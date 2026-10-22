"use strict";

/* -------------------------- Configurações do Placar -------------------------- */
const REGRAS_PLACAR = {
    pontosPorAcerto: 10,   // Pontos ganhos por anomalia
    penalidadeBomba: 15,   // Pontos perdidos por bomba
    metasPorNivel: [100, 100, 200, 300, 500, 1000]
};

const placar = {
    nivel: 1,

    acertosNivel: 0,
    bombasNivel: 0,
    pontosNivel: 0,

    acertosConcluidos: 0,
    pontosConcluidos: 0,

    acertosTotal: 0,
    pontosTotal: 0
};

/* -------------------------- Funções Auxiliares -------------------------- */
function metaDoNivel(nivel) {
    const metas = REGRAS_PLACAR.metasPorNivel;
    return metas[Math.min(nivel, metas.length) - 1];
}

function definirTexto(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

/* Calcula os pontos: soma os acertos e subtrai as bombas */
function atualizarPontuacao() {
    placar.pontosNivel = (placar.acertosNivel * REGRAS_PLACAR.pontosPorAcerto) -
                        (placar.bombasNivel * REGRAS_PLACAR.penalidadeBomba);
}

function atualizarEstatisticas() {
    placar.acertosTotal = placar.acertosConcluidos + placar.acertosNivel;
    placar.pontosTotal = placar.pontosConcluidos + placar.pontosNivel;
}

function atualizarPainel() {
    definirTexto('nivel-atual', placar.nivel);
    definirTexto('pontos-nivel', placar.pontosNivel);
    definirTexto('meta-nivel', metaDoNivel(placar.nivel));
    definirTexto('acertos-nivel', placar.acertosNivel);
    definirTexto('acertos-total', placar.acertosTotal);
    definirTexto('pontos-total', placar.pontosTotal);
}

/* -------------------------- Registros de Eventos -------------------------- */

/* Chamado ao clicar na ANOMALIA (+10 pontos) */
function registrarAcerto(info) {
    placar.acertosNivel++;
    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();

    // Efeito visual no cursor
    document.body.classList.add('cursor-anomalia');
    setTimeout(() => document.body.classList.remove('cursor-anomalia'), 250);

    localStorage.setItem('placarAtual', JSON.stringify(placar));

    const bateuMeta = placar.pontosNivel >= metaDoNivel(placar.nivel);
    if (bateuMeta && typeof finalizarPartida === 'function') {
        finalizarPartida('vitoria');
    }

    return bateuMeta;
}

/* Chamado ao clicar na BOMBA (-15 pontos) */
function registrarBomba(info) {
    placar.bombasNivel++;
    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();

    // Efeito visual no cursor
    document.body.classList.add('cursor-bomba');
    setTimeout(() => document.body.classList.remove('cursor-bomba'), 250);

    localStorage.setItem('placarAtual', JSON.stringify(placar));
}

/* -------------------------- Progressão de Nível -------------------------- */
function avancarNivel() {
    placar.acertosConcluidos += placar.acertosNivel;
    placar.pontosConcluidos += placar.pontosNivel;

    placar.nivel++;
    placar.acertosNivel = 0;
    placar.bombasNivel = 0;

    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();
}

function restaurarEstadoPlacar() {
    const parametros = new URLSearchParams(window.location.search);
    
    if (parametros.get('proximoNivel') === 'true') {
        const placarSalvo = localStorage.getItem('placarParaAvancar');
        if (placarSalvo) {
            Object.assign(placar, JSON.parse(placarSalvo));
            avancarNivel();
        }
        localStorage.removeItem('placarParaAvancar');
        localStorage.removeItem('resultadoVitoria');
        return;
    }

    if (parametros.get('retomar') === 'true') {
        const placarSalvo = localStorage.getItem('placarAtual');
        if (placarSalvo) {
            Object.assign(placar, JSON.parse(placarSalvo));
        }
    } else {
        localStorage.removeItem('placarAtual');
    }
}

function atualizarModalVitoria() {
    const resultado = localStorage.getItem('resultadoVitoria');
    if (!resultado) return;

    const dados = JSON.parse(resultado);
    definirTexto('pontuacao-vitoria', dados.pontos);
    definirTexto('nivel-vitoria', dados.nivel);
}

/* -------------------------- Inicialização -------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    restaurarEstadoPlacar();
    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();
    atualizarModalVitoria();
});