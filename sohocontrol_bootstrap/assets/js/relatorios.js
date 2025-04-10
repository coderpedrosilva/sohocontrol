// Configuração inicial para ApexCharts
Apex.grid = { padding: { right: 0, left: 0 } };
Apex.dataLabels = { enabled: false };

// Função para aplicar o filtro de período
document.getElementById('applyFilter').addEventListener('click', function() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  if (startDate && endDate) {
    atualizarGraficos(startDate, endDate);
  } else {
    alert('Por favor, selecione a data inicial e final.');
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
    processarDadosVendas(data);
  })
  .catch(error => {
    console.error('Erro ao buscar dados:', error);
    alert('Erro ao buscar dados. Verifique a API ou o console para mais detalhes.');
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear();
  const mesAtual = String(dataAtual.getMonth() + 1).padStart(2, '0');
  const diaAtual = String(dataAtual.getDate()).padStart(2, '0');

  document.getElementById('startDate').value = `${anoAtual}-${mesAtual}-01`; // Primeiro dia do mês
  document.getElementById('endDate').value = `${anoAtual}-${mesAtual}-${diaAtual}`; // Dia atual

  atualizarGraficos(`${anoAtual}-${mesAtual}-01`, `${anoAtual}-${mesAtual}-${diaAtual}`);
});

// Função para limpar gráficos antes de renderizar novos
function limparGraficos() {
  document.getElementById('totalSales').innerHTML = '';
  document.getElementById('spark1').innerHTML = '';
  document.getElementById('spark2').innerHTML = '';
  document.getElementById('spark3').innerHTML = '';
  document.getElementById('spark4').innerHTML = '';
  document.getElementById('bar').innerHTML = '';
  document.getElementById('donut').innerHTML = '';
  document.getElementById('area').innerHTML = '';
  document.getElementById('line').innerHTML = '';
}

// Função para processar dados das vendas e atualizar os gráficos
function processarDadosVendas(vendas) {
  let totalVendas = 0;
  let totalDescontos = 0;
  let totalLucro = 0;
  let totalFrete = 0; // Adicionado para cálculo do frete
  let totalImposto = 0; // Adicionado para cálculo do imposto
  let lucroPorMes = Array(12).fill(0);
  let produtosVendidos = {};
  let clientesCompraram = {};
  let totalPrecoCompra = 0;

  // Calcula os totais de vendas, descontos, lucro, frete, custo total e imposto
  vendas.forEach(venda => {

    const produtos = venda.nomeProdutos.split(', ');
    let quantidades = venda.quantidades.split(', ').map(qtd => parseInt(qtd, 10));
    const valorVenda = typeof venda.valorTotal === 'string' ? parseFloat(venda.valorTotal.replace(',', '.')) : parseFloat(venda.valorTotal || 0);
    const valorParcial = typeof venda.valorParcial === 'string' ? parseFloat(venda.valorParcial.replace(',', '.')) : parseFloat(venda.valorParcial || 0);
    let descontoAplicado = typeof venda.descontoAplicado === 'string' ? parseFloat(venda.descontoAplicado.replace(',', '.')) : parseFloat(venda.descontoAplicado || 0);
    const valorFrete = typeof venda.frete === 'string' ? parseFloat(venda.frete.replace(',', '.')) : parseFloat(venda.frete || 0);
     
    // Calcule lucro líquido gráfico
    const lucroLiquidoGrafico = valorVenda - valorFrete - (venda.totalImposto || 0);

    // Ajusta para garantir que o mês esteja correto
    const mes = new Date(venda.dataVenda).getUTCMonth(); // Obtém o mês da venda (0-11)
    lucroPorMes[mes] += lucroLiquidoGrafico;

    // Se o tipo de desconto for percentual, converte para valor em reais
    if (venda.tipoDesconto === 'percentual') {
      descontoAplicado = valorParcial * (descontoAplicado / 100);
    }

    //totalVendas += valorParcial;
    totalVendas += valorVenda;
    totalDescontos += descontoAplicado;
    totalLucro += valorVenda - valorFrete;
    totalFrete += valorFrete; // Soma o valor do frete

    // Calcula imposto e custo total baseado nos dados do backend
    if (typeof venda.totalImposto === 'number') {
      totalImposto += parseFloat(venda.totalImposto || 0); // Total de imposto fornecido pelo backend
    }

    produtos.forEach((produto, index) => {
      const quantidade = quantidades[index] || 0;
      produtosVendidos[produto] = (produtosVendidos[produto] || 0) + quantidade;
    });

    // Conta a quantidade de compras por cliente
    const cliente = venda.nomeCliente;
    clientesCompraram[cliente] = (clientesCompraram[cliente] || 0) + 1;
  });

  // Calcula o custo total diretamente somando os preços de compra
  for (let i = 0; i < vendas.length; i++) {
    precosCompra = vendas[i].precosCompra.split(', ') || []; // Divide os preços por vírgulas
    quantidades = vendas[i].quantidades.split(', ') || []; // Divide as quantidades por vírgulas
    
    for (let j = 0; j < precosCompra.length; j++) {
      const precoUnitario = parseFloat(precosCompra[j].replace(',', '.')) || 0;
      const quantidade = parseInt(quantidades[j], 10) || 1; // Assume 1 se não houver quantidade
      totalPrecoCompra += precoUnitario * quantidade; // Soma considerando a quantidade
    }
  }

const lucroLiquido = totalVendas - totalFrete - totalImposto - totalPrecoCompra;

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
  renderizarGraficos(totalVendas, totalDescontos, totalLucro, totalFrete, totalImposto, lucroLiquido, lucroPorMes, produtosNomes, produtosQuantidade, clientesNomes, clientesQuantidade);
}

function renderizarGraficos(totalVendas, totalDescontos, totalLucro, totalFrete, totalImposto, lucroLiquido, lucroPorMes, produtosNomes, produtosQuantidade, clientesNomes, clientesQuantidade) {
  // Renderiza os box sparkline
  renderSparkline('Total de Vendas', totalVendas + totalDescontos, '#totalSales');
  renderSparkline('Total de Descontos', totalDescontos, '#spark1');
  renderSparkline('*Lucro Bruto', totalLucro - totalImposto, '#spark2');
  renderSparkline('Frete', totalFrete, '#spark3'); 
  renderSparkline('Imposto', totalImposto, '#spark4'); 
  renderSparkline('**Lucro Líquido', lucroLiquido, '#spark5'); 
  renderBarChart('Lucro Bruto por Período', lucroPorMes, '#bar');
  renderDonutChart('Produtos Mais Vendidos', produtosQuantidade, produtosNomes, '#donut');
  renderAreaChart('Clientes que Mais Compraram', clientesQuantidade, clientesNomes, '#area');

  // Obtém o estoque dos produtos mais vendidos
  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => {
      const estoqueProdutosMaisVendidos = data
        .filter(produto => produtosNomes.includes(produto.nome))
        .map(produto => ({ nome: produto.nome, quantidade: produto.quantidade }));

      renderLineChart(
        'Estoque dos Produtos Mais Vendidos',
        estoqueProdutosMaisVendidos.map(p => p.quantidade),
        estoqueProdutosMaisVendidos.map(p => p.nome),
        '#line'
      );
    })
    .catch(error => console.error('Erro ao buscar estoque dos produtos mais vendidos:', error));
}

// Função para distribuir o valor total em variações para criar efeito pontiagudo
function distribuirVariações(total) {
  const pontos = 24; // Número de pontos para criar os "espinhos"
  const variacoes = Array(pontos).fill(0);
  let soma = 0;

  for (let i = 0; i < pontos - 1; i++) {
    const variacao = Math.random() * (total - soma) * 0.1; // Variações aleatórias
    variacoes[i] = variacao;
    soma += variacao;
  }

  variacoes[pontos - 1] = total - soma; // Ajusta o último ponto para totalizar o valor
  return variacoes;
}

// Função para criar gráficos sparkline com o valor acima e o título abaixo
function renderSparkline(title, data, selector) {
  // Distribui as variações para criar o efeito visual pontiagudo
  const variacoes = distribuirVariações(data);

  // Define a cor do gráfico
  let color = '#008FFB'; // Azul padrão
  if (title === 'Total de Vendas' || title === 'Total de Descontos') {
    color = 'rgba(160, 160, 160, 0.5)'; // Cinza com 50% de opacidade
  }

  const options = {
    chart: {
      type: 'area',
      height: 160,
      sparkline: { enabled: true }
    },
    stroke: { 
      curve: 'straight', // Linha reta para criar o efeito pontiagudo
      width: 4 // Espessura da linha
    },
    series: [{ name: title, data: variacoes }],
    colors: [color], // Cor aplicada
    title: {
      text: parseFloat(data).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      offsetX: 30,
      style: { fontSize: '24px', color: '#263238' }
    },
    subtitle: {
      text: title,
      offsetX: 30,
      style: { fontSize: '14px', color: '#78909C' }
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
      }
    }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}

function renderBarChart(title, data, selector) {
  const formattedData = data.map(value => parseFloat(value.toFixed(2))); // Formata os valores para 2 casas decimais

  const options = {
    chart: { type: 'bar', height: 380 },
    series: [{ name: title, data: formattedData }], // Usa os valores formatados
    xaxis: {
      categories: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 
        'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 
        'Novembro', 'Dezembro'
      ]
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return val.toFixed(2); // Exibe os valores do eixo Y com 2 casas decimais
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
      }
    },
    title: { text: title, align: 'left', style: { fontSize: '18px' } }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}

function renderDonutChart(title, data, labels, selector) {
  const options = {
    chart: { type: 'donut', height: 400 },
    series: data,
    labels: labels,
    title: { text: title, align: 'center', style: { fontSize: '18px' } },
    legend: { position: 'bottom' }
  };
  new ApexCharts(document.querySelector(selector), options).render();
}

function renderAreaChart(title, data, categories, selector) {
  // Substitui valores NaN por 0 no array de dados
  const sanitizedData = data.map(value => (isNaN(value) || value === null) ? 0 : value);

  const options = {
    chart: { type: 'area', height: 340 },
    series: [{ name: title, data: sanitizedData }],
    xaxis: { categories: categories },
    yaxis: {
      labels: {
        formatter: function(val) {
          return Math.floor(val); // Exibe apenas inteiros
        }
      },
      min: 0, // Começa o eixo Y em 0
      forceNiceScale: true // Ajusta o espaçamento dos ticks
    },
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

// Botão de mensagem do filtro de pesquisa
document.querySelector('.close').addEventListener('click', function () {
  document.getElementById('filterMessage').style.display = 'none';
});