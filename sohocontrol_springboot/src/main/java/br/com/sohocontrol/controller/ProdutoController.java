package br.com.sohocontrol.controller;

import br.com.sohocontrol.model.ItemVenda;
import br.com.sohocontrol.model.Produto;
import br.com.sohocontrol.model.Venda;
import br.com.sohocontrol.repository.ProdutoRepository;
import br.com.sohocontrol.repository.VendaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoRepository produtoRepository;
    private final VendaRepository vendaRepository;

    public ProdutoController(ProdutoRepository produtoRepository, VendaRepository vendaRepository) {
        this.produtoRepository = produtoRepository;
        this.vendaRepository = vendaRepository;
    }

    @GetMapping
    public List<Produto> getAllProdutos() {
        return produtoRepository.findAll();
    }

    @PostMapping
    public Produto createProduto(@RequestBody Produto produto) {
        return produtoRepository.save(produto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> updateProduto(@PathVariable Long id, @RequestBody Produto produtoAtualizado) {
        Optional<Produto> produtoOptional = produtoRepository.findById(id);

        if (produtoOptional.isPresent()) {
            Produto produtoExistente = produtoOptional.get();
            produtoExistente.setNome(produtoAtualizado.getNome());
            produtoExistente.setFornecedor(produtoAtualizado.getFornecedor());
            produtoExistente.setOrigem(produtoAtualizado.getOrigem());
            produtoExistente.setDescricao(produtoAtualizado.getDescricao()); // Atualiza a descrição
            produtoExistente.setQuantidade(produtoAtualizado.getQuantidade());
            produtoExistente.setPrecoCompra(produtoAtualizado.getPrecoCompra()); // Atualiza o preço de compra
            produtoExistente.setImposto(produtoAtualizado.getImposto());
            produtoExistente.setPrecoVenda(produtoAtualizado.getPrecoVenda());

            Produto produtoAtualizadoSalvo = produtoRepository.save(produtoExistente);
            return ResponseEntity.ok(produtoAtualizadoSalvo);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduto(@PathVariable Long id) {
        Optional<Produto> produtoOptional = produtoRepository.findById(id);

        if (produtoOptional.isPresent()) {
            Produto produto = produtoOptional.get();

            // Buscar todas as vendas associadas ao produto
            List<Venda> vendasAssociadas = vendaRepository.findByProdutoId(id);

            // Excluir todas as vendas associadas ao produto
            for (Venda venda : vendasAssociadas) {
                vendaRepository.delete(venda);
            }

            // Deletar o produto após remover as vendas associadas
            try {
                produtoRepository.delete(produto);
                return ResponseEntity.ok("Produto e vendas associadas excluídos com sucesso.");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Erro ao excluir o produto.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Produto não encontrado.");
        }
    }
}
