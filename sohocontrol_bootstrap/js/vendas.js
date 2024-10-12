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

// Função para autocomplete de produtos e atualizar valor parcial
document.addEventListener('input', function(event) {
  if (event.target && event.target.name === 'produto_venda') {
    autocompleteProduto(event.target);
  }
  if (event.target && event.target.name === 'quantidade_venda') {
    atualizarValores();
  }
});

function autocompleteProduto(inputElement) {
  let inputValue = inputElement.value.toLowerCase();
  let suggestionsDiv = inputElement.nextElementSibling;
  suggestionsDiv.innerHTML = '';

  if (inputValue.length > 0) {
    let produtosFiltrados = produtos.filter(produto => produto.nome.toLowerCase().includes(inputValue));
    produtosFiltrados.forEach(produto => {
      let suggestionItem = document.createElement('div');
      suggestionItem.innerText = produto.nome;
      suggestionItem.onclick = function() {
        inputElement.value = produto.nome;
        suggestionsDiv.innerHTML = '';
        inputElement.dataset.preco = produto.precoVenda; // Armazena o preço do produto
        atualizarValores(); // Atualiza os valores parciais e o total
      };
      suggestionsDiv.appendChild(suggestionItem);
    });
  }
}

// Função para atualizar valores parciais de todas as linhas e o valor total com desconto
function atualizarValores() {
  let linhasProdutos = document.querySelectorAll('.produto-quantidade');
  let valorTotalParcial = 0;

  linhasProdutos.forEach(linha => {
    let produtoInput = linha.querySelector('[name="produto_venda"]');
    let precoProduto = parseFloat(produtoInput.dataset.preco || 0);
    let quantidade = parseInt(linha.querySelector('[name="quantidade_venda"]').value) || 0;
    let valorParcial = precoProduto * quantidade;

    // Adiciona o valor parcial desta linha ao total
    valorTotalParcial += valorParcial;
  });

  // Atualiza o valor parcial total no campo correspondente
  document.getElementById('valor_parcial').value = valorTotalParcial.toFixed(2);

  // Aplica desconto ao valor total
  calcularValorTotalComDesconto(valorTotalParcial);
}

// Função para calcular o valor total com desconto
function calcularValorTotalComDesconto(valorParcial) {
  let desconto = parseFloat(document.getElementById('desconto').value) || 0;
  let tipoDesconto = document.getElementById('tipo_desconto').value;
  let valorTotal = valorParcial;

  if (tipoDesconto === 'reais') {
    valorTotal -= desconto; // Aplica desconto em reais
  } else if (tipoDesconto === 'percentual') {
    valorTotal -= valorParcial * (desconto / 100); // Aplica desconto percentual
  }

  // Atualiza o campo de valor total
  document.getElementById('valor_total').value = valorTotal.toFixed(2);
}

// Eventos para recalcular o total quando o desconto ou tipo de desconto for alterado
document.getElementById('desconto').addEventListener('input', function() {
  let valorParcial = parseFloat(document.getElementById('valor_parcial').value) || 0;
  calcularValorTotalComDesconto(valorParcial);
});

document.getElementById('tipo_desconto').addEventListener('change', function() {
  let valorParcial = parseFloat(document.getElementById('valor_parcial').value) || 0;
  calcularValorTotalComDesconto(valorParcial);
});

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
    atualizarValores(); // Recalcula após a remoção
  } else {
    alert('Não é possível remover a única linha de produto e quantidade.');
  }
}

// Função para registrar a venda
document.getElementById('vendaForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Venda registrada com sucesso!');
});

// Carregar dados iniciais ao carregar a página
document.addEventListener('DOMContentLoaded', carregarDadosIniciais);
