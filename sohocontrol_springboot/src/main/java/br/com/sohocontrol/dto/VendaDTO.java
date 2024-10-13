package br.com.sohocontrol.dto;

import java.time.LocalDate;

public class VendaDTO {
    private Long codigoVenda;
    private LocalDate dataVenda;
    private String nomeCliente;
    private String nomeProdutos; // Nomes dos produtos em uma String única, separados por vírgula
    private String quantidades; // Quantidades dos itens, também em uma String separada por vírgula
    private String precosVenda; // Preços dos itens, em String separada por vírgula
    private double valorTotal;

    public VendaDTO(Long codigoVenda, LocalDate dataVenda, String nomeCliente, String nomeProdutos, String quantidades, String precosVenda, double valorTotal) {
        this.codigoVenda = codigoVenda;
        this.dataVenda = dataVenda;
        this.nomeCliente = nomeCliente;
        this.nomeProdutos = nomeProdutos;
        this.quantidades = quantidades;
        this.precosVenda = precosVenda;
        this.valorTotal = valorTotal;
    }

    public Long getCodigoVenda() {
        return codigoVenda;
    }

    public void setCodigoVenda(Long codigoVenda) {
        this.codigoVenda = codigoVenda;
    }

    public LocalDate getDataVenda() {
        return dataVenda;
    }

    public void setDataVenda(LocalDate dataVenda) {
        this.dataVenda = dataVenda;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public String getNomeProdutos() {
        return nomeProdutos;
    }

    public void setNomeProdutos(String nomeProdutos) {
        this.nomeProdutos = nomeProdutos;
    }

    public String getQuantidades() {
        return quantidades;
    }

    public void setQuantidades(String quantidades) {
        this.quantidades = quantidades;
    }

    public String getPrecosVenda() {
        return precosVenda;
    }

    public void setPrecosVenda(String precosVenda) {
        this.precosVenda = precosVenda;
    }

    public double getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(double valorTotal) {
        this.valorTotal = valorTotal;
    }
}
