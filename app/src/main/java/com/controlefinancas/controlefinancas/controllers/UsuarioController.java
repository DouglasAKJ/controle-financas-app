package com.controlefinancas.controlefinancas.controllers;

import com.controlefinancas.controlefinancas.models.Usuario;
import com.controlefinancas.controlefinancas.models.dto.*;
import com.controlefinancas.controlefinancas.security.JwtTokenService;
import com.controlefinancas.controlefinancas.security.SecurityConfiguration;
import com.controlefinancas.controlefinancas.services.UsuarioService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/api/user")
public class UsuarioController {

    @Autowired
    UsuarioService usuarioService;

    @Autowired
    JwtTokenService jwtTokenService;

    @Autowired
    SecurityConfiguration securityConfiguration;

    @PostMapping
    public ResponseEntity<?> criaUsuario(@RequestBody UsuarioDTO usuarioDTO){
        if(usuarioDTO.email() != null && usuarioDTO.password() != null && usuarioDTO.username() != null){

            Usuario usuario = new Usuario(usuarioDTO.username(), usuarioDTO.email(), usuarioDTO.password());

            if(!usuarioService.usuarioExistePorEmail(usuarioDTO.email())){
                usuarioService.criaUsuario(usuario);

                log.info("Criou usuário!");
                return ResponseEntity.ok().build();

            } else {
                return ResponseEntity.badRequest().body("Conta com e-mail informado já existe");
            }

        } else {
            log.info(usuarioDTO.email() + " " + usuarioDTO.username() + " " + usuarioDTO.password());
            log.info("Não criou Usuário");
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity loginUsuario(@RequestBody LoginUsuarioDTO loginUsuarioDTO){
        log.info("Login chamado");
        JwtTokenDTO token = usuarioService.authenticateUser(loginUsuarioDTO);
        log.info("Token criado");
        return ResponseEntity.ok(token);
    }

    @GetMapping("/get")
    public ResponseEntity<?> retornaUsuarioLogado(@AuthenticationPrincipal Usuario usuario){
        try {
            UserInfoDTO userInfoDTO = new UserInfoDTO(usuario.getName(), usuario.getEmail());
            return ResponseEntity.ok(userInfoDTO);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }
    @PostMapping("/password")
    public ResponseEntity<?> alteraSenhaUsuario(@AuthenticationPrincipal Usuario usuario, @RequestBody SenhaDTO senhaDTO){
        try {
            usuarioService.alterarSenha(usuario.getId(), senhaDTO);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }




    }

}
