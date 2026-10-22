"use strict";

/* ------------------------------ Configuração ------------------------------ */

var CAMINHO_IMG = "../assets/img/";

var IMG_XICARA = CAMINHO_IMG + "xicaraBrancaUnitaria.png";
var IMG_BOMBA = CAMINHO_IMG + "bomba.png";
var IMG_EXPLOSAO = CAMINHO_IMG + "bomba_acertada.png";
var CORES_ANOMALIA = ["Azul", "Laranja", "Verde"];

var configTabuleiro = {
  lado: 3,
  modo: "classico",
  tempoExposicao: 1200,
  intervaloAparicao: 700,
  chanceBomba: 0.3,
  maxSimultaneas: 1,
  ativo: false,
};

var LADO_MIN = 2;
var LADO_MAX = 8;
var TEMPO_FEEDBACK = 300;

/* Estado interno */
var elTabuleiro = null;
var buracos = [];
var anomaliasAtivas = new Map();
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
    var modo = sessionStorage.getItem("modo") || localStorage.getItem("modo") ||
               sessionStorage.getItem("modoJogo") || localStorage.getItem("modoJogo");
               
    var tamanho = sessionStorage.getItem("tamanho") || localStorage.getItem("tamanho") ||
                  sessionStorage.getItem("tamanhoTabuleiro") || localStorage.getItem("tamanhoTabuleiro");

    if (modo === "classico" || modo === "explosivo") {
      configTabuleiro.modo = modo;
    }
    if (tamanho) {
      configTabuleiro.lado = limitarLado(tamanho);
    }
  } catch (erro) {
    console.warn("Erro ao ler configurações:", erro);
  }
}

/* ------------------------------ Tabuleiro --------------------------------- */

function criarTabuleiro(lado) {
  elTabuleiro = document.querySelector(".tabuleiro");
  if (!elTabuleiro) {
    console.error("Elemento .tabuleiro não encontrado no HTML!");
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
    elTabuleiro.style.setProperty("--espaco", novoLado >= 6 ? "6px" : "15px");
  }

  configTabuleiro.maxSimultaneas = Math.max(
    1,
    Math.floor((novoLado * novoLado) / 9),
  );
}

function sairDoJogo() {
  pararAparicoes();

  if (typeof tempoRestante !== 'undefined') {
    localStorage.setItem('tempoRestante', tempoRestante);
  }

  if (typeof placar !== 'undefined') {
    localStorage.setItem('placarAtual', JSON.stringify(placar));
  }

  if (typeof intervalo !== 'undefined' && intervalo) {
    clearInterval(intervalo);
    intervalo = null;
  }

  window.location.href = 'home.html?abrirModal=true';
}

/* --------------------------- Aparição das anomalias ----------------------- */

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

    if (typeof registrarAparicaoToupeira === "function") {
      registrarAparicaoToupeira();
    }
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

function aoExpirarAnomalia(indice) {
  esconderAnomalia(indice);
}

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

  buraco.style.pointerEvents = "auto";
  var img = buraco.querySelector("img");
  img.src = IMG_XICARA;
  img.alt = "Xícara";
  delete buraco.dataset.tipo;
}

function esconderTodasAnomalias() {
  Array.from(anomaliasAtivas.keys()).forEach(esconderAnomalia);
}

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
    return;
  }

  anomalia.acertada = true;
  buraco.style.pointerEvents = "none";
  clearTimeout(anomalia.timeoutId);

  var info = { indice: indice, tipo: anomalia.tipo, cor: anomalia.cor };

  if (anomalia.tipo === "toupeira") {
    buraco.querySelector("img").src =
      CAMINHO_IMG + "anomalia" + anomalia.cor + "_acertada.png";

    if (typeof registrarAcerto === "function") {
      registrarAcerto(info);
    }
  } else {
    buraco.querySelector("img").src = IMG_EXPLOSAO;
    buraco.querySelector("img").alt = "Explosão";

    if (typeof registrarBomba === "function") {
      registrarBomba(info);
    }
  }

  anomalia.timeoutId = setTimeout(function () {
    esconderAnomalia(indice);
  }, TEMPO_FEEDBACK);
}

/* ------------------------------ Inicialização Segura --------------------- */

function inicializarJogo() {
  lerConfiguracaoSalva();
  criarTabuleiro(configTabuleiro.lado);

  if (elTabuleiro) {
    elTabuleiro.addEventListener("click", verificarClique);
  }

  iniciarAparicoes();
}

// Garante que renderiza imediatamente, mesmo se o DOM já tiver sido carregado
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarJogo);
} else {
  inicializarJogo();
}