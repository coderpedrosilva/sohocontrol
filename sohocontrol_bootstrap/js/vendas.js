// Variáveis globais para armazenar clientes e produtos
let clientes = [];
let produtos = [];

// Função para carregar dados iniciais
function carregarDadosIniciais() {
  fetch('http://localhost:8080/api/clientes')
    .then(response => response.json())
    .then(data => { clientes = data; })
    .catch(error => console.error('Erro ao buscar clientes:', error));

  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => { produtos = data; })
    .catch(error => console.error('Erro ao buscar produtos:', error));
}

// Função para sugerir clientes
document.getElementById('cliente_venda').addEventListener('input', function() {
  let input = this.value.toLowerCase();
  let suggestionsDiv = document.getElementById('cliente-suggestions');
  suggestionsDiv.innerHTML = '';

  if (input.length > 0) {
    let clientesFiltrados = clientes.filter(cliente => cliente.nome.toLowerCase().includes(input));
    clientesFiltrados.forEach(cliente => {
      let suggestionItem = document.createElement('div');
      suggestionItem.innerText = cliente.nome;
      suggestionItem.onclick = function() {
        document.getElementById('cliente_venda').value = cliente.nome;
        suggestionsDiv.innerHTML = '';
      };
      suggestionsDiv.appendChild(suggestionItem);
    });
  }
});

// Função para autocomplete de produtos
document.addEventListener('input', function(event) {
  if (event.target && event.target.name === 'produto_venda') {
    autocompleteProduto(event.target);
  }
});

function autocompleteProduto(inputElement) {
  let inputValue = inputElement.value.toLowerCase();
  let suggestionsDiv = inputElement.nextElementSibling; // Localiza a div de sugestões logo após o input
  suggestionsDiv.innerHTML = ''; // Limpa sugestões anteriores

  if (inputValue.length > 0) {
    let produtosFiltrados = produtos.filter(produto => produto.nome.toLowerCase().includes(inputValue));
    produtosFiltrados.forEach(produto => {
      let suggestionItem = document.createElement('div');
      suggestionItem.innerText = produto.nome;
      suggestionItem.onclick = function() {
        inputElement.value = produto.nome;
        suggestionsDiv.innerHTML = '';
      };
      suggestionsDiv.appendChild(suggestionItem);
    });
  }
}

// Função para adicionar linha de produto e quantidade
function adicionarLinhaProdutoQuantidade() {
  let linhaOriginal = document.querySelector('.produto-quantidade');
  let novaLinha = linhaOriginal.cloneNode(true);

  novaLinha.querySelector('[name="produto_venda"]').value = '';
  novaLinha.querySelector('[name="quantidade_venda"]').value = '';
  novaLinha.querySelector('.btn-outline-danger').setAttribute('onclick', 'removerLinhaProdutoQuantidade(this)');

  document.getElementById('produto-quantidade-container').appendChild(novaLinha);
}

// Função para remover linha de produto e quantidade
function removerLinhaProdutoQuantidade(elemento) {
  let linha = elemento.closest('.produto-quantidade');
  if (document.querySelectorAll('.produto-quantidade').length > 1) {
    linha.remove();
  } else {
    alert('Não é possível remover a única linha de produto e quantidade.');
  }
}

// Função para calcular o valor total
document.getElementById('vendaForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Venda registrada com sucesso!');
});

// Carregar dados iniciais ao carregar a página
document.addEventListener('DOMContentLoaded', carregarDadosIniciais);
