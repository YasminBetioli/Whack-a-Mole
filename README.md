# Acerte a Toupeira (Whack-a-Mole)

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![PHP](https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

> **Projeto Final da disciplina SI401 - Programação Web**  
> Plataforma online do clássico jogo Arcade "Acerte a Toupeira", desenvolvida do zero (Vanilla), abordando front-end e back-end.

📖 Sobre o Projeto
Este projeto consiste em uma plataforma web completa onde usuários podem se cadastrar, jogar partidas de Acerte a Toupeira e competir em um ranking global. O jogo acontece diretamente no navegador, com o front-end controlando toda a lógica e temporização da partida, enquanto o back-end em PHP gerencia a segurança, sessões de usuário e persistência de dados.

🎮 Modos de Jogo
O usuário pode definir o tamanho do tabuleiro (de 4 a 64 buracos) e escolher entre duas modalidades:

Clássica: Toupeiras surgem aleatoriamente. O objetivo é clicar nelas antes que desapareçam.

Explosiva: Toupeiras e bombas surgem aleatoriamente. Acertar toupeiras soma pontos, mas clicar nas bombas aplica penalidades ao placar.

📈 Sistema de Progressão e Dificuldade
O jogo é infinito, dividido em níveis com duração fixa de tempo. Para avançar de nível, o jogador deve atingir uma meta de x% de acertos. A cada novo nível, o tempo de exposição da toupeira nos buracos diminui, exigindo reflexos cada vez mais rápidos. A partida encerra quando o jogador não atinge a porcentagem mínima de acertos do nível.

✨ Funcionalidades
Autenticação e Cadastro: Criação de conta (com validação de dados) e login utilizando controle de sessões PHP.

Gestão de Perfil: Atualização de dados cadastrais do jogador.

Motor do Jogo (JS): Lógica de geração aleatória, controle de tempo (setInterval/setTimeout), cálculo de hitbox e pontuação dinâmica.

Histórico Pessoal: Registro detalhado de todas as partidas jogadas pelo usuário (dimensões, nível alcançado, modalidade e data/hora).

Ranking Global: Tabela com os melhores jogadores da plataforma.

Design Responsivo e Validado: Interface estilizada com CSS puro, aprovada nos validadores da W3C.

🛠️ Tecnologias Utilizadas
Este projeto foi desenvolvido respeitando a restrição de não utilizar frameworks (como React, Laravel ou Bootstrap), garantindo o aprendizado dos fundamentos da web:

Front-end: HTML5, CSS3, JavaScript (Vanilla / ES6+).

Back-end: PHP puro.

Banco de Dados: MySQL / MariaDB.
