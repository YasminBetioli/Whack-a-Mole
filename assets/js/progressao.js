"use strict";

/* -------------------------- Configuração de Dificuldade por Nível -------------------------- */
const CONFIG_DIFICULDADE = {
    tempoExposicaoBase: 1600,   // Duração inicial da anomalia no Nível 1 (ms)
    reducaoPorNivel: 80,        // Tempo subtraído a cada nível ganho (ms)
    tempoExposicaoMinimo: 450   // Limite mínimo para o jogo permanecer jogável (ms)
};

/* -------------------------- Lógica de Dificuldade -------------------------- */

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

/* -------------------------- Inicialização -------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    // Aplica a velocidade correspondente ao nível assim que a página carrega
    aplicarDificuldadeDoNivel();
});