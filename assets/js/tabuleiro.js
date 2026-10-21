

"use strict";

/* ------------------------------ Configuração ------------------------------ */

var CAMINHO_IMG = "/assets/img/";

var IMG_XICARA = CAMINHO_IMG + "xicaraBrancaUnitaria.png";
var IMG_BOMBA = CAMINHO_IMG + "bomba.png";
var CORES_ANOMALIA = ["Azul", "Laranja", "Verde"];

var configTabuleiro = {
  lado: 3, // tabuleiro lado x lado (2 a 8 => 4 a 64 buracos)
  modo: "classico", // 'classico' ou 'explosivo'
  tempoExposicao: 1200, // ms que a anomalia fica visível
  intervaloAparicao: 700, // ms entre tentativas de aparição
  chanceBomba: 0.3, // só vale no modo explosivo
  maxSimultaneas: 1, // calculado em alterarTamanhoTabuleiro()
  ativo: false, // true enquanto as anomalias estão aparecendo
};

var LADO_MIN = 2;
var LADO_MAX = 8;
var TEMPO_FEEDBACK = 250; // ms que a anomalia acertada fica na tela

/* Estado interno (não mexer de fora) */
var elTabuleiro = null;
var buracos = []; // elementos .buraco, na ordem
var anomaliasAtivas = new Map(); // indice -> { tipo, cor, timeoutId, acertada }
var timeoutAparicao = null;

/* ------------------------------ Utilitários ------------------------------- */

function limitarLado(valor) {
  var n = parseInt(valor, 10);
  if (isNaN(n)) {
    return configTabuleiro.lado;
  }
  return Math.min(LADO_MAX, Math.max(LADO_MIN, n));
}


function lerConfiguracaoSalva() {
  try {
    var modo = sessionStorage.getItem("modo");
    var tamanho = sessionStorage.getItem("tamanho");
    if (modo === "classico" || modo === "explosivo") {
      configTabuleiro.modo = modo;
    }
    if (tamanho) {
      configTabuleiro.lado = limitarLado(tamanho);
    }
  } catch (erro) {
    
  }
}

/* ------------------------------ Tabuleiro --------------------------------- */

/* Gera lado x lado buracos dentro de .tabuleiro. */
function criarTabuleiro(lado) {
  elTabuleiro = document.querySelector(".tabuleiro");
  if (!elTabuleiro) {
    return;
  }

  pararAparicoes();
  configTabuleiro.lado = limitarLado(
    lado === undefined ? configTabuleiro.lado : lado,
  );

  elTabuleiro.innerHTML = "";
  buracos = [];

  var total = configTabuleiro.lado * configTabuleiro.lado;
  for (var i = 0; i < total; i++) {
    var buraco = document.createElement("div");
    buraco.className = "buraco";
    buraco.dataset.indice = i;

    var img = document.createElement("img");
    img.src = IMG_XICARA;
    img.alt = "Xícara";
    img.draggable = false;

    buraco.appendChild(img);
    elTabuleiro.appendChild(buraco);
    buracos.push(buraco);
  }

  alterarTamanhoTabuleiro(configTabuleiro.lado, true);
}


function alterarTamanhoTabuleiro(lado, jaCriado) {
  var novoLado = limitarLado(lado);

  if (
    !jaCriado &&
    (novoLado !== configTabuleiro.lado ||
      buracos.length !== novoLado * novoLado)
  ) {
    criarTabuleiro(novoLado);
    return;
  }

  configTabuleiro.lado = novoLado;
  if (elTabuleiro) {
    elTabuleiro.style.setProperty("--colunas", novoLado);
    /* tabuleiros grandes precisam de menos espaço entre os buracos */
    elTabuleiro.style.setProperty("--espaco", novoLado >= 6 ? "6px" : "15px");
  }

  /* mais buracos => mais anomalias ao mesmo tempo (3x3 = 1, 8x8 = 7) */
  configTabuleiro.maxSimultaneas = Math.max(
    1,
    Math.floor((novoLado * novoLado) / 9),
  );
}

/* --------------------------- Aparição das anomalias ----------------------- */

/* Sorteia um buraco que NÃO esteja com anomalia. Retorna o índice, ou -1. */
function sortearPosicao() {
  var livres = [];
  for (var i = 0; i < buracos.length; i++) {
    if (!anomaliasAtivas.has(i)) {
      livres.push(i);
    }
  }
  if (livres.length === 0) {
    return -1;
  }
  return livres[Math.floor(Math.random() * livres.length)];
}

/* Mostra uma toupeira (ou bomba, no modo explosivo) no buraco indicado. */
function mostrarAnomalia(indice) {
  if (indice < 0 || indice >= buracos.length || anomaliasAtivas.has(indice)) {
    return;
  }

  var ehBomba =
    configTabuleiro.modo === "explosivo" &&
    Math.random() < configTabuleiro.chanceBomba;
  var tipo = ehBomba ? "bomba" : "toupeira";
  var cor = ehBomba
    ? null
    : CORES_ANOMALIA[Math.floor(Math.random() * CORES_ANOMALIA.length)];

  var img = buracos[indice].querySelector("img");
  if (ehBomba) {
    img.src = IMG_BOMBA;
    img.alt = "Bomba";
  } else {
    img.src = CAMINHO_IMG + "anomalia" + cor + "_normal.png";
    img.alt = "Anomalia " + cor.toLowerCase();
  }

  buracos[indice].dataset.tipo = tipo;

  var timeoutId = setTimeout(function () {
    aoExpirarAnomalia(indice);
  }, configTabuleiro.tempoExposicao);

  anomaliasAtivas.set(indice, {
    tipo: tipo,
    cor: cor,
    timeoutId: timeoutId,
    acertada: false,
  });
}

/* A anomalia sumiu sozinha (ninguém clicou). Toupeira que escapou conta como
   perdida na % de acertos; bomba que some não penaliza nem conta. */
function aoExpirarAnomalia(indice) {
  var anomalia = anomaliasAtivas.get(indice);
  if (
    anomalia &&
    anomalia.tipo === "toupeira" &&
    typeof contabilizarResultado === "function"
  ) {
    contabilizarResultado("perdida");
  }
  esconderAnomalia(indice);
}

/* Remove a anomalia do buraco e devolve a xícara vazia. */
function esconderAnomalia(indice) {
  var anomalia = anomaliasAtivas.get(indice);
  if (anomalia) {
    clearTimeout(anomalia.timeoutId);
    anomaliasAtivas.delete(indice);
  }

  var buraco = buracos[indice];
  if (!buraco) {
    return;
  }
  var img = buraco.querySelector("img");
  img.src = IMG_XICARA;
  img.alt = "Xícara";
  delete buraco.dataset.tipo;
}

function esconderTodasAnomalias() {
  Array.from(anomaliasAtivas.keys()).forEach(esconderAnomalia);
}

/* Liga a sequência de aparições. Pode ser chamada de novo após pausa. */
function iniciarAparicoes() {
  if (configTabuleiro.ativo || buracos.length === 0) {
    return;
  }
  configTabuleiro.ativo = true;
  agendarProximaAparicao();
}

function agendarProximaAparicao() {
  timeoutAparicao = setTimeout(function () {
    if (!configTabuleiro.ativo) {
      return;
    }
    if (anomaliasAtivas.size < configTabuleiro.maxSimultaneas) {
      mostrarAnomalia(sortearPosicao());
    }
    agendarProximaAparicao();
  }, configTabuleiro.intervaloAparicao);
}


function pararAparicoes() {
  configTabuleiro.ativo = false;
  clearTimeout(timeoutAparicao);
  timeoutAparicao = null;
  esconderTodasAnomalias();
}

function atualizarVelocidade(tempoExposicaoMs) {
  configTabuleiro.tempoExposicao = Math.max(250, tempoExposicaoMs);
  configTabuleiro.intervaloAparicao = Math.max(
    200,
    Math.round(tempoExposicaoMs * 0.6),
  );
}

/* ------------------------------ Cliques ----------------------------------- */
function verificarClique(evento) {
  if (!configTabuleiro.ativo) {
    return;
  }
  var buraco = evento.target.closest(".buraco");
  if (!buraco) {
    return;
  }

  var indice = parseInt(buraco.dataset.indice, 10);
  var anomalia = anomaliasAtivas.get(indice);
  if (!anomalia || anomalia.acertada) {
    return; // clicou em xícara vazia ou repetiu o clique
  }
  anomalia.acertada = true;
  clearTimeout(anomalia.timeoutId);

  var info = { indice: indice, tipo: anomalia.tipo, cor: anomalia.cor };

  if (anomalia.tipo === "toupeira") {
    buraco.querySelector("img").src =
      CAMINHO_IMG + "anomalia" + anomalia.cor + "_acertada.png";
    if (typeof contabilizarResultado === "function") {
      contabilizarResultado("acerto");
    }
    /* contabiliza o acerto, se já estiver pronta */
    if (typeof registrarAcerto === "function") {
      registrarAcerto(info);
    }
  } else {
    if (typeof contabilizarResultado === "function") {
      contabilizarResultado("bomba");
    }
    /* aplica a penalidade, se já estiver pronta */
    if (typeof registrarBomba === "function") {
      registrarBomba(info);
    }
  }


  anomalia.timeoutId = setTimeout(function () {
    esconderAnomalia(indice);
  }, TEMPO_FEEDBACK);
}


document.addEventListener("DOMContentLoaded", function () {
  lerConfiguracaoSalva();
  criarTabuleiro(configTabuleiro.lado);

  elTabuleiro.addEventListener("click", verificarClique);


  iniciarAparicoes();
});
