<?php
// Validação dos dados de cadastro e de edição de perfil NO SERVIDOR.
//
// São as mesmas regras do arquivo assets/js/validacao.js. O JavaScript só ajuda quem
// usa o site normalmente; esta validação é a que vale de verdade, porque o navegador
// pode ser contornado.
//
// Como usar:
//
//     require_once __DIR__ . '/../config/validacao.php';
//     $erro = validar_cpf(valor_post('cpf'));   // '' = tudo certo; senão, a mensagem de erro

/* -------------------------- Utilitários -------------------------- */

/* Lê um campo do formulário (POST). Se não existir ou não for texto, devolve '' */
function valor_post(string $campo): string
{
    $valor = $_POST[$campo] ?? '';
    return is_string($valor) ? $valor : '';
}

function somente_digitos(string $texto): string
{
    return preg_replace('/\D/', '', $texto);
}

/* "15/11/2000" -> "2000-11-15" (formato do MySQL). Só chamar depois de validar a data. */
function data_br_para_iso(string $data): string
{
    [$dia, $mes, $ano] = explode('/', trim($data));
    return sprintf('%04d-%02d-%02d', $ano, $mes, $dia);
}

/* "2000-11-15" -> "15/11/2000" (para mostrar na tela) */
function data_iso_para_br(string $data): string
{
    $partes = explode('-', $data);
    if (count($partes) !== 3) {
        return '';
    }
    return sprintf('%02d/%02d/%04d', $partes[2], $partes[1], $partes[0]);
}

function formatar_cpf(string $cpf): string
{
    $d = somente_digitos($cpf);
    if (strlen($d) !== 11) {
        return $cpf;
    }
    return substr($d, 0, 3) . '.' . substr($d, 3, 3) . '.' . substr($d, 6, 3) . '-' . substr($d, 9, 2);
}

function formatar_telefone(string $telefone): string
{
    $d = somente_digitos($telefone);

    if (strlen($d) === 11) {
        return '(' . substr($d, 0, 2) . ') ' . substr($d, 2, 5) . '-' . substr($d, 7, 4);
    }
    if (strlen($d) === 10) {
        return '(' . substr($d, 0, 2) . ') ' . substr($d, 2, 4) . '-' . substr($d, 6, 4);
    }
    return $telefone;
}

/* -------------------------- Regras de cada campo -------------------------- */

function validar_nome(string $valor): string
{
    $nome = preg_replace('/\s+/u', ' ', trim($valor));

    if ($nome === '') {
        return 'Informe o nome completo.';
    }
    if (mb_strlen($nome) > 120) {
        return 'O nome deve ter no máximo 120 caracteres.';
    }
    if (!preg_match('/^[\p{L}][\p{L}\'’.\- ]*$/u', $nome)) {
        return 'Use apenas letras no nome.';
    }
    if (count(explode(' ', $nome)) < 2) {
        return 'Informe nome e sobrenome.';
    }
    return '';
}

function validar_data_nascimento(string $valor): string
{
    $texto = trim($valor);

    if ($texto === '') {
        return 'Informe a data de nascimento.';
    }
    if (!preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $texto, $partes)) {
        return 'Use o formato dd/mm/aaaa.';
    }

    $dia = (int) $partes[1];
    $mes = (int) $partes[2];
    $ano = (int) $partes[3];

    if (!checkdate($mes, $dia, $ano)) {
        return 'Essa data não existe.';
    }
    if ($ano < 1900) {
        return 'Informe um ano a partir de 1900.';
    }
    if (sprintf('%04d-%02d-%02d', $ano, $mes, $dia) > date('Y-m-d')) {
        return 'A data de nascimento não pode estar no futuro.';
    }
    return '';
}

/* Confere os dois dígitos verificadores do CPF (recebe só os 11 números) */
function cpf_tem_digitos_validos(string $cpf): bool
{
    for ($tamanho = 9; $tamanho <= 10; $tamanho++) {
        $soma = 0;
        for ($i = 0; $i < $tamanho; $i++) {
            $soma += (int) $cpf[$i] * ($tamanho + 1 - $i);
        }
        $digito = (($soma * 10) % 11) % 10;
        if ($digito !== (int) $cpf[$tamanho]) {
            return false;
        }
    }
    return true;
}

function validar_cpf(string $valor): string
{
    $cpf = somente_digitos($valor);

    if ($cpf === '') {
        return 'Informe o CPF.';
    }
    if (strlen($cpf) !== 11) {
        return 'O CPF deve ter 11 números.';
    }
    if (preg_match('/^(\d)\1{10}$/', $cpf)) {
        return 'CPF inválido.';
    }
    if (!cpf_tem_digitos_validos($cpf)) {
        return 'CPF inválido.';
    }
    return '';
}

function validar_telefone(string $valor): string
{
    $telefone = somente_digitos($valor);

    if ($telefone === '') {
        return 'Informe o telefone.';
    }
    if (strlen($telefone) < 10 || strlen($telefone) > 11) {
        return 'Informe o telefone com DDD (10 ou 11 números).';
    }
    if ((int) substr($telefone, 0, 2) < 11) {
        return 'DDD inválido.';
    }
    if (strlen($telefone) === 11 && $telefone[2] !== '9') {
        return 'Celular deve começar com 9 depois do DDD.';
    }
    return '';
}

function validar_email(string $valor): string
{
    $email = trim($valor);

    if ($email === '') {
        return 'Informe o e-mail.';
    }
    if (mb_strlen($email) > 120) {
        return 'O e-mail deve ter no máximo 120 caracteres.';
    }
    if (!preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/', $email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return 'E-mail inválido.';
    }
    return '';
}

function validar_username(string $valor): string
{
    $username = trim($valor);

    if ($username === '') {
        return 'Informe o username.';
    }
    if (!preg_match('/^[A-Za-z0-9_]{4,30}$/', $username)) {
        return 'Use de 4 a 30 caracteres: letras, números ou _ (sem espaços).';
    }
    return '';
}

/* Na edição de perfil a senha é opcional: em branco = manter a senha atual */
function validar_senha(string $valor, bool $opcional = false): string
{
    if ($valor === '') {
        return $opcional ? '' : 'Informe a senha.';
    }
    if (mb_strlen($valor) < 6) {
        return 'A senha deve ter no mínimo 6 caracteres.';
    }
    // O password_hash (bcrypt) só considera os 72 primeiros bytes da senha
    if (strlen($valor) > 72) {
        return 'A senha deve ter no máximo 72 caracteres.';
    }
    return '';
}
