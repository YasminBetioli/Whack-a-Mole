<?php
// Encerra a sessão do usuário e volta para a tela de login.

session_start();

// Apaga os dados da sessão
$_SESSION = [];

// Apaga também o cookie da sessão no navegador
if (ini_get('session.use_cookies')) {
    $parametros = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $parametros['path'],
        $parametros['domain'],
        $parametros['secure'],
        $parametros['httponly']
    );
}

// Destrói a sessão no servidor
session_destroy();

header('Location: index.php');
exit;
