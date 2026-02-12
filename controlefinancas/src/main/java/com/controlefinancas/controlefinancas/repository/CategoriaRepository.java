package com.controlefinancas.controlefinancas.repository;

import com.controlefinancas.controlefinancas.models.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByUsuarioId(Long id);
}
