Open Street Maps Dijkstra Study
===================

Este projeto tem por finalidade o estudo e compreensão da implementação de roteirizadores logísticos baseados e dados geoespaciais.

Além disso, este projeto implementa um conceito intitulado de Facilidades Próximas (ou Closest Faciliteis), encontrados em alguns grandes players de mercado, como Uber, 99, Rapiddo, etc.
Este conceito visa encontrar a facilidade mais próxima baseada em uma localidade, como por exemplo encontrar o Táxi mais próximo a sua localização, ou o Motoboy mais próximo de um escritório de advocacia.

Este projeto é baseado na tecnologia Node.js, com alguns pré processamentos em Python suportados pela biblioteca de manipulação e análise de dados geoespaciais ArcPy.

### Rodando o projeto

É necesessário ter versão maior ou igual a 4 do Node.js para rodar este projeto.

Instale os pacotes necessários utilizando o comando abaixo em seu terminal:
```sh
npm install
```

Para subir server do projeto, execute o comando:
```sh
npm start
```
_(Neste passo um diretório *dist* será criado, contendo todos os arquivos transpilados em Javscript )_

Acese o browser utilizando o link http://localhost:3000
