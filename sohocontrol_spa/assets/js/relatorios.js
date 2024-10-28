// Configuração inicial para ApexCharts
Apex.grid = { padding: { right: 0, left: 0 } };
Apex.dataLabels = { enabled: false };

// Função para aplicar o filtro de período
document.getElementById('applyFilter').addEventListener('click', function() {
  const startMonth = document.getElementById('startMonth').value;
  const endMonth = document.getElementById('endMonth').value;
  if (startMonth && endMonth) {
    const startDate = `${startMonth}-01`;
    const endDate = obterUltimoDiaDoMes(endMonth);
    atualizarGraficos(startDate, endDate);
  } else {
    alert('Por favor, selecione o período inicial e final.');
  }
});

// Função para obter o último dia de um mês
function obterUltimoDiaDoMes(mesAno) {
  const [ano, mes] = mesAno.split('-');
  const ultimoDia = new Date(ano, mes, 0).getDate();
  return `${mesAno}-${ultimoDia}`;
}

// Função para atualizar os gráficos com base nos dados do backend
function atualizarGraficos(startDate, endDate) {
  limparGraficos();

  fetch(`http://localhost:8080/api/vendas/filtrar?start=${startDate}&end=${endDate}`, {
    headers: { 'Accept': 'application/json' }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erro: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    processarDadosVendas(data, startDate, endDate);
  })
  .catch(error => {
    console.error('Erro ao buscar dados:', error);
    alert('Erro ao buscar dados. Verifique a API ou o console para mais detalhes.');
  });
}

// Função para limpar gráficos antes de renderizar novos
function limparGraficos() {
  document.getElementById('totalSales').innerHTML = '';
  document.getElementById('spark1').innerHTML = '';
  document.getElementById('spark2').innerHTML = '';
  document.getElementById('bar').innerHTML = '';
  document.getElementById('donut').innerHTML = '';
  document.getElementById('area').innerHTML = '';
  document.getElementById('line').innerHTML = '';
}

// Função para processar dados das vendas e atualizar os gráficos
function processarDadosVendas(vendas, startDate, endDate) {
  let totalVendas = 0;
  let totalDescontos = 0;
  let totalLucro = 0;
  let vendasPorMes = Array(12).fill(0);
  let produtosVendidos = {};
  let clientesCompraram = {};

  // Calcula os totais de vendas, descontos e lucro
  vendas.forEach(venda => {
    const valorVenda = parseFloat(venda.valorTotal || 0);
    let descontoEmReais = 0;

    if (venda.tipoDesconto === 'percentual') {
      const valorOriginal = valorVenda / (1 - venda.descontoAplicado / 100);
      descontoEmReais = parseFloat((valorOriginal * (venda.descontoAplicado / 100)).toFixed(2));
    } else {
      descontoEmReais = parseFloat(venda.descontoAplicado || 0);
    }

    totalVendas += valorVenda + descontoEmReais;
    totalDescontos += descontoEmReais;
    totalLucro += valorVenda;

    // Ajusta para garantir que o mês esteja correto
    const mes = new Date(venda.dataVenda).getUTCMonth(); // Obtém o mês da venda (0-11)
    vendasPorMes[mes] += valorVenda;

    const produtos = venda.nomeProdutos.split(', ');
    produtos.forEach(produto => {
      produtosVendidos[produto] = (produtosVendidos[produto] || 0) + 1;
    });

    const cliente = venda.nomeCliente;
    clientesCompraram[cliente] = (clientesCompraram[cliente] || 0) + 1;
  });

  // Organiza os 10 produtos mais vendidos
  const topProdutos = Object.entries(produtosVendidos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const produtosNomes = topProdutos.map(item => item[0]);
  const produtosQuantidade = topProdutos.map(item => item[1]);

  // Organiza os 10 clientes que mais compraram
  const topClientes = Object.entries(clientesCompraram)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const clientesNomes = topClientes.map(item => item[0]);
  const clientesQuantidade = topClientes.map(item => item[1]);

  // Renderiza os gráficos com os dados de vendas
  renderizarGraficos(totalVendas, totalDescontos, totalLucro, vendasPorMes, produtosNomes, produtosQuantidade, clientesNomes, clientesQuantidade);
}

// Função para renderizar os gráficos com os dados obtidos
// Função para renderizar os gráficos com os dados obtidos
function renderizarGraficos(totalVendas, totalDescontos, totalLucro, vendasPorMes, produtosNomes, produtosQuantidade, clientesNomes, clientesQuantidade) {
  const vendasVariacoes = distribuirVariações(totalVendas);
  const descontosVariacoes = distribuirVariações(totalDescontos);
  const lucroVariacoes = distribuirVariações(totalLucro);

  renderSparkline('Total de Vendas', vendasVariacoes, '#totalSales');
  renderSparkline('Total de Descontos', descontosVariacoes, '#spark1');
  renderSparkline('Lucro', lucroVariacoes, '#spark2');

  // Ajusta o gráfico de "Vendas por Mês" para corresponder corretamente aos meses
  renderBarChart('Vendas por Mês', vendasPorMes, '#bar');

  renderDonutChart('Produtos Mais Vendidos', produtosQuantidade, produtosNomes, '#donut');
  renderAreaChart('Clientes que Mais Compraram', clientesQuantidade, clientesNomes, '#area');

  // Faz uma requisição para buscar o estoque total dos produtos mais vendidos
  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => {
      // Filtra o estoque dos 10 produtos mais vendidos
      const estoqueProdutosMaisVendidos = data
        .filter(produto => produtosNomes.includes(produto.nome))
        .map(produto => ({ nome: produto.nome, quantidade: produto.quantidade }));

      // Atualiza o gráfico de linhas com o estoque total dos produtos mais vendidos
      renderLineChart(
        'Estoque dos Produtos Mais Vendidos',
        estoqueProdutosMaisVendidos.map(p => p.quantidade),
        estoqueProdutosMaisVendidos.map(p => p.nome),
        '#line'
      );
    })
    .catch(error => console.error('Erro ao buscar estoque dos produtos mais vendidos:', error));
}

