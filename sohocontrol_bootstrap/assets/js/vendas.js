// ===================================
// VARIÁVEIS GLOBAIS
// ===================================

// Array para armazenar a lista de clientes carregados do backend
let clientes = [];

// Array para armazenar a lista de produtos carregados do backend
let produtos = [];

// Array para armazenar sugestões de busca (clientes e produtos) para o autocomplete
let busca = [];

// Variável para controlar o próximo código de venda a ser utilizado ao registrar uma nova venda
let proximoCodigoVenda = 1000; // Inicia o código de venda em 1000

// Número de vendas exibidas por página no frontend (para paginação)
let vendasPorPagina = 10;

// Variável para rastrear a página atual na lista de vendas paginada
let paginaAtualVendas = 1;

// Array para armazenar a lista de vendas carregadas do backend
let vendas = [];

// ===================================
// FUNÇÕES DE INICIALIZAÇÃO
// ===================================

// Função para carregar dados iniciais de clientes e produtos do backend
function carregarDadosIniciais() {
  // Requisição para obter a lista de clientesssss
  fetch('http://localhost:8080/api/clientes')
    .then(response => response.json())
    .then(data => {
      // Armazena os clientes e ordena por nome em ordem alfabética
      clientes = data.sort((a, b) => a.nome.localeCompare(b.nome)); 
    })
    .catch(error => console.error('Erro ao buscar clientes:', error));

  // Chama a função para carregar a lista de produtos
  carregarProdutos();
}

// ===================================
// FUNÇÕES RELACIONADAS A PRODUTOS
// ===================================

// Função para buscar e carregar a lista de produtos do backend
function carregarProdutos() {
  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => {
      // Armazena a lista de produtos e ordena em ordem alfabética
      produtos = data.sort((a, b) => a.nome.localeCompare(b.nome)); 
      // Exibe os produtos carregados na interface
      exibirProdutos(); 
    })
    .catch(error => console.error('Erro ao buscar produtos:', error));
}

// Função para verificar se um produto já foi selecionado no formulário
function produtoJaSelecionado(produtoId) {
  // Coleta os IDs dos produtos já selecionados no formulário
  let produtosSelecionados = Array.from(document.querySelectorAll('[name="produto_venda"]'))
    .map(input => input.dataset.produtoId);
  // Retorna verdadeiro se o ID do produto já estiver na lista de selecionados
  return produtosSelecionados.includes(produtoId.toString());
}

// ===================================
// FUNÇÕES DE AUTOCOMPLETE
// ===================================

// Exibe a lista de todos os clientes ao clicar no campo "Cliente"
document.getElementById('cliente_venda').addEventListener('click', function() {
  const suggestionsDiv = document.getElementById('cliente-suggestions');
  suggestionsDiv.innerHTML = ''; // Limpa sugestões anteriores
  suggestionsDiv.style.display = 'block'; // Torna a lista de sugestões visível

  // Adiciona uma sugestão para cada cliente carregado
  clientes.forEach(cliente => {
    let suggestionItem = document.createElement('div');
    suggestionItem.classList.add('suggestion-item');
    suggestionItem.innerText = cliente.nome;
    suggestionItem.onclick = function() {
      document.getElementById('cliente_venda').value = cliente.nome;
      document.getElementById('cliente_venda').dataset.clienteId = cliente.id; // Armazena o ID do cliente
      suggestionsDiv.style.display = 'none'; // Oculta a lista de sugestões após a seleção
    };
    suggestionsDiv.appendChild(suggestionItem);
  });
});

