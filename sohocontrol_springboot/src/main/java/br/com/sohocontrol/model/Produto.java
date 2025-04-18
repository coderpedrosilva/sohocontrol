package br.com.sohocontrol.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String fornecedor;
    private String origem;
    private String descricao;
    private int quantidade;
    private double precoCompra;
    private double imposto;
    private double precoVenda;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getFornecedor() { return fornecedor; }
    public void setFornecedor(String fornecedor) { this.fornecedor = fornecedor; }

    public String getOrigem() { return origem; }
    public void setOrigem(String origem) { this.origem = origem; }

    public String getDescricao() { return descricao; } // Getter para descrição
    public void setDescricao(String descricao) { this.descricao = descricao; } // Setter para descrição

    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }

    public double getPrecoCompra() { return precoCompra; } // Getter para preço de compra
    public void setPrecoCompra(double precoCompra) { this.precoCompra = precoCompra; } // Setter para preço de compra

    public double getImposto() { return imposto; }
    public void setImposto(double imposto) { this.imposto = imposto; }

    public double getPrecoVenda() { return precoVenda; }
    public void setPrecoVenda(double precoVenda) { this.precoVenda = precoVenda; }
}