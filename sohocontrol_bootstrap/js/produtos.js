// Função para cadastrar produto
document.getElementById('produtoForm').addEventListener('submit', function(e) {
  e.preventDefault();

  let product = {
    nome: document.getElementById('nome_produto').value,
    fornecedor: document.getElementById('fornecedor').value,
    origem: document.getElementById('origem').value,
    quantidade: document.getElementById('quantidade').value,
    precoVenda: document.getElementById('preco_venda').value
  };

  fetch('http://localhost:8080/api/produtos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  })
  .then(response => response.json())
  .then(data => {
    alert('Produto cadastrado com sucesso!');
    document.getElementById('produtoForm').reset();
  })
  .catch(error => console.error('Erro:', error));
});

// Função para atualizar tabela de produtos
function atualizarTabelaProdutos() {
  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => {
      let tbody = document.querySelector('#tabelaProdutos tbody');
      tbody.innerHTML = '';

      let search = document.getElementById('buscarProduto').value.toLowerCase();
      let filteredProducts = data.filter(function(produto) {
        return produto.nome.toLowerCase().includes(search);
      });

      filteredProducts.forEach(function(produto) {
        let row = tbody.insertRow();
        row.insertCell().innerText = produto.id;
        row.insertCell().innerText = produto.nome;
        row.insertCell().innerText = produto.fornecedor;
        row.insertCell().innerText = produto.origem;
        row.insertCell().innerText = produto.quantidade;
        row.insertCell().innerText = produto.precoVenda;
      });
    })
    .catch(error => console.error('Erro:', error));
}

document.getElementById('buscarProduto').addEventListener('input', atualizarTabelaProdutos);
document.getElementById('visualizar-tab').addEventListener('click', atualizarTabelaProdutos);
