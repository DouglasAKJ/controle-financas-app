package com.controlefinancas.controlefinancas.models;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Getter
    @Setter
    private long id;

    @Getter
    @Setter
    private BigDecimal valor;

    @Getter
    @Setter
    @Nullable
    @Enumerated(EnumType.STRING)
    private TipoTransacao tipo;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @Getter
    @Setter
    private Usuario usuario;

    @Getter
    @Setter
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    @Nullable
    private Categoria categoria;

    @Getter
    @Setter
    private LocalDate date;

    public Transacao(BigDecimal valor, @Nullable TipoTransacao tipo, Usuario usuario, Categoria categoria) {
        this.valor = valor;
        this.tipo = tipo;
        this.usuario = usuario;
        this.categoria = categoria;
    }

    public Transacao(BigDecimal valor, Usuario usuario, Categoria categoria, LocalDate date) {
        this.valor = valor;
        this.usuario = usuario;
        this.categoria = categoria;
        this.date = date;
    }

    public Transacao(BigDecimal valor, Usuario usuario, TipoTransacao tipo ,Categoria categoria, LocalDate date) {
        this.valor = valor;
        this.usuario = usuario;
        this.categoria = categoria;
        this.date = date;
        this.tipo = tipo;
    }

    public Transacao(BigDecimal valor, Usuario usuario, TipoTransacao tipo, LocalDate date){
        this.valor = valor;
        this.usuario = usuario;
        this.tipo = tipo;
        this.date = date;
    }

    public Transacao(Usuario usuario, BigDecimal valor) {
        this.usuario = usuario;
        this.valor = valor;
    }

    public Transacao() {
    }
}
