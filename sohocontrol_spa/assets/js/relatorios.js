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
  const ultimoDia = new Date(ano, mes, 0).getDate(); // Calcula o último dia do mês
  return `${mesAno}-${ultimoDia}`;
}

// Função para atualizar os gráficos com base nos dados do backend
function atualizarGraficos(startDate, endDate) {
  // Limpa os gráficos antes de atualizá-los
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
    processarDadosVendas(data);
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
function processarDadosVendas(vendas) {
  // Inicializa as variáveis
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

    // Converte desconto percentual para reais corretamente
    if (venda.tipoDesconto === 'percentual') {
      const valorOriginal = valorVenda / (1 - venda.descontoAplicado / 100);
      descontoEmReais = parseFloat((valorOriginal * (venda.descontoAplicado / 100)).toFixed(2));
    } else {
      descontoEmReais = parseFloat(venda.descontoAplicado || 0);
    }

    // Incrementa os totais
    totalVendas += valorVenda + descontoEmReais;
    totalDescontos += descontoEmReais;
    totalLucro += valorVenda;

    // Adiciona o valor de vendas ao mês correto
    const mes = new Date(venda.dataVenda).getMonth();
    vendasPorMes[mes] += valorVenda;

    // Contabiliza os produtos vendidos
    const produtos = venda.nomeProdutos.split(', ');
    produtos.forEach(produto => {
      produtosVendidos[produto] = (produtosVendidos[produto] || 0) + 1;
    });

    // Contabiliza os clientes que mais compraram
    const cliente = venda.nomeCliente;
    clientesCompraram[cliente] = (clientesCompraram[cliente] || 0) + 1;
  });

  // Organiza os 10 produtos mais vendidos e os 10 clientes que mais compraram
  const produtosMaisVendidos = Object.entries(produtosVendidos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(item => item[1]);

  const clientesMaisCompraram = Object.entries(clientesCompraram)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(item => item[1]);

  // Gera variações mantendo o valor total calculado
  const vendasVariacoes = distribuirVariações(totalVendas);
  const descontosVariacoes = distribuirVariações(totalDescontos);
  const lucroVariacoes = distribuirVariações(totalLucro);

  // Atualiza os gráficos com os resultados corrigidos
  renderSparkline('Total de Vendas', vendasVariacoes, '#totalSales');
  renderSparkline('Total de Descontos', descontosVariacoes, '#spark1');
  renderSparkline('Lucro', lucroVariacoes, '#spark2');
  renderBarChart('Vendas por Mês', vendasPorMes, '#bar');
  renderDonutChart('Produtos Mais Vendidos', produtosMaisVendidos, '#donut');
  renderAreaChart('Clientes que Mais Compraram', clientesMaisCompraram, '#area');
}

// TRABALHAR ESSA FUNÇÃO COM ATENÇÃO DEPOIS
// Função para distribuir o valor total em variações
function distribuirVariações(total) {
  const pontos = 24; // Número de pontos para variação
  const variacoes = Array(pontos).fill(0);
  let soma = 0;

  for (let i = 0; i < pontos - 1; i++) {
    // Gera uma variação aleatória, mantendo o total exato
    const variacao = Math.random() * (total - soma) * 0.1; // Até 10% do restante
    variacoes[i] = variacao;
    soma += variacao;
  }

  // Ajusta o último ponto para garantir que a soma seja igual ao total
  variacoes[pontos - 1] = total - soma;

  return variacoes;
}

// Funções para criar os gráficos
function renderSparkline(title, data, selector) {
  const options = {
    chart: {
      type: 'area',
      height: 160,
      sparkline: { enabled: true }
    },
    stroke: { curve: 'smooth' }, // Define a linha suave
    series: [{ name: title, data: data }],
    colors: ['#008FFB'], // Define uma cor fixa para melhorar a visualização
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

function renderBarChart(title, data, selector) {
  const options = {
    chart: { type: 'bar', height: 380, stacked: true },
    series: [{ name: title, data: data }],
    xaxis: { categories: Array.from({ length: data.length }, (_, i) => i + 1) },
    title: { text: title, align: 'left', style: { fontSize: '18px' } }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}

function renderDonutChart(title, data, selector) {
  const options = {
    chart: { type: 'donut', width: '100%', height: 400 },
    series: data,
    labels: Object.keys(data),
    title: { text: title, align: 'center', style: { fontSize: '18px' } },
    legend: { position: 'bottom' }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}

function renderAreaChart(title, data, selector) {
  const options = {
    chart: { type: 'area', height: 340 },
    series: [{ name: title, data: data }],
    xaxis: { categories: Array.from({ length: data.length }, (_, i) => i + 1) },
    title: { text: title, align: 'left', style: { fontSize: '18px' } }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}
