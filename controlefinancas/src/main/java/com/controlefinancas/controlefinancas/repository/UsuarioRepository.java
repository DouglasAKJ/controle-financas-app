package com.controlefinancas.controlefinancas.repository;

import com.controlefinancas.controlefinancas.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    public Usuario findByEmail(String email);

    public boolean existsByEmail(String email);
}
