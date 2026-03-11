package com.controlefinancas.controlefinancas.services;

import com.controlefinancas.controlefinancas.models.Usuario;
import com.controlefinancas.controlefinancas.models.dto.JwtTokenDTO;
import com.controlefinancas.controlefinancas.models.dto.LoginUsuarioDTO;
import com.controlefinancas.controlefinancas.models.dto.SenhaDTO;
import com.controlefinancas.controlefinancas.models.dto.UsuarioDTO;
import com.controlefinancas.controlefinancas.repository.UsuarioRepository;
import com.controlefinancas.controlefinancas.security.JwtTokenService;
import com.controlefinancas.controlefinancas.security.SecurityConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class UsuarioService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private SecurityConfiguration securityConfiguration;

    public JwtTokenDTO authenticateUser(LoginUsuarioDTO loginUsuarioDTO){
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                new UsernamePasswordAuthenticationToken(loginUsuarioDTO.email(), loginUsuarioDTO.password());

        Authentication authentication = authenticationManager.authenticate(usernamePasswordAuthenticationToken);

        Usuario usuario = (Usuario) authentication.getPrincipal();

        return new JwtTokenDTO(jwtTokenService.generateToken(usuario));
    }

    public Usuario retornaUsuarioPorToken(String token){
            String email = jwtTokenService.getSubjectFromToken(token);
            if(usuarioRepository.existsByEmail(email)){
                return usuarioRepository.findByEmail(email);
            } else {
                throw new IllegalArgumentException("Token não válido");
            }
    }


    public void criaUsuario(Usuario usuarioDTO){
        if(usuarioDTO != null && usuarioDTO.getEmail() != null && usuarioDTO.getPassword() != null && usuarioDTO.getName() != null){
            Usuario usuario = Usuario.builder()
                    .email(usuarioDTO.getEmail())
                    .name(usuarioDTO.getName())
                    .pass(securityConfiguration.passwordEncoder()
                            .encode(usuarioDTO.getPassword()))
                    .saldoAtual(new BigDecimal(0))
                    .build();
            usuarioRepository.save(usuario);
        }
    }

    public void deletaUsuario(Long id){
        if(usuarioRepository.existsById(id)){
            usuarioRepository.deleteById(id);
        }
    }

    public Usuario retornaUsuario(Long id){
        if(usuarioRepository.existsById(id)){
            return usuarioRepository.findById(id).orElseThrow();
        } else {
            throw new RuntimeException("Usuário não encontrado");
        }
    }


    public Usuario verificaUsuario(Usuario usuario){
        if(usuarioRepository.existsByEmail(usuario.getEmail())){
            Usuario usuarioAtual = usuarioRepository.findByEmail(usuario.getEmail());

            if(usuario.getPassword().equals(usuarioAtual.getPassword())){
                return usuarioAtual;
            } else {
                throw new IllegalArgumentException("Usuário ou senha incorretos");
            }

        } else {
            throw new RuntimeException("Usuário não encontrado");
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            Usuario usuario = usuarioRepository.findByEmail(username);
            return new Usuario(usuario.getId(), usuario.getName(), usuario.getUsername(), usuario.getPassword(), usuario.getSaldoAtual());
        }catch (UsernameNotFoundException e){
            throw new UsernameNotFoundException("Usuário não encontraod");
        }
    }

    public void alterarSenha(Long id, SenhaDTO senha){
        Usuario usuario = usuarioRepository.findById(id).orElseThrow( () -> new RuntimeException("Usuario não encontrado"));

        if(securityConfiguration.passwordEncoder().matches(senha.currentPassword(), usuario.getPassword())){
            String novaSenhaCriptografada = securityConfiguration.passwordEncoder().encode(senha.newPassword());
            usuario.setPass(novaSenhaCriptografada);
            usuarioRepository.save(usuario);
        } else {
            throw new BadCredentialsException("Senha incorreta");
        }

    }

    public boolean usuarioExistePorEmail(String email){
        return usuarioRepository.existsByEmail(email);
    }



}
