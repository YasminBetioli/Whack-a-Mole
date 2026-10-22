"use strict";

/* -------------------------- Configuração de Dificuldade por Nível -------------------------- */
const CONFIG_DIFICULDADE = {
    tempoExposicaoBase: 1200,   // Duração inicial da anomalia no Nível 1 (ms)
    reducaoPorNivel: 120,      // Tempo subtraído a cada nível ganho (ms)
    tempoExposicaoMinimo: 350  // Limite mínimo para o jogo permanecer jogável (ms)
};

/* -------------------------- Lógica de Progressão e Dificuldade -------------------------- */

/**
 * Calcula e aplica os tempos de exposição e intervalo de aparição no tabuleiro
 * com base no nível atual contido no placar.
 */
function aplicarDificuldadeDoNivel() {
    const nivelAtual = (typeof placar !== 'undefined' && placar.nivel) ? placar.nivel : 1;

    // Calcula o tempo de exposição reduzindo proporcionalmente ao nível
    const tempoExposicao = Math.max(
        CONFIG_DIFICULDADE.tempoExposicaoMinimo,
        CONFIG_DIFICULDADE.tempoExposicaoBase - ((nivelAtual - 1) * CONFIG_DIFICULDADE.reducaoPorNivel)
    );

    // Aplica a nova velocidade na mecânica do tabuleiro.js
    if (typeof atualizarVelocidade === 'function') {
        atualizarVelocidade(tempoExposicao);
    }
}

/**
 * Checa se a pontuação atual do nível atingiu ou superou a meta definida.
 * @returns {boolean}
 */
function verificarMetaConcluida() {
    if (typeof placar === 'undefined' || typeof metaDoNivel !== 'function') {
        return false;
    }

    const meta = metaDoNivel(placar.nivel);
    return placar.pontosNivel >= meta;
}

/**
 * Avalia se o jogador pode avançar e dispara a transição de vitória.
 */
function verificarProgressao() {
    if (verificarMetaConcluida()) {
        if (typeof finalizarPartida === 'function') {
            finalizarPartida('vitoria');
        }
    }
}

/* -------------------------- Inicialização -------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    // Aplica a velocidade correspondente ao nível assim que a página carrega
    aplicarDificuldadeDoNivel();
});