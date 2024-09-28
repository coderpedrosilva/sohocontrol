package br.com.sohocontrol.repository;

import br.com.sohocontrol.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendaRepository extends JpaRepository<Venda, Long> {
}