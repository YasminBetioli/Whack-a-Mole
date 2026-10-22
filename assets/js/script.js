"use strict";

/* -------------------------- Variáveis Globais de Tempo -------------------------- */
let tempoRestante = 50; 
let intervalo = null;
let jogoPausado = false;
let jogoAtivo = false;

/* -------------------------- Inicialização do Jogo -------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    const modoJogo = localStorage.getItem('modoJogo') || sessionStorage.getItem('modo') || 'classico';
    const indicadorModo = document.querySelector('.modo');
    if (indicadorModo) {
        indicadorModo.textContent = modoJogo === 'explosivo' ? 'Explosivo' : 'Clássico';
    }

    const elementoTempo = document.getElementById('time');
    if (!elementoTempo) return;

    const urlParams = new URLSearchParams(window.location.search);
    const deveRetomar = urlParams.get('retomar');
    const tempoSalvo = localStorage.getItem('tempoRestante');

    if (deveRetomar === 'true' && tempoSalvo !== null) {
        tempoRestante = parseInt(tempoSalvo, 10);
    } else {
        tempoRestante = 50;
        localStorage.removeItem('tempoRestante');
    }

    // Inicia o relógio
    iniciarTemporizador();
});

/* -------------------------- Controle do Temporizador -------------------------- */
function iniciarTemporizador() {
    if (intervalo) return;
    
    jogoAtivo = true;
    jogoPausado = false;
    
    atualizarTempo();

    intervalo = setInterval(() => {
        if (!jogoPausado && jogoAtivo) {
            if (tempoRestante > 0) {
                tempoRestante--;
                atualizarTempo();
                localStorage.setItem('tempoRestante', tempoRestante);
            } else {
                // Avalia se atingiu a porcentagem de acertos em vez de forçar derrota
                if (typeof avaliarFimDoNivel === 'function') {
                    avaliarFimDoNivel();
                } else {
                    finalizarPartida('derrota');
                }
            }
        }
    }, 1000);
}

function atualizarTempo() {
    let minutos = Math.floor(tempoRestante / 60);
    let segundos = tempoRestante % 60;

    let minutosFormatados = String(minutos).padStart(2, '0');
    let segundosFormatados = String(segundos).padStart(2, '0');

    const elementoTempo = document.getElementById('time');
    if (elementoTempo) {
        elementoTempo.textContent = `${minutosFormatados}:${segundosFormatados}`;
    }
}

/* -------------------------- Fluxo de Estado da Partida -------------------------- */
function pausarPartida() {
    jogoPausado = true;
    localStorage.setItem('tempoRestante', tempoRestante);
    if (typeof pararAparicoes === 'function') {
        pararAparicoes();
    }
}

function retomarPartida() {
    jogoPausado = false;
    if (typeof iniciarAparicoes === 'function') {
        iniciarAparicoes();
    }
}

function finalizarPartida(resultado) {
    jogoAtivo = false;
    if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
    }
    
    if (typeof pararAparicoes === 'function') {
        pararAparicoes();
    }

    localStorage.removeItem('tempoRestante');

    if (typeof placar !== 'undefined') {
        const taxaCalculada = typeof calcularTaxaAcertoTotal === 'function' ? calcularTaxaAcertoTotal() : 0;

        const dadosResultado = {
            pontos: placar.pontosTotal,
            nivel: placar.nivel || 1,
            taxa: taxaCalculada
        };

        localStorage.setItem('resultadoVitoria', JSON.stringify(dadosResultado));
        localStorage.setItem('resultadoDerrota', JSON.stringify(dadosResultado));
    }

    if (resultado === 'derrota') {
        window.location.href = 'modal-derrota-vitoria.html#derrota';
    } else if (resultado === 'vitoria') {
        if (typeof placar !== 'undefined') {
            localStorage.setItem('placarParaAvancar', JSON.stringify(placar));
        }
        window.location.href = 'modal-derrota-vitoria.html#vitoria';
    }
}

function reiniciarPartida() {
    localStorage.removeItem('tempoRestante');
    tempoRestante = 50;
    atualizarTempo();
    iniciarTemporizador();
    if (typeof iniciarAparicoes === 'function') {
        iniciarAparicoes();
    }
}