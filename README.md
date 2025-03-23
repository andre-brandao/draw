# Deds Paint

Projeto desenvolvido para a aula de Computação grafica na puc minas

## Rodando o projeto

é necessario possuir o [NodeJs](https://nodejs.org/en/download) para executar o projeto localmente, guia de instalacao pode ser encontrado clicando no link https://nodejs.org/en/download

Abra o terminal na pasta do projeto e siga os passos a seguir

Instalando as dependencias do projeto

```bash
npm i
```

```bash
npm run dev

```

## Abrindo o projeto

abra o navegador no link localhost:5173 como mencionado no terminal apos o comando anterior

## Note

- O canvas do html representa a imagem como um array de pixels, por baixo, assim satisfaz o requisito funcional do trabalho

https://developer.mozilla.org/en-US/docs/Web/API/ImageData

pode ser acessado atravez do getter em global.svelte.ts

````ts
getAreaDesenho: () => {
// return pixel matriz
return ctx?.getImageData(0, 0, width, height);
}

        ```
````