// Função para criar o gráfico de barras com correspondência correta dos meses
function renderBarChart(title, data, selector) {
  const options = {
    chart: { type: 'bar', height: 380, stacked: true },
    series: [{ name: title, data: data }],
    xaxis: {
      categories: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 
        'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 
        'Novembro', 'Dezembro'
      ] // Define os meses como categorias
    },
    title: { text: title, align: 'left', style: { fontSize: '18px' } }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}

// Função para distribuir o valor total em variações
function distribuirVariações(total) {
  const pontos = 24;
  const variacoes = Array(pontos).fill(0);
  let soma = 0;

  for (let i = 0; i < pontos - 1; i++) {
    const variacao = Math.random() * (total - soma) * 0.1;
    variacoes[i] = variacao;
    soma += variacao;
  }

  variacoes[pontos - 1] = total - soma;
  return variacoes;
}

// Funções para criar os gráficos restantes (inalterados)
function renderSparkline(title, data, selector) {
  const options = {
    chart: {
      type: 'area',
      height: 160,
      sparkline: { enabled: true }
    },
    stroke: { curve: 'smooth' },
    series: [{ name: title, data: data }],
    colors: ['#008FFB'],
    title: {
      text: title,
      offsetX: 30,
      style: { fontSize: '24px' }
    },
    subtitle: {
      text: data.reduce((a, b) => a + b, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      offsetX: 30,
      style: { fontSize: '14px' }
    }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}

function renderDonutChart(title, data, labels, selector) {
  const options = {
    chart: { type: 'donut', width: '100%', height: 400 },
    series: data,
    labels: labels,
    title: { text: title, align: 'center', style: { fontSize: '18px' } },
    legend: { position: 'bottom' }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}

function renderAreaChart(title, data, categories, selector) {
  const options = {
    chart: { type: 'area', height: 340 },
    series: [{ name: title, data: data }],
    xaxis: { categories: categories },
    title: { text: title, align: 'left', style: { fontSize: '18px' } }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}

function renderLineChart(title, data, categories, selector) {
  const options = {
    chart: { type: 'line', height: 340 },
    series: [{ name: title, data: data }],
    xaxis: { categories: categories },
    title: { text: title, align: 'left', style: { fontSize: '18px' } }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}
