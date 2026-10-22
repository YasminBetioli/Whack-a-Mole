"use strict";

document.addEventListener('DOMContentLoaded', () => {
    /* -------------------------- Elementos do Modal -------------------------- */
    const dialogoSelecaoJogo = document.getElementById('selecao-jogo');
    const botaoAbrirSelecao = document.getElementById('abrir-selecao-jogo');
    const botaoFecharSelecao = document.querySelector('#selecao-jogo .btn-voltar');
    const botaoIniciarPartida = document.getElementById('iniciar-partida');
    const containerGameMode = document.getElementById('gameMode');

    /* -------------------------- Eventos de Abertura / Fechamento -------------------------- */
    if (botaoAbrirSelecao && dialogoSelecaoJogo) {
        botaoAbrirSelecao.addEventListener('click', () => dialogoSelecaoJogo.showModal());
    }

    if (botaoFecharSelecao && dialogoSelecaoJogo) {
        botaoFecharSelecao.addEventListener('click', () => dialogoSelecaoJogo.close());
    }

    if (dialogoSelecaoJogo) {
        // Fecha o modal ao clicar fora dele (no backdrop)
        dialogoSelecaoJogo.addEventListener('click', (evento) => {
            if (evento.target === dialogoSelecaoJogo) {
                dialogoSelecaoJogo.close();
            }
        });
    }

    /* -------------------------- Seleção do Modo de Jogo -------------------------- */
    if (containerGameMode) {
        containerGameMode.addEventListener('click', (evento) => {
            const modo = evento.target.closest('#classico, #explosivo');
            if (!modo) return;

            document.querySelectorAll('#classico, #explosivo').forEach((opcao) => {
                opcao.classList.toggle('selecionado', opcao === modo);
            });
        });
    }

    /* -------------------------- Iniciar Nova Partida -------------------------- */
    if (botaoIniciarPartida) {
        botaoIniciarPartida.addEventListener('click', () => {
            const selectTabuleiro = document.getElementById('tabuleiroSelect');
            const dimensaoTabuleiro = selectTabuleiro ? selectTabuleiro.value : '3x3'; // ex: "3x3"
            const tamanhoUnico = dimensaoTabuleiro.split('x')[0] || '3';               // ex: "3"

            const modoSelecionado = document.querySelector('#gameMode .selecionado');
            const modoJogo = (modoSelecionado && modoSelecionado.id === 'explosivo') ? 'explosivo' : 'classico';

            // Salva no localStorage (para script.js e placar.js)
            localStorage.setItem('dimensaoTabuleiro', dimensaoTabuleiro);
            localStorage.setItem('modoJogo', modoJogo);

            // Salva no sessionStorage (para tabuleiro.js)
            sessionStorage.setItem('tamanho', tamanhoUnico);
            sessionStorage.setItem('modo', modoJogo);

            // Limpa partidas anteriores salvas para iniciar um jogo do zero
            localStorage.removeItem('tempoRestante');
            localStorage.removeItem('placarAtual');

            // Redireciona para o tabuleiro
            window.location.href = 'tabuleiro.html';
        });
    }

    /* -------------------------- Reabrir Modal ao Sair do Jogo -------------------------- */
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('abrirModal') === 'true' && dialogoSelecaoJogo) {
        if (!dialogoSelecaoJogo.hasAttribute('open')) {
            dialogoSelecaoJogo.showModal();
        }
    }
});