package com.controlefinancas.controlefinancas.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Getter
    @Setter
    private long id;

    @Getter
    @Setter
    private String categoria;

    @Getter
    @Setter
    private String color;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    public Categoria(String categoria, Usuario usuario) {
        this.categoria = categoria;
        this.usuario = usuario;
    }

    public Categoria(String categoria, Usuario usuario, String color){
        this.categoria = categoria;
        this.usuario = usuario;
        this.color = color;
    }

    public Categoria(String categoria) {
        this.categoria = categoria;
    }

    public Categoria() {
    }

}
