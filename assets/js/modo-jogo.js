

"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var divClassico = document.getElementById("classico");
  var divExplosivo = document.getElementById("explosivo");
  var select = document.getElementById("tabuleiroSelect");
  var btnJogar = document.querySelector(".btnJogar");

  var modo = "classico";
  try {
    modo =
      sessionStorage.getItem("modo") === "explosivo" ? "explosivo" : "classico";
    var salvo = sessionStorage.getItem("tamanho");
   
    if (salvo && select.querySelector('option[value="' + salvo + '"]')) {
      select.value = salvo;
    }
  } catch (erro) {
   
  }

  function marcarModo(novoModo) {
    modo = novoModo;
    divClassico.classList.toggle("selecionado", modo === "classico");
    divExplosivo.classList.toggle("selecionado", modo === "explosivo");
  }

  document
    .getElementById("modoClassicoBtn")
    .addEventListener("click", function () {
      marcarModo("classico");
    });
  document
    .getElementById("modoExplosivoBtn")
    .addEventListener("click", function () {
      marcarModo("explosivo");
    });
  marcarModo(modo);

  btnJogar.addEventListener("click", function () {
    try {
      sessionStorage.setItem("modo", modo);
      sessionStorage.setItem("tamanho", select.value);
    } catch (erro) {
     
    }
   
    window.location.href = "tabuleiro.html";
  });
});
