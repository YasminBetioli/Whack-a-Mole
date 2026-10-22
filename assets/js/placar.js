"use strict";

/* -------------------------- Configurações do Placar -------------------------- */
const REGRAS_PLACAR = {
    pontosPorAcerto: 10,
    penalidadeBomba: 15,
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

function atualizarPontuacao() {
    // Garante que a pontuação do nível não fique menor que zero (opcional, adicione Math.max se quiser barrar negativos)
    placar.pontosNivel = Math.max(0, 
        (placar.acertosNivel * REGRAS_PLACAR.pontosPorAcerto) -
        (placar.bombasNivel * REGRAS_PLACAR.penalidadeBomba)
    );
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
function registrarAcerto(info) {
    placar.acertosNivel++;
    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();

    // Efeito visual no cursor
    document.body.classList.add('cursor-anomalia');
    setTimeout(() => document.body.classList.remove('cursor-anomalia'), 250);

    // Salva o estado atualizado para permitir salvamento no Sair
    localStorage.setItem('placarAtual', JSON.stringify(placar));

    // Retorna true se bateu ou ultrapassou a meta do nível
    const bateuMeta = placar.pontosNivel >= metaDoNivel(placar.nivel);
    if (bateuMeta && typeof finalizarPartida === 'function') {
        finalizarPartida('vitoria');
    }

    return bateuMeta;
}

function registrarBomba(info) {
    placar.bombasNivel++;
    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();

    // Efeito visual no cursor
    document.body.classList.add('cursor-bomba');
    setTimeout(() => document.body.classList.remove('cursor-bomba'), 250);

    // Salva o estado atualizado
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
    
    // 1. Caso esteja avançando para o próximo nível vindo da tela de Vitória
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

    // 2. Caso esteja retomando uma partida onde clicou em "Sair"
    if (parametros.get('retomar') === 'true') {
        const placarSalvo = localStorage.getItem('placarAtual');
        if (placarSalvo) {
            Object.assign(placar, JSON.parse(placarSalvo));
        }
    } else {
        // Partida completamente nova: limpa dados antigos de salvamento
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
    atualizarPainel();
    atualizarModalVitoria();
});