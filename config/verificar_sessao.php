<?php
// Guarda de acesso: coloque no TOPO de toda página da pasta pages/ que exige login
// (na linha 1, antes do <!DOCTYPE html>) a linha:
//
//     require_once __DIR__ . '/../config/verificar_sessao.php';
//
// Se não houver usuário logado, manda para a tela de login.

session_start();

// Impede o navegador de guardar a página em cache
// (assim, depois de sair da conta, o botão "voltar" não mostra a página protegida)
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if (!isset($_SESSION['usuario_id'])) {
    header('Location: ../index.php');
    exit;
}
