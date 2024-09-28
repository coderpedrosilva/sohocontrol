let produtos = []; // Armazena os produtos cadastrados
let productCode = 1;

document.getElementById('produtoForm').addEventListener('submit', function(e) {
  e.preventDefault();

  let name = document.getElementById('nome_produto').value;
  let supplier = document.getElementById('fornecedor').value;
  let origin = document.getElementById('origem').value;
  let quantity = document.getElementById('quantidade').value;
  let salePrice = document.getElementById('preco_venda').value;

  let product = {
    codigo: productCode++,
    nome: name,
    fornecedor: supplier,
    origem: origin,
    quantidade: quantity,
    preco_venda: salePrice
  };

  produtos.push(product); // Adiciona o produto ao array global
  document.getElementById('produtoForm').reset();
  alert('Produto cadastrado com sucesso!');
});

function atualizarTabelaProdutos() {
  let tbody = document.querySelector('#tabelaProdutos tbody');
  tbody.innerHTML = '';

  let search = document.getElementById('buscarProduto').value.toLowerCase();
  let filteredProducts = produtos.filter(function(produto) {
    return produto.nome.toLowerCase().includes(search);
  });

  filteredProducts.forEach(function(produto) {
    let row = tbody.insertRow();
    row.insertCell().innerText = produto.codigo;
    row.insertCell().innerText = produto.nome;
    row.insertCell().innerText = produto.fornecedor;
    row.insertCell().innerText = produto.origem;
    row.insertCell().innerText = produto.quantidade;
    row.insertCell().innerText = produto.preco_venda;
  });
}

document.getElementById('buscarProduto').addEventListener('input', atualizarTabelaProdutos);
document.getElementById('visualizar-tab').addEventListener('click', atualizarTabelaProdutos);
