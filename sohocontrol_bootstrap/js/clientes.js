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

// Função para atualizar tabela de clientes
function atualizarTabelaClientes() {
  fetch('http://localhost:8080/api/clientes')
    .then(response => response.json())
    .then(data => {
      let tbody = document.querySelector('#tabelaClientes tbody');
      tbody.innerHTML = '';

      // Ordenar clientes do mais recente para o mais antigo
      let sortedClients = data.sort((a, b) => b.id - a.id);

      let search = document.getElementById('buscarCliente').value.toLowerCase();
      let filteredClients = sortedClients.filter(function(cliente) {
        return cliente.nome.toLowerCase().includes(search);
      });

      filteredClients.forEach(function(cliente) {
        let row = tbody.insertRow();
        row.insertCell().innerText = cliente.nome;
        row.insertCell().innerText = cliente.cpfCnpj;
        row.insertCell().innerText = cliente.endereco;
        row.insertCell().innerText = cliente.cidade;
        row.insertCell().innerText = cliente.estado;
        row.insertCell().innerText = cliente.telefone;
        row.insertCell().innerText = cliente.email;
      });
    })
    .catch(error => console.error('Erro:', error));
}

document.getElementById('buscarCliente').addEventListener('input', atualizarTabelaClientes);
document.getElementById('visualizar-tab').addEventListener('click', atualizarTabelaClientes);
