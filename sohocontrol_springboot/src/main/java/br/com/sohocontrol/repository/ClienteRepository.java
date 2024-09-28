package br.com.sohocontrol.repository;

import br.com.sohocontrol.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}