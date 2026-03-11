package com.controlefinancas.controlefinancas.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.controlefinancas.controlefinancas.models.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
public class JwtTokenService {
    @Value("${security.jwt.secret-key}")
    private String SECRET_KEY;

    @Value("${security.jwt.issuer}")
    private String ISSUER;

    public String generateToken(Usuario usuario){
        try{
            Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);
            return JWT.create()
                    .withIssuer(ISSUER)
                    .withIssuedAt(creationDate())
                    .withExpiresAt(expirationDate())
                    .withSubject(usuario.getUsername())
                    .sign(algorithm);
        } catch (JWTCreationException e){
            throw new JWTCreationException("Erro ao gerar token", e);
        }
    }

    public String getSubjectFromToken(String token){
        try{
            Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);
            return JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTCreationException e){
            throw new JWTCreationException("Token inválido ou expirado", e);
        }
    }

    private Instant creationDate(){
        return ZonedDateTime.now(ZoneId.of("America/Recife")).toInstant();
    }

    private Instant expirationDate(){
        return ZonedDateTime.now(ZoneId.of("America/Recife")).plusDays(1).toInstant();
    }

}
