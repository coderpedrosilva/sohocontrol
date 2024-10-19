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
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(client)
  })
  .then(response => response.json())
  .then(data => {
    alert('Cliente cadastrado com sucesso!');
    document.getElementById('clienteForm').reset();
  })
  .catch(error => console.error('Erro:', error));
});

function atualizarTabelaClientes() {
  fetch('http://localhost:8080/api/clientes')
    .then(response => response.json())
    .then(data => {
      let tbody = document.querySelector('#tabelaClientes tbody');
      tbody.innerHTML = '';

      let sortedClients = data.sort((a, b) => b.id - a.id);
      let search = document.getElementById('buscarCliente').value.toLowerCase();
      let filteredClients = sortedClients.filter(cliente => 
        cliente.nome.toLowerCase().includes(search)
      );

      filteredClients.forEach(function(cliente) {
        let row = tbody.insertRow();
        row.setAttribute('data-id', cliente.id);
        row.insertCell().innerText = cliente.nome;
        row.insertCell().innerText = cliente.cpfCnpj;
        row.insertCell().innerText = cliente.endereco;
        row.insertCell().innerText = cliente.cidade;
        row.insertCell().innerText = cliente.estado;
        row.insertCell().innerText = cliente.telefone;
        row.insertCell().innerText = cliente.email;

        // Coluna de Ações
        let actionCell = row.insertCell();
        actionCell.innerHTML = `
          <div class="icon-container">
            <i class="fa-solid fa-pen-to-square" onclick="habilitarEdicaoCliente(${cliente.id}, this)"></i>
            <i class="fa-solid fa-floppy-disk d-none" onclick="salvarEdicaoCliente(${cliente.id}, this)"></i>
            <i class="fa-solid fa-trash" onclick="deletarCliente(${cliente.id})"></i>
          </div>
        `;
      });
    })
    .catch(error => console.error('Erro:', error));
}

// Função para habilitar edição de cliente
function habilitarEdicaoCliente(id, editIcon) {
  let row = editIcon.closest('tr');
  let cells = row.querySelectorAll('td:not(:last-child)');

  cells.forEach(cell => {
    let input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.value = cell.innerText;
    cell.innerText = '';
    cell.appendChild(input);
  });

  // Mostra o ícone de salvar e oculta o de editar
  editIcon.classList.add('d-none');
  editIcon.nextElementSibling.classList.remove('d-none');
}

// Função para salvar edição de cliente
function salvarEdicaoCliente(id, saveIcon) {
  let row = saveIcon.closest('tr');
  let cells = row.querySelectorAll('td:not(:last-child)');
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
    headers: {
      'Content-Type': 'application/json'
    },
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

function deletarCliente(id) {
  if (confirm('Tem certeza que deseja excluir o cliente?')) {
    fetch(`http://localhost:8080/api/clientes/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        alert('Cliente excluído com sucesso!');
        atualizarTabelaClientes();
      } else if (response.status === 404) {
        alert('Cliente não encontrado.');
      } else {
        alert('Erro ao excluir cliente. Verifique se há vendas associadas.');
      }
    })
    .catch(error => console.error('Erro ao excluir cliente:', error));
  }
}


document.getElementById('buscarCliente').addEventListener('input', atualizarTabelaClientes);
document.getElementById('visualizar-tab').addEventListener('click', atualizarTabelaClientes);
