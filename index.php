<?php
session_start();

// Se já estiver logado, vai direto para o início
if (isset($_SESSION['usuario_id'])) {
    header('Location: pages/home.php');
    exit;
}

$erro = $_GET['erro'] ?? '';
$cadastroOk = ($_GET['cadastro'] ?? '') === 'ok'; // vem do cadastrar.php depois de criar a conta
$mensagens = [
    'vazio'    => 'Preencha o username e a senha.',
    'invalido' => 'Username ou senha incorretos.'
];
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="assets/css/login-cadastro-perfil-home.css">
    <title> Whack-a-Anomaly | Login </title>
</head>

<body>
    <div class="login-page">

        <div class="container-login">

            <div class="secao-foto">

                <div class="foto-login">
                    <img src="assets/img/Foto_Perfil_Login.png" alt="Personagem como foto de perfil">
                </div>
            
            </div>

            <div class="linha-divisora"></div>

            <div class="secao-formulario">
                <h1> Login </h1>

                <form action="login.php" method="post">
                    <div class="campo-input-texto">
                        <label for="username"> Username </label>
                        <input type="text" id="username" name="username">
                    </div>

                    <div class="campo-input-texto">
                        <label for="senha"> Senha </label>
                        <input type="password" id="senha" name="senha">
                    </div>

                    <?php if ($cadastroOk): ?>
                        <p class="mensagem-sucesso" role="status"> Conta criada! Entre com o seu username e a sua senha. </p>
                    <?php endif; ?>

                    <?php if (isset($mensagens[$erro])): ?>
                        <p class="texto-vermelho-login"><?= htmlspecialchars($mensagens[$erro]) ?></p>
                    <?php endif; ?>

                    <button type="submit"> Login </button>
                </form>

                <div class="link-cadastro">
                    <span class="texto-vermelho-login"> Novo aqui? </span>
                    <a href="pages/cadastro.html"> Crie sua conta </a>
                </div>

            </div>

        </div>

        <img src="assets/img/Canto_Inferior_Direito_Login.png" alt="Personagem decorativo">

    </div>
</body>
</html>