package com.controlefinancas.controlefinancas.models.dto;

import java.math.BigDecimal;

public record TransacaoValoresPorCategoria(BigDecimal valorEntrada, BigDecimal valorSaida, BigDecimal saldoFinal) {
}
