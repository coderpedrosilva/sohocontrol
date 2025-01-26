package br.com.sohocontrol.controller;

import br.com.sohocontrol.dto.VendaDTO;
import br.com.sohocontrol.model.ItemVenda;
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

@CrossOrigin(origins = "*")
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
        double valorParcial = venda.getValorParcial();
        double frete = venda.getFrete();
        double totalImposto = 0.0;
        double custoTotal = 0.0;

        // Extrair preços de compra formatados
        String precosCompra = venda.getItens().stream()
                .map(item -> String.format("%.2f", item.getProduto().getPrecoCompra()).replace(".", ","))
                .collect(Collectors.joining(", "));

        // Calcular imposto total e custo total
        for (ItemVenda item : venda.getItens()) {
            Produto produto = item.getProduto();
            int quantidade = item.getQuantidade();

            totalImposto += produto.getImposto() * quantidade; // Soma o imposto dos produtos
            custoTotal += produto.getPrecoCompra() * quantidade; // Soma o custo total dos produtos
        }

        // Calcular lucro líquido
        double lucroLiquido = valorTotal - (custoTotal + frete + totalImposto);

        // Formatar o valor total com informações sobre desconto
        String valorTotalFormatado = String.format("%.2f", valorTotal).replace(".", ",");
        if (descontoAplicado > 0) {
            if ("reais".equalsIgnoreCase(venda.getTipoDesconto())) {
                valorTotalFormatado += String.format(" (Desconto de R$ %.2f)", descontoAplicado).replace(".", ",");
            } else if ("percentual".equalsIgnoreCase(venda.getTipoDesconto())) {
                valorTotalFormatado += String.format(" (Desconto de %.2f%%)", descontoAplicado);
            }
        }

        // Retornar o DTO atualizado
        return new VendaDTO(
                venda.getId(),
                venda.getDataVenda(),
                venda.getCliente().getNome(),
                venda.getItens().stream().map(item -> item.getProduto().getNome()).collect(Collectors.joining(", ")), // Nomes dos produtos
                venda.getItens().stream().map(item -> String.valueOf(item.getQuantidade())).collect(Collectors.joining(", ")), // Quantidades
                venda.getItens().stream().map(item -> String.format("%.2f", item.getPrecoVenda()).replace(".", ",")).collect(Collectors.joining(", ")), // Preços de venda
                String.format("%.2f", valorParcial).replace(".", ","),
                valorTotalFormatado,
                descontoAplicado,
                venda.getTipoDesconto() != null ? venda.getTipoDesconto() : "",
                frete,
                precosCompra,
                totalImposto // Total de imposto calculado
        );
    }
}
