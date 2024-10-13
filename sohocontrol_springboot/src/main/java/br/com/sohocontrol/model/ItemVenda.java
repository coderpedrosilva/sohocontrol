package br.com.sohocontrol.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class ItemVenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    private int quantidade;

    @ManyToOne
    @JoinColumn(name = "venda_id", nullable = false)
    @JsonBackReference // Evita referência cíclica na serialização JSON
    private Venda venda;

    // Construtores, Getters e Setters
    public ItemVenda() {}

    public ItemVenda(Produto produto, int quantidade, Venda venda) {
        this.produto = produto;
        this.quantidade = quantidade;
        this.venda = venda;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public Venda getVenda() {
        return venda;
    }

    public void setVenda(Venda venda) {
        this.venda = venda;
    }
}
