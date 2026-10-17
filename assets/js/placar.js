
const REGRAS_PLACAR = {
    pontosPorAcerto: 10,
    penalidadeBomba: 15,
    metasPorNivel: [100, 150, 200, 300, 500, 1000] 
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
    placar.pontosNivel =
        placar.acertosNivel * REGRAS_PLACAR.pontosPorAcerto -
        placar.bombasNivel * REGRAS_PLACAR.penalidadeBomba;
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

function registrarAcerto() {
    placar.acertosNivel++;
    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();
}

function registrarBomba() {
    placar.bombasNivel++;
    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();
}

function verificarClique(evento) {
    const buraco = evento.target.closest('.buraco');
    if (!buraco) {
        return;
    }

    const tipo = buraco.dataset.tipo;

    if (tipo === 'anomalia') {
        registrarAcerto();
    } else if (tipo === 'bomba') {
        registrarBomba();
    } else {
        return; 
    }

    buraco.dataset.tipo = 'clicado';
}

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

window.addEventListener('DOMContentLoaded', atualizarPainel);

window.addEventListener('DOMContentLoaded', () => {
    const tabuleiro = document.querySelector('.tabuleiro');
    if (tabuleiro) {
        tabuleiro.addEventListener('click', verificarClique);
    }
});