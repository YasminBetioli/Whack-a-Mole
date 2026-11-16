"use strict";

/*
 * Validação dos formulários de Cadastro e Edição de Perfil.
 *
 * Cada função "validar..." recebe o valor digitado e devolve:
 *   - ''  (texto vazio) se o valor está correto;
 *   - uma mensagem de erro, se estiver incorreto.
 *
 * ATENÇÃO: esta validação é só para o usuário (feedback imediato no navegador).
 * No back-end (PHP) as MESMAS regras precisam ser repetidas, porque o navegador
 * pode ser contornado. Só o servidor consegue conferir se username/CPF já existem.
 */

/* -------------------------- Utilitários -------------------------- */

function somenteDigitos(texto) {
    return String(texto).replace(/\D/g, '');
}

/* -------------------------- Regras de cada campo -------------------------- */

function validarNome(valor) {
    const nome = valor.trim().replace(/\s+/g, ' ');

    if (nome === '') return 'Informe o nome completo.';
    if (nome.length > 120) return 'O nome deve ter no máximo 120 caracteres.';
    if (!/^[\p{L}][\p{L}'’.\- ]*$/u.test(nome)) return 'Use apenas letras no nome.';
    if (nome.split(' ').length < 2) return 'Informe nome e sobrenome.';

    return '';
}

function validarDataNascimento(valor) {
    const texto = valor.trim();

    if (texto === '') return 'Informe a data de nascimento.';

    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
    if (!partes) return 'Use o formato dd/mm/aaaa.';

    const dia = parseInt(partes[1], 10);
    const mes = parseInt(partes[2], 10);
    const ano = parseInt(partes[3], 10);
    const data = new Date(ano, mes - 1, dia);

    // Se o JavaScript "corrigiu" a data (ex.: 31/02 virou 03/03), ela não existe
    const dataExiste = data.getFullYear() === ano &&
                       data.getMonth() === mes - 1 &&
                       data.getDate() === dia;

    if (!dataExiste) return 'Essa data não existe.';
    if (ano < 1900) return 'Informe um ano a partir de 1900.';
    if (data > new Date()) return 'A data de nascimento não pode estar no futuro.';

    return '';
}

/* Confere os dois dígitos verificadores do CPF */
function cpfTemDigitosValidos(cpf) {
    for (let tamanho = 9; tamanho <= 10; tamanho++) {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) {
            soma += parseInt(cpf[i], 10) * (tamanho + 1 - i);
        }
        const digito = ((soma * 10) % 11) % 10;
        if (digito !== parseInt(cpf[tamanho], 10)) return false;
    }
    return true;
}

function validarCpf(valor) {
    const cpf = somenteDigitos(valor);

    if (cpf === '') return 'Informe o CPF.';
    if (cpf.length !== 11) return 'O CPF deve ter 11 números.';
    if (/^(\d)\1{10}$/.test(cpf)) return 'CPF inválido.';
    if (!cpfTemDigitosValidos(cpf)) return 'CPF inválido.';

    return '';
}

function validarTelefone(valor) {
    const telefone = somenteDigitos(valor);

    if (telefone === '') return 'Informe o telefone.';
    if (telefone.length < 10 || telefone.length > 11) return 'Informe o telefone com DDD (10 ou 11 números).';
    if (parseInt(telefone.slice(0, 2), 10) < 11) return 'DDD inválido.';
    if (telefone.length === 11 && telefone[2] !== '9') return 'Celular deve começar com 9 depois do DDD.';

    return '';
}

function validarEmail(valor) {
    const email = valor.trim();

    if (email === '') return 'Informe o e-mail.';
    if (email.length > 120) return 'O e-mail deve ter no máximo 120 caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'E-mail inválido.';

    return '';
}

function validarUsername(valor) {
    const username = valor.trim();

    if (username === '') return 'Informe o username.';
    if (!/^[A-Za-z0-9_]{4,30}$/.test(username)) {
        return 'Use de 4 a 30 caracteres: letras, números ou _ (sem espaços).';
    }

    return '';
}

/* Na edição de perfil a senha é opcional: em branco = manter a senha atual */
function validarSenha(valor, opcional) {
    if (valor === '') return opcional ? '' : 'Informe a senha.';
    if (valor.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
    if (valor.length > 72) return 'A senha deve ter no máximo 72 caracteres.';

    return '';
}

/* -------------------------- Máscaras de digitação -------------------------- */

function formatarCpf(valor) {
    const d = somenteDigitos(valor).slice(0, 11);

    if (d.length <= 3) return d;
    if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3);
    if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
    return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9);
}

function formatarTelefone(valor) {
    const d = somenteDigitos(valor).slice(0, 11);

    if (d.length === 0) return '';
    if (d.length <= 2) return '(' + d;
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
}

function formatarData(valor) {
    const d = somenteDigitos(valor).slice(0, 8);

    if (d.length <= 2) return d;
    if (d.length <= 4) return d.slice(0, 2) + '/' + d.slice(2);
    return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
}

/* Campo (id do input) -> máscara e limite de caracteres */
const MASCARAS = {
    'cpf':             { formatar: formatarCpf,      maximo: 14 },
    'telefone':        { formatar: formatarTelefone, maximo: 15 },
    'data-nascimento': { formatar: formatarData,     maximo: 10 }
};

/* -------------------------- Exibição dos erros na tela -------------------------- */

function obterElementoErro(input) {
    const idErro = 'erro-' + input.id;
    let elementoErro = document.getElementById(idErro);

    if (!elementoErro) {
        elementoErro = document.createElement('span');
        elementoErro.id = idErro;
        elementoErro.className = 'erro-campo';
        elementoErro.setAttribute('role', 'alert');
        input.insertAdjacentElement('afterend', elementoErro);
        input.setAttribute('aria-describedby', idErro);
    }
    return elementoErro;
}

function mostrarErro(input, mensagem) {
    const elementoErro = obterElementoErro(input);

    elementoErro.textContent = mensagem;
    input.classList.toggle('input-invalido', mensagem !== '');
    input.setAttribute('aria-invalid', mensagem !== '' ? 'true' : 'false');
}

/* -------------------------- Validação do formulário -------------------------- */

/* Devolve a mensagem de erro do campo (ou '' se estiver certo) */
function validarCampo(input, formulario) {
    const valor = input.value;

    switch (input.id) {
        case 'nome':              return validarNome(valor);
        case 'data-nascimento':   return validarDataNascimento(valor);
        case 'cpf':               return validarCpf(valor);
        case 'telefone':          return validarTelefone(valor);
        case 'email':             return validarEmail(valor);
        case 'username-cadastro': return validarUsername(valor);
        case 'senha-cadastro':    return validarSenha(valor, formulario.id === 'form-editar-perfil');
        default:                  return '';
    }
}

/*
 * Mensagem de erro de um campo. Se o servidor recusou o valor (ex.: username já existe) e a
 * pessoa ainda não mudou o texto, a mensagem do servidor continua valendo.
 */
function mensagemDoCampo(input, formulario) {
    if (input.dataset.erroServidor && input.dataset.valorComErro === input.value) {
        return input.dataset.erroServidor;
    }
    return validarCampo(input, formulario);
}

/* Valida todos os campos habilitados; devolve o primeiro campo com erro (ou null) */
function validarFormulario(formulario) {
    let primeiroInvalido = null;

    formulario.querySelectorAll('input').forEach((input) => {
        // Campos bloqueados (cadeado) não podem ser alterados, então não são validados
        if (input.disabled) return;

        const mensagem = mensagemDoCampo(input, formulario);
        mostrarErro(input, mensagem);

        if (mensagem !== '' && primeiroInvalido === null) {
            primeiroInvalido = input;
        }
    });

    return primeiroInvalido;
}

function configurarFormulario(formulario) {
    formulario.querySelectorAll('input').forEach((input) => {
        if (input.disabled) return;

        const mascara = MASCARAS[input.id];
        if (mascara) {
            input.maxLength = mascara.maximo;
            input.addEventListener('input', () => {
                input.value = mascara.formatar(input.value);
            });
        }

        // Ao sair do campo, mostra o erro; enquanto corrige, o erro some assim que ficar certo
        input.addEventListener('blur', () => {
            mostrarErro(input, mensagemDoCampo(input, formulario));
        });
        input.addEventListener('input', () => {
            if (input.classList.contains('input-invalido')) {
                mostrarErro(input, mensagemDoCampo(input, formulario));
            }
        });
    });

    formulario.addEventListener('submit', (evento) => {
        const primeiroInvalido = validarFormulario(formulario);

        if (primeiroInvalido) {
            evento.preventDefault();
            primeiroInvalido.focus();
            return;
        }

        // Se o servidor recusar o cadastro (ex.: username repetido), a página recarrega vazia:
        // guardamos o que foi digitado (menos a senha) para preencher de novo.
        if (formulario.id === 'form-cadastro') {
            salvarRascunho(formulario);
        }

        // Formulário com "action" (ligado ao PHP): o envio segue normalmente.
        // Sem "action", só segue para a página indicada em data-destino.
        const destino = formulario.dataset.destino;
        if (!formulario.getAttribute('action') && destino) {
            evento.preventDefault();
            window.location.href = destino;
        }
    });
}

/* -------------------------- Cadastro: rascunho e erros vindos do servidor -------------------------- */

/* Nome usado na URL (?campos=...) feita pelo cadastrar.php -> id do input */
const CAMPOS_DO_SERVIDOR = {
    nome:       'nome',
    nascimento: 'data-nascimento',
    cpf:        'cpf',
    telefone:   'telefone',
    email:      'email',
    username:   'username-cadastro',
    senha:      'senha-cadastro'
};

const MENSAGENS_DUPLICADO = {
    username: 'Esse username já está em uso.',
    cpf:      'Já existe uma conta com esse CPF.'
};

const CHAVE_RASCUNHO = 'rascunhoCadastro';

function salvarRascunho(formulario) {
    const dados = {};
    formulario.querySelectorAll('input').forEach((input) => {
        if (input.type !== 'password') dados[input.id] = input.value;
    });

    try {
        sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(dados));
    } catch (erro) {
        // Sem armazenamento disponível: o cadastro funciona, só não restaura o texto digitado
    }
}

function restaurarRascunho(formulario) {
    try {
        const salvo = sessionStorage.getItem(CHAVE_RASCUNHO);
        sessionStorage.removeItem(CHAVE_RASCUNHO);
        if (!salvo) return;

        const dados = JSON.parse(salvo);
        Object.keys(dados).forEach((id) => {
            const input = document.getElementById(id);
            if (input && formulario.contains(input) && input.type !== 'password') {
                input.value = dados[id];
            }
        });
    } catch (erro) {
        // Rascunho ilegível: segue com os campos vazios
    }
}

function removerRascunho() {
    try {
        sessionStorage.removeItem(CHAVE_RASCUNHO);
    } catch (erro) {
        // nada a fazer
    }
}

/* Lê ?erro=...&campos=... deixado na URL pelo cadastrar.php e mostra as mensagens */
function mostrarErrosDoServidor(formulario) {
    const parametros = new URLSearchParams(window.location.search);
    const erro = parametros.get('erro');

    if (!erro) {
        removerRascunho(); // abriu a página do zero: não reaproveita texto antigo
        return;
    }

    restaurarRascunho(formulario);

    const campos = (parametros.get('campos') || '').split(',')
        .filter((nome) => Object.prototype.hasOwnProperty.call(CAMPOS_DO_SERVIDOR, nome));
    let primeiroComErro = null;

    campos.forEach((nome) => {
        const input = document.getElementById(CAMPOS_DO_SERVIDOR[nome]);
        if (!input) return;

        let mensagem = '';
        if (erro === 'duplicado') {
            mensagem = MENSAGENS_DUPLICADO[nome] || 'Esse valor já está em uso.';
        } else if (erro === 'invalido') {
            mensagem = 'Confira este campo.';
        }
        if (mensagem === '') return;

        // Enquanto o texto não mudar, esta mensagem do servidor continua valendo
        input.dataset.erroServidor = mensagem;
        input.dataset.valorComErro = input.value;
        mostrarErro(input, mensagem);

        if (primeiroComErro === null) primeiroComErro = input;
    });

    if (erro === 'servidor') {
        const elementoGeral = document.getElementById('erro-formulario');
        if (elementoGeral) {
            elementoGeral.textContent = 'Não foi possível criar a conta agora. Tente novamente.';
        }
    }

    if (primeiroComErro) primeiroComErro.focus();
}

/* -------------------------- Inicialização -------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    ['form-cadastro', 'form-editar-perfil'].forEach((idFormulario) => {
        const formulario = document.getElementById(idFormulario);
        if (formulario) configurarFormulario(formulario);
    });

    const formularioCadastro = document.getElementById('form-cadastro');
    if (formularioCadastro) mostrarErrosDoServidor(formularioCadastro);
});
