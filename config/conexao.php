<?php
// Configurações do banco de dados.

require_once __DIR__ . '/config.php';

function conectar(): mysqli
{
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    try {
        $conexao = new mysqli(DB_HOST, DB_USUARIO, DB_SENHA, DB_NOME);
        $conexao->set_charset('utf8mb4');
        return $conexao;
    } catch (mysqli_sql_exception $erro) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        exit('Não foi possível conectar ao banco de dados.');
    }
}
