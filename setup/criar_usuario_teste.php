<?php
// Cria um usuário de teste para experimentar o login.
// Pode ser apagado depois: o cadastro de verdade é feito pela tela de cadastro.

require_once __DIR__ . '/../config/conexao.php';

header('Content-Type: text/plain; charset=utf-8');

$username = 'teste';
$senha    = 'teste123';

$conexao = conectar();

try {
    // A senha nunca é guardada em texto puro: guardamos só o "hash" dela
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    $nome       = 'Usuário de Teste';
    $nascimento = '2000-01-01';
    $cpf        = '00000000000';
    $telefone   = '(19) 99999-9999';
    $email      = 'teste@exemplo.com';

    $comando = $conexao->prepare(
        'INSERT INTO usuarios
            (nome_completo, data_nascimento, cpf, telefone, email, username, senha_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $comando->bind_param(
        'sssssss',
        $nome, $nascimento, $cpf, $telefone, $email, $username, $senhaHash
    );
    $comando->execute();

    echo "Usuário de teste criado!\n";
    echo "username: $username\n";
    echo "senha: $senha\n";

} catch (mysqli_sql_exception $erro) {
    if ($erro->getCode() == 1062) {
        // 1062 = valor repetido em uma coluna UNIQUE (username ou cpf)
        echo "O usuário de teste já existe.\n";
        echo "username: $username\n";
        echo "senha: $senha\n";
    } else {
        echo 'ERRO: ' . $erro->getMessage() . "\n";
    }
}

$conexao->close();
