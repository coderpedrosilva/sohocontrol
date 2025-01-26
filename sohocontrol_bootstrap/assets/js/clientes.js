// ===================================
// VARIÁVEIS GLOBAIS
// ===================================

let clientes = [];
let clientesPorPagina = 10;
let paginaAtual = 1;

// ===================================
// FUNÇÕES DE INICIALIZAÇÃO
// ===================================

// Atualiza a tabela de clientes e a paginação inicial
document.getElementById('visualizar-tab').addEventListener('click', atualizarTabelaClientes);

// ===================================
// FUNÇÕES RELACIONADAS A CLIENTES
// ===================================

// Função para cadastrar cliente
document.getElementById('clienteForm').addEventListener('submit', function(e) {
  e.preventDefault();

  let client = {
    nome: document.getElementById('nome').value,
    cpfCnpj: document.getElementById('cpf_cnpj').value,
    endereco: document.getElementById('endereco').value,
    cidade: document.getElementById('cidade').value,
    estado: document.getElementById('estado').value,
    telefone: document.getElementById('telefone').value,
    email: document.getElementById('email').value
  };

  fetch('http://localhost:8080/api/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(client)
  })
  .then(response => response.json())
  .then(data => {
    alert('Cliente cadastrado com sucesso!');
    document.getElementById('clienteForm').reset();
  })
  .catch(error => console.error('Erro:', error));
});

// Função para buscar e atualizar a tabela de clientes
function atualizarTabelaClientes() {
  fetch('http://localhost:8080/api/clientes')
    .then(response => response.json())
    .then(data => {
      clientes = data.sort((a, b) => a.nome.localeCompare(b.nome));
      renderizarTabelaClientes();
      renderizarPaginacao();
    })
    .catch(error => console.error('Erro:', error));
}

// Função para deletar cliente
function deletarCliente(id) {
  if (confirm('Tem certeza que deseja excluir o cliente e todos os pedidos relacionados?')) {
    fetch(`http://localhost:8080/api/clientes/${id}`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          alert('Cliente excluído com sucesso!');
          atualizarTabelaClientes();
        } else if (response.status === 404) {
          alert('Cliente não encontrado.');
        } else {
          alert('Erro ao excluir cliente.');
        }
      })
      .catch(error => console.error('Erro ao excluir cliente:', error));
  }
}

// ===================================
// FUNÇÕES DE EDIÇÃO DE CLIENTES
// ===================================

// Habilita a edição dos dados de um cliente
function habilitarEdicaoCliente(id, editIcon) {
  let row = editIcon.closest('tr');
  let cells = Array.from(row.cells).slice(1, -1); // Exclui a primeira (ID) e a última célula (Ações)

  cells.forEach(cell => {
    let input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.value = cell.innerText;
    cell.innerText = '';
    cell.appendChild(input);
  });

  editIcon.classList.add('d-none');
  editIcon.nextElementSibling.classList.remove('d-none');
}

// Salva a edição dos dados de um cliente
function salvarEdicaoCliente(id, saveIcon) {
  let row = saveIcon.closest('tr');
  let cells = Array.from(row.cells).slice(1, -1); // Exclui a primeira (ID) e a última célula (Ações)

  let clientData = {
    nome: cells[0].querySelector('input').value,
    cpfCnpj: cells[1].querySelector('input').value,
    endereco: cells[2].querySelector('input').value,
    cidade: cells[3].querySelector('input').value,
    estado: cells[4].querySelector('input').value,
    telefone: cells[5].querySelector('input').value,
    email: cells[6].querySelector('input').value
  };

  fetch(`http://localhost:8080/api/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData)
  })
  .then(response => {
    if (response.ok) {
      alert('Cliente atualizado com sucesso!');
      atualizarTabelaClientes();
    } else {
      alert('Erro ao atualizar cliente.');
    }
  })
  .catch(error => console.error('Erro:', error));
}

// ===================================
// FUNÇÕES DE TABELA E PAGINAÇÃO
// ===================================

// Renderiza a tabela de clientes
function renderizarTabelaClientes() {
  let tbody = document.querySelector('#tabelaClientes tbody');
  tbody.innerHTML = '';

  let search = document.getElementById('buscarCliente').value.toLowerCase();
  let filteredClients = clientes.filter(cliente => cliente.nome.toLowerCase().includes(search));

  let inicio = (paginaAtual - 1) * clientesPorPagina;
  let fim = inicio + clientesPorPagina;
  let clientesPagina = filteredClients.slice(inicio, fim);

  clientesPagina.forEach(cliente => {
    let row = tbody.insertRow();
    row.setAttribute('data-id', cliente.id);

    row.insertCell().innerText = cliente.id; // Código do Cliente
    row.insertCell().innerText = cliente.nome;
    row.insertCell().innerText = cliente.cpfCnpj;
    row.insertCell().innerText = cliente.endereco;
    row.insertCell().innerText = cliente.cidade;
    row.insertCell().innerText = cliente.estado;
    row.insertCell().innerText = cliente.telefone;
    row.insertCell().innerText = cliente.email;

    let actionCell = row.insertCell();
    actionCell.innerHTML = `
      <div class="icon-container">
        <i class="fa-solid fa-pen-to-square" onclick="habilitarEdicaoCliente(${cliente.id}, this)"></i>
        <i class="fa-solid fa-floppy-disk d-none" onclick="salvarEdicaoCliente(${cliente.id}, this)"></i>
        <i class="fa-solid fa-trash" onclick="deletarCliente(${cliente.id})"></i>
      </div>
    `;
  });
}

// Renderiza a paginação da tabela de clientes
function renderizarPaginacao() {
  let totalPaginas = Math.ceil(clientes.length / clientesPorPagina);
  let pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  let maxPaginasVisiveis = 3;
  let inicioPagina = Math.max(1, paginaAtual - 1);
  let fimPagina = Math.min(totalPaginas, inicioPagina + maxPaginasVisiveis - 1);

  // Botão "Anterior"
  let anteriorLi = document.createElement('li');
  anteriorLi.classList.add('page-item');
  if (paginaAtual === 1) anteriorLi.classList.add('disabled');
  anteriorLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
  anteriorLi.onclick = (e) => {
    e.preventDefault();
    if (paginaAtual > 1) {
      paginaAtual--;
      renderizarTabelaClientes();
      renderizarPaginacao();
    }
  };
  pagination.appendChild(anteriorLi);

  // Números das páginas
  for (let i = inicioPagina; i <= fimPagina; i++) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    if (i === paginaAtual) li.classList.add('active');

    let a = document.createElement('a');
    a.classList.add('page-link');
    a.href = '#';
    a.innerText = i;
    a.onclick = (e) => {
      e.preventDefault();
      paginaAtual = i;
      renderizarTabelaClientes();
      renderizarPaginacao();
    };

    li.appendChild(a);
    pagination.appendChild(li);
  }

  // Botão "Próxima"
  let proximaLi = document.createElement('li');
  proximaLi.classList.add('page-item');
  if (paginaAtual === totalPaginas) proximaLi.classList.add('disabled');
  proximaLi.innerHTML = `<a class="page-link" href="#">Próxima</a>`;
  proximaLi.onclick = (e) => {
    e.preventDefault();
    if (paginaAtual < totalPaginas) {
      paginaAtual++;
      renderizarTabelaClientes();
      renderizarPaginacao();
    }
  };
  pagination.appendChild(proximaLi);
}

// ===================================
// FUNÇÕES DE BUSCA
// ===================================

document.getElementById('buscarCliente').addEventListener('input', () => {
  paginaAtual = 1;
  renderizarTabelaClientes();
  renderizarPaginacao();
});
