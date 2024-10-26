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
        if (venda.getCliente() == null || venda.getCliente().getId() == null) {
            return errorResponse("Cliente não informado ou inválido.", HttpStatus.BAD_REQUEST);
        }

        try {
            venda.getItens().forEach(item -> {
                Produto produto = produtoRepository.findById(item.getProduto().getId())
                        .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

                if (produto.getQuantidade() < item.getQuantidade()) {
                    // Retornar uma resposta de erro com mensagem clara
                    throw new IllegalArgumentException("Quantidade insuficiente em estoque para o produto " + produto.getNome());
                }

                // Salva o preço do produto no momento da venda
                item.setPrecoVenda(produto.getPrecoVenda());

                produto.setQuantidade(produto.getQuantidade() - item.getQuantidade());
                produtoRepository.save(produto);
                item.setVenda(venda);
            });

            vendaRepository.save(venda);
            return ResponseEntity.ok(venda);
        } catch (IllegalArgumentException e) {
            // Captura o erro e retorna uma resposta de erro amigável
            return errorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            // Captura outros erros
            return errorResponse("Erro ao registrar a venda.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ResponseEntity<Map<String, String>> errorResponse(String message, HttpStatus status) {
        Map<String, String> errorMap = new HashMap<>();
        errorMap.put("error", message);
        return ResponseEntity.status(status).body(errorMap);
    }

    @GetMapping
    public ResponseEntity<List<VendaDTO>> getAllVendas() {
        List<VendaDTO> vendasDto = vendaRepository.findAllOrderByDataAndIdDesc().stream().map(venda -> {
            double valorFinal = venda.getValorTotal();
            String descontoInfo = "";

            // Verifica se o desconto é diferente de nulo e maior que 0
            if (venda.getDescontoAplicado() != null && venda.getDescontoAplicado() > 0) {
                if ("reais".equalsIgnoreCase(venda.getTipoDesconto())) {
                    // Formata para mostrar até duas casas decimais para descontos em reais
                    descontoInfo = String.format(" (Desconto de R$ %.2f)", venda.getDescontoAplicado());
                } else if ("percentual".equalsIgnoreCase(venda.getTipoDesconto())) {
                    // Formata para mostrar até duas casas decimais para descontos percentuais
                    descontoInfo = String.format(" (Desconto de %.2f%%)", venda.getDescontoAplicado());
                }
            }

            String valorTotalFormatado = String.format("%.2f%s", valorFinal, descontoInfo);

            return new VendaDTO(
                    venda.getId(),
                    venda.getDataVenda(),
                    venda.getCliente().getNome(),
                    venda.getItens().stream().map(item -> item.getProduto().getNome()).collect(Collectors.joining(", ")),
                    venda.getItens().stream().map(item -> String.valueOf(item.getQuantidade())).collect(Collectors.joining(", ")),
                    venda.getItens().stream().map(item -> String.format("%.2f", item.getPrecoVenda())).collect(Collectors.joining(", ")),
                    valorTotalFormatado,
                    venda.getDescontoAplicado() != null ? venda.getDescontoAplicado() : 0.0,
                    venda.getTipoDesconto() != null ? venda.getTipoDesconto() : ""
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(vendasDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVenda(@PathVariable Long id) {
        return vendaRepository.findById(id)
                .map(venda -> {
                    vendaRepository.delete(venda);
                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Venda não encontrada"));
    }
}