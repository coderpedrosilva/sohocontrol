package br.com.sohocontrol.repository;

import br.com.sohocontrol.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
}
