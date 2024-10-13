package br.com.sohocontrol.dto;

import java.time.LocalDate;

public class VendaDTO {
    private Long codigoVenda;
    private LocalDate dataVenda;
    private String nomeCliente;
    private String nomeProdutos;
    private String quantidades;
    private String precosVenda;
    private String valorTotal; // Alterado para String para permitir a frase de desconto
    private double descontoAplicado;
    private String tipoDesconto;

    // Construtor completo incluindo os novos campos de desconto
    public VendaDTO(Long codigoVenda, LocalDate dataVenda, String nomeCliente, String nomeProdutos, String quantidades, String precosVenda, String valorTotal, double descontoAplicado, String tipoDesconto) {
        this.codigoVenda = codigoVenda;
        this.dataVenda = dataVenda;
        this.nomeCliente = nomeCliente;
        this.nomeProdutos = nomeProdutos;
        this.quantidades = quantidades;
        this.precosVenda = precosVenda;
        this.valorTotal = valorTotal;
        this.descontoAplicado = descontoAplicado;
        this.tipoDesconto = tipoDesconto;
    }

    // Getters e Setters
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

    public String getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(String valorTotal) {
        this.valorTotal = valorTotal;
    }

    public double getDescontoAplicado() {
        return descontoAplicado;
    }

    public void setDescontoAplicado(double descontoAplicado) {
        this.descontoAplicado = descontoAplicado;
    }

    public String getTipoDesconto() {
        return tipoDesconto;
    }

    public void setTipoDesconto(String tipoDesconto) {
        this.tipoDesconto = tipoDesconto;
    }
}