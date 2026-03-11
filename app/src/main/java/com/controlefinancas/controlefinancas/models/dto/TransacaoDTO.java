package com.controlefinancas.controlefinancas.models.dto;

import com.controlefinancas.controlefinancas.models.Categoria;
import com.controlefinancas.controlefinancas.models.TipoTransacao;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransacaoDTO(BigDecimal valor, Long categoriaId, TipoTransacao tipoTransacao, LocalDate date, int month, int year) {
}
