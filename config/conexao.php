<?php
// Conexão com o banco de dados.
// Como usar nas outras páginas PHP:
//
//     require_once __DIR__ . '/../config/conexao.php';
//     $conexao = conectar();

require_once __DIR__ . '/config.php';

function conectar(): mysqli
{
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    try {
        $conexao = new mysqli(DB_HOST, DB_USUARIO, DB_SENHA, DB_NOME);
        $conexao->set_charset('utf8mb4');
        return $conexao;
    } catch (mysqli_sql_exception $erro) {
        // Não mostra detalhes técnicos para o usuário
        http_response_code(500);
        header('Content-Type: text/plain; charset=utf-8');
        exit('Não foi possível conectar ao banco de dados.');
    }
}
