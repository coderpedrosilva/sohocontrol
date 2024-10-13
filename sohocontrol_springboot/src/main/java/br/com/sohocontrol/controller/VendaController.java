package br.com.sohocontrol.controller;

import br.com.sohocontrol.dto.VendaDTO;
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
        System.out.println("Recebendo requisição de venda: " + venda);

        if (venda.getCliente() == null || venda.getCliente().getId() == null) {
            return errorResponse("Cliente não informado ou inválido.", HttpStatus.BAD_REQUEST);
        }

        venda.getItens().forEach(item -> {
            Produto produto = produtoRepository.findById(item.getProduto().getId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            if (produto.getQuantidade() < item.getQuantidade()) {
                throw new RuntimeException("Quantidade insuficiente em estoque para o produto " + produto.getNome());
            }

            produto.setQuantidade(produto.getQuantidade() - item.getQuantidade());
            produtoRepository.save(produto);
            item.setVenda(venda);
        });

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
        List<VendaDTO> vendasDto = vendaRepository.findAll().stream().map(venda -> {
            double valorFinal = venda.getValorTotal();
            String descontoInfo = "";

            // Verifica se há um desconto aplicado e adiciona a informação do desconto
            if (venda.getDescontoAplicado() != null && venda.getDescontoAplicado() > 0) {
                if ("reais".equalsIgnoreCase(venda.getTipoDesconto())) {
                    descontoInfo = String.format(" (Desconto de R$ %.2f)", venda.getDescontoAplicado());
                } else if ("percentual".equalsIgnoreCase(venda.getTipoDesconto())) {
                    descontoInfo = String.format(" (Desconto de %.0f%%)", venda.getDescontoAplicado());
                }
            }

            // Formata o valor total como uma string com duas casas decimais, sem modificá-lo no frontend
            String valorTotalFormatado = String.format("%.2f%s", valorFinal, descontoInfo);

            return new VendaDTO(
                    venda.getId(),
                    venda.getDataVenda(),
                    venda.getCliente().getNome(),
                    venda.getItens().stream().map(item -> item.getProduto().getNome()).collect(Collectors.joining(", ")),
                    venda.getItens().stream().map(item -> String.valueOf(item.getQuantidade())).collect(Collectors.joining(", ")),
                    venda.getItens().stream().map(item -> String.format("%.2f", item.getProduto().getPrecoVenda())).collect(Collectors.joining(", ")),
                    valorTotalFormatado,
                    venda.getDescontoAplicado() != null ? venda.getDescontoAplicado() : 0.0,
                    venda.getTipoDesconto() != null ? venda.getTipoDesconto() : ""
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(vendasDto);
    }

}