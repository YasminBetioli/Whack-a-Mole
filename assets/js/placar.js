"use strict";

/* -------------------------- Configurações do Placar -------------------------- */
const REGRAS_PLACAR = {
    porcentagemMinimaNivel: 70, // 70% de acertos necessários para avançar de nível
    pontosPorAcerto: 10,        // Pontos ganhos por toupeira
    penalidadeBomba: 15         // Pontos perdidos por bomba (Modo Explosivo)
};

const placar = {
    nivel: 1,

    // Métricas do Nível Atual
    toupeirasExibidasNivel: 0,
    acertosNivel: 0,
    bombasNivel: 0,
    pontosNivel: 0,

    // Métricas Acumuladas de Níveis Concluídos
    toupeirasConcluidas: 0,
    acertosConcluidos: 0,
    pontosConcluidos: 0,

    // Métricas Totais do Jogo
    toupeirasExibidasTotal: 0,
    acertosTotal: 0,
    pontosTotal: 0
};

/* -------------------------- Funções de Cálculo -------------------------- */

/* Calcula a taxa de acerto do nível atual em porcentagem (0 a 100%) */
function calcularTaxaAcertoNivel() {
    if (placar.toupeirasExibidasNivel === 0) return 0;
    const taxa = (placar.acertosNivel / placar.toupeirasExibidasNivel) * 100;
    return Math.max(0, Math.round(taxa));
}

/* Calcula a taxa de acerto acumulada da partida inteira (0 a 100%) */
function calcularTaxaAcertoTotal() {
    if (placar.toupeirasExibidasTotal === 0) return 0;
    const taxa = (placar.acertosTotal / placar.toupeirasExibidasTotal) * 100;
    return Math.max(0, Math.round(taxa));
}

/* Atualiza os pontos do nível (permite pontuação negativa se houver mais bombas) */
function atualizarPontuacao() {
    placar.pontosNivel = (placar.acertosNivel * REGRAS_PLACAR.pontosPorAcerto) -
                        (placar.bombasNivel * REGRAS_PLACAR.penalidadeBomba);
}

/* Atualiza os acumulados totais da partida */
function atualizarEstatisticas() {
    placar.toupeirasExibidasTotal = placar.toupeirasConcluidas + placar.toupeirasExibidasNivel;
    placar.acertosTotal = placar.acertosConcluidos + placar.acertosNivel;
    placar.pontosTotal = placar.pontosConcluidos + placar.pontosNivel;
}

function definirTexto(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

/* -------------------------- Atualização do Painel / HUD -------------------------- */

function atualizarPainel() {
    const taxaNivel = calcularTaxaAcertoNivel();
    const taxaTotal = calcularTaxaAcertoTotal();

    // 1. Topo da tela: Exibe apenas a pontuação do nível atual
    definirTexto('pontos-nivel', placar.pontosNivel);

    // 2. Estatísticas do jogo
    definirTexto('nivel-atual', placar.nivel);
    definirTexto('pontos-total', placar.pontosTotal);
    definirTexto('acertos-nivel', placar.acertosNivel);
    definirTexto('acertos-total', placar.acertosTotal);
    
    // 3. Taxa de acerto (exibida no canto do tabuleiro e nos modais)
    definirTexto('taxa-acerto-nivel', taxaNivel + '%');
    definirTexto('porcentagem-vitoria', taxaTotal + '%');
    definirTexto('porcentagem-derrota', taxaTotal + '%');

    // 4. Cor dinâmica da taxa: Verde se estiver atingindo a meta (>=70%), Vermelho se estiver abaixo
    const elTaxa = document.getElementById('taxa-acerto-nivel');
    if (elTaxa) {
        elTaxa.style.color = taxaNivel >= 70 ? '#53f2b8' : '#ff6b6b';
    }
}

/* -------------------------- Registros de Eventos -------------------------- */

/* Chamado no tabuleiro.js a cada nova toupeira que sobe no buraco */
function registrarAparicaoToupeira() {
    placar.toupeirasExibidasNivel++;
    atualizarEstatisticas();
    atualizarPainel();
}

/* Chamado ao clicar na TOUPEIRA (+10 pontos) */
function registrarAcerto(info) {
    placar.acertosNivel++;
    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();

    document.body.classList.add('cursor-anomalia');
    setTimeout(() => document.body.classList.remove('cursor-anomalia'), 250);

    localStorage.setItem('placarAtual', JSON.stringify(placar));
}

/* Chamado ao clicar na BOMBA (-15 pontos) */
function registrarBomba(info) {
    placar.bombasNivel++;
    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();

    document.body.classList.add('cursor-bomba');
    setTimeout(() => document.body.classList.remove('cursor-bomba'), 250);

    localStorage.setItem('placarAtual', JSON.stringify(placar));
}

/* -------------------------- Avaliação de Fim de Nível -------------------------- */

/* Chamada quando o tempo 't' do nível expira */
function avaliarFimDoNivel() {
    const taxaAlcancada = calcularTaxaAcertoNivel();
    const passouDeNivel = taxaAlcancada >= REGRAS_PLACAR.porcentagemMinimaNivel;

    if (passouDeNivel) {
        if (typeof finalizarPartida === 'function') {
            finalizarPartida('vitoria');
        }
    } else {
        if (typeof finalizarPartida === 'function') {
            finalizarPartida('derrota');
        }
    }
    return passouDeNivel;
}

/* -------------------------- Progressão de Nível -------------------------- */
function avancarNivel() {
    placar.toupeirasConcluidas += placar.toupeirasExibidasNivel;
    placar.acertosConcluidos += placar.acertosNivel;
    placar.pontosConcluidos += placar.pontosNivel;

    placar.nivel++;
    placar.toupeirasExibidasNivel = 0;
    placar.acertosNivel = 0;
    placar.bombasNivel = 0;
    placar.pontosNivel = 0;

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
    const resultado = localStorage.getItem('resultadoVitoria') || localStorage.getItem('resultadoDerrota');
    if (!resultado) return;

    const dados = JSON.parse(resultado);
    const textoTaxa = (dados.taxa !== undefined ? dados.taxa : 0) + '%';

    definirTexto('pontuacao-vitoria', dados.pontos);
    definirTexto('pontuacao-derrota', dados.pontos);
    definirTexto('nivel-vitoria', dados.nivel);
    definirTexto('nivel-derrota', dados.nivel);

    definirTexto('porcentagem-vitoria', textoTaxa);
    definirTexto('porcentagem-derrota', textoTaxa);
}

/* -------------------------- Inicialização -------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    restaurarEstadoPlacar();
    atualizarPontuacao();
    atualizarEstatisticas();
    atualizarPainel();
    atualizarModalVitoria();
});

function metaDoNivel(nivel) {
    return REGRAS_PLACAR.porcentagemMinimaNivel || 70;
}

