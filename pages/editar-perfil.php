<?php
require_once __DIR__ . '/../config/verificar_sessao.php';
require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../config/validacao.php';

/* Escapa texto antes de colocar dentro do HTML (evita que o conteúdo vire código) */
function h(string $texto): string
{
    return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
}

$usuarioId = (int) $_SESSION['usuario_id'];
$conexao = conectar();

// Dados atuais da conta
$consulta = $conexao->prepare(
    'SELECT nome_completo, data_nascimento, cpf, telefone, email, username FROM usuarios WHERE id = ?'
);
$consulta->bind_param('i', $usuarioId);
$consulta->execute();
$usuario = $consulta->get_result()->fetch_assoc();
$consulta->close();

if (!$usuario) {
    // A conta não existe mais: encerra a sessão
    $conexao->close();
    header('Location: ../logout.php');
    exit;
}

$salvo     = isset($_GET['salvo']);   // vem do redirecionamento depois de salvar
$erros     = [];                      // mensagens de erro por campo (chave = id do input)
$erroGeral = '';

// Valores mostrados nos campos que podem ser editados
$nome     = $usuario['nome_completo'];
$telefone = formatar_telefone($usuario['telefone']);
$email    = $usuario['email'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // IMPORTANTE: data de nascimento, CPF e username NÃO podem ser alterados.
    // Eles nem são lidos do formulário: valem sempre os que estão no banco.
    $nome      = preg_replace('/\s+/u', ' ', trim(valor_post('nome')));
    $telefone  = trim(valor_post('telefone'));
    $email     = trim(valor_post('email'));
    $senhaNova = valor_post('senha-cadastro');      // em branco = manter a senha atual

    $erros = array_filter([
        'nome'            => validar_nome($nome),
        'telefone'        => validar_telefone($telefone),
        'email'           => validar_email($email),
        'senha-cadastro'  => validar_senha($senhaNova, true),
    ], function ($mensagem) {
        return $mensagem !== '';
    });

    if (!$erros) {
        $telefoneDigitos = somente_digitos($telefone);

        try {
            if ($senhaNova !== '') {
                $senhaHash = password_hash($senhaNova, PASSWORD_DEFAULT);
                $comando = $conexao->prepare(
                    'UPDATE usuarios SET nome_completo = ?, telefone = ?, email = ?, senha_hash = ? WHERE id = ?'
                );
                $comando->bind_param('ssssi', $nome, $telefoneDigitos, $email, $senhaHash, $usuarioId);
            } else {
                $comando = $conexao->prepare(
                    'UPDATE usuarios SET nome_completo = ?, telefone = ?, email = ? WHERE id = ?'
                );
                $comando->bind_param('sssi', $nome, $telefoneDigitos, $email, $usuarioId);
            }
            $comando->execute();
            $comando->close();
            $conexao->close();

            $_SESSION['nome'] = $nome;

            // Redireciona para evitar reenvio do formulário se a pessoa atualizar a página
            header('Location: editar-perfil.php?salvo=1');
            exit;
        } catch (mysqli_sql_exception $erro) {
            $erroGeral = 'Não foi possível salvar as alterações agora. Tente novamente.';
        }
    }
}

$conexao->close();
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../assets/css/login-cadastro-perfil-home.css">
    <title> Whack-a-Anomaly | Editar Perfil </title>
</head>

<body>
    <div class="editar-perfil-page">

        <div class="container-editar-perfil">

            <div class="secao-foto">

                <div class="foto-perfil">
                    <img src="../assets/img/Foto_Perfil_Login.png" alt="Personagem como foto de perfil">
                </div>
            
            </div>

            <div class="linha-divisora"></div>

            <div class="secao-formulario">
                <h1> Editar Perfil </h1>

                <form id="form-editar-perfil" novalidate method="post" action="editar-perfil.php">
                    <div class="campo-input-texto linha-completa">
                        <label for="nome"> Nome Completo </label>
                        <input type="text" id="nome" name="nome" value="<?= h($nome) ?>"<?= isset($erros['nome']) ? ' class="input-invalido" aria-invalid="true" aria-describedby="erro-nome"' : '' ?>>
                        <?php if (isset($erros['nome'])): ?><span id="erro-nome" class="erro-campo" role="alert"><?= h($erros['nome']) ?></span><?php endif; ?>
                        <img src="../assets/img/Icone_Lapis.png" alt="Icone de lapis">
                    </div>

                    <div class="input-segunda-linha">
                        <div class="campo-input-texto metade">
                            <label for="data-nascimento"> Data de Nascimento </label>
                            <input type="text" id="data-nascimento" name="data-nascimento" value="<?= h(data_iso_para_br($usuario['data_nascimento'])) ?>" disabled>
                            <img src="../assets/img/Cadeado_Claro.png" alt="Icone de cadeado">
                        </div>

                        <div class="campo-input-texto metade input-com-cadeado">
                            <label for="cpf"> CPF </label>
                            <input type="text" id="cpf" name="cpf" value="<?= h(formatar_cpf($usuario['cpf'])) ?>" disabled>
                            <img src="../assets/img/Cadeado_Claro.png" alt="Icone de cadeado">
                        </div>
                    </div>

                    <div class="input-terceira-linha">
                        <div class="campo-input-texto metade">
                            <label for="telefone"> Telefone </label>
                            <input type="tel" id="telefone" name="telefone" value="<?= h($telefone) ?>"<?= isset($erros['telefone']) ? ' class="input-invalido" aria-invalid="true" aria-describedby="erro-telefone"' : '' ?>>
                            <?php if (isset($erros['telefone'])): ?><span id="erro-telefone" class="erro-campo" role="alert"><?= h($erros['telefone']) ?></span><?php endif; ?>
                            <img src="../assets/img/Icone_Lapis.png" alt="Icone de lapis">
                        </div>

                        <div class="campo-input-texto metade">
                            <label for="email"> E-mail </label>
                            <input type="email" id="email" name="email" value="<?= h($email) ?>"<?= isset($erros['email']) ? ' class="input-invalido" aria-invalid="true" aria-describedby="erro-email"' : '' ?>>
                            <?php if (isset($erros['email'])): ?><span id="erro-email" class="erro-campo" role="alert"><?= h($erros['email']) ?></span><?php endif; ?>
                            <img src="../assets/img/Icone_Lapis.png" alt="Icone de lapis">
                        </div>
                    </div>

                    <div class="input-quarta-linha">
                        <div class="campo-input-texto metade input-com-cadeado">
                            <label for="username-cadastro"> Username </label>
                            <input type="text" id="username-cadastro" name="username-cadastro" value="<?= h($usuario['username']) ?>" disabled>
                            <img src="../assets/img/Cadeado_Claro.png" alt="Icone de cadeado">
                        </div>

                        <div class="campo-input-texto metade">
                            <label for="senha-cadastro"> Senha </label>
                            <input type="password" id="senha-cadastro" name="senha-cadastro" autocomplete="new-password"<?= isset($erros['senha-cadastro']) ? ' class="input-invalido" aria-invalid="true" aria-describedby="erro-senha-cadastro"' : '' ?>>
                            <?php if (isset($erros['senha-cadastro'])): ?><span id="erro-senha-cadastro" class="erro-campo" role="alert"><?= h($erros['senha-cadastro']) ?></span><?php endif; ?>
                            <img src="../assets/img/Icone_Lapis.png" alt="Icone de lapis">
                        </div>
                    </div>

                    <?php if ($salvo): ?>
                        <p class="mensagem-sucesso" role="status"> Alterações salvas. </p>
                    <?php endif; ?>

                    <?php if ($erroGeral !== ''): ?>
                        <p class="mensagem-erro" role="alert"><?= h($erroGeral) ?></p>
                    <?php endif; ?>

                    <div class="botoes-editar-perfil">
                        <button type="submit" class="button"> Salvar alterações </button>
                        <button type="button" class="button-vermelho" onclick="window.location.href='../logout.php'"> Sair da conta </button>
                    </div>


                </form>

                <div class="link-cadastro">
                    <a href="home.php"> ← Voltar ao início </a>
                </div>

            </div>
            
        </div>

        <img src="../assets/img/Canto_Inferior_Direito_Login.png" alt="Personagem decorativo">

    </div>

    <script src="../assets/js/validacao.js"></script>
</body>
</html>