// Sugere clientes à medida que o usuário digita no campo "Cliente"
document.getElementById('cliente_venda').addEventListener('input', function() {
  let input = this.value.toLowerCase();
  let suggestionsDiv = document.getElementById('cliente-suggestions');
  suggestionsDiv.innerHTML = '';

  if (input.length > 0) {
    // Filtra os clientes com base na entrada do usuário
    let clientesFiltrados = clientes.filter(cliente => cliente.nome.toLowerCase().includes(input));

    // Exibe as sugestões de clientes filtradas
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

// Monitora as entradas nos campos de produtos e quantidade para acionar autocompletes e cálculos
document.addEventListener('input', function(event) {
  if (event.target && event.target.name === 'produto_venda') {
    autocompleteProduto(event.target); // Aciona o autocomplete de produtos
  }
  if (event.target && event.target.name === 'quantidade_venda') {
    limitarQuantidade(event.target); // Limita a quantidade máxima
    atualizarValores(); // Atualiza o valor parcial e total
  }
});

// Fecha a lista de sugestões ao clicar fora do campo de produto e da lista de sugestões
document.addEventListener('click', function(event) {
  const produtoInputs = document.querySelectorAll('[name="produto_venda"]');
  produtoInputs.forEach(produtoInput => {
    const produtoSuggestionsDiv = produtoInput.nextElementSibling;
    if (event.target !== produtoInput && !produtoSuggestionsDiv.contains(event.target)) {
      produtoSuggestionsDiv.innerHTML = ''; // Esconde a lista de sugestões de produto
    }
  });
});

// Fecha a lista de sugestões ao clicar fora do campo ou das sugestões
document.addEventListener('click', function(event) {
  const inputField = document.getElementById('cliente_venda');
  const suggestionsDiv = document.getElementById('cliente-suggestions');

  // Verifica se o clique foi fora do campo de entrada e das sugestões
  if (event.target !== inputField && !suggestionsDiv.contains(event.target)) {
    suggestionsDiv.innerHTML = ''; // Esconde a lista de sugestões
  }
});

// Autocomplete para produtos, exibindo sugestões e atualizando valores parciais
function autocompleteProduto(inputElement) {
  let inputValue = inputElement.value.toLowerCase();
  let suggestionsDiv = inputElement.nextElementSibling;
  suggestionsDiv.innerHTML = '';

  if (inputValue.length > 0) {
    // Filtra produtos que não foram selecionados anteriormente
    let produtosFiltrados = produtos.filter(produto => 
      produto.nome.toLowerCase().includes(inputValue) &&
      !produtoJaSelecionado(produto.id, inputElement)
    );

    // Exibe as sugestões de produtos filtrados
    produtosFiltrados.forEach(produto => {
      let suggestionItem = document.createElement('div');
      suggestionItem.innerText = produto.nome;
      suggestionItem.onclick = function() {
        inputElement.value = produto.nome;
        inputElement.dataset.produtoId = produto.id; // Armazena o ID do produto
        inputElement.dataset.preco = produto.precoVenda; // Armazena o preço do produto
        suggestionsDiv.innerHTML = '';
        atualizarValores(); // Atualiza o valor parcial e total
      };
      suggestionsDiv.appendChild(suggestionItem);
    });
  } else {
    // Limpa o dataset se o campo de entrada estiver vazio
    inputElement.dataset.produtoId = '';
    inputElement.dataset.preco = '';
  }
}

// Limpa o dataset do campo de produto se o campo estiver vazio
document.addEventListener('input', function(event) {
  if (event.target && event.target.name === 'produto_venda' && event.target.value === '') {
    event.target.dataset.produtoId = '';
    event.target.dataset.preco = '';
  }
});

// Exibe a lista de todos os produtos ao clicar no campo "Produto"
document.addEventListener('click', function(event) {
  const produtoInput = event.target;
  if (produtoInput && produtoInput.name === 'produto_venda') {
    const suggestionsDiv = produtoInput.nextElementSibling; // Obtém a div de sugestões associada
    suggestionsDiv.innerHTML = ''; // Limpa sugestões anteriores
    suggestionsDiv.style.display = 'block'; // Torna a lista de sugestões visível

    // Adiciona uma sugestão para cada produto carregado
    produtos.forEach(produto => {
      if (!produtoJaSelecionado(produto.id)) { // Verifica se o produto já foi selecionado
        let suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.innerText = produto.nome;
        suggestionItem.onclick = function() {
          produtoInput.value = produto.nome;
          produtoInput.dataset.produtoId = produto.id; // Armazena o ID do produto
          produtoInput.dataset.preco = produto.precoVenda; // Armazena o preço do produto
          suggestionsDiv.style.display = 'none'; // Oculta a lista de sugestões após a seleção
          atualizarValores(); // Atualiza os valores parciais e total
        };
        suggestionsDiv.appendChild(suggestionItem);
      }
    });
  }
});

// Fecha a lista de sugestões ao clicar fora do campo de cliente ou da lista de sugestões
document.addEventListener('click', function(event) {
  const clienteInput = document.getElementById('cliente_venda');
  const clienteSuggestionsDiv = document.getElementById('cliente-suggestions');

  // Verifica se o clique foi fora do campo de cliente e da lista de sugestões
  if (event.target !== clienteInput && !clienteSuggestionsDiv.contains(event.target)) {
    clienteSuggestionsDiv.style.display = 'none'; // Esconde a lista de sugestões
  }
});

// Carrega sugestões de clientes e produtos no campo de busca geral
function carregarDadosBusca() {
  const campoBusca = document.getElementById('buscarVenda');
  const suggestionsDiv = document.createElement('div');
  suggestionsDiv.classList.add('autocomplete-suggestions');
  campoBusca.parentNode.appendChild(suggestionsDiv);

  // Adiciona sugestões de clientes à lista de autocomplete
  clientes.forEach(cliente => {
    let suggestionItem = document.createElement('div');
    suggestionItem.innerText = cliente.nome;
    suggestionItem.addEventListener('click', function() {
      campoBusca.value = cliente.nome;
      filtrarLinhasTabela(cliente.nome.toLowerCase());
      suggestionsDiv.innerHTML = ''; // Limpa sugestões após a seleção
    });
    suggestionsDiv.appendChild(suggestionItem);
  });

  // Adiciona sugestões de produtos à lista de autocomplete
  produtos.forEach(produto => {
    let suggestionItem = document.createElement('div');
    suggestionItem.innerText = produto.nome;
    suggestionItem.addEventListener('click', function() {
      campoBusca.value = produto.nome;
      filtrarLinhasTabela(produto.nome.toLowerCase());
      suggestionsDiv.innerHTML = ''; // Limpa sugestões após a seleção
    });
    suggestionsDiv.appendChild(suggestionItem);
  });

  // Exibe sugestões conforme o usuário digita no campo de busca
  campoBusca.addEventListener('input', function() {
    const termoBusca = this.value.toLowerCase();
    suggestionsDiv.innerHTML = '';

    if (termoBusca.length > 0) {
      // Filtra e exibe sugestões de clientes com base no termo de busca
      clientes.filter(cliente => cliente.nome.toLowerCase().includes(termoBusca))
        .forEach(cliente => {
          let suggestionItem = document.createElement('div');
          suggestionItem.innerText = cliente.nome;
          suggestionItem.addEventListener('click', function() {
            campoBusca.value = cliente.nome;
            filtrarLinhasTabela(cliente.nome.toLowerCase());
            suggestionsDiv.innerHTML = ''; // Limpa sugestões após a seleção
          });
          suggestionsDiv.appendChild(suggestionItem);
        });

      // Filtra e exibe sugestões de produtos com base no termo de busca
      produtos.filter(produto => produto.nome.toLowerCase().includes(termoBusca))
        .forEach(produto => {
          let suggestionItem = document.createElement('div');
          suggestionItem.innerText = produto.nome;
          suggestionItem.addEventListener('click', function() {
            campoBusca.value = produto.nome;
            filtrarLinhasTabela(produto.nome.toLowerCase());
            suggestionsDiv.innerHTML = ''; // Limpa sugestões após a seleção
          });
          suggestionsDiv.appendChild(suggestionItem);
        });
    }
  });
}

// Atualiza as sugestões no campo de busca geral conforme o usuário digita
document.getElementById('buscarVenda').addEventListener('input', function() {
  const inputValue = this.value.toLowerCase();
  const suggestionsDiv = document.getElementById('buscar-suggestions');
  suggestionsDiv.innerHTML = '';

  if (inputValue.length > 0) {
    // Filtra os resultados para o autocomplete
    const resultadosFiltrados = busca.filter(item => item.nome.toLowerCase().includes(inputValue));

    // Exibe os resultados filtrados no campo de autocomplete
    resultadosFiltrados.forEach(item => {
      const suggestionItem = document.createElement('div');
      suggestionItem.innerText = `${item.nome} (${item.tipo})`;
      suggestionItem.onclick = function() {
        document.getElementById('buscarVenda').value = item.nome;
        suggestionsDiv.innerHTML = ''; // Limpa sugestões após a seleção
      };
      suggestionsDiv.appendChild(suggestionItem);
    });
  }
});

// Filtra as linhas da tabela de vendas com base no termo de busca inserido no campo de busca
document.getElementById('buscarVenda').addEventListener('input', function() {
  filtrarLinhasTabela(this.value.toLowerCase());
});

// ===================================
// FUNÇÕES RELACIONADAS A VENDAS
// ===================================

// Função para deletar uma venda
function deletarVenda(codigoVenda, linhaElemento) {
  // Exibe uma confirmação antes de prosseguir com a exclusão
  if (confirm("Tem certeza de que deseja deletar esta venda?")) {
    // Faz uma requisição DELETE ao backend para remover a venda
    fetch(`http://localhost:8080/api/vendas/${codigoVenda}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        alert("Venda deletada com sucesso!");
        // Remove a linha correspondente na interface
        linhaElemento.remove();
      } else {
        // Trata erros de resposta inesperada do backend
        return response.text().then(err => { throw new Error(err); });
      }
    })
    .catch(error => {
      // Exibe uma mensagem de erro em caso de falha
      console.error("Erro ao deletar a venda:", error.message);
      alert("Erro ao deletar a venda: " + error.message);
    });
  }
}

// Função para carregar vendas do backend
function carregarVendas() {
  // Faz uma requisição GET para obter a lista de vendas
  fetch('http://localhost:8080/api/vendas')
    .then(response => response.json())
    .then(data => {
      vendas = data; // Armazena os dados de vendas recebidos
      renderizarTabelaVendas(); // Atualiza a tabela de vendas com os dados carregados
    })
    .catch(error => console.error('Erro ao carregar vendas:', error));
}

// Filtra as linhas da tabela de vendas com base no termo de busca inserido
document.getElementById('buscarVenda').addEventListener('input', function() {
  const termoBusca = this.value.toLowerCase();
  const linhasVendas = document.querySelectorAll('#tabelaVendas tbody tr');

  linhasVendas.forEach(linha => {
    const cliente = linha.cells[2].innerText.toLowerCase();
    const produto = linha.cells[3].innerText.toLowerCase();

    // Exibe ou oculta linhas com base no termo de busca (cliente ou produto)
    if (cliente.includes(termoBusca) || produto.includes(termoBusca)) {
      linha.style.display = ''; // Mostra a linha que corresponde ao termo de busca
    } else {
      linha.style.display = 'none'; // Oculta a linha que não corresponde
    }
  });
});

// Função para adicionar uma nova linha para inserção de produto e quantidade na venda
function adicionarLinhaProdutoQuantidade() {
  const linhaOriginal = document.querySelector('.produto-quantidade');
  const novaLinha = linhaOriginal.cloneNode(true);

  // Limpa os valores dos campos da nova linha
  novaLinha.querySelector('[name="produto_venda"]').value = '';
  novaLinha.querySelector('[name="quantidade_venda"]').value = '';
  novaLinha.querySelector('.autocomplete-suggestions').innerHTML = ''; // Limpa sugestões anteriores

  // Define o dataset de produto como vazio para a nova linha
  novaLinha.querySelector('[name="produto_venda"]').dataset.produtoId = '';
  novaLinha.querySelector('[name="produto_venda"]').dataset.preco = '';

  // Atualiza o botão de remoção na nova linha para permitir exclusão
  const removerBotao = novaLinha.querySelector('.btn-outline-danger');
  removerBotao.setAttribute('onclick', 'removerLinhaProdutoQuantidade(this)');

  // Adiciona a nova linha ao container de produtos
  document.getElementById('produto-quantidade-container').appendChild(novaLinha);
}

// Função para remover uma linha de produto e quantidade da venda
function removerLinhaProdutoQuantidade(elemento) {
  const linha = elemento.closest('.produto-quantidade');
  // Garante que pelo menos uma linha de produto permaneça
  if (document.querySelectorAll('.produto-quantidade').length > 1) {
    linha.remove(); // Remove a linha selecionada
    atualizarValores(); // Recalcula os valores após a remoção
  } else {
    alert('Não é possível remover a única linha de produto e quantidade.');
  }
}

document.getElementById('vendaForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const clienteId = parseInt(document.getElementById('cliente_venda').dataset.clienteId, 10);
  const frete = parseFloat(document.getElementById('frete').value.replace(',', '.')) || 0; // Captura o valor do frete
  const valorTotal = parseFloat(document.getElementById('valor_total').value) || 0;
  const valorParcial = parseFloat(document.getElementById('valor_parcial').value) || 0;
  const desconto = parseFloat(document.getElementById('desconto').value.replace(',', '.')) || 0;
  const tipoDesconto = document.getElementById('tipo_desconto').value;

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

  const venda = {
      dataVenda: document.getElementById('data_venda').value,
      cliente: { id: clienteId },
      itens: itens,
      frete: frete, // Inclui o frete no payload
      valorTotal: valorTotal.toFixed(2),
      valorParcial: valorParcial.toFixed(2),
      descontoAplicado: parseFloat(desconto.toFixed(2)),
      tipoDesconto: tipoDesconto
  };

  fetch('http://localhost:8080/api/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venda)
  })
      .then(response => {
          if (!response.ok) {
              return response.json().then(err => {
                  throw new Error(err.error);
              });
          }
          return response.json();
      })
      .then(() => {
          alert("Venda registrada com sucesso!");
          document.getElementById('vendaForm').reset();
          limparFormularioVenda();
          carregarProdutos();
          carregarVendas();
      })
      .catch(error => {
          alert("Erro ao registrar a venda: " + error.message);
      });
});

function limparFormularioVenda() {
  const vendaForm = document.getElementById('vendaForm');

  // Limpa todos os campos do formulário
  vendaForm.reset();

  // Limpa o campo de cliente
  document.getElementById('cliente_venda').value = '';
  document.getElementById('cliente_venda').dataset.clienteId = '';

  // Remove todas as linhas de produtos, exceto a primeira
  const produtoContainer = document.getElementById('produto-quantidade-container');
  const primeiraLinha = produtoContainer.querySelector('.produto-quantidade');
  produtoContainer.innerHTML = ''; // Remove todas as linhas
  produtoContainer.appendChild(primeiraLinha); // Adiciona a primeira linha de volta

  // Limpa os datasets da primeira linha
  primeiraLinha.querySelector('[name="produto_venda"]').value = '';
  primeiraLinha.querySelector('[name="produto_venda"]').dataset.produtoId = '';
  primeiraLinha.querySelector('[name="produto_venda"]').dataset.preco = '';
  primeiraLinha.querySelector('[name="quantidade_venda"]').value = '';

  // Limpa os valores de cálculo
  document.getElementById('valor_parcial').value = '';
  document.getElementById('valor_total').value = '';
  document.getElementById('frete').value = '';
  document.getElementById('desconto').value = '';
}

// ===================================
// FUNÇÕES DE VALIDAÇÃO E CÁLCULO
// ===================================

// Função que limita a quantidade de cada produto a um valor máximo de 999.999.999
function limitarQuantidade(quantidadeInput) {
  let quantidade = parseInt(quantidadeInput.value) || 0;
  if (quantidade > 999999999) {
    quantidadeInput.value = 999999999;
    alert('A quantidade máxima permitida para cada produto é 999.999.999.');
  }
}

// Função para atualizar os valores parciais de todos os produtos selecionados
// e recalcular o valor total aplicando o desconto
function atualizarValores() {
  let linhasProdutos = document.querySelectorAll('.produto-quantidade');
  let valorTotalParcial = 0;

  // Calcula o valor parcial de cada produto com base no preço e quantidade
  linhasProdutos.forEach(linha => {
    let produtoInput = linha.querySelector('[name="produto_venda"]');
    let precoProduto = parseFloat(produtoInput.dataset.preco || 0);
    let quantidade = parseInt(linha.querySelector('[name="quantidade_venda"]').value) || 0;
    let valorParcial = precoProduto * quantidade;

    // Adiciona o valor parcial ao valor total
    valorTotalParcial += valorParcial;
  });

  // Atualiza o valor parcial total na interface
  document.getElementById('valor_parcial').value = valorTotalParcial.toFixed(2);

  // Aplica o desconto sobre o valor total parcial
  calcularValorTotalComDesconto(valorTotalParcial);
}

// Função para calcular o valor total após o desconto (em reais ou percentual)
function calcularValorTotalComDesconto(valorParcial) {
  let descontoStr = document.getElementById('desconto').value.replace(',', '.');
  let desconto = parseFloat(descontoStr) || 0;
  let tipoDesconto = document.getElementById('tipo_desconto').value;
  let frete = parseFloat(document.getElementById('frete').value.replace(',', '.')) || 0; // Captura o frete
  let valorTotal = valorParcial + frete; // Inclui o frete no cálculo

  if (tipoDesconto === 'reais') {
      valorTotal -= desconto; // Subtrai o desconto em reais diretamente
  } else if (tipoDesconto === 'percentual') {
      valorTotal -= valorParcial * (desconto / 100); // Calcula a porcentagem corretamente
  }

  valorTotal = Math.max(0, valorTotal); // Garante que o valor total não seja negativo

  document.getElementById('valor_total').value = valorTotal.toFixed(2); // Atualiza o campo na interface
}

// Função para validar o campo de desconto, permitindo apenas números e vírgula
function validarDesconto(event) {
  let valor = event.target.value;

  // Remove qualquer caractere não numérico ou diferente de vírgula
  valor = valor.replace(/[^0-9,]/g, '');

  // Limita a entrada a uma única vírgula e até duas casas decimais
  let partes = valor.split(',');
  if (partes.length > 2) {
    valor = partes[0] + ',' + partes[1].substring(0, 2);
  } else if (partes[1]) {
    partes[1] = partes[1].substring(0, 2);
    valor = partes.join(',');
  }

  event.target.value = valor;
}

// Eventos que recalculam o valor total ao alterar o desconto ou tipo de desconto
document.getElementById('desconto').addEventListener('input', function() {
  let valorParcial = parseFloat(document.getElementById('valor_parcial').value) || 0;
  calcularValorTotalComDesconto(valorParcial);
});

document.getElementById('tipo_desconto').addEventListener('change', function() {
  let valorParcial = parseFloat(document.getElementById('valor_parcial').value) || 0;
  calcularValorTotalComDesconto(valorParcial);
});

document.getElementById('frete').addEventListener('input', function () {
  let valorParcial = parseFloat(document.getElementById('valor_parcial').value) || 0;
  calcularValorTotalComDesconto(valorParcial);
});

// Função que formata a data no formato "AAAA-MM-DD" para "DD/MM/AAAA"
function formatarData(dataISO) {
  const partes = dataISO.split('-');
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ===================================
// FUNÇÕES DE RENDERIZAÇÃO
// ===================================

// Exibe a lista de produtos na tabela de produtos na interface
function exibirProdutos() {
  const tabelaProdutos = document.getElementById('tabelaProdutos');
  if (tabelaProdutos) {
    const corpoTabela = tabelaProdutos.querySelector('tbody');
    corpoTabela.innerHTML = ''; // Limpa a tabela antes de adicionar os produtos

    // Adiciona uma nova linha para cada produto carregado
    produtos.forEach(produto => {
      const novaLinha = corpoTabela.insertRow();
      novaLinha.insertCell().innerText = produto.id;
      novaLinha.insertCell().innerText = produto.nome;
      novaLinha.insertCell().innerText = produto.quantidade;
      novaLinha.insertCell().innerText = parseFloat(produto.precoVenda).toFixed(2);
    });
  }
}

// Filtra as linhas da tabela de vendas com base no termo de busca fornecido
function filtrarLinhasTabela(termoBusca) {
  const linhasVendas = document.querySelectorAll('#tabelaVendas tbody tr');

  // Verifica se o nome do cliente ou produto corresponde ao termo de busca
  linhasVendas.forEach(linha => {
    const cliente = linha.cells[2].innerText.toLowerCase();
    const produto = linha.cells[3].innerText.toLowerCase();

    if (cliente.includes(termoBusca) || produto.includes(termoBusca)) {
      linha.style.display = ''; // Exibe a linha que corresponde ao termo de busca
    } else {
      linha.style.display = 'none'; // Oculta as linhas que não correspondem ao termo
    }
  });
}

// Função para renderizar a tabela de vendas considerando a busca
function renderizarTabelaVendas() {
  let tbody = document.querySelector('#tabelaVendas tbody');
  tbody.innerHTML = '';

  // Filtra as vendas com base no termo de busca
  let termoBusca = document.getElementById('buscarVenda').value.toLowerCase();
  let vendasFiltradas = vendas.filter(venda => {
      return (
          venda.nomeCliente.toLowerCase().includes(termoBusca) ||
          venda.nomeProdutos.toLowerCase().includes(termoBusca)
      );
  });

  // Cálculo dos índices de início e fim com base na página atual
  let inicio = (paginaAtualVendas - 1) * vendasPorPagina;
  let fim = inicio + vendasPorPagina;

  // Obtem apenas as vendas da página atual
  let vendasPaginadas = vendasFiltradas.slice(inicio, fim);

  // Adiciona cada venda à tabela
  vendasPaginadas.forEach(venda => {
      let row = tbody.insertRow();
      row.insertCell().innerText = venda.codigoVenda;
      row.insertCell().innerText = formatarData(venda.dataVenda);
      row.insertCell().innerText = venda.nomeCliente;
      row.insertCell().innerText = venda.nomeProdutos;
      row.insertCell().innerText = venda.quantidades;
      row.insertCell().innerText = venda.precosVenda;
      row.insertCell().innerText = venda.valorParcial;
      
      // Formata o valor do frete com vírgula em vez de ponto
      let freteFormatado = venda.frete.toFixed(2).replace('.', ',');
      row.insertCell().innerText = `R$ ${freteFormatado}`;
      
      row.insertCell().innerText = venda.valorTotal;

      let actionCell = row.insertCell();
      actionCell.innerHTML = `
          <div class="icon-container">
              <i class="fa-solid fa-file-image" onclick="gerarPNGVenda(this.closest('tr'))"></i>
              <i class="fa-solid fa-file-pdf" onclick="gerarPDFVenda(this.closest('tr'))"></i>
              <i class="fa-solid fa-trash" onclick="deletarVenda(${venda.codigoVenda}, this.closest('tr'))"></i>
          </div>
      `;
  });

  // Atualiza a paginação
  renderizarPaginacaoVendas(vendasFiltradas.length);
}

// Função de busca ajustada para permitir busca global
document.getElementById('buscarVenda').addEventListener('input', function() {
  paginaAtualVendas = 1; // Reinicia para a primeira página
  renderizarTabelaVendas(); // Atualiza a tabela com os resultados da busca
});

// Renderiza os botões de paginação da tabela de vendas
function renderizarPaginacaoVendas() {
  let totalPaginas = Math.ceil(vendas.length / vendasPorPagina); // Calcula o total de páginas
  let pagination = document.getElementById('paginationVendas');
  pagination.innerHTML = ''; // Limpa a paginação antes de renderizar

  let maxPaginasVisiveis = 3; // Número máximo de páginas visíveis
  let inicioPagina = Math.max(1, paginaAtualVendas - 1); // Início do intervalo visível
  let fimPagina = Math.min(totalPaginas, inicioPagina + maxPaginasVisiveis - 1); // Fim do intervalo visível

  // Botão "Anterior"
  let anteriorLi = document.createElement('li');
  anteriorLi.classList.add('page-item');
  if (paginaAtualVendas === 1) anteriorLi.classList.add('disabled'); // Desativa o botão se na primeira página
  anteriorLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
  anteriorLi.onclick = (e) => {
    e.preventDefault();
    if (paginaAtualVendas > 1) {
      paginaAtualVendas--; // Retrocede uma página
      renderizarTabelaVendas(); // Atualiza a tabela
    }
  };
  pagination.appendChild(anteriorLi); // Adiciona o botão "Anterior"

  // Botões de páginas visíveis
  for (let i = inicioPagina; i <= fimPagina; i++) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    if (i === paginaAtualVendas) li.classList.add('active'); // Marca a página atual

    let a = document.createElement('a');
    a.classList.add('page-link');
    a.href = '#';
    a.innerText = i;
    a.onclick = (e) => {
      e.preventDefault();
      paginaAtualVendas = i; // Define a página atual
      renderizarTabelaVendas(); // Atualiza a tabela
    };

    li.appendChild(a);
    pagination.appendChild(li); // Adiciona os botões de número de página
  }

  // Botão "Próxima"
  let proximaLi = document.createElement('li');
  proximaLi.classList.add('page-item');
  if (paginaAtualVendas === totalPaginas) proximaLi.classList.add('disabled'); // Desativa o botão se na última página
  proximaLi.innerHTML = `<a class="page-link" href="#">Próxima</a>`;
  proximaLi.onclick = (e) => {
    e.preventDefault();
    if (paginaAtualVendas < totalPaginas) {
      paginaAtualVendas++; // Avança uma página
      renderizarTabelaVendas(); // Atualiza a tabela
    }
  };
  pagination.appendChild(proximaLi); // Adiciona o botão "Próxima"
}

// ===================================
// GERAÇÃO DE PNG
// ===================================

function gerarPNGVenda(linha) {
  // Obtenha os dados da linha clicada
  const dadosVenda = Array.from(linha.cells).map(cell => cell.innerText);

  // Criação de um elemento temporário para renderizar os dados
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "800px";
  container.style.fontFamily = "Helvetica, Arial, sans-serif";
  container.style.fontSize = "14px";
  container.style.lineHeight = "1.5";
  container.style.padding = "20px";
  container.style.border = "1px solid #ddd";
  container.style.backgroundColor = "#fff";

  // Adicione o título principal
  const title = document.createElement("h2");
  title.textContent = "Descrição de Venda";
  title.style.textAlign = "center";
  title.style.marginBottom = "20px";
  title.style.fontSize = "18px";
  title.style.fontWeight = "bold";
  container.appendChild(title);

  // Adicione uma linha de divisão
  const divider = document.createElement("hr");
  divider.style.border = "0";
  divider.style.borderTop = "1px solid #ddd";
  container.appendChild(divider);

  // Combine produtos, preços e quantidades
  const produtos = dadosVenda[3].split(", ");
  const quantidades = dadosVenda[4].split(", ");
  const precos = dadosVenda[5].split(", ");
  const produtosComDetalhes = produtos
    .map((produto, index) => `${produto} (R$ ${precos[index]}) x ${quantidades[index]}`)
    .join(", ");

  // Dados fixos da venda
  const campos = [
    { titulo: "Código de Venda", valor: dadosVenda[0] },
    { titulo: "Data", valor: dadosVenda[1] },
    { titulo: "Cliente", valor: dadosVenda[2] },
    { titulo: "Produto(s)", valor: produtosComDetalhes },
    { titulo: "Valor Parcial da Venda (R$)", valor: dadosVenda[6] },
    { titulo: "Frete (R$)", valor: dadosVenda[7].replace(".", ",") }, // Formata o frete com vírgula
    { titulo: "Valor Total da Venda (R$)", valor: dadosVenda[8] },
  ];

  // Renderizar os campos no container
  campos.forEach((campo) => {
    const fieldContainer = document.createElement("div");
    fieldContainer.style.marginBottom = "10px";

    const fieldTitle = document.createElement("strong");
    fieldTitle.textContent = `${campo.titulo}: `;
    fieldContainer.appendChild(fieldTitle);

    const fieldValue = document.createElement("span");
    fieldValue.textContent = campo.valor;
    fieldContainer.appendChild(fieldValue);

    container.appendChild(fieldContainer);
  });

  // Adicione uma nota de rodapé
  const footerNote = document.createElement("p");
  footerNote.textContent = "Nota: O desconto informado acima não é aplicado ao frete.";
  footerNote.style.fontStyle = "italic";
  footerNote.style.fontSize = "12px";
  footerNote.style.marginTop = "20px";
  container.appendChild(footerNote);

  // Adicione uma mensagem final de agradecimento
  const thankYou = document.createElement("p");
  thankYou.textContent = "Obrigado!";
  thankYou.style.textAlign = "center";
  thankYou.style.fontWeight = "bold";
  thankYou.style.marginTop = "20px";
  container.appendChild(thankYou);

  document.body.appendChild(container);

  // Use html2canvas para capturar o container como uma imagem
  html2canvas(container).then((canvas) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `venda-${dadosVenda[0]}.png`;
    link.click();

    // Remova o container temporário
    document.body.removeChild(container);
  });
}

// ===================================
// GERAÇÃO DE PDF
// ===================================

function gerarPDFVenda(linha) {
  // Obtenha os dados da linha clicada
  const dadosVenda = Array.from(linha.cells).map(cell => cell.innerText);

  // Configure o jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Adicione o título principal com formatação elegante
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Descrição de Venda", 105, 20, { align: "center" });

  // Adicione uma linha de divisão após o título
  doc.setLineWidth(0.5);
  doc.line(10, 25, 200, 25);

  // Combine produtos, preços e quantidades
  const produtos = dadosVenda[3].split(", ");
  const quantidades = dadosVenda[4].split(", ");
  const precos = dadosVenda[5].split(", ");

  const produtosComDetalhes = produtos.map((produto, index) => 
      `${produto} (R$ ${precos[index]}) x ${quantidades[index]}`
  ).join(", ");

  // Configuração de posição inicial
  let posY = 35;

  // Dados fixos da venda
  const campos = [
      { titulo: "Código de Venda", valor: dadosVenda[0] },
      { titulo: "Data", valor: dadosVenda[1] },
      { titulo: "Cliente", valor: dadosVenda[2] },
      { titulo: "Produto(s)", valor: produtosComDetalhes },
      { titulo: "Valor Parcial da Venda (R$)", valor: dadosVenda[6] },
      { titulo: "Frete (R$)", valor: dadosVenda[7] },
      { titulo: "Valor Total da Venda (R$)", valor: dadosVenda[8] },
  ];

  // Itera sobre os campos e adiciona os dados ao PDF
  campos.forEach((campo) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      // Adiciona o título
      doc.text(`${campo.titulo}:`, 10, posY);

      // Adiciona o valor com quebra de linha automática para campos longos
      const valorX = 80; // Posição horizontal para os valores
      const larguraMax = 120; // Largura máxima para quebra de texto
      const linhas = doc.splitTextToSize(campo.valor, larguraMax);
      doc.setFont("helvetica", "bold");
      linhas.forEach((linha, index) => {
          doc.text(linha, valorX, posY + index * 8);
      });

      // Ajusta a posição vertical (altura) com base no número de linhas
      posY += linhas.length * 10;
  });

  // Adicione uma linha de observação ao final do PDF
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text(
      "Nota: O desconto informado acima não é aplicado ao frete.",
      10,
      posY + 10
  );

  // Adicione uma mensagem final de agradecimento
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Obrigado!", 105, posY + 25, { align: "center" });

  // Baixe o arquivo PDF
  doc.save(`venda-${dadosVenda[0]}.pdf`);
}

// ===================================
// EVENTOS DE INICIALIZAÇÃO
// ===================================

// Adiciona um evento para validar o campo de desconto enquanto o usuário digita
document.getElementById('desconto').addEventListener('input', validarDesconto);

// Executa ações iniciais quando a página é carregada
document.addEventListener('DOMContentLoaded', function() {
  carregarDadosIniciais(); // Carrega dados de clientes e produtos do backend
  carregarVendas(); // Carrega e exibe as vendas na tabela
  carregarDadosBusca(); // Inicializa o autocomplete para busca de clientes e produtos
});


