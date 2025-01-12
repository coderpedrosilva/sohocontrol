package br.com.sohocontrol.controller;

import br.com.sohocontrol.dto.VendaDTO;
import br.com.sohocontrol.model.Produto;
import br.com.sohocontrol.model.Venda;
import br.com.sohocontrol.repository.ProdutoRepository;
import br.com.sohocontrol.repository.VendaRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*") // Permitir todas as origens (ajuste conforme necessário)
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
                    throw new IllegalArgumentException("Quantidade insuficiente em estoque para o produto " + produto.getNome());
                }

                item.setPrecoVenda(produto.getPrecoVenda());
                produto.setQuantidade(produto.getQuantidade() - item.getQuantidade());
                produtoRepository.save(produto);
                item.setVenda(venda);
            });

            // Recalcular o valor total com frete
            venda.calcularValorTotal();

            vendaRepository.save(venda);
            return ResponseEntity.ok(venda);
        } catch (IllegalArgumentException e) {
            return errorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
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
        List<VendaDTO> vendasDto = vendaRepository.findAllOrderByDataAndIdDesc()
                .stream()
                .map(this::mapToVendaDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(vendasDto);
    }

    @GetMapping("/filtrar")
    public ResponseEntity<List<VendaDTO>> getVendasPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        List<VendaDTO> vendasDto = vendaRepository.findAllOrderByDataAndIdDesc().stream()
                .filter(venda -> !venda.getDataVenda().isBefore(start) && !venda.getDataVenda().isAfter(end))
                .map(this::mapToVendaDTO)
                .collect(Collectors.toList());

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

    private VendaDTO mapToVendaDTO(Venda venda) {
        double valorTotal = venda.getValorTotal();
        double descontoAplicado = venda.getDescontoAplicado() != null ? venda.getDescontoAplicado() : 0.0;
        double valorParcial = venda.getValorParcial(); // Obtenção direta do banco de dados
        double frete = venda.getFrete(); // Novo campo

        // Formatação do valor total com desconto
        String valorTotalFormatado = String.format("%.2f", valorTotal).replace(".", ",");
        if (descontoAplicado > 0) {
            if ("reais".equalsIgnoreCase(venda.getTipoDesconto())) {
                valorTotalFormatado += String.format(" (Desconto de R$ %.2f)", descontoAplicado).replace(".", ",");
            } else if ("percentual".equalsIgnoreCase(venda.getTipoDesconto())) {
                valorTotalFormatado += String.format(" (Desconto de %.2f%%)", descontoAplicado);
            }
        }

        return new VendaDTO(
                venda.getId(),
                venda.getDataVenda(),
                venda.getCliente().getNome(),
                venda.getItens().stream().map(item -> item.getProduto().getNome()).collect(Collectors.joining(", ")),
                venda.getItens().stream().map(item -> String.valueOf(item.getQuantidade())).collect(Collectors.joining(", ")),
                venda.getItens().stream().map(item -> String.format("%.2f", item.getPrecoVenda()).replace(".", ",")).collect(Collectors.joining(", ")),
                String.format("%.2f", valorParcial).replace(".", ","),
                valorTotalFormatado, // Valor total formatado
                descontoAplicado,
                venda.getTipoDesconto() != null ? venda.getTipoDesconto() : "",
                frete // Inclua o valor do frete aqui
        );
    }
}
