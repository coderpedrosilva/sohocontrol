package br.com.sohocontrol.dto;

import java.time.LocalDate;

public class VendaDTO {

    private Long codigoVenda;
    private LocalDate dataVenda;
    private String nomeCliente;
    private String nomeProdutos;
    private String quantidades;
    private String precosVenda;
    private String valorParcial; // Novo campo
    private String valorTotal;
    private double descontoAplicado;
    private String tipoDesconto;

    // Construtor atualizado
    public VendaDTO(Long codigoVenda, LocalDate dataVenda, String nomeCliente, String nomeProdutos,
                    String quantidades, String precosVenda, String valorParcial,
                    String valorTotal, double descontoAplicado, String tipoDesconto) {
        this.codigoVenda = codigoVenda;
        this.dataVenda = dataVenda;
        this.nomeCliente = nomeCliente;
        this.nomeProdutos = nomeProdutos;
        this.quantidades = quantidades;
        this.precosVenda = precosVenda;
        this.valorParcial = valorParcial;
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

    public String getValorParcial() {
        return valorParcial;
    }

    public void setValorParcial(String valorParcial) {
        this.valorParcial = valorParcial;
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

    @Override
    public String toString() {
        return "VendaDTO{" +
                "codigoVenda=" + codigoVenda +
                ", dataVenda=" + dataVenda +
                ", nomeCliente='" + nomeCliente + '\'' +
                ", nomeProdutos='" + nomeProdutos + '\'' +
                ", quantidades='" + quantidades + '\'' +
                ", precosVenda='" + precosVenda + '\'' +
                ", valorParcial='" + valorParcial + '\'' +
                ", valorTotal='" + valorTotal + '\'' +
                ", descontoAplicado=" + descontoAplicado +
                ", tipoDesconto='" + tipoDesconto + '\'' +
                '}';
    }
}