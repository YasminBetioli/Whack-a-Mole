
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
    return placar.pontosNivel >= metaDoNivel(placar.nivel);
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
        /* Muda a imagem da xícara para indicar que a anomalia foi acertada */
        const imagem = buraco.querySelector('img');
        imagem.src = imagem.src.replace('_normal.png', '_acertada.png');
        imagem.alt = 'Anomalia acertada';
        document.body.classList.add('cursor-anomalia');
        // Restaura o cursor normal após o efeito do clique.
        setTimeout(() => document.body.classList.remove('cursor-anomalia'), 250);
        const nivelConcluido = registrarAcerto();
        buraco.dataset.tipo = 'anomaliaAcertada';
        clearTimeout(temporizadorAnomalia);
        temporizadorAnomalia = setTimeout(() => {
            esconderAnomalia(buraco);
            if (nivelConcluido) {
                finalizarPartida('vitoria');
            }
        }, 1000);
        return;
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

function restaurarProximoNivel() {
    const parametros = new URLSearchParams(window.location.search);
    if (parametros.get('proximoNivel') !== 'true') return;

    // Recupera o placar e avança antes de atualizar o painel.
    const placarSalvo = localStorage.getItem('placarParaAvancar');
    if (placarSalvo) {
        Object.assign(placar, JSON.parse(placarSalvo));
        avancarNivel();
    }

    localStorage.removeItem('placarParaAvancar');
    localStorage.removeItem('resultadoVitoria');
}

function atualizarModalVitoria() {
    const resultado = localStorage.getItem('resultadoVitoria');
    if (!resultado) return;

    const dados = JSON.parse(resultado);
    definirTexto('pontuacao-vitoria', dados.pontos);
    definirTexto('nivel-vitoria', dados.nivel);
}

window.addEventListener('DOMContentLoaded', () => {
    restaurarProximoNivel();
    atualizarPainel();
    atualizarModalVitoria();
});

window.addEventListener('DOMContentLoaded', () => {
    const tabuleiro = document.querySelector('.tabuleiro');
    if (tabuleiro) {
        tabuleiro.addEventListener('click', verificarClique);
    }
});