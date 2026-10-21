let tempoRestante = 150; // Altere para 300 se o tempo padrão da fase for 5 minutos
let intervalo = null;
let jogoPausado = false;
let jogoAtivo = false;
const tempoExposicaoAnomalia = 5000;
const intervaloEntreAparicoes = 1000;
let temporizadorAnomalia = null;
let ultimaAnomalia = null;

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

function sortearPosicao() {
    const buracos = document.querySelectorAll('.buraco');
    if (buracos.length === 0) return; 

    const indiceSorteado = Math.floor(Math.random() * buracos.length);
    const buracoSorteado = buracos[indiceSorteado]; 
    const imagem = buracoSorteado.querySelector('img');
    const modoExplosivo = localStorage.getItem('modoJogo') === 'explosivo';
    const exibirBomba = modoExplosivo && Math.random() < 0.3;

    if (exibirBomba) {
        buracoSorteado.dataset.tipo = 'bomba';
        imagem.src = '../assets/img/bomba.png';
        imagem.alt = 'Bomba';
    } else {
        const anomalias = [
            '../assets/img/anomaliaAzul_normal.png',
            '../assets/img/anomaliaLaranja_normal.png',
            '../assets/img/anomaliaVerde_normal.png'
        ];
        const anomaliasDisponiveis = anomalias.filter((anomalia) => anomalia !== ultimaAnomalia);
        const indiceAnomalia = Math.floor(Math.random() * anomaliasDisponiveis.length);
        const caminhoAnomalia = anomaliasDisponiveis[indiceAnomalia];

        buracoSorteado.dataset.tipo = 'anomalia';
        imagem.src = caminhoAnomalia;
        imagem.alt = 'Xícara com anomalia';
        ultimaAnomalia = caminhoAnomalia;
    }

    clearTimeout(temporizadorAnomalia);
    temporizadorAnomalia = setTimeout(esconderAnomalia, tempoExposicaoAnomalia);
}

function iniciarAparicoes() {
    const aparicaoAtiva = document.querySelector('.buraco[data-tipo="anomalia"], .buraco[data-tipo="anomaliaAcertada"], .buraco[data-tipo="bomba"], .buraco[data-tipo="bombaAcertada"]');
    if (!jogoAtivo || jogoPausado || aparicaoAtiva) return;

    sortearPosicao();
}

function esconderAnomalia(buracoAlvo) {
    const buraco = buracoAlvo || document.querySelector('.buraco[data-tipo="anomalia"], .buraco[data-tipo="bomba"]');
    if (buraco) {
        const imagem = buraco.querySelector('img');
        imagem.src = '../assets/img/xicaraBrancaUnitaria.png';
        imagem.alt = 'Xícara';
        buraco.removeAttribute('data-tipo');
    }
    temporizadorAnomalia = null;

    if (jogoAtivo && !jogoPausado) {
        setTimeout(iniciarAparicoes, intervaloEntreAparicoes);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    criarTabuleiro();
    
    const modoJogo = localStorage.getItem('modoJogo') || 'classico';
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
        tempoRestante = parseInt(tempoSalvo);
    } else {
        tempoRestante = 150;
        localStorage.removeItem('tempoRestante');
    }

    iniciarTemporizador();
    iniciarAparicoes();
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
                if (typeof verificarProgressao === "function") {
                    verificarProgressao();
                } else {
                    finalizarPartida("derrota");
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

function pausarPartida() {
    jogoPausado = true;
    localStorage.setItem('tempoRestante', tempoRestante);
    if (typeof pararAparicoes === "function") {
        pararAparicoes();
    }
}

function retomarPartida() {
    jogoPausado = false;
    if (typeof iniciarAparicoes === "function") {
        iniciarAparicoes();
    }
}

function finalizarPartida(resultado) {
    jogoAtivo = false;
    clearInterval(intervalo);
    intervalo = null;
    
    localStorage.removeItem('tempoRestante');

    if (resultado === 'derrota') {
        window.location.href = 'modal-derrota-vitoria.html#derrota';
    } else if (resultado === 'vitoria') {
        if (typeof placar !== 'undefined') {
            localStorage.setItem('placarParaAvancar', JSON.stringify(placar));
            localStorage.setItem('resultadoVitoria', JSON.stringify({
                pontos: placar.pontosNivel,
                nivel: placar.nivel
            }));
        }
        window.location.href = 'modal-derrota-vitoria.html#vitoria';
    }
}

function reiniciarPartida() {
    localStorage.removeItem('tempoRestante');
    tempoRestante = 150;
    atualizarTempo();
    iniciarTemporizador();
}