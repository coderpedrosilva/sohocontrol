// Variáveis globais para armazenar clientes, produtos e o próximo código de venda
let clientes = [];
let produtos = [];
let proximoCodigoVenda = 1000; // Inicia o código de venda em 1000

// Função para carregar dados iniciais de clientes e produtos
function carregarDadosIniciais() {
  fetch('http://localhost:8080/api/clientes')
    .then(response => response.json())
    .then(data => {
      // Ordena os clientes por nome em ordem alfabética
      clientes = data.sort((a, b) => a.nome.localeCompare(b.nome)); 
    })
    .catch(error => console.error('Erro ao buscar clientes:', error));

  carregarProdutos(); // Carrega a lista de produtos
}

// Mostrar a lista de todos os clientes ao clicar no campo "Cliente"
document.getElementById('cliente_venda').addEventListener('click', function() {
  const suggestionsDiv = document.getElementById('cliente-suggestions');
  suggestionsDiv.innerHTML = ''; // Limpar sugestões anteriores

  // Criar uma sugestão para cada cliente carregado
  clientes.forEach(cliente => {
    let suggestionItem = document.createElement('div');
    suggestionItem.innerText = cliente.nome;
    suggestionItem.onclick = function() {
      document.getElementById('cliente_venda').value = cliente.nome;
      document.getElementById('cliente_venda').dataset.clienteId = cliente.id;
      suggestionsDiv.innerHTML = ''; // Limpar sugestões após a seleção
    };
    suggestionsDiv.appendChild(suggestionItem);
  });
});

// Função para carregar e exibir produtos
function carregarProdutos() {
  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => {
      // Ordena os produtos por nome em ordem alfabética
      produtos = data.sort((a, b) => a.nome.localeCompare(b.nome)); 
      exibirProdutos(); // Exibe a lista de produtos na interface
    })
    .catch(error => console.error('Erro ao buscar produtos:', error));
}

// Função para exibir a lista de produtos na interface
function exibirProdutos() {
  const tabelaProdutos = document.getElementById('tabelaProdutos');
  if (tabelaProdutos) {
    const corpoTabela = tabelaProdutos.querySelector('tbody');
    corpoTabela.innerHTML = ''; // Limpa a tabela antes de adicionar os produtos

    produtos.forEach(produto => {
      const novaLinha = corpoTabela.insertRow();
      novaLinha.insertCell().innerText = produto.id;
      novaLinha.insertCell().innerText = produto.nome;
      novaLinha.insertCell().innerText = produto.quantidade;
      novaLinha.insertCell().innerText = parseFloat(produto.precoVenda).toFixed(2);
    });
  }
}

// Função para deletar uma venda
function deletarVenda(codigoVenda, linhaElemento) {
  // Confirmação antes de deletar
  if (confirm("Tem certeza de que deseja deletar esta venda?")) {
    // Requisição ao backend para deletar a venda
    fetch(`http://localhost:8080/api/vendas/${codigoVenda}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        alert("Venda deletada com sucesso!");
        // Remove a linha da tabela no frontend
        linhaElemento.remove();
      } else {
        return response.text().then(err => { throw new Error(err); });
      }
    })
    .catch(error => {
      console.error("Erro ao deletar a venda:", error.message);
      alert("Erro ao deletar a venda: " + error.message);
    });
  }
}

// Função para carregar e exibir vendas com o valor e frase de desconto
function carregarVendas() {
  fetch('http://localhost:8080/api/vendas')
    .then(response => response.json())
    .then(vendas => {
      const tabelaVendas = document.getElementById('tabelaVendas').querySelector('tbody');
      tabelaVendas.innerHTML = ''; // Limpa a tabela antes de adicionar as vendas

      vendas.forEach(venda => {
        const novaLinha = tabelaVendas.insertRow();

        // Processa a data corretamente para evitar problema de fuso horário
        const dataVenda = new Date(venda.dataVenda + 'T00:00:00'); // Força a data como meia-noite local
        const dia = String(dataVenda.getDate()).padStart(2, '0');
        const mes = String(dataVenda.getMonth() + 1).padStart(2, '0'); // Mês começa do zero
        const ano = dataVenda.getFullYear();
        const dataVendaFormatada = `${dia}/${mes}/${ano}`;

        novaLinha.insertCell().innerText = venda.codigoVenda;
        novaLinha.insertCell().innerText = dataVendaFormatada;
        novaLinha.insertCell().innerText = venda.nomeCliente;
        novaLinha.insertCell().innerText = venda.nomeProdutos;
        novaLinha.insertCell().innerText = venda.quantidades;
        novaLinha.insertCell().innerText = venda.precosVenda;
        novaLinha.insertCell().innerText = venda.valorTotal;

        // Coluna de Ações com os ícones
        const acoesCell = novaLinha.insertCell();
        acoesCell.innerHTML = `
          <div class="icon-container">
            <i class="fa-regular fa-file-image" onclick="baixarComprovante('png', ${venda.codigoVenda})"></i>
            <i class="fa-solid fa-file-pdf" onclick="baixarComprovante('pdf', ${venda.codigoVenda})"></i>
            <i class="fa-solid fa-trash" onclick="deletarVenda(${venda.codigoVenda}, this.closest('tr'))"></i>
          </div>
        `;
      });
    })
    .catch(error => console.error('Erro ao carregar vendas:', error));
}

// Função para sugerir clientes
document.getElementById('cliente_venda').addEventListener('input', function() {
  let input = this.value.toLowerCase();
  let suggestionsDiv = document.getElementById('cliente-suggestions');
  suggestionsDiv.innerHTML = '';

  if (input.length > 0) {
    let clientesFiltrados = clientes.filter(cliente => cliente.nome.toLowerCase().includes(input));

    // Exibe os clientes filtrados
    clientesFiltrados.forEach(cliente => {
      let suggestionItem = document.createElement('div');
      suggestionItem.innerText = cliente.nome;
      suggestionItem.onclick = function() {
        document.getElementById('cliente_venda').value = cliente.nome;
        document.getElementById('cliente_venda').dataset.clienteId = cliente.id; // Armazena o ID do cliente
        suggestionsDiv.innerHTML = ''; // Esconde as sugestões após a seleção
      };
      suggestionsDiv.appendChild(suggestionItem);
    });
  }
});

// Fecha a lista de sugestões ao clicar fora do campo ou das sugestões
document.addEventListener('click', function(event) {
  const inputField = document.getElementById('cliente_venda');
  const suggestionsDiv = document.getElementById('cliente-suggestions');

  // Se o clique não ocorreu no campo de entrada nem na lista de sugestões
  if (event.target !== inputField && !suggestionsDiv.contains(event.target)) {
    suggestionsDiv.innerHTML = ''; // Esconde a lista de sugestões
  }
});

// Função para verificar se um produto já foi selecionado
function produtoJaSelecionado(produtoId) {
  let produtosSelecionados = Array.from(document.querySelectorAll('[name="produto_venda"]'))
    .map(input => input.dataset.produtoId);
  return produtosSelecionados.includes(produtoId.toString());
}

// Função para autocomplete de produtos e atualizar valor parcial
document.addEventListener('input', function(event) {
  if (event.target && event.target.name === 'produto_venda') {
    autocompleteProduto(event.target);
  }
  if (event.target && event.target.name === 'quantidade_venda') {
    limitarQuantidade(event.target);
    atualizarValores();
  }
});

// Função para autocomplete de produtos e atualizar valor parcial
function autocompleteProduto(inputElement) {
  let inputValue = inputElement.value.toLowerCase();
  let suggestionsDiv = inputElement.nextElementSibling;
  suggestionsDiv.innerHTML = '';

  if (inputValue.length > 0) {
    // Lista apenas produtos não selecionados em outros campos
    let produtosFiltrados = produtos.filter(produto => 
      produto.nome.toLowerCase().includes(inputValue) &&
      !produtoJaSelecionado(produto.id, inputElement)
    );

    produtosFiltrados.forEach(produto => {
      let suggestionItem = document.createElement('div');
      suggestionItem.innerText = produto.nome;
      suggestionItem.onclick = function() {
        inputElement.value = produto.nome;
        inputElement.dataset.produtoId = produto.id; // Armazena o ID do produto
        inputElement.dataset.preco = produto.precoVenda; // Armazena o preço do produto
        suggestionsDiv.innerHTML = '';
        atualizarValores(); // Atualiza os valores parciais e o total
      };
      suggestionsDiv.appendChild(suggestionItem);
    });
  } else {
    // Se o campo estiver vazio, limpar o dataset
    inputElement.dataset.produtoId = '';
    inputElement.dataset.preco = '';
  }
}

// Evento para limpar o dataset quando o campo de produto está vazio
document.addEventListener('input', function(event) {
  if (event.target && event.target.name === 'produto_venda' && event.target.value === '') {
    event.target.dataset.produtoId = '';
    event.target.dataset.preco = '';
  }
});

// Mostrar a lista de todos os produtos ao clicar no campo "Produto"
document.addEventListener('click', function(event) {
  const produtoInput = event.target;
  if (produtoInput && produtoInput.name === 'produto_venda') {
    const suggestionsDiv = produtoInput.nextElementSibling; // Div de sugestões associada
    suggestionsDiv.innerHTML = ''; // Limpa sugestões anteriores

    // Cria uma sugestão para cada produto carregado
    produtos.forEach(produto => {
      if (!produtoJaSelecionado(produto.id)) { // Garante que o produto ainda não foi selecionado
        let suggestionItem = document.createElement('div');
        suggestionItem.innerText = produto.nome;
        suggestionItem.onclick = function() {
          produtoInput.value = produto.nome;
          produtoInput.dataset.produtoId = produto.id;
          produtoInput.dataset.preco = produto.precoVenda;
          suggestionsDiv.innerHTML = ''; // Limpa sugestões após a seleção
          atualizarValores(); // Atualiza os valores parciais e total
        };
        suggestionsDiv.appendChild(suggestionItem);
      }
    });
  }
});

// Mostrar a lista de todos os clientes ao clicar no campo "Cliente"
document.getElementById('cliente_venda').addEventListener('click', function() {
  const suggestionsDiv = document.getElementById('cliente-suggestions');
  suggestionsDiv.innerHTML = ''; // Limpar sugestões anteriores

  // Criar uma sugestão para cada cliente carregado
  clientes.forEach(cliente => {
    let suggestionItem = document.createElement('div');
    suggestionItem.innerText = cliente.nome;
    suggestionItem.onclick = function() {
      document.getElementById('cliente_venda').value = cliente.nome;
      document.getElementById('cliente_venda').dataset.clienteId = cliente.id;
      suggestionsDiv.innerHTML = ''; // Limpar sugestões após a seleção
    };
    suggestionsDiv.appendChild(suggestionItem);
  });
});

// Fecha a lista de sugestões ao clicar fora do campo ou das sugestões (para o campo de Cliente e Produto)
document.addEventListener('click', function(event) {
  const clienteInput = document.getElementById('cliente_venda');
  const clienteSuggestionsDiv = document.getElementById('cliente-suggestions');
  const produtoInputs = document.querySelectorAll('[name="produto_venda"]');

  // Fecha a lista de sugestões de cliente
  if (event.target !== clienteInput && !clienteSuggestionsDiv.contains(event.target)) {
    clienteSuggestionsDiv.innerHTML = ''; // Esconde a lista de sugestões de clientes
  }

  // Fecha a lista de sugestões de produto
  produtoInputs.forEach(produtoInput => {
    const produtoSuggestionsDiv = produtoInput.nextElementSibling;
    if (event.target !== produtoInput && !produtoSuggestionsDiv.contains(event.target)) {
      produtoSuggestionsDiv.innerHTML = ''; // Esconde a lista de sugestões de produtos
    }
  });
});

// Função para limitar a quantidade máxima de cada produto
function limitarQuantidade(quantidadeInput) {
  let quantidade = parseInt(quantidadeInput.value) || 0;
  if (quantidade > 999999999) {
    quantidadeInput.value = 999999999;
    alert('A quantidade máxima permitida para cada produto é 999.999.999.');
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

  // Se o valor total após desconto for negativo, ajuste para zero
  valorTotal = valorTotal < 0 ? 0 : valorTotal;

  // Exibe a frase do valor total com desconto
  let valorTotalDisplay = valorTotal.toFixed(2);
  if (desconto > 0) {
    valorTotalDisplay += tipoDesconto === 'reais' ? ` (Desconto de R$ ${desconto.toFixed(2)})` : ` (Desconto de ${desconto.toFixed(0)}%)`;
  }
  document.getElementById('valor_total').value = valorTotalDisplay;
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
  const linhaOriginal = document.querySelector('.produto-quantidade');
  const novaLinha = linhaOriginal.cloneNode(true);

  // Limpar valores dos campos na nova linha
  novaLinha.querySelector('[name="produto_venda"]').value = '';
  novaLinha.querySelector('[name="quantidade_venda"]').value = '';
  novaLinha.querySelector('.autocomplete-suggestions').innerHTML = ''; // Limpa sugestões

  // Configura os dados de produto como vazio para a nova linha
  novaLinha.querySelector('[name="produto_venda"]').dataset.produtoId = '';
  novaLinha.querySelector('[name="produto_venda"]').dataset.preco = '';

  // Ajustar o botão de remover na nova linha
  const removerBotao = novaLinha.querySelector('.btn-outline-danger');
  removerBotao.setAttribute('onclick', 'removerLinhaProdutoQuantidade(this)');

  // Adiciona a nova linha ao container
  document.getElementById('produto-quantidade-container').appendChild(novaLinha);
}

// Função para remover linha de produto e quantidade
function removerLinhaProdutoQuantidade(elemento) {
  const linha = elemento.closest('.produto-quantidade');
  if (document.querySelectorAll('.produto-quantidade').length > 1) {
    linha.remove();
    atualizarValores(); // Recalcula após a remoção
  } else {
    alert('Não é possível remover a única linha de produto e quantidade.');
  }
}

// Função para registrar a venda e resetar a tela ao finalizar
document.getElementById('vendaForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const clienteId = parseInt(document.getElementById('cliente_venda').dataset.clienteId, 10);
  if (!clienteId) {
    alert("Cliente não selecionado corretamente.");
    return;
  }

  // Captura e verifica se todos os produtos têm um ID válido
  const itens = Array.from(document.querySelectorAll('.produto-quantidade')).map(linha => {
    const produtoId = parseInt(linha.querySelector('[name="produto_venda"]').dataset.produtoId, 10);
    const quantidade = parseInt(linha.querySelector('[name="quantidade_venda"]').value) || 0;

    if (!produtoId) {
      alert("Produto não selecionado corretamente.");
      throw new Error("Produto não informado ou inválido.");
    }
    return {
      produto: { id: produtoId },
      quantidade: quantidade
    };
  });

  const valorTotal = parseFloat(document.getElementById('valor_total').value) || 0;
  const desconto = parseFloat(document.getElementById('desconto').value) || 0;
  const tipoDesconto = document.getElementById('tipo_desconto').value;

  const venda = {
    dataVenda: document.getElementById('data_venda').value,
    cliente: { id: clienteId },
    itens: itens,
    valorTotal: valorTotal.toFixed(2), // Valor total calculado com desconto
    descontoAplicado: desconto,
    tipoDesconto: tipoDesconto
  };

  fetch('http://localhost:8080/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(venda)
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(err => { throw new Error(err); });
      }
      return response.json();
    })
    .then(data => {
      alert("Venda registrada com sucesso!");
      document.getElementById('vendaForm').reset();
      document.getElementById('valor_parcial').value = '';
      document.getElementById('valor_total').value = '';

      // Remove todas as linhas de produto, exceto a primeira, para voltar ao estado inicial
      const container = document.getElementById('produto-quantidade-container');
      while (container.children.length > 1) {
        container.removeChild(container.lastChild);
      }

      carregarProdutos(); // Recarrega a lista de produtos para refletir a nova quantidade
      carregarVendas(); // Atualiza a lista de vendas
    })
    .catch(error => {
      console.error("Erro ao registrar a venda:", error.message);
      alert("Erro ao registrar a venda: " + error.message);
    });
});

// Função para carregar todos os dados iniciais ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  carregarDadosIniciais(); // Carrega clientes e produtos
  carregarVendas(); // Carrega e exibe as vendas
});
