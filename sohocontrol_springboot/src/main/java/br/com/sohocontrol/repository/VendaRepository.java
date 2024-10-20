package br.com.sohocontrol.repository;

import br.com.sohocontrol.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    @Query("SELECT v FROM Venda v WHERE v.cliente.id = :clienteId")
    List<Venda> findByClienteId(Long clienteId);

    @Query("SELECT v FROM Venda v JOIN v.itens i WHERE i.produto.id = :produtoId")
    List<Venda> findByProdutoId(Long produtoId);

    @Query("SELECT v FROM Venda v ORDER BY v.dataVenda DESC, v.id DESC")
    List<Venda> findAllOrderByDataAndIdDesc();
}
