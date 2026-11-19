<?php

require_once __DIR__ . '/config/conexao.php';
require_once __DIR__ . '/config/validacao.php';

session_start();

if (isset($_SESSION['usuario_id'])) {
    header('Location: pages/home.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: pages/cadastro.html');
    exit;
}

function voltar_com_erro(string $codigo, array $campos = []): void
{
    $url = 'pages/cadastro.html?erro=' . urlencode($codigo);
    if ($campos) {
        $url .= '&campos=' . implode(',', $campos);
    }
    header('Location: ' . $url);
    exit;
}

/* -------------------------- Lê os dados do formulário -------------------------- */

$nome       = preg_replace('/\s+/u', ' ', trim(valor_post('nome')));
$nascimento = trim(valor_post('data-nascimento'));
$cpf        = somente_digitos(valor_post('cpf'));       // o banco guarda só os 11 números
$telefone   = somente_digitos(valor_post('telefone'));  // 11 númeoros tb, com DDD
$email      = trim(valor_post('email'));
$username   = trim(valor_post('username-cadastro'));
$senha      = valor_post('senha-cadastro');               // senha nunca recebe trim()

/* -------------------------- Valida -------------------------- */

$camposInvalidos = [];

if (validar_nome($nome) !== '')                  $camposInvalidos[] = 'nome';
if (validar_data_nascimento($nascimento) !== '') $camposInvalidos[] = 'nascimento';
if (validar_cpf($cpf) !== '')                    $camposInvalidos[] = 'cpf';
if (validar_telefone($telefone) !== '')          $camposInvalidos[] = 'telefone';
if (validar_email($email) !== '')                $camposInvalidos[] = 'email';
if (validar_username($username) !== '')          $camposInvalidos[] = 'username';
if (validar_senha($senha) !== '')                $camposInvalidos[] = 'senha';

if ($camposInvalidos) {
    voltar_com_erro('invalido', $camposInvalidos);
}

$nascimentoIso = data_br_para_iso($nascimento); // 15/11/2000 -> 2000-11-15

/* -------------------------- Grava no banco -------------------------- */

$conexao = conectar();

try {
    $consulta = $conexao->prepare('SELECT username, cpf FROM usuarios WHERE username = ? OR cpf = ?');
    $consulta->bind_param('ss', $username, $cpf);
    $consulta->execute();
    $existentes = $consulta->get_result()->fetch_all(MYSQLI_ASSOC);
    $consulta->close();

    $duplicados = [];
    foreach ($existentes as $linha) {
        if (strcasecmp($linha['username'], $username) === 0) $duplicados['username'] = 'username';
        if ($linha['cpf'] === $cpf)                          $duplicados['cpf'] = 'cpf';
    }
    if ($duplicados) {
        $conexao->close();
        voltar_com_erro('duplicado', array_values($duplicados));
    }

    // a senha nunca é guardada em texto puro
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    $comando = $conexao->prepare(
        'INSERT INTO usuarios
            (nome_completo, data_nascimento, cpf, telefone, email, username, senha_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $comando->bind_param(
        'sssssss',
        $nome, $nascimentoIso, $cpf, $telefone, $email, $username, $senhaHash
    );
    $comando->execute();
    $comando->close();
    $conexao->close();

} catch (mysqli_sql_exception $erro) {
    $conexao->close();

    if ($erro->getCode() == 1062) {
        // 1062 = valor repetido em coluna UNIQUE 
        // no intervalo entre a conferência acima e o INSERT)
        $mensagem = $erro->getMessage();
        $campos = [];
        if (strpos($mensagem, 'uq_usuarios_username') !== false) $campos[] = 'username';
        if (strpos($mensagem, 'uq_usuarios_cpf') !== false)      $campos[] = 'cpf';
        voltar_com_erro('duplicado', $campos ?: ['username', 'cpf']);
    }

    voltar_com_erro('servidor');
}

header('Location: index.php?cadastro=ok');
exit;
