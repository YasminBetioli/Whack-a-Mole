<?php
// Cria o banco e as tabelas do sistema.
// Pode ser executado mais de uma vez: usa IF NOT EXISTS, então não apaga nada.

require_once __DIR__ . '/../config/config.php';

header('Content-Type: text/plain; charset=utf-8');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // 1) Conecta no servidor MySQL (ainda sem escolher o banco)
    $conexao = new mysqli(DB_HOST, DB_USUARIO, DB_SENHA);
    $conexao->set_charset('utf8mb4');

    // 2) Cria o banco, se ainda não existir
    $conexao->query(
        'CREATE DATABASE IF NOT EXISTS `' . DB_NOME . '`
         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    $conexao->select_db(DB_NOME);
    echo "Banco '" . DB_NOME . "' pronto.\n";

    // 3) Tabela de usuários (dados do cadastro)
    $conexao->query("
        CREATE TABLE IF NOT EXISTS usuarios (
            id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
            nome_completo   VARCHAR(120) NOT NULL,
            data_nascimento DATE         NOT NULL,
            cpf             CHAR(11)     NOT NULL,
            telefone        VARCHAR(20)  NOT NULL,
            email           VARCHAR(120) NOT NULL,
            username        VARCHAR(30)  NOT NULL,
            senha_hash      VARCHAR(255) NOT NULL,
            criado_em       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_usuarios_username (username),
            UNIQUE KEY uq_usuarios_cpf (cpf)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "Tabela 'usuarios' pronta.\n";

    // 4) Tabela de partidas (histórico e ranking saem daqui)
    $conexao->query("
        CREATE TABLE IF NOT EXISTS partidas (
            id             INT UNSIGNED      NOT NULL AUTO_INCREMENT,
            usuario_id     INT UNSIGNED      NOT NULL,
            linhas         TINYINT UNSIGNED  NOT NULL,
            colunas        TINYINT UNSIGNED  NOT NULL,
            modalidade     ENUM('classica','explosiva') NOT NULL,
            pontuacao      INT               NOT NULL,
            nivel_atingido SMALLINT UNSIGNED NOT NULL,
            total_acertos  INT UNSIGNED      NOT NULL DEFAULT 0,
            data_hora      DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_partidas_usuario (usuario_id),
            KEY idx_partidas_pontuacao (pontuacao),
            CONSTRAINT fk_partidas_usuario
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "Tabela 'partidas' pronta.\n";

    echo "\nTudo certo! Banco e tabelas criados.\n";
    $conexao->close();

} catch (mysqli_sql_exception $erro) {
    echo 'ERRO: ' . $erro->getMessage() . "\n";
}
