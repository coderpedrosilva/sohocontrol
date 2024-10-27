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
  // Requisição para obter a lista de clientes
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

// Função para registrar uma nova venda e resetar o formulário ao finalizar
document.getElementById('vendaForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Impede o comportamento padrão do formulário

  const clienteId = parseInt(document.getElementById('cliente_venda').dataset.clienteId, 10);
  if (!clienteId) {
    alert("Cliente não selecionado corretamente."); // Verifica se o cliente foi selecionado
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

// Obtém os valores do formulário: total, desconto e tipo de desconto
const valorTotal = parseFloat(document.getElementById('valor_total').value) || 0;
const desconto = parseFloat(document.getElementById('desconto').value.replace(',', '.')) || 0; // Convertendo para double
const tipoDesconto = document.getElementById('tipo_desconto').value;

// Cria um objeto de venda com as informações coletadas
const venda = {
  dataVenda: document.getElementById('data_venda').value, // Data da venda
  cliente: { id: clienteId }, // ID do cliente selecionado
  itens: itens, // Lista de produtos e suas quantidades
  valorTotal: valorTotal.toFixed(2), // Valor total formatado com duas casas decimais
  descontoAplicado: parseFloat(desconto.toFixed(2)), // Converte para double e garante duas casas decimais
  tipoDesconto: tipoDesconto // Tipo de desconto aplicado (reais ou percentual)
};

// Envia o objeto de venda para o backend usando uma requisição POST
fetch('http://localhost:8080/api/vendas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(venda) // Converte o objeto de venda para JSON
})
  .then(response => {
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      // Caso contrário, lança um erro com a mensagem retornada pelo servidor
      return response.json().then(err => { throw new Error(err.error); });
    }
    return response.json(); // Retorna a resposta JSON se bem-sucedida
  })
  .then(data => {
    // Informa o usuário sobre o sucesso do registro da venda
    alert("Venda registrada com sucesso!");

    // Reseta o formulário de venda e limpa os campos de valor parcial e total
    document.getElementById('vendaForm').reset();
    document.getElementById('valor_parcial').value = '';
    document.getElementById('valor_total').value = '';

    // Remove todas as linhas de produto, exceto a primeira, para redefinir o estado inicial
    const container = document.getElementById('produto-quantidade-container');
    while (container.children.length > 1) {
      container.removeChild(container.lastChild);
    }

    // Recarrega a lista de produtos e vendas para refletir as atualizações no frontend
    carregarProdutos();
    carregarVendas();
  })
  .catch(error => {
    // Exibe uma mensagem de erro caso ocorra uma falha no registro da venda
    alert("Erro ao registrar a venda: " + error.message);
  });
});

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
  // Converte vírgula para ponto decimal, se necessário
  let descontoStr = document.getElementById('desconto').value.replace(',', '.');
  let desconto = parseFloat(descontoStr) || 0;
  let tipoDesconto = document.getElementById('tipo_desconto').value;
  let valorTotal = valorParcial;

  // Aplica o desconto com base no tipo selecionado (reais ou percentual)
  if (tipoDesconto === 'reais') {
    valorTotal -= desconto; // Desconto em reais
  } else if (tipoDesconto === 'percentual') {
    valorTotal -= valorParcial * (desconto / 100); // Desconto percentual
  }

  // Garante que o valor total não seja negativo
  valorTotal = Math.max(0, valorTotal);

  // Exibe o valor total na interface
  document.getElementById('valor_total').value = valorTotal.toFixed(2);
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
  tbody.innerHTML = ''; // Limpa a tabela antes de adicionar novas linhas

  let termoBusca = document.getElementById('buscarVenda').value.toLowerCase();
  let vendasFiltradas = vendas.filter(venda => 
    venda.nomeCliente.toLowerCase().includes(termoBusca) || 
    venda.nomeProdutos.toLowerCase().includes(termoBusca)
  );

  let inicio = (paginaAtualVendas - 1) * vendasPorPagina;
  let fim = inicio + vendasPorPagina;

  // Caso esteja buscando, exibir todos os resultados filtrados, ignorando a paginação
  let vendasExibidas = termoBusca ? vendasFiltradas : vendas.slice(inicio, fim);

  vendasExibidas.forEach(venda => {
    let row = tbody.insertRow();
    row.insertCell().innerText = venda.codigoVenda;
    row.insertCell().innerText = formatarData(venda.dataVenda);
    row.insertCell().innerText = venda.nomeCliente;
    row.insertCell().innerText = venda.nomeProdutos;
    row.insertCell().innerText = venda.quantidades;
    row.insertCell().innerText = venda.precosVenda;

    // Verifica se a frase de desconto está presente no valor total
    let valorTotalCell = row.insertCell();
    if (venda.valorTotal.includes('Desconto')) {
      valorTotalCell.innerText = venda.valorTotal; // Exibe o valor total já formatado do backend
    } else {
      valorTotalCell.innerText = parseFloat(venda.valorTotal).toFixed(2).replace('.', ','); // Sem desconto
    }

    // Adiciona as ações (ícones) para cada venda
    let actionCell = row.insertCell();
    actionCell.innerHTML = `
      <div class="icon-container">
        <i class="fa-solid fa-file-image"></i>
        <i class="fa-solid fa-file-pdf"></i>
        <i class="fa-solid fa-trash" onclick="deletarVenda(${venda.codigoVenda}, this.closest('tr'))"></i>
      </div>
    `;
  });

  // Renderizar paginação apenas se não houver busca ativa
  if (!termoBusca) {
    renderizarPaginacaoVendas();
  }
}

