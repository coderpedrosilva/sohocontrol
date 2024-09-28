// Variáveis globais para armazenar clientes e produtos
let clientes = [];
let produtos = [];

// Função para buscar clientes e produtos do backend ao carregar a página
function carregarDadosIniciais() {
  fetch('http://localhost:8080/api/clientes')
    .then(response => response.json())
    .then(data => {
      clientes = data;
    })
    .catch(error => console.error('Erro ao buscar clientes:', error));

  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => {
      produtos = data;
    })
    .catch(error => console.error('Erro ao buscar produtos:', error));
}

// Função para sugerir clientes conforme o usuário digita
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

// Função para sugerir produtos conforme o usuário digita
document.getElementById('produto_venda').addEventListener('input', function() {
  let input = this.value.toLowerCase();
  let suggestionsDiv = document.getElementById('produto-suggestions');
  suggestionsDiv.innerHTML = '';
  
  if (input.length > 0) {
    let produtosFiltrados = produtos.filter(produto => produto.nome.toLowerCase().includes(input));

    produtosFiltrados.forEach(produto => {
      let suggestionItem = document.createElement('div');
      suggestionItem.innerText = produto.nome;
      suggestionItem.onclick = function() {
        document.getElementById('produto_venda').value = produto.nome;
        suggestionsDiv.innerHTML = '';
        calcularValorParcial(produto); // Calcular valor parcial ao selecionar produto
      };
      suggestionsDiv.appendChild(suggestionItem);
    });
  }
});

// Função para calcular o valor parcial (preço do produto * quantidade)
function calcularValorParcial(produtoSelecionado) {
  let quantidade = parseInt(document.getElementById('quantidade_venda').value) || 0;

  // Somente calcular o valor parcial se a quantidade for válida
  if (!isNaN(quantidade) && quantidade > 0) {
    let valorParcial = produtoSelecionado.precoVenda * quantidade;
    document.getElementById('valor_parcial').value = valorParcial.toFixed(2);
    calcularValorTotal(); // Atualiza o valor total com desconto
  } else {
    document.getElementById('valor_parcial').value = ''; // Limpa se inválido
  }
}

// Função para calcular o valor total com base no desconto
function calcularValorTotal() {
  let valorParcial = parseFloat(document.getElementById('valor_parcial').value) || 0;
  let desconto = parseFloat(document.getElementById('desconto').value) || 0;
  let tipoDesconto = document.getElementById('tipo_desconto').value;
  let valorTotal = valorParcial;

  if (tipoDesconto === 'reais') {
    valorTotal -= desconto;
  } else if (tipoDesconto === 'percentual') {
    valorTotal -= valorParcial * (desconto / 100);
  }

  // Atualiza o campo de valor total
  document.getElementById('valor_total').value = valorTotal.toFixed(2);
}

// Eventos para atualizar o valor total quando a quantidade ou desconto forem alterados
document.getElementById('quantidade_venda').addEventListener('input', function() {
  let produtoNome = document.getElementById('produto_venda').value;
  let produtoSelecionado = produtos.find(produto => produto.nome === produtoNome);
  if (produtoSelecionado) {
    calcularValorParcial(produtoSelecionado);
  }
});
document.getElementById('desconto').addEventListener('input', calcularValorTotal);
document.getElementById('tipo_desconto').addEventListener('change', calcularValorTotal);

// Função para registrar a venda
document.getElementById('vendaForm').addEventListener('submit', function(e) {
  e.preventDefault();

  let clienteNome = document.getElementById('cliente_venda').value;
  let produtoNome = document.getElementById('produto_venda').value;
  let cliente = clientes.find(c => c.nome === clienteNome);
  let produto = produtos.find(p => p.nome === produtoNome);

  if (!cliente || !produto) {
    alert('Selecione um cliente e um produto válidos.');
    return;
  }

  let quantidadeVenda = parseInt(document.getElementById('quantidade_venda').value);
  if (produto.quantidade < quantidadeVenda) {
    alert('Quantidade insuficiente em estoque!');
    return;
  }

  let sale = {
    dataVenda: document.getElementById('data_venda').value,
    cliente: cliente, // associar com cliente existente
    produto: produto, // associar com produto existente
    quantidade: quantidadeVenda,
    valorTotal: document.getElementById('valor_total').value
  };

  fetch('http://localhost:8080/api/vendas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(sale)
  })
  .then(response => response.json())
  .then(data => {
    alert('Venda registrada com sucesso!');
    document.getElementById('vendaForm').reset();
    document.getElementById('valor_parcial').value = '';
    document.getElementById('valor_total').value = '';
    atualizarEstoqueProduto(produto, quantidadeVenda); // Atualiza o estoque
  })
  .catch(error => console.error('Erro ao registrar venda:', error));
});

// Função para atualizar o estoque do produto após a venda
function atualizarEstoqueProduto(produto, quantidadeVendida) {
  produto.quantidade -= quantidadeVendida;

  fetch(`http://localhost:8080/api/produtos/${produto.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(produto)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao atualizar estoque');
    }
    atualizarTabelaProdutos();
  })
  .catch(error => console.error('Erro ao atualizar estoque:', error));
}

// Função para atualizar a tabela de produtos após a venda
function atualizarTabelaProdutos() {
  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => {
      produtos = data;
      // Atualizar a visualização da tabela de produtos
      // Aqui você pode adicionar o código para renderizar a tabela se necessário
    })
    .catch(error => console.error('Erro ao atualizar produtos:', error));
}

// **Função corrigida para atualizar a tabela de vendas**
function atualizarTabelaVendas() {
  fetch('http://localhost:8080/api/vendas')
    .then(response => response.json())
    .then(data => {
      let tbody = document.querySelector('#tabelaVendas tbody');
      tbody.innerHTML = '';

      data.forEach(venda => {
        let row = tbody.insertRow();
        row.insertCell().innerText = venda.dataVenda;
        row.insertCell().innerText = venda.cliente.nome;
        row.insertCell().innerText = venda.produto.nome;
        row.insertCell().innerText = venda.quantidade;
        row.insertCell().innerText = venda.valorTotal.toFixed(2); // Exibe valor com 2 casas decimais
      });
    })
    .catch(error => console.error('Erro ao buscar vendas:', error));
}

// Carregar dados iniciais (clientes e produtos) ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  carregarDadosIniciais();
  atualizarTabelaVendas(); // Chama a função para carregar as vendas existentes
});
