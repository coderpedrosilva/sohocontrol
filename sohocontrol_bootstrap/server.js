const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 4200;

// Corrige o caminho dos arquivos no executável pkg
const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;

// Middleware para servir arquivos estáticos corretamente
app.use('/assets', express.static(path.join(basePath, 'assets')));
app.use('/lib', express.static(path.join(basePath, 'lib')));
app.use('/js', express.static(path.join(basePath, 'js')));
app.use('/fonts', express.static(path.join(basePath, 'assets', 'fonts')));

// Roteamento das páginas HTML (corrigido para funcionar no executável)
const serveHTML = (route, filename) => {
  app.get(route, (req, res) => {
    const filePath = path.join(basePath, 'views', filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('Arquivo não encontrado.');
    }
  });
};

serveHTML('/clientes', 'index.html');
serveHTML('/vendas', 'vendas.html');
serveHTML('/estoque', 'produtos.html');
serveHTML('/relatorios', 'relatorios.html');

// Redirecionar todas as outras rotas para a página inicial
app.get('*', (req, res) => {
  res.sendFile(path.join(basePath, 'views', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
