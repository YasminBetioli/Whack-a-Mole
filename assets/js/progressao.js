
"use strict";

/* ------------------------------ Configuração ------------------------------ */

var META_PORCENTAGEM = 60; // % mínima de acertos para passar de nível
var FATOR_DIFICULDADE = 0.85; // a cada nível o tempo de exposição cai 15%
var EXPOSICAO_MINIMA = 400; // ms: limite para o jogo não ficar impossível
var EXPOSICAO_INICIAL = 1200; // ms: igual ao padrão do tabuleiro.js (nível 1)
var PAUSA_ENTRE_NIVEIS = 1000; // ms de respiro antes do próximo nível

/* ------------------------------ Estado ------------------------------------ */

var nivelAtual = 1;
var desempenho = { acertos: 0, perdidas: 0, bombas: 0 }; // zera a cada nível

/* ------------------------------ Contabilização ---------------------------- */

/* Chamada pelo tabuleiro.js: "acerto" | "perdida" | "bomba" */
function contabilizarResultado(tipo) {
  if (tipo === "acerto") {
    desempenho.acertos++;
  } else if (tipo === "perdida") {
    desempenho.perdidas++;
  } else if (tipo === "bomba") {
    desempenho.bombas++;
  }
  salvarDesempenho();
}

/* Guarda os contadores do nível para a pausa não zerar a % de acertos
   (o botão de pausa troca de página e o JS recomeça do zero). */
function salvarDesempenho() {
  try {
    sessionStorage.setItem("desempenhoNivel", JSON.stringify(desempenho));
  } catch (erro) {
    /* segue sem salvar */
  }
}

function porcentagemAcertos() {
  var total = desempenho.acertos + desempenho.perdidas;
  if (total === 0) {
    return 0;
  }
  return Math.round((desempenho.acertos / total) * 100);
}

/* ------------------------------ As 5 funções ------------------------------ */

/* Confere o requisito do nível: true = atingiu a meta.
   É o ÚNICO lugar que depende do critério (% de acertos). */
function verificarMetaNivel() {
  return porcentagemAcertos() >= META_PORCENTAGEM;
}

/* Deve ser chamada quando o tempo do nível acabar.
   Para as aparições e decide: avança de nível ou encerra a partida. */
function verificarProgressao() {
  if (typeof pararAparicoes === "function") {
    pararAparicoes();
  }

  if (verificarMetaNivel()) {
    avancarNivel();
  } else {
    encerrarPorDesempenho();
  }
}

/* Sobe o nível, zera os contadores do nível e recomeça mais difícil. */
function avancarNivel() {
  nivelAtual++;
  desempenho = { acertos: 0, perdidas: 0, bombas: 0 };
  salvarDesempenho();
  salvarNivel();

  atualizarDificuldade();
  mostrarNivel();

  /* reinicia o tempo do nível (Pessoa 4) */
  if (typeof reiniciarPartida === "function") {
    reiniciarPartida();
  }

  /* pequena pausa antes das anomalias voltarem a aparecer */
  setTimeout(function () {
    if (typeof iniciarAparicoes === "function") {
      iniciarAparicoes();
    }
  }, PAUSA_ENTRE_NIVEIS);
}

/* Deixa as anomalias mais rápidas: menos tempo na tela, com mínimo. */
function atualizarDificuldade() {
  var atual = configTabuleiro.tempoExposicao;
  var novo = Math.max(EXPOSICAO_MINIMA, Math.round(atual * FATOR_DIFICULDADE));
  atualizarVelocidade(novo); // tabuleiro.js: atualiza exposição e intervalo
}

/* Fim de jogo: a meta de acertos do nível não foi alcançada. */
function encerrarPorDesempenho() {
  if (typeof pararAparicoes === "function") {
    pararAparicoes();
  }

  /* resultado disponível para histórico/ranking (Pessoas 1, 2 e 5) */
  var resultado = {
    nivel: nivelAtual,
    modo: configTabuleiro.modo,
    tamanho: configTabuleiro.lado + "x" + configTabuleiro.lado,
    porcentagem: porcentagemAcertos(),
    vitoria: false,
  };
  try {
    sessionStorage.setItem("resultadoPartida", JSON.stringify(resultado));
    sessionStorage.removeItem("nivelAtual");
    sessionStorage.removeItem("desempenhoNivel");
  } catch (erro) {
    /* sem storage: segue sem salvar */
  }

  /* finalizarPartida (Pessoa 4) para o relógio e abre a tela de derrota */
  if (typeof finalizarPartida === "function") {
    finalizarPartida("derrota");
  } else {
    window.location.href = "modal-derrota-vitoria.html#derrota";
  }
}

/* ------------------------------ Interface e retomada ---------------------- */

function mostrarNivel() {
  var el = document.querySelector(".nivel");
  if (el) {
    el.textContent = "Nível " + nivelAtual;
  }
}

function salvarNivel() {
  try {
    sessionStorage.setItem("nivelAtual", nivelAtual);
  } catch (erro) {
    /* segue sem salvar */
  }
}

/* Partida nova começa no nível 1. Se veio do "Continuar" (?retomar=true),
   volta ao nível salvo com a dificuldade correspondente. */
document.addEventListener("DOMContentLoaded", function () {
  var retomar =
    new URLSearchParams(window.location.search).get("retomar") === "true";

  nivelAtual = 1;
  try {
    var salvo = parseInt(sessionStorage.getItem("nivelAtual"), 10);
    if (retomar && !isNaN(salvo) && salvo > 1) {
      nivelAtual = salvo;
    } else if (!retomar) {
      sessionStorage.removeItem("nivelAtual");
    }

    /* volta também aos acertos já feitos no nível */
    var guardado = JSON.parse(sessionStorage.getItem("desempenhoNivel"));
    if (retomar && guardado) {
      desempenho = guardado;
    } else if (!retomar) {
      sessionStorage.removeItem("desempenhoNivel");
    }
  } catch (erro) {
    /* segue no nível 1 */
  }

  atualizarVelocidade(EXPOSICAO_INICIAL);
  for (var i = 1; i < nivelAtual; i++) {
    atualizarDificuldade();
  }
  mostrarNivel();
});
