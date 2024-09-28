package br.com.sohocontrol.controller;

import br.com.sohocontrol.model.Produto;
import br.com.sohocontrol.model.Venda;
import br.com.sohocontrol.repository.ProdutoRepository;
import br.com.sohocontrol.repository.VendaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;

    public VendaController(VendaRepository vendaRepository, ProdutoRepository produtoRepository) {
        this.vendaRepository = vendaRepository;
        this.produtoRepository = produtoRepository;
    }

    @PostMapping
    public ResponseEntity<?> createVenda(@RequestBody Venda venda) {
        Produto produto = produtoRepository.findById(venda.getProduto().getId()).orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Verificar se há quantidade suficiente no estoque
        if (produto.getQuantidade() < venda.getQuantidade()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Quantidade insuficiente em estoque");
        }

        // Reduzir a quantidade no estoque
        produto.setQuantidade(produto.getQuantidade() - venda.getQuantidade());
        produtoRepository.save(produto);

        // Salvar a venda
        vendaRepository.save(venda);
        return ResponseEntity.ok(venda);
    }

    @GetMapping
    public List<Venda> getAllVendas() {
        return vendaRepository.findAll();
    }
}
