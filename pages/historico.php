<?php
require_once __DIR__ . '/../config/verificar_sessao.php';
require_once __DIR__ . '/../config/conexao.php';

function escapar($valor): string
{
    return htmlspecialchars((string) $valor, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function renderizarTabela(array $partidas, bool $mostrarMensagemVazia = false): void
{
    ?>
    <table class="notebook-table">
        <thead>
            <tr>
                <th scope="col">Tabuleiro</th>
                <th scope="col">Modo de jogo</th>
                <th scope="col">Pontuação</th>
                <th scope="col">Nível atingido</th>
                <th scope="col">Data</th>
            </tr>
        </thead>
        <tbody>
            <?php if (!$partidas && $mostrarMensagemVazia): ?>
                <tr>
                    <td colspan="5">Nenhuma partida registrada.</td>
                </tr>
            <?php endif; ?>
            <?php foreach ($partidas as $partida): ?>
                <tr>
                    <td><?= escapar($partida['linhas']) ?>x<?= escapar($partida['colunas']) ?></td>
                    <td><?= $partida['modalidade'] === 'classica' ? 'Clássico' : 'Explosivo' ?></td>
                    <td><?= escapar($partida['pontuacao']) ?></td>
                    <td><?= escapar($partida['nivel_atingido']) ?></td>
                    <td><?= escapar(date('d/m/Y \à\s H:i', strtotime($partida['data_hora']))) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php
}

$itensPorLado = 9;
$itensPorPagina = $itensPorLado * 2;
$paginaSolicitada = filter_input(INPUT_GET, 'pagina', FILTER_VALIDATE_INT);
$pagina = ($paginaSolicitada === false || $paginaSolicitada === null || $paginaSolicitada < 1)
    ? 1
    : $paginaSolicitada;
$partidas = [];
$totalPartidas = 0;
$totalPaginas = 1;
$erroHistorico = null;

$conexao = conectar();
try {
    $usuarioId = (int) $_SESSION['usuario_id'];

    $consultaTotal = $conexao->prepare(
        'SELECT COUNT(*) AS total FROM partidas WHERE usuario_id = ?'
    );
    $consultaTotal->bind_param('i', $usuarioId);
    $consultaTotal->execute();
    $totalPartidas = (int) $consultaTotal->get_result()->fetch_assoc()['total'];
    $consultaTotal->close();

    $totalPaginas = max(1, (int) ceil($totalPartidas / $itensPorPagina));
    $pagina = min($pagina, $totalPaginas);
    $limite = $itensPorPagina;
    $offset = ($pagina - 1) * $itensPorPagina;

    $consultaPartidas = $conexao->prepare(
        'SELECT linhas, colunas, modalidade, pontuacao, nivel_atingido, data_hora
         FROM partidas
         WHERE usuario_id = ?
         ORDER BY data_hora DESC, id DESC
         LIMIT ? OFFSET ?'
    );
    $consultaPartidas->bind_param('iii', $usuarioId, $limite, $offset);
    $consultaPartidas->execute();
    $partidas = $consultaPartidas->get_result()->fetch_all(MYSQLI_ASSOC);
    $consultaPartidas->close();
} catch (mysqli_sql_exception $erro) {
    error_log('Falha ao carregar o histórico de partidas: ' . $erro->getMessage());
    http_response_code(500);
    $erroHistorico = 'Não foi possível carregar o histórico. Tente novamente mais tarde.';
} finally {
    $conexao->close();
}

$usernameJogador = $_SESSION['username'] ?? '';
$partidasEsquerda = array_slice($partidas, 0, $itensPorLado);
$partidasDireita = array_slice($partidas, $itensPorLado, $itensPorLado);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="../assets/img/monstrinho.png">
    <title>Whack-a-Anomaly | Histórico</title>
    <link rel="stylesheet" href="../assets/css/base.css">
    <link rel="stylesheet" href="../assets/css/historico.css">
</head>
<body>
    <main class="historico-screen <?= $pagina % 2 === 0 ? 'pagina-par' : 'pagina-impar' ?>">
        <button type="button" class="btn-voltar" onclick="window.location.href='home.php'">← Voltar</button>

        <div class="mesa-objetos" aria-hidden="true">
            <img src="../assets/img/papel.png" alt="" class="obj obj-papel-1">
            <img src="../assets/img/caneta.png" alt="" class="obj obj-caneta">
            <img src="../assets/img/xicara.png" alt="" class="obj obj-xicara">
            <img src="../assets/img/clipes.png" alt="" class="obj obj-clipes">
            <img src="../assets/img/papel.png" alt="" class="obj obj-papel-2">
        </div>

        <img src="../assets/img/foto_historico.png" alt="Foto de perfil" class="polaroid-foto">
        <span class="polaroid-name"><?= escapar($usernameJogador) ?></span>

        <div class="notebook-overlay">
            <?php if ($erroHistorico !== null): ?>
                <p class="historico-mensagem" role="alert"><?= escapar($erroHistorico) ?></p>
            <?php else: ?>
                <div class="notebook-spread">
                    <div class="overlay-left">
                        <?php renderizarTabela($partidasEsquerda, $totalPartidas === 0); ?>
                        <?php if ($pagina > 1): ?>
                            <a class="nav-arrow prev-arrow" href="?pagina=<?= $pagina - 1 ?>" aria-label="Página anterior">&larr;</a>
                        <?php endif; ?>
                    </div>

                    <div class="overlay-right">
                        <?php if ($partidasDireita): ?>
                            <?php renderizarTabela($partidasDireita); ?>
                        <?php endif; ?>
                        <?php if ($pagina < $totalPaginas): ?>
                            <a class="nav-arrow next-arrow" href="?pagina=<?= $pagina + 1 ?>" aria-label="Próxima página">&rarr;</a>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </main>
</body>
</html>
