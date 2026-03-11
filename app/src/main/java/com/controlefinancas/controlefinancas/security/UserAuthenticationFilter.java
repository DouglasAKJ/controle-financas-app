package com.controlefinancas.controlefinancas.security;

import com.controlefinancas.controlefinancas.models.Usuario;
import com.controlefinancas.controlefinancas.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Component
public class UserAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (checkIfEndpointIsNotPublic(request)){
            String token = recoveryToken(request);
            if(token != null) {
                String subject = jwtTokenService.getSubjectFromToken(token);
                Usuario usuario = usuarioRepository.findByEmail(subject);

                Authentication authentication = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } else {
                throw new RuntimeException("O token está ausente.");
            }
        }
        filterChain.doFilter(request, response);
    }

    private String recoveryToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null){
            return authorizationHeader.replace("Bearer", "");
        }
        return null;
    }

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private boolean checkIfEndpointIsNotPublic(HttpServletRequest request){

        String requestURI = request.getRequestURI();
        return Arrays.stream(SecurityConfiguration.endpoints_without_authentication_required).noneMatch(pattern -> pathMatcher.match(pattern, requestURI));
    }

}
