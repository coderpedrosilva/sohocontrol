let produtos = [];
let produtosPorPagina = 10;
let paginaAtualProdutos = 1;

// Função para carregar dados iniciais de clientes e produtos
function carregarDadosIniciais() {
  // Carrega clientes
  fetch('http://localhost:8080/api/clientes')
    .then(response => response.json())
    .then(data => {
      // Ordena os clientes por nome em ordem alfabética
      clientes = data.sort((a, b) => a.nome.localeCompare(b.nome)); 
    })
    .catch(error => console.error('Erro ao buscar clientes:', error));

  // Carrega produtos
  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => {
      // Ordena os produtos por nome em ordem alfabética
      produtos = data.sort((a, b) => a.nome.localeCompare(b.nome));
      renderizarTabelaProdutos();
      renderizarPaginacaoProdutos();
    })
    .catch(error => console.error('Erro ao buscar produtos:', error));
}

// Função para formatar o preço com vírgula e duas casas decimais
function formatarPreco(preco) {
  return preco.toFixed(2).replace('.', ','); // Converte para string com duas casas decimais e troca ponto por vírgula
}

// Função para validar e formatar o preço durante a digitação
function validarPreco(event) {
  let valor = event.target.value;

  // Permitir apenas números e vírgula
  valor = valor.replace(/[^0-9,]/g, '');

  // Garantir que apenas uma vírgula seja usada
  let partes = valor.split(',');
  if (partes.length > 2) {
    valor = partes[0] + ',' + partes[1].substring(0, 2);
  }

  // Limitar a dois dígitos após a vírgula
  if (partes[1]) {
    partes[1] = partes[1].substring(0, 2);
    valor = partes.join(',');
  }

  event.target.value = valor;
}

// Adicionar o evento de validação nos campos de preço
document.getElementById('preco_compra').addEventListener('input', validarPreco);
document.getElementById('preco_venda').addEventListener('input', validarPreco);

// Função para cadastrar produto
document.getElementById('produtoForm').addEventListener('submit', function(e) {
  e.preventDefault();

  let precoCompra = document.getElementById('preco_compra').value.replace(',', '.');
  let precoVenda = document.getElementById('preco_venda').value.replace(',', '.');

  let product = {
    nome: document.getElementById('nome_produto').value,
    fornecedor: document.getElementById('fornecedor').value,
    origem: document.getElementById('origem').value,
    descricao: document.getElementById('descricao').value,
    quantidade: parseInt(document.getElementById('quantidade').value, 10) || 0,
    precoCompra: parseFloat(precoCompra) || 0,
    precoVenda: parseFloat(precoVenda) || 0
  };

  fetch('http://localhost:8080/api/produtos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  })
  .then(response => {
    if (response.ok) {
      alert('Produto cadastrado com sucesso!');
      document.getElementById('produtoForm').reset();
      atualizarTabelaProdutos();
    } else {
      return response.text().then(err => { throw new Error(err); });
    }
  })
  .catch(error => console.error('Erro:', error));
});

// Função para atualizar tabela de produtos
function atualizarTabelaProdutos() {
  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => {
      produtos = data.sort((a, b) => a.nome.localeCompare(b.nome));
      renderizarTabelaProdutos();
      renderizarPaginacaoProdutos();
    })
    .catch(error => console.error('Erro:', error));
}

// Função para renderizar a tabela de produtos com paginação
function renderizarTabelaProdutos() {
  let tbody = document.querySelector('#tabelaProdutos tbody');
  tbody.innerHTML = '';

  let search = document.getElementById('buscarProduto').value.toLowerCase();
  let filteredProducts = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(search)
  );

  let inicio = (paginaAtualProdutos - 1) * produtosPorPagina;
  let fim = inicio + produtosPorPagina;
  let produtosPagina = filteredProducts.slice(inicio, fim);

  produtosPagina.forEach(function(produto) {
    let row = tbody.insertRow();
    row.setAttribute('data-id', produto.id);
    row.insertCell().innerText = produto.id;
    row.insertCell().innerText = produto.nome;
    row.insertCell().innerText = produto.fornecedor;
    row.insertCell().innerText = produto.origem;
    row.insertCell().innerText = produto.descricao;
    row.insertCell().innerText = produto.quantidade;
    row.insertCell().innerText = formatarPreco(produto.precoCompra);
    row.insertCell().innerText = formatarPreco(produto.precoVenda);

    // Coluna de Ações
    let actionCell = row.insertCell();
    actionCell.innerHTML = `
      <div class="icon-container">
        <i class="fa-solid fa-pen-to-square" onclick="habilitarEdicaoProduto(${produto.id}, this)"></i>
        <i class="fa-solid fa-floppy-disk d-none" onclick="salvarEdicaoProduto(${produto.id}, this)"></i>
        <i class="fa-solid fa-trash" onclick="deletarProduto(${produto.id})"></i>
      </div>
    `;
  });
}

// Função para renderizar a paginação de produtos
function renderizarPaginacaoProdutos() {
  let totalPaginas = Math.ceil(produtos.length / produtosPorPagina);
  let pagination = document.getElementById('paginationProdutos');
  pagination.innerHTML = '';

  let maxPaginasVisiveis = 3;
  let inicioPagina = Math.max(1, paginaAtualProdutos - 1);
  let fimPagina = Math.min(totalPaginas, inicioPagina + maxPaginasVisiveis - 1);

  // Botão "Anterior"
  let anteriorLi = document.createElement('li');
  anteriorLi.classList.add('page-item');
  if (paginaAtualProdutos === 1) anteriorLi.classList.add('disabled');
  anteriorLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
  anteriorLi.onclick = (e) => {
    e.preventDefault();
    if (paginaAtualProdutos > 1) {
      paginaAtualProdutos--;
      renderizarTabelaProdutos();
      renderizarPaginacaoProdutos();
    }
  };
  pagination.appendChild(anteriorLi);

  // Números das páginas
  for (let i = inicioPagina; i <= fimPagina; i++) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    if (i === paginaAtualProdutos) li.classList.add('active');

    let a = document.createElement('a');
    a.classList.add('page-link');
    a.href = '#';
    a.innerText = i;
    a.onclick = (e) => {
      e.preventDefault();
      paginaAtualProdutos = i;
      renderizarTabelaProdutos();
      renderizarPaginacaoProdutos();
    };

    li.appendChild(a);
    pagination.appendChild(li);
  }

  // Botão "Próxima"
  let proximaLi = document.createElement('li');
  proximaLi.classList.add('page-item');
  if (paginaAtualProdutos === totalPaginas) proximaLi.classList.add('disabled');
  proximaLi.innerHTML = `<a class="page-link" href="#">Próxima</a>`;
  proximaLi.onclick = (e) => {
    e.preventDefault();
    if (paginaAtualProdutos < totalPaginas) {
      paginaAtualProdutos++;
      renderizarTabelaProdutos();
      renderizarPaginacaoProdutos();
    }
  };
  pagination.appendChild(proximaLi);
}

// Função para habilitar edição de produto
function habilitarEdicaoProduto(id, editIcon) {
  let row = editIcon.closest('tr');
  let cells = row.querySelectorAll('td:not(:last-child)');

  cells.forEach((cell, index) => {
    let input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    
    if (index === 6 || index === 7) {
      input.value = cell.innerText.replace(',', '.');
    } else {
      input.value = cell.innerText;
    }
    
    cell.innerText = '';
    cell.appendChild(input);
  });

  editIcon.classList.add('d-none');
  editIcon.nextElementSibling.classList.remove('d-none');
}

// Função para salvar edição de produto
function salvarEdicaoProduto(id, saveIcon) {
  let row = saveIcon.closest('tr');
  let cells = row.querySelectorAll('td:not(:last-child)');
  let productData = {
    nome: cells[1].querySelector('input').value,
    fornecedor: cells[2].querySelector('input').value,
    origem: cells[3].querySelector('input').value,
    descricao: cells[4].querySelector('input').value,
    quantidade: parseInt(cells[5].querySelector('input').value, 10) || 0,
    precoCompra: parseFloat(cells[6].querySelector('input').value.replace(',', '.')) || 0,
    precoVenda: parseFloat(cells[7].querySelector('input').value.replace(',', '.')) || 0
  };

  fetch(`http://localhost:8080/api/produtos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  })
  .then(response => {
    if (response.ok) {
      alert('Produto atualizado com sucesso!');
      atualizarTabelaProdutos();
    } else {
      return response.text().then(err => { throw new Error(err); });
    }
  })
  .catch(error => console.error('Erro:', error));
}

// Função para deletar produto
function deletarProduto(id) {
  if (confirm('Tem certeza que deseja excluir o produto e todos os pedidos relacionados?')) {
    fetch(`http://localhost:8080/api/produtos/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        alert('Produto e todos os pedidos relacionados foram excluídos com sucesso!');
        atualizarTabelaProdutos();
      } else if (response.status === 404) {
        alert('Produto não encontrado.');
      } else {
        alert('Erro ao excluir produto.');
      }
    })
    .catch(error => console.error('Erro ao excluir produto:', error));
  }
}

document.addEventListener('DOMContentLoaded', function() {
  carregarDadosIniciais();
});

document.getElementById('buscarProduto').addEventListener('input', () => {
  paginaAtualProdutos = 1;
  renderizarTabelaProdutos();
  renderizarPaginacaoProdutos();
});

document.getElementById('visualizar-tab').addEventListener('click', atualizarTabelaProdutos);
