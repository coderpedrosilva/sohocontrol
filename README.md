# instalação Express

### 1. Instalação do Express.js do Zero

Se você está começando do zero e deseja configurar o Express.js, siga as instruções abaixo.

**Passo 1:** Criar um Novo Projeto Node.js

Navegue até o diretório onde deseja criar o projeto:
```
cd caminho/onde/deseja/criar/o/projeto
```
Inicialize um novo projeto Node.js:
```
npm init -y
```
Instale o Express.js:
```
npm install express
```
**Passo 2:** Criar o Servidor Express

No diretório do projeto, crie um arquivo chamado `server.js` e adicione o conteúdo necessário (conforme consta no projeto).

Execute o servidor Express:
```
node server.js
```
Acesse o servidor pelo navegador em `http://localhost:4200`.

Se houver problemas de execução no PowerShell, você pode ajustar a política de execução com:
```
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Reinstalação das Dependências do Projeto com Express.js

Caso você já tenha o projeto clonado, mas precise reinstalar as dependências que não foram incluídas no repositório devido ao `.gitignore`, siga estas etapas.

**Passo 1:** Instalar as Dependências

Navegue até o diretório do projeto:
```
cd caminho/até/o/projeto
```
Instale as dependências do projeto listadas no `package.json`:
```
npm install
```
**Passo 2:** Verificar o Arquivo server.js

Certifique-se de que o arquivo `server.js` está presente no diretório do projeto.

Passo 3: Executar o Servidor Express

No diretório do projeto, execute o servidor Express:
```
node server.js
```
Acesse o servidor pelo navegador em `http://localhost:4200`.

### Para usar o Nodemon

Você pode usar o Nodemon para substituir o comando node `server.js`. O Nodemon reinicia automaticamente o servidor sempre que houver alterações no código, tornando o desenvolvimento mais prático.

Para usar o Nodemon:

1. Instale o Nodemon globalmente:
 ```
npm install -g nodemon
```
2. Depois, no diretório do projeto, use o seguinte comando para iniciar o servidor:
```
nodemon server.js
```
Dessa forma, o servidor será automaticamente reiniciado sempre que você modificar o código em `server.js`. 











