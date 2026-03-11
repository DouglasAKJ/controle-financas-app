package com.controlefinancas.controlefinancas.models.dto;

import com.controlefinancas.controlefinancas.models.Transacao;

import java.math.BigDecimal;
import java.util.List;

public record TransacaoPorCategoriaDTO(List<Transacao> transacoes, BigDecimal valorEntrada, BigDecimal valorSaida, BigDecimal saldoAtual) {
}
