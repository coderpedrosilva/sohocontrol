const express = require('express');
const path = require('path');
const app = express();
const port = 4200;

// Middleware para servir arquivos estáticos
app.use(express.static(__dirname));

// Roteamento das URLs amigáveis
app.get('/clientes', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

app.get('/vendas', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'vendas.html'));
});

app.get('/estoque', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'produtos.html'));
});

// Redirecionar todas as outras rotas para a página inicial
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
