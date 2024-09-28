let clientes = []; // Armazena os clientes cadastrados

document.getElementById('clienteForm').addEventListener('submit', function(e) {
  e.preventDefault();

  let name = document.getElementById('nome').value;
  let cpfCnpj = document.getElementById('cpf_cnpj').value;
  let address = document.getElementById('endereco').value;
  let phone = document.getElementById('telefone').value;
  let email = document.getElementById('email').value;

  let client = {
    nome: name,
    cpf_cnpj: cpfCnpj,
    endereco: address,
    telefone: phone,
    email: email
  };

  clientes.push(client); // Adiciona o cliente ao array global
  document.getElementById('clienteForm').reset();
  alert('Cliente cadastrado com sucesso!');
});

function atualizarTabelaClientes() {
  let tbody = document.querySelector('#tabelaClientes tbody');
  tbody.innerHTML = '';

  let search = document.getElementById('buscarCliente').value.toLowerCase();
  let filteredClients = clientes.filter(function(cliente) {
    return cliente.nome.toLowerCase().includes(search);
  });

  filteredClients.forEach(function(cliente) {
    let row = tbody.insertRow();
    row.insertCell().innerText = cliente.nome;
    row.insertCell().innerText = cliente.cpf_cnpj;
    row.insertCell().innerText = cliente.endereco;
    row.insertCell().innerText = cliente.telefone;
    row.insertCell().innerText = cliente.email;
  });
}

document.getElementById('buscarCliente').addEventListener('input', atualizarTabelaClientes);
document.getElementById('visualizar-tab').addEventListener('click', atualizarTabelaClientes);
