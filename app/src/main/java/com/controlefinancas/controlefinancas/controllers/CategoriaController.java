package com.controlefinancas.controlefinancas.controllers;

import com.controlefinancas.controlefinancas.models.Categoria;
import com.controlefinancas.controlefinancas.models.Usuario;
import com.controlefinancas.controlefinancas.models.dto.CategoriaDTO;
import com.controlefinancas.controlefinancas.services.CategoriaService;
import com.controlefinancas.controlefinancas.services.UsuarioService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/category")
public class CategoriaController {
    @Autowired
    CategoriaService categoriaService;

    @Autowired
    UsuarioService usuarioService;

    @PostMapping("/create")
    public ResponseEntity<?> criaCategoria(@AuthenticationPrincipal Usuario usuario, @RequestBody CategoriaDTO categoriaDTO){
        if(usuarioService.usuarioExistePorEmail(usuario.getEmail())){
            Categoria categoria = new Categoria(categoriaDTO.categoria(), usuario, categoriaDTO.color());

            categoriaService.criaCategoria(categoria);

            return ResponseEntity.ok(categoria);

        } else {
            throw new RuntimeException("Falha na criação de categoria");
        }
    }

    @GetMapping("/get")
    public ResponseEntity<?> retornaCategoriasPorUsuario(@AuthenticationPrincipal Usuario usuario){
        if(usuarioService.usuarioExistePorEmail(usuario.getEmail())){
            return ResponseEntity.ok(categoriaService.listaCategoriasPorUsuario(usuario.getId()));
        } else {
            throw new RuntimeException("Usuário não encontrado");
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> alteraCategoriaPorId(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id, @RequestBody CategoriaDTO categoriaDTO){
        if(usuarioService.usuarioExistePorEmail(usuario.getEmail())){
            Categoria categoria = categoriaService.retornaCategoriaPorId(id);
            categoria.setCategoria(categoriaDTO.categoria());
            categoria.setColor(categoriaDTO.color());
            categoriaService.alteraCategoria(categoria);
            return ResponseEntity.ok(categoriaDTO);
        } else {
            throw new RuntimeException("Erro");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletaCategoriaPorId(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id){
        if(usuarioService.usuarioExistePorEmail(usuario.getEmail())){
            categoriaService.deletaCategoria(id);
            return ResponseEntity.ok().build();
        } else {
            throw new IllegalArgumentException("Categoria não encontrada");
        }
    }
}
