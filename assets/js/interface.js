/* Abre e fecha a tela de seleção de jogo */
const dialogoSelecaoJogo = document.getElementById('selecao-jogo');
const botaoAbrirSelecao = document.getElementById('abrir-selecao-jogo');
const botaoFecharSelecao = document.querySelector('#selecao-jogo .btn-voltar');
const botaoIniciarPartida = document.getElementById('iniciar-partida');

botaoAbrirSelecao.addEventListener('click', () => dialogoSelecaoJogo.showModal());
botaoFecharSelecao.addEventListener('click', () => dialogoSelecaoJogo.close());

dialogoSelecaoJogo.addEventListener('click', (evento) => { /* Fecha a tela*/
	if (evento.target === dialogoSelecaoJogo) {
		dialogoSelecaoJogo.close();
	}
});

/*Faz que, ao clicar, o modo de jogo seja selecionado e a borda permaneça visível*/ 
document.getElementById('gameMode').addEventListener('click', (evento) => {
	const modo = evento.target.closest('#classico, #explosivo');
	if (!modo) {
		return;
	}

	document.querySelectorAll('#classico, #explosivo').forEach((opcao) => {
		opcao.classList.toggle('selecionado', opcao === modo);
	});
});

/* Inicia a partida com o modo de jogo selecionado */
botaoIniciarPartida.addEventListener('click', () => {
	const dimensaoTabuleiro = document.getElementById('tabuleiroSelect').value; /* Obtém a dimensão selecionada */
	const modoSelecionado = document.querySelector('#gameMode .selecionado');
	const modoJogo = modoSelecionado && modoSelecionado.id === 'explosivo' ? 'explosivo' : 'classico';
	localStorage.setItem('dimensaoTabuleiro', dimensaoTabuleiro); /* Salva a dimensão*/
	localStorage.setItem('modoJogo', modoJogo); /* Salva o modo escolhido */
	window.location.href = 'tabuleiro.html'; /* Redireciona para a página do tabuleiro */
});

// Reabre a seleção do modo de jogo quando o jogador retorna do botão Sair.
if (new URLSearchParams(window.location.search).get('abrirModal') === 'true') {
	dialogoSelecaoJogo.showModal();
}
