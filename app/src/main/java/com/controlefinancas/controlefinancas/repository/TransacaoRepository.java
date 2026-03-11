package com.controlefinancas.controlefinancas.repository;

import com.controlefinancas.controlefinancas.models.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findByUsuarioId(Long id);

    List<Transacao> findByCategoriaId(Long id);

}
