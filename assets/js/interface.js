const dialogoSelecaoJogo = document.getElementById('selecao-jogo');
const botaoAbrirSelecao = document.getElementById('abrir-selecao-jogo');
const botaoFecharSelecao = document.querySelector('#selecao-jogo .btn-voltar');

botaoAbrirSelecao.addEventListener('click', () => dialogoSelecaoJogo.showModal());
botaoFecharSelecao.addEventListener('click', () => dialogoSelecaoJogo.close());

dialogoSelecaoJogo.addEventListener('click', (evento) => {
	if (evento.target === dialogoSelecaoJogo) {
		dialogoSelecaoJogo.close();
	}
});
