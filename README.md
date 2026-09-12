# 🕹️ Acerte a Toupeira (Whack-a-Mole)
<p align="center">
    <img src="./Img/UNICAMP_logo.png">
</p>

<p align="left">
  <strong>Projeto Final da disciplina SI401 - Programação Web</strong>
  <br>
  Faculdade de Tecnologia da Universidade Estadual de Campinas (FT/UNICAMP)
</p>

---

### 📖 Sobre o Projeto
Este projeto consiste em uma plataforma web completa onde usuários podem se cadastrar, jogar partidas de Acerte a Toupeira e competir em um ranking global. O jogo acontece diretamente no navegador, com o front-end controlando toda a lógica e temporização da partida, enquanto o back-end em PHP gerencia a segurança, sessões de usuário e persistência de dados.

---

### 🎮 Modos de Jogo
O usuário pode definir o tamanho do tabuleiro (de 4 a 64 buracos) e escolher entre duas modalidades:
* **Clássica:** Toupeiras surgem aleatoriamente. O objetivo é clicar nelas antes que desapareçam.
* **Explosiva:** Toupeiras e bombas surgem aleatoriamente. Acertar toupeiras soma pontos, mas clicar nas bombas aplica penalidades ao placar.

---

### 📈 Sistema de Progressão e Dificuldade
O jogo é infinito, dividido em níveis com duração fixa de tempo. Para avançar de nível, o jogador deve atingir uma meta de x% de acertos. A cada novo nível, o tempo de exposição da toupeira nos buracos diminui, exigindo reflexos cada vez mais rápidos. A partida encerra quando o jogador não atinge a porcentagem mínima de acertos do nível.

---

### ✨ Funcionalidades
* **Autenticação e Cadastro:** Criação de conta (com validação de dados) e login utilizando controle de sessões PHP.
* **G**estão de Perfil:** Atualização de dados cadastrais do jogador.
* **Motor do Jogo (JS):** Lógica de geração aleatória, controle de tempo (setInterval/setTimeout), cálculo de hitbox e pontuação dinâmica.
* **Histórico Pessoal:** Registro detalhado de todas as partidas jogadas pelo usuário (dimensões, nível alcançado, modalidade e data/hora).
* **Ranking Global:** Tabela com os melhores jogadores da plataforma.
* **Design Responsivo e Validado:** Interface estilizada com CSS puro, aprovada nos validadores da W3C.

---

### 🛠️ Tecnologias Utilizadas
Este projeto foi desenvolvido respeitando a restrição de não utilizar frameworks (como React, Laravel ou Bootstrap), garantindo o aprendizado dos fundamentos da web:
* **Front-end:** HTML5, CSS3, JavaScript (Vanilla / ES6+).
* **Back-end:** PHP puro.
* **Banco de Dados:** MySQL / MariaDB.

---

### 👥 Membros do Grupo
Este projeto foi desenvolvido por:

**Yasmin Caetano Betioli**      | RA: 296809
**Yasmin Caetano Betioli**      | RA: 296809
**Yasmin Caetano Betioli**      | RA: 296809
**Yasmin Caetano Betioli**      | RA: 296809
**Yasmin Caetano Betioli**      | RA: 296809