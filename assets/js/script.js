let tempoRestante = 300; 
let intervalo = null;
let jogoPausado = false;
let jogoAtivo = false;

window.addEventListener('DOMContentLoaded', () => {
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
        tempoRestante = 300;
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

  localStorage.removeItem("tempoRestante");

  if (resultado === "derrota") {
    window.location.href = "modal-derrota-vitoria.html#derrota";
  } else if (resultado === "vitoria") {
    window.location.href = "modal-derrota-vitoria.html#vitoria";
  }
}
function reiniciarPartida() {
    localStorage.removeItem('tempoRestante');
    tempoRestante = 300;
    atualizarTempo();
    iniciarTemporizador();
}