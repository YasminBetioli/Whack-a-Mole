<?php
require_once __DIR__ . '/../config/verificar_sessao.php';
require_once __DIR__ . '/../config/conexao.php';

/*
 * RANKING GLOBAL
 *
 * Critério: cada jogador aparece UMA vez, com a sua melhor partida (dentre todas as que
 * jogou). Os jogadores são ordenados por pontuação; em caso de empate, vence o de maior
 * nível atingido e, persistindo o empate, quem fez essa partida primeiro.
 *
 * Os filtros (modalidade e tabuleiro) valem para as duas coisas: decidem qual é a "melhor
 * partida" de cada jogador e quem entra no ranking. Os dados vêm da tabela 'partidas'.
 */

const RANKING_TOP = 5; // quantos jogadores aparecem na tabela

function escapar($valor): string
{
    return htmlspecialchars((string) $valor, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function nome_modalidade(string $modalidade): string
{
    return $modalidade === 'classica' ? 'Clássico' : 'Explosivo';
}

function formatar_posicao(int $posicao): string
{
    return str_pad((string) $posicao, 2, '0', STR_PAD_LEFT);
}

/* -------------------------- Filtros (vêm da URL, então são validados) -------------------------- */

// valor do filtro -> valor guardado no banco (null = sem filtro)
$modalidadesFiltro = ['geral' => null, 'classico' => 'classica', 'explosivo' => 'explosiva'];

$modoFiltro = $_GET['modalidade'] ?? 'geral';
if (!is_string($modoFiltro) || !array_key_exists($modoFiltro, $modalidadesFiltro)) {
    $modoFiltro = 'geral';
}

// "todos" ou "NxN" com N de 2 a 8 (o tabuleiro do jogo é sempre quadrado)
$tabuleiroFiltro = $_GET['tabuleiro'] ?? 'todos';
$ladoFiltro = null;
if (is_string($tabuleiroFiltro) && preg_match('/^([2-8])x\1$/', $tabuleiroFiltro, $partes)) {
    $ladoFiltro = (int) $partes[1];
} else {
    $tabuleiroFiltro = 'todos';
}

$opcoesTabuleiro = ['todos' => 'Todos'];
for ($lado = 2; $lado <= 8; $lado++) {
    $opcoesTabuleiro[$lado . 'x' . $lado] = $lado . 'x' . $lado;
}

/* -------------------------- Consulta -------------------------- */

$condicoes  = [];
$tipos      = '';
$parametros = [];

if ($modalidadesFiltro[$modoFiltro] !== null) {
    $condicoes[]  = 'p.modalidade = ?';
    $tipos       .= 's';
    $parametros[] = $modalidadesFiltro[$modoFiltro];
}
if ($ladoFiltro !== null) {
    $condicoes[]  = 'p.linhas = ? AND p.colunas = ?';
    $tipos       .= 'ii';
    $parametros[] = $ladoFiltro;
    $parametros[] = $ladoFiltro;
}
$where = $condicoes ? 'WHERE ' . implode(' AND ', $condicoes) : '';

$usuarioId = (int) $_SESSION['usuario_id'];
$tipos       .= 'ii';
$parametros[] = RANKING_TOP;
$parametros[] = $usuarioId;

// Requer MySQL 8+ ou MariaDB 10.2+ (funções de janela). O XAMPP atual já traz MariaDB 10.4 ou mais novo.
// 1) 'm': a melhor partida de cada jogador (melhor = 1)
// 2) 'r': coloca os jogadores em ordem e numera a posição
// 3) filtro final: o top da tabela + a linha do usuário logado (para o rodapé mostrar a posição dele)
$sql = "
    SELECT r.posicao, r.usuario_id, r.username, r.pontuacao, r.nivel_atingido,
           r.linhas, r.colunas, r.modalidade, r.data_hora
    FROM (
        SELECT m.usuario_id, u.username, m.pontuacao, m.nivel_atingido,
               m.linhas, m.colunas, m.modalidade, m.data_hora,
               ROW_NUMBER() OVER (
                   ORDER BY m.pontuacao DESC, m.nivel_atingido DESC, m.data_hora ASC, m.usuario_id ASC
               ) AS posicao
        FROM (
            SELECT p.usuario_id, p.linhas, p.colunas, p.modalidade, p.pontuacao,
                   p.nivel_atingido, p.data_hora,
                   ROW_NUMBER() OVER (
                       PARTITION BY p.usuario_id
                       ORDER BY p.pontuacao DESC, p.nivel_atingido DESC, p.data_hora ASC, p.id ASC
                   ) AS melhor
            FROM partidas p
            $where
        ) m
        JOIN usuarios u ON u.id = m.usuario_id
        WHERE m.melhor = 1
    ) r
    WHERE r.posicao <= ? OR r.usuario_id = ?
    ORDER BY r.posicao
";

$linhas       = [];
$erroRanking  = null;

$conexao = conectar();
try {
    $consulta = $conexao->prepare($sql);
    $consulta->bind_param($tipos, ...$parametros);
    $consulta->execute();
    $linhas = $consulta->get_result()->fetch_all(MYSQLI_ASSOC);
    $consulta->close();
} catch (mysqli_sql_exception $erro) {
    error_log('Falha ao carregar o ranking: ' . $erro->getMessage());
    http_response_code(500);
    $erroRanking = 'Não foi possível carregar o ranking. Tente novamente mais tarde.';
} finally {
    $conexao->close();
}

// Separa o top da tabela da linha do usuário logado (que pode estar fora do top)
$ranking     = [];
$minhaLinha  = null;
foreach ($linhas as $linha) {
    if ((int) $linha['posicao'] <= RANKING_TOP) {
        $ranking[] = $linha;
    }
    if ((int) $linha['usuario_id'] === $usuarioId) {
        $minhaLinha = $linha;
    }
}

$usernameLogado = $_SESSION['username'] ?? '';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> Whack-a-Anomaly | Ranking </title>
    <!-- Folhas de estilo externas -->
    <link rel="stylesheet" href="../assets/css/base.css">
    <link rel="stylesheet" href="../assets/css/ranking.css">
</head>
<body>

    <!-- Container do Mural em Tela Cheia -->
    <main class="ranking-board">
        
        <button type="button" class="btn-voltar" onclick="window.location.href='home.php'"> ← Voltar </button>
        <!-- Conteúdo expandido sobre a folha de papel central -->

        <div class="ranking-paper-content">

            <!-- Barra de Filtros (envia sozinha ao mudar; o botão só aparece sem JavaScript) -->
            <form method="get" action="ranking.php" onchange="this.submit()">
                <nav class="ranking-filters" aria-label="Filtros do Ranking">
                    <div class="modalities">
                        <input type="radio" id="mod-geral" name="modalidade" value="geral" class="radio-filter" <?= $modoFiltro === 'geral' ? 'checked' : '' ?>>
                        <label for="mod-geral" class="btn-filter">Geral</label>

                        <input type="radio" id="mod-explosivo" name="modalidade" value="explosivo" class="radio-filter" <?= $modoFiltro === 'explosivo' ? 'checked' : '' ?>>
                        <label for="mod-explosivo" class="btn-filter">Explosivo</label>

                        <input type="radio" id="mod-classico" name="modalidade" value="classico" class="radio-filter" <?= $modoFiltro === 'classico' ? 'checked' : '' ?>>
                        <label for="mod-classico" class="btn-filter">Clássico</label>
                    </div>
                    
                    <!-- Seletor do Tabuleiro -->
                    <div class="board-filter">
                        <label for="select-tabuleiro">Tabuleiro:</label>
                        <select id="select-tabuleiro" name="tabuleiro">
                            <?php foreach ($opcoesTabuleiro as $valor => $rotulo): ?>
                                <option value="<?= escapar($valor) ?>" <?= $tabuleiroFiltro === $valor ? 'selected' : '' ?>><?= escapar($rotulo) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <noscript><button type="submit" class="btn-filter">Filtrar</button></noscript>
                    </div>
                </nav>
            </form>

            <!-- Tabela com o Top 5: melhor partida de cada jogador -->
            <div class="ranking-table-section">
                <table class="ranking-table">
                    <thead>
                        <tr>
                            <th scope="col">POS</th>
                            <th scope="col">AVATAR</th>
                            <th scope="col">USUÁRIO</th>
                            <th scope="col">PONTUAÇÃO</th>
                            <th scope="col">NÍVEL</th>
                            <th scope="col">TABULEIRO</th>
                            <th scope="col">MODO</th>
                            <th scope="col">DATA</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($erroRanking !== null): ?>
                            <tr>
                                <td colspan="8" class="ranking-vazio" role="alert"><?= escapar($erroRanking) ?></td>
                            </tr>
                        <?php elseif (!$ranking): ?>
                            <tr>
                                <td colspan="8" class="ranking-vazio">Nenhuma partida registrada para este filtro.</td>
                            </tr>
                        <?php endif; ?>
                        <?php foreach ($ranking as $linha): ?>
                            <tr<?= (int) $linha['usuario_id'] === $usuarioId ? ' class="linha-usuario"' : '' ?>>
                                <td><?= escapar(formatar_posicao((int) $linha['posicao'])) ?></td>
                                <td>
                                    <div class="avatar-polaroid">
                                        <img src="../assets/img/anomaliaFoto.png" alt="Avatar Polaroid de <?= escapar($linha['username']) ?>">
                                    </div>
                                </td>
                                <td class="col-usuario"><?= escapar($linha['username']) ?></td>
                                <td><?= escapar($linha['pontuacao']) ?></td>
                                <td><?= escapar($linha['nivel_atingido']) ?></td>
                                <td><?= escapar($linha['linhas']) ?>x<?= escapar($linha['colunas']) ?></td>
                                <td><?= escapar(nome_modalidade($linha['modalidade'])) ?></td>
                                <td class="col-data"><?= escapar(date('d/m/Y H:i', strtotime($linha['data_hora']))) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Rodapé do Usuário Logado -->
            <footer class="user-rank-bar">
                <div class="user-position"><?= $minhaLinha ? escapar(formatar_posicao((int) $minhaLinha['posicao'])) : '—' ?></div>
                <div class="user-avatar-box">
                    <img src="../assets/img/anomaliaFoto.png" alt="Avatar Polaroid de <?= escapar($usernameLogado) ?>">
                </div>
                <div class="user-info">
                    <div class="user-name"><?= escapar($usernameLogado) ?></div>
                    <div class="user-details">
                        <?php if ($minhaLinha): ?>
                            Nível <?= escapar($minhaLinha['nivel_atingido']) ?>
                            · <?= escapar($minhaLinha['linhas']) ?>x<?= escapar($minhaLinha['colunas']) ?>
                            · <?= escapar(nome_modalidade($minhaLinha['modalidade'])) ?>
                            · <?= escapar(date('d/m/Y H:i', strtotime($minhaLinha['data_hora']))) ?>
                        <?php else: ?>
                            Você ainda não tem partidas neste filtro.
                        <?php endif; ?>
                    </div>
                </div>
                <div class="user-score"><?= $minhaLinha ? escapar($minhaLinha['pontuacao']) : '—' ?></div>
            </footer>

        </div>

    </main>

</body>
</html>