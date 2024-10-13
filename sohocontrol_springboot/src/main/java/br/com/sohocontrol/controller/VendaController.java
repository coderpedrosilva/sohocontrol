package br.com.sohocontrol.controller;

import br.com.sohocontrol.dto.VendaDTO;
import br.com.sohocontrol.model.ItemVenda;
import br.com.sohocontrol.model.Produto;
import br.com.sohocontrol.model.Venda;
import br.com.sohocontrol.repository.ProdutoRepository;
import br.com.sohocontrol.repository.VendaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        if (venda.getCliente() == null || venda.getCliente().getId() == null) {
            return errorResponse("Cliente não informado ou inválido.", HttpStatus.BAD_REQUEST);
        }

        double valorTotal = 0.0;

        // Itera sobre cada item da venda para calcular o valor total e ajustar o estoque
        for (ItemVenda item : venda.getItens()) {
            Produto produto = produtoRepository.findById(item.getProduto().getId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            // Verificar quantidade no estoque
            if (produto.getQuantidade() < item.getQuantidade()) {
                return errorResponse("Quantidade insuficiente em estoque para o produto " + produto.getNome(), HttpStatus.BAD_REQUEST);
            }

            // Reduz a quantidade no estoque do produto
            produto.setQuantidade(produto.getQuantidade() - item.getQuantidade());
            produtoRepository.save(produto);

            // Calcula o valor parcial deste item (quantidade * preço de venda) e adiciona ao valor total da venda
            valorTotal += item.getQuantidade() * produto.getPrecoVenda();

            // Associa o item à venda
            item.setVenda(venda);
        }

        // Define o valor total calculado na venda
        venda.setValorTotal(valorTotal);

        // Salva a venda com os itens e o valor total atualizado
        vendaRepository.save(venda);

        return ResponseEntity.ok(venda);
    }

    private ResponseEntity<Map<String, String>> errorResponse(String message, HttpStatus status) {
        Map<String, String> errorMap = new HashMap<>();
        errorMap.put("error", message);
        return ResponseEntity.status(status).body(errorMap);
    }

    @GetMapping
    public ResponseEntity<List<VendaDTO>> getAllVendas() {
        List<VendaDTO> vendasDto = vendaRepository.findAll().stream().map(venda -> new VendaDTO(
                venda.getId(),
                venda.getDataVenda(),
                venda.getCliente().getNome(),
                venda.getItens().stream().map(item -> item.getProduto().getNome()).collect(Collectors.joining(", ")),
                venda.getItens().stream().map(item -> String.valueOf(item.getQuantidade())).collect(Collectors.joining(", ")),
                venda.getItens().stream().map(item -> String.format("%.2f", item.getProduto().getPrecoVenda())).collect(Collectors.joining(", ")),
                venda.getValorTotal() // Valor total da venda agora está sendo corretamente enviado
        )).collect(Collectors.toList());

        return ResponseEntity.ok(vendasDto);
    }
}
