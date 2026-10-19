let tempoRestante = 150; 
let intervalo = null;
let jogoPausado = false;
let jogoAtivo = false;

function criarTabuleiro() {
    const tabuleiro = document.querySelector('.tabuleiro');
    if (!tabuleiro) return;

    const dimensao = localStorage.getItem('dimensaoTabuleiro') || '3x3';
    const [colunas, linhas] = dimensao.split('x').map(Number);
    if (!Number.isInteger(colunas) || !Number.isInteger(linhas) || colunas < 1 || linhas < 1) {
        return;
    }

    tabuleiro.replaceChildren();
    tabuleiro.style.gridTemplateColumns = `repeat(${colunas}, minmax(0, 1fr))`;
    tabuleiro.style.gridTemplateRows = `repeat(${linhas}, minmax(0, 1fr))`;

    for (let indice = 0; indice < colunas * linhas; indice++) {
        const buraco = document.createElement('div');
        buraco.className = 'buraco';

        const xicara = document.createElement('img');
        xicara.src = '../assets/img/xicaraBrancaUnitaria.png';
        xicara.alt = 'Xícara';

        buraco.appendChild(xicara);
        tabuleiro.appendChild(buraco);
    }
}

function sortearPosicao() { /* Sorteia uma posição aleatória para colocar a anomalia, substituindo as imagens*/
    const buracos = document.querySelectorAll('.buraco'); /* Seleciona todos os buracos do tabuleiro e se não tiver buracos não faz nada*/
    if (buracos.length === 0) return; 

    const indiceSorteado = Math.floor(Math.random() * buracos.length); /* Sorteia um índice aleatório para escolher um buraco */
    const buracoSorteado = buracos[indiceSorteado]; 
    const imagemAnomalia = buracoSorteado.querySelector('img');
    const anomalias = [
        '../assets/img/anomaliaAzul_normal.png',
        '../assets/img/anomaliaLaranja_normal.png',
        '../assets/img/anomaliaVerde_normal.png'
    ];
    const indiceAnomalia = Math.floor(Math.random() * anomalias.length);

    buracoSorteado.dataset.tipo = 'anomalia';
    imagemAnomalia.src = anomalias[indiceAnomalia];
    imagemAnomalia.alt = 'Xícara com anomalia';
}

window.addEventListener('DOMContentLoaded', () => {
    criarTabuleiro();
    // Sorteia a primeira anomalia depois de criar os buracos.
    sortearPosicao();

    const elementoTempo = document.getElementById('time');
    if (!elementoTempo) return;

    // Lê se a URL está pedindo para retomar (ex: tabuleiro.html?retomar=true)
    const urlParams = new URLSearchParams(window.location.search);
    const deveRetomar = urlParams.get('retomar');
    
    const tempoSalvo = localStorage.getItem('tempoRestante');

    if (deveRetomar === 'true' && tempoSalvo !== null) {
        // Veio do botão "Continuar": usa estritamente o tempo salvo
        tempoRestante = parseInt(tempoSalvo);
    } else {
        // Jogo novo (veio do menu, Vitória ou Derrota)
        tempoRestante = 150;
        localStorage.removeItem('tempoRestante');
    }

    iniciarTemporizador();
});

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
                finalizarPartida('derrota');
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

function pausarPartida() {
    jogoPausado = true;
    localStorage.setItem('tempoRestante', tempoRestante);
}

function retomarPartida() {
    jogoPausado = false;
}

function finalizarPartida(resultado) {
    jogoAtivo = false;
    clearInterval(intervalo);
    intervalo = null;
    
    localStorage.removeItem('tempoRestante');

    if (resultado === 'derrota') {
        window.location.href = 'modal-derrota-vitoria.html#derrota';
    } else if (resultado === 'vitoria') {
        window.location.href = 'modal-derrota-vitoria.html#vitoria';
    }
}

function reiniciarPartida() {
    localStorage.removeItem('tempoRestante');
    tempoRestante = 300;
    atualizarTempo();
    iniciarTemporizador();
}