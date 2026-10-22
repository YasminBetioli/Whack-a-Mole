"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var divClassico = document.getElementById("classico");
  var divExplosivo = document.getElementById("explosivo");
  var select = document.getElementById("tabuleiroSelect");
  var btnJogar = document.querySelector(".btnJogar");

  var btnClassico = document.getElementById("modoClassicoBtn") || divClassico;
  var btnExplosivo = document.getElementById("modoExplosivoBtn") || divExplosivo;

  var modo = "classico";
  try {
    modo =
      (sessionStorage.getItem("modo") || localStorage.getItem("modo")) === "explosivo"
        ? "explosivo"
        : "classico";
    var salvo = sessionStorage.getItem("tamanho") || localStorage.getItem("tamanho");

    if (salvo && select && select.querySelector('option[value="' + salvo + '"]')) {
      select.value = salvo;
    }
  } catch (erro) {
    console.warn("Erro ao ler storage:", erro);
  }

  function marcarModo(novoModo) {
    modo = novoModo;
    if (divClassico) divClassico.classList.toggle("selecionado", modo === "classico");
    if (divExplosivo) divExplosivo.classList.toggle("selecionado", modo === "explosivo");
  }

  // Registra o clique do Modo Clássico com proteção contra erro de null
  if (btnClassico) {
    btnClassico.addEventListener("click", function () {
      marcarModo("classico");
    });
  }

  // Registra o clique do Modo Explosivo com proteção contra erro de null
  if (btnExplosivo) {
    btnExplosivo.addEventListener("click", function () {
      marcarModo("explosivo");
    });
  }

  marcarModo(modo);

  // Registra o botão Jogar salvando em ambos os storages
  if (btnJogar) {
    btnJogar.addEventListener("click", function () {
      try {
        var tamanhoEscolhido = select ? select.value : "3";
        
        sessionStorage.setItem("modo", modo);
        sessionStorage.setItem("tamanho", tamanhoEscolhido);
        
        localStorage.setItem("modo", modo);
        localStorage.setItem("tamanho", tamanhoEscolhido);
      } catch (erro) {
        console.warn("Erro ao salvar storage:", erro);
      }

      window.location.href = "tabuleiro.html";
    });
  }
});