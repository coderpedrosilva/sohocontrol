const express = require('express');
const path = require('path');
const app = express();
const port = 4200;

// Middleware para servir arquivos estáticos
app.use(express.static(__dirname));

// Roteamento das URLs amigáveis
app.get('/clientes', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/vendas', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'vendas.html'));
});

app.get('/estoque', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'produtos.html'));
});

app.get('/relatorios', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'relatorios.html'));
});

// Redirecionar todas as outras rotas para a página inicial
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
