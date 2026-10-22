"use strict";

document.addEventListener('DOMContentLoaded', () => {
    /* -------------------------- Elementos da Interface -------------------------- */
    const containerVitoria = document.getElementById('modal-vitoria');
    const containerDerrota = document.getElementById('modal-derrota');

    const btnProximoNivel = document.getElementById('btn-proximo-nivel');
    const btnTentarNovamente = document.getElementById('btn-tentar-novamente');
    const botoesMenuPrincipal = document.querySelectorAll('.btn-menu-principal');

    const hash = window.location.hash;

    /* -------------------------- Alternância de Exibição -------------------------- */
    if (hash === '#vitoria') {
        if (containerVitoria) containerVitoria.style.display = 'flex';
        if (containerDerrota) containerDerrota.style.display = 'none';
        carregarEstatisticasVitoria();
    } else {
        // Padrão ou derrota
        if (containerVitoria) containerVitoria.style.display = 'none';
        if (containerDerrota) containerDerrota.style.display = 'flex';
        carregarEstatisticasDerrota();
    }

    /* -------------------------- Carregamento de Dados -------------------------- */
    function carregarEstatisticasVitoria() {
        const resultado = localStorage.getItem('resultadoVitoria');
        if (!resultado) return;

        const dados = JSON.parse(resultado);
        const elPontos = document.getElementById('pontuacao-vitoria');
        const elNivel = document.getElementById('nivel-vitoria');

        if (elPontos) elPontos.textContent = dados.pontos || 0;
        if (elNivel) elNivel.textContent = dados.nivel || 1;
    }

    function carregarEstatisticasDerrota() {
        const placarSalvo = localStorage.getItem('placarAtual');
        if (!placarSalvo) return;

        const placar = JSON.parse(placarSalvo);
        const elPontos = document.getElementById('pontuacao-derrota');
        const elNivel = document.getElementById('nivel-derrota');

        if (elPontos) elPontos.textContent = placar.pontosTotal || 0;
        if (elNivel) elNivel.textContent = placar.nivel || 1;
    }

    /* -------------------------- Ações dos Botões -------------------------- */

    // Avançar para o próximo nível (Vitória)
    if (btnProximoNivel) {
        btnProximoNivel.addEventListener('click', () => {
            window.location.href = 'tabuleiro.html?proximoNivel=true';
        });
    }

    // Reiniciar o jogo (Derrota)
    if (btnTentarNovamente) {
        btnTentarNovamente.addEventListener('click', () => {
            localStorage.removeItem('tempoRestante');
            localStorage.removeItem('placarAtual');
            window.location.href = 'tabuleiro.html';
        });
    }

    // Voltar ao Menu Principal (Presente em ambos os modais)
    botoesMenuPrincipal.forEach((btn) => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('tempoRestante');
            localStorage.removeItem('placarAtual');
            window.location.href = 'home.html?abrirModal=true';
        });
    });
});