package com.controlefinancas.controlefinancas.models.dto;

import java.math.BigDecimal;

public record DashboardDTO(BigDecimal saldoAtual, BigDecimal entradas, BigDecimal saidas, int qntTransacoes) {
}
