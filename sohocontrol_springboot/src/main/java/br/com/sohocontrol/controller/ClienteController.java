package br.com.sohocontrol.controller;

import br.com.sohocontrol.model.Cliente;
import br.com.sohocontrol.model.Venda;
import br.com.sohocontrol.repository.ClienteRepository;
import br.com.sohocontrol.repository.VendaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "http://127.0.0.1:5500") // Permitir o frontend acessar esse endpoint
public class ClienteController {

    private final ClienteRepository clienteRepository;
    private final VendaRepository vendaRepository;

    public ClienteController(ClienteRepository clienteRepository, VendaRepository vendaRepository) {
        this.clienteRepository = clienteRepository;
        this.vendaRepository = vendaRepository;
    }

    @PostMapping
    public Cliente createCliente(@RequestBody Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    @GetMapping
    public List<Cliente> getAllClientes() {
        return clienteRepository.findAll();
    }

    @PutMapping("/{id}")
    public Cliente updateCliente(@PathVariable Long id, @RequestBody Cliente clienteAtualizado) {
        return clienteRepository.findById(id)
                .map(cliente -> {
                    cliente.setNome(clienteAtualizado.getNome());
                    cliente.setCpfCnpj(clienteAtualizado.getCpfCnpj());
                    cliente.setEndereco(clienteAtualizado.getEndereco());
                    cliente.setCidade(clienteAtualizado.getCidade());
                    cliente.setEstado(clienteAtualizado.getEstado());
                    cliente.setTelefone(clienteAtualizado.getTelefone());
                    cliente.setEmail(clienteAtualizado.getEmail());
                    return clienteRepository.save(cliente);
                })
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCliente(@PathVariable Long id) {
        try {
            if (clienteRepository.existsById(id)) {
                // Excluir as vendas associadas ao cliente
                List<Venda> vendasAssociadas = vendaRepository.findByClienteId(id);
                if (!vendasAssociadas.isEmpty()) {
                    vendaRepository.deleteAll(vendasAssociadas);
                }

                // Excluir o cliente
                clienteRepository.deleteById(id);
                return ResponseEntity.ok().build();
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado");
            }
        } catch (Exception e) {
            // Log para depuração
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao deletar cliente");
        }
    }
}
