let sales = [];

// Função para sugerir clientes enquanto o usuário digita
function suggestClients(input) {
  let suggestionsDiv = document.getElementById('cliente-suggestions');
  suggestionsDiv.innerHTML = '';
  let searchTerm = input.value.toLowerCase();
  
  if (searchTerm.length > 0) {
    let filteredClients = clientes.filter(function(cliente) {
      return cliente.nome.toLowerCase().includes(searchTerm);
    });

    filteredClients.forEach(function(cliente) {
      let suggestionItem = document.createElement('div');
      suggestionItem.innerText = cliente.nome;
      suggestionItem.onclick = function() {
        input.value = cliente.nome;
        suggestionsDiv.innerHTML = '';
      };
      suggestionsDiv.appendChild(suggestionItem);
    });
  }
}

// Função para sugerir produtos enquanto o usuário digita
function suggestProducts(input) {
  let suggestionsDiv = document.getElementById('produto-suggestions');
  suggestionsDiv.innerHTML = '';
  let searchTerm = input.value.toLowerCase();
  
  if (searchTerm.length > 0) {
    let filteredProducts = produtos.filter(function(produto) {
      return produto.nome.toLowerCase().includes(searchTerm);
    });

    filteredProducts.forEach(function(produto) {
      let suggestionItem = document.createElement('div');
      suggestionItem.innerText = produto.nome;
      suggestionItem.onclick = function() {
        input.value = produto.nome;
        suggestionsDiv.innerHTML = '';
        calculatePartialValue(produto);
      };
      suggestionsDiv.appendChild(suggestionItem);
    });
  }
}

// Função para calcular o valor parcial com base no preço e quantidade
function calculatePartialValue(selectedProduct) {
  let quantity = parseInt(document.getElementById('quantidade_venda').value);
  let partialValue = selectedProduct.preco_venda * quantity;
  document.getElementById('valor_parcial').value = partialValue.toFixed(2);
  calculateTotalValue();
}

// Função para calcular o valor total, aplicando o desconto
function calculateTotalValue() {
  let partialValue = parseFloat(document.getElementById('valor_parcial').value);
  let discount = parseFloat(document.getElementById('desconto').value) || 0;
  let discountType = document.getElementById('tipo_desconto').value;

  let totalValue = partialValue;

  if (discountType === "reais") {
    totalValue -= discount;
  } else if (discountType === "percentual") {
    totalValue -= partialValue * (discount / 100);
  }

  document.getElementById('valor_total').value = totalValue.toFixed(2);
}

// Adiciona os eventos de sugestão
document.getElementById('cliente_venda').addEventListener('input', function() {
  suggestClients(this);
});

document.getElementById('produto_venda').addEventListener('input', function() {
  suggestProducts(this);
});

// Evento para calcular o total quando a quantidade ou desconto mudarem
document.getElementById('quantidade_venda').addEventListener('input', calculateTotalValue);
document.getElementById('desconto').addEventListener('input', calculateTotalValue);
document.getElementById('tipo_desconto').addEventListener('change', calculateTotalValue);

// Função para registrar a venda
document.getElementById('vendaForm').addEventListener('submit', function(e) {
  e.preventDefault();

  let saleDate = document.getElementById('data_venda').value;
  let client = document.getElementById('cliente_venda').value;
  let product = document.getElementById('produto_venda').value;
  let quantity = document.getElementById('quantidade_venda').value;
  let totalValue = document.getElementById('valor_total').value;

  let sale = {
    data: saleDate,
    cliente: client,
    produto: product,
    quantidade: quantity,
    valor_total: totalValue
  };

  sales.push(sale);
  document.getElementById('vendaForm').reset();
  alert('Venda registrada com sucesso!');
});
