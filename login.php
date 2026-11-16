<?php
// Recebe o formulário de login (POST), confere username e senha no banco
// e, se estiver tudo certo, abre a sessão do usuário.

require_once __DIR__ . '/config/conexao.php';

session_start();

// Só aceita acesso pelo formulário
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

$username = trim($_POST['username'] ?? '');
$senha    = $_POST['senha'] ?? '';

if ($username === '' || $senha === '') {
    header('Location: index.php?erro=vazio');
    exit;
}

// Busca o usuário pelo username
$conexao = conectar();
$comando = $conexao->prepare(
    'SELECT id, nome_completo, username, senha_hash FROM usuarios WHERE username = ?'
);
$comando->bind_param('s', $username);
$comando->execute();
$usuario = $comando->get_result()->fetch_assoc();
$conexao->close();

// Compara a senha digitada com o hash guardado no banco
if ($usuario && password_verify($senha, $usuario['senha_hash'])) {
    session_regenerate_id(true); // novo id de sessão após o login (mais seguro)

    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['username']   = $usuario['username'];
    $_SESSION['nome']       = $usuario['nome_completo'];

    header('Location: pages/home.php');
    exit;
}

// Mensagem igual para "usuário não existe" e "senha errada"
header('Location: index.php?erro=invalido');
exit;
