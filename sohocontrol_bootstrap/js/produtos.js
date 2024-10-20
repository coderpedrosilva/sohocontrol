 // Função para cadastrar produto
 document.getElementById('produtoForm').addEventListener('submit', function(e) {
  e.preventDefault();

  let product = {
    nome: document.getElementById('nome_produto').value,
    fornecedor: document.getElementById('fornecedor').value,
    origem: document.getElementById('origem').value,
    quantidade: document.getElementById('quantidade').value,
    precoVenda: document.getElementById('preco_venda').value
  };

  fetch('http://localhost:8080/api/produtos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  })
  .then(response => response.json())
  .then(data => {
    alert('Produto cadastrado com sucesso!');
    document.getElementById('produtoForm').reset();
    atualizarTabelaProdutos();
  })
  .catch(error => console.error('Erro:', error));
});

// Função para atualizar tabela de produtos
function atualizarTabelaProdutos() {
  fetch('http://localhost:8080/api/produtos')
    .then(response => response.json())
    .then(data => {
      let tbody = document.querySelector('#tabelaProdutos tbody');
      tbody.innerHTML = '';

      let search = document.getElementById('buscarProduto').value.toLowerCase();
      let filteredProducts = data.filter(function(produto) {
        return produto.nome.toLowerCase().includes(search);
      });

      filteredProducts.forEach(function(produto) {
        let row = tbody.insertRow();
        row.setAttribute('data-id', produto.id);
        row.insertCell().innerText = produto.id;
        row.insertCell().innerText = produto.nome;
        row.insertCell().innerText = produto.fornecedor;
        row.insertCell().innerText = produto.origem;
        row.insertCell().innerText = produto.quantidade;
        row.insertCell().innerText = produto.precoVenda;

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
    })
    .catch(error => console.error('Erro:', error));
}

// Função para habilitar edição de produto
function habilitarEdicaoProduto(id, editIcon) {
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

// Função para salvar edição de produto
function salvarEdicaoProduto(id, saveIcon) {
  let row = saveIcon.closest('tr');
  let cells = row.querySelectorAll('td:not(:last-child)');
  let productData = {
    nome: cells[1].querySelector('input').value,
    fornecedor: cells[2].querySelector('input').value,
    origem: cells[3].querySelector('input').value,
    quantidade: cells[4].querySelector('input').value,
    precoVenda: cells[5].querySelector('input').value
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
      alert('Erro ao atualizar produto.');
    }
  })
  .catch(error => console.error('Erro:', error));
}

// Função para deletar produto
function deletarProduto(id) {
  // Primeiro aviso sobre a exclusão dos pedidos relacionados
  if (confirm('A exclusão deste produto resultará na remoção de todos os pedidos relacionados. Deseja continuar?')) {
    // Confirmar novamente se o usuário deseja realmente excluir o produto e os pedidos relacionados
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
}


document.getElementById('buscarProduto').addEventListener('input', atualizarTabelaProdutos);
document.getElementById('visualizar-tab').addEventListener('click', atualizarTabelaProdutos);