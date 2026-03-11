package com.controlefinancas.controlefinancas.services;

import com.controlefinancas.controlefinancas.models.Categoria;
import com.controlefinancas.controlefinancas.models.TipoTransacao;
import com.controlefinancas.controlefinancas.models.Transacao;
import com.controlefinancas.controlefinancas.models.dto.TransacaoValoresPorCategoria;
import com.controlefinancas.controlefinancas.repository.TransacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransacaoService {

    @Autowired
    TransacaoRepository transacaoRepository;

    @Transactional
    public void criaTransacao(Transacao transacao){
        if(transacao.getValor() != null && transacao.getUsuario() != null && transacao.getDate() != null && transacao.getTipo() != null){
            if(transacao.getValor().doubleValue() >= 0){
                transacaoRepository.save(transacao);
            } else {
                throw new IllegalArgumentException("Valor abaixo de zero não aceito");
            }
        } else {
            throw new IllegalArgumentException("Erro");
        }
    }

    public void alteraTransacao(Transacao transacao){
        if(existePorId(transacao.getId())){
            transacaoRepository.save(transacao);
        } else {
            throw new IllegalArgumentException("Transação Inválida");
        }
    }

    public void alteraSenha(String senha){

    }

    public boolean existePorId(Long id){
        return transacaoRepository.existsById(id);
    }

    public Transacao retornaTransacaoPorId(Long id){
        return transacaoRepository.getReferenceById(id);
    }

    public List<Transacao> retornaTransacoesPorUsuarioId(Long id) { return transacaoRepository.findByUsuarioId(id);}

    public void deletaTransacao(Long id){
        transacaoRepository.deleteById(id);
    }

    public BigDecimal retornaEntradasPorUsuarioId(Long id){
        List<Transacao> lista = retornaTransacoesPorUsuarioId(id);

        List<Transacao> entradas = lista.stream().filter(transacao -> transacao.getTipo().equals(TipoTransacao.ENTRADA)).toList();

        BigDecimal valorEntradas = new BigDecimal(0);
        for (Transacao e : entradas){
            valorEntradas = valorEntradas.add(e.getValor());
        }

        return valorEntradas;

    }

    public BigDecimal retornaSaidasPorUsuarioId(Long id){
        List<Transacao> lista = retornaTransacoesPorUsuarioId(id);

        List<Transacao> saidas = lista.stream().filter(transacao -> transacao.getTipo().equals(TipoTransacao.SAIDA)).toList();

        BigDecimal valorSaidas = new BigDecimal(0);
        for (Transacao s : saidas){
            valorSaidas = valorSaidas.add(s.getValor());
        }

        return valorSaidas;
    }

    public BigDecimal retornaSaldoAtualPorUsuarioId(Long id){
        List<Transacao> lista = retornaTransacoesPorUsuarioId(id);

        List<Transacao> saidas = lista.stream().filter(transacao -> transacao.getTipo().equals(TipoTransacao.SAIDA)).toList();

        BigDecimal valorSaidas = new BigDecimal(0);
        for (Transacao s : saidas){
            valorSaidas = valorSaidas.add(s.getValor());
        }

        List<Transacao> entradas = lista.stream().filter(transacao -> transacao.getTipo().equals(TipoTransacao.ENTRADA)).toList();

        BigDecimal valorEntradas = new BigDecimal(0);
        for (Transacao e : entradas){
            valorEntradas = valorEntradas.add(e.getValor());
        }

        return valorEntradas.subtract(valorSaidas);
    }

    public List<Transacao> retornaTransacoesDoUsuarioPorMes(Long id, int mesValue){

        List<Transacao> transacoes = transacaoRepository.findByUsuarioId(id).stream().filter(transacao -> transacao.getDate().getMonthValue() == mesValue).toList();

        return transacoes;
    }

    public List<Transacao> retornaTransacoesDoUsuarioPorAno(Long id, int ano){
        List<Transacao> transacoes = transacaoRepository.findByUsuarioId(id).stream().filter(transacao -> transacao.getDate().getYear() == ano).toList();

        return transacoes;
    }

    public List<Transacao> retornaTransacoesDoUsuarioPorCategoria(Long id){return transacaoRepository.findByCategoriaId(id);}

    public TransacaoValoresPorCategoria retornaValorPorCategoria(Long id){
        List<Transacao> transacoes = retornaTransacoesDoUsuarioPorCategoria(id);

         BigDecimal valorEntrada = new BigDecimal(0);

        BigDecimal valorSaida = new BigDecimal(0);

        List<Transacao> entradas = transacoes.stream().filter(transacao -> transacao.getTipo().equals(TipoTransacao.ENTRADA)).toList();

        for(Transacao t : entradas){
            valorEntrada = valorEntrada.add(t.getValor());
        }

        List<Transacao> saidas = transacoes.stream().filter(transacao -> transacao.getTipo().equals(TipoTransacao.SAIDA)).toList();

        for (Transacao t : saidas){
            valorSaida = valorSaida.add(t.getValor());
        }

        BigDecimal saldoFinal = valorEntrada.subtract(valorSaida);

        return new TransacaoValoresPorCategoria(valorEntrada, valorSaida, saldoFinal);
    }

    public int retornaQntDeTransacaoPorUsuarioId(Long id){
        List<Transacao> lista = retornaTransacoesPorUsuarioId(id);

        return lista.size();
    }

}
