<?php

require_once __DIR__ . '/../config/verificar_sessao.php';
require_once __DIR__ . '/../config/conexao.php';

header('Content-Type: application/json; charset=utf-8');

function responder(int $codigoHttp, array $corpo): void
{
    http_response_code($codigoHttp);
    echo json_encode($corpo);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, ['ok' => false, 'erro' => 'metodo_invalido']);
}

$dados = json_decode(file_get_contents('php://input'), true);
if (!is_array($dados)) {
    responder(400, ['ok' => false, 'erro' => 'dados_invalidos']);
}

/* -------------------------- Validação dos dados recebidos -------------------------- */

$modalidades = ['classico' => 'classica', 'explosivo' => 'explosiva'];
$modoRecebido = $dados['modalidade'] ?? '';
if (!is_string($modoRecebido) || !isset($modalidades[$modoRecebido])) {
    responder(400, ['ok' => false, 'erro' => 'modalidade_invalida']);
}
$modalidade = $modalidades[$modoRecebido];

$linhas       = filter_var($dados['linhas'] ?? null, FILTER_VALIDATE_INT);
$colunas      = filter_var($dados['colunas'] ?? null, FILTER_VALIDATE_INT);
$pontuacao    = filter_var($dados['pontuacao'] ?? null, FILTER_VALIDATE_INT);
$nivel        = filter_var($dados['nivel'] ?? null, FILTER_VALIDATE_INT);
$totalAcertos = filter_var($dados['total_acertos'] ?? null, FILTER_VALIDATE_INT);

if (in_array(false, [$linhas, $colunas, $pontuacao, $nivel, $totalAcertos], true)) {
    responder(400, ['ok' => false, 'erro' => 'dados_invalidos']);
}

$buracos = $linhas * $colunas;
if ($linhas < 1 || $colunas < 1 || $buracos < 4 || $buracos > 64) {
    responder(400, ['ok' => false, 'erro' => 'tabuleiro_invalido']);
}
if ($nivel < 1 || $nivel > 65535) {
    responder(400, ['ok' => false, 'erro' => 'nivel_invalido']);
}
if ($totalAcertos < 0 || $totalAcertos > 1000000 || abs($pontuacao) > 10000000) {
    responder(400, ['ok' => false, 'erro' => 'pontuacao_invalida']);
}

/* -------------------------- Grava no banco -------------------------- */

$usuarioId = (int) $_SESSION['usuario_id'];
$conexao = conectar();

try {
    $comando = $conexao->prepare(
        'INSERT INTO partidas
            (usuario_id, linhas, colunas, modalidade, pontuacao, nivel_atingido, total_acertos)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $comando->bind_param(
        'iiisiii',
        $usuarioId, $linhas, $colunas, $modalidade, $pontuacao, $nivel, $totalAcertos
    );
    $comando->execute();
    $comando->close();
    $conexao->close();
} catch (mysqli_sql_exception $erro) {
    $conexao->close();
    responder(500, ['ok' => false, 'erro' => 'falha_ao_salvar']);
}

responder(200, ['ok' => true]);