// Função de busca ajustada para permitir busca global
document.getElementById('buscarVenda').addEventListener('input', function() {
  paginaAtualVendas = 1; // Reinicia para a primeira página
  renderizarTabelaVendas(); // Atualiza a tabela com os resultados da busca
});

// Renderiza os botões de paginação da tabela de vendas
function renderizarPaginacaoVendas() {
  let totalPaginas = Math.ceil(vendas.length / vendasPorPagina);
  let pagination = document.getElementById('paginationVendas');
  pagination.innerHTML = ''; // Limpa a paginação antes de renderizar

  let maxPaginasVisiveis = 3; // Limita a quantidade de páginas exibidas
  let inicioPagina = Math.max(1, paginaAtualVendas - 1);
  let fimPagina = Math.min(totalPaginas, inicioPagina + maxPaginasVisiveis - 1);

  // Botão "Anterior" para navegação entre páginas
  let anteriorLi = document.createElement('li');
  anteriorLi.classList.add('page-item');
  if (paginaAtualVendas === 1) anteriorLi.classList.add('disabled');
  anteriorLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
  anteriorLi.onclick = (e) => {
    e.preventDefault();
    if (paginaAtualVendas > 1) {
      paginaAtualVendas--;
      renderizarTabelaVendas(); // Atualiza a tabela de vendas após a mudança de página
    }
  };
  pagination.appendChild(anteriorLi);

  // Renderiza os números das páginas para navegação
  for (let i = inicioPagina; i <= fimPagina; i++) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    if (i === paginaAtualVendas) li.classList.add('active');

    let a = document.createElement('a');
    a.classList.add('page-link');
    a.href = '#';
    a.innerText = i;
    a.onclick = (e) => {
      e.preventDefault();
      paginaAtualVendas = i;
      renderizarTabelaVendas(); // Atualiza a tabela de vendas após a seleção da página
    };

    li.appendChild(a);
    pagination.appendChild(li);
  }

  // Botão "Próxima" para navegação entre páginas
  let proximaLi = document.createElement('li');
  proximaLi.classList.add('page-item');
  if (paginaAtualVendas === totalPaginas) proximaLi.classList.add('disabled');
  proximaLi.innerHTML = `<a class="page-link" href="#">Próxima</a>`;
  proximaLi.onclick = (e) => {
    e.preventDefault();
    if (paginaAtualVendas < totalPaginas) {
      paginaAtualVendas++;
      renderizarTabelaVendas(); // Atualiza a tabela de vendas após a mudança de página
    }
  };
  pagination.appendChild(proximaLi);
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
