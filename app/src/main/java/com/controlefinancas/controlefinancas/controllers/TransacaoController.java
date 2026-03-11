package com.controlefinancas.controlefinancas.controllers;

import com.controlefinancas.controlefinancas.models.Categoria;
import com.controlefinancas.controlefinancas.models.Transacao;
import com.controlefinancas.controlefinancas.models.Usuario;
import com.controlefinancas.controlefinancas.models.dto.CategoriaDTO;
import com.controlefinancas.controlefinancas.models.dto.DashboardDTO;
import com.controlefinancas.controlefinancas.models.dto.TransacaoDTO;
import com.controlefinancas.controlefinancas.models.dto.TransacaoPorCategoriaDTO;
import com.controlefinancas.controlefinancas.services.CategoriaService;
import com.controlefinancas.controlefinancas.services.TransacaoService;
import com.controlefinancas.controlefinancas.services.UsuarioService;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping("/api/transaction")
public class TransacaoController {

    @Autowired
    TransacaoService transacaoService;

    @Autowired
    CategoriaService categoriaService;

    @Autowired
    UsuarioService usuarioService;

    @PostMapping("/create")
    public ResponseEntity<?> insereTransacao(@AuthenticationPrincipal Usuario usuario, @RequestBody TransacaoDTO transacaoDTO){
        if(usuarioService.usuarioExistePorEmail(usuario.getEmail())){

            if(transacaoDTO.categoriaId() != null){
                Categoria categoria = categoriaService.retornaCategoriaPorId(transacaoDTO.categoriaId());

                transacaoService.criaTransacao(new Transacao(transacaoDTO.valor(), usuario, transacaoDTO.tipoTransacao(), categoria, transacaoDTO.date()));
            } else {
                transacaoService.criaTransacao(new Transacao(transacaoDTO.valor(), usuario, transacaoDTO.tipoTransacao(), null, transacaoDTO.date()));
            }

            log.info("transação registrada com sucesso!" + transacaoDTO.valor() + " " + transacaoDTO.tipoTransacao() + " " + transacaoDTO.date());
            return ResponseEntity.ok(transacaoDTO);
        } else {
            throw new UsernameNotFoundException("Usuário não encontrado");
        }
    }

    @PostMapping("/alteraCategoria")
    public ResponseEntity<?> alteraCategoriaTransacao(@AuthenticationPrincipal Usuario usuario, @RequestBody CategoriaDTO categoriaDTO) {
        if (transacaoService.existePorId(categoriaDTO.id())) {
            Transacao transacao = transacaoService.retornaTransacaoPorId(categoriaDTO.id());

            Categoria categoria = new Categoria(categoriaDTO.categoria(), usuario);

            categoriaService.criaCategoria(categoria);

            transacao.setCategoria(categoria);

            transacaoService.criaTransacao(transacao);

            return ResponseEntity.ok("Adicionado categoria");

        } else {
            throw new IllegalArgumentException("Categoria inválida");
        }
    }

    @PostMapping("/transacoesPorCategoria")
    public ResponseEntity<?> retornaTransacoesPorCategoria(@AuthenticationPrincipal Usuario usuario, @RequestBody CategoriaDTO categoriaDTO){
        if (usuarioService.usuarioExistePorEmail(usuario.getEmail())){

            TransacaoPorCategoriaDTO transacaoPorCategoriaDTO = new TransacaoPorCategoriaDTO(transacaoService.retornaTransacoesDoUsuarioPorCategoria(categoriaDTO.id()), transacaoService.retornaValorPorCategoria(categoriaDTO.id()).valorEntrada(), transacaoService.retornaValorPorCategoria(categoriaDTO.id()).valorSaida(), transacaoService.retornaValorPorCategoria(categoriaDTO.id()).saldoFinal() );

            return ResponseEntity.ok(transacaoPorCategoriaDTO);
        } else {
            throw new UsernameNotFoundException("Usuário não existe");
        }
    }

    @PostMapping("/month")
    public ResponseEntity<?> retornaTransacoesFiltroMes(@AuthenticationPrincipal Usuario usuario, @RequestBody TransacaoDTO transacaoDTO){
        if (usuarioService.usuarioExistePorEmail(usuario.getEmail())){
            return ResponseEntity.ok(transacaoService.retornaTransacoesDoUsuarioPorMes(usuario.getId(), transacaoDTO.month()));
        } else {
            throw new UsernameNotFoundException("Usuário não existe");
        }
    }

    @PostMapping("year")
    public ResponseEntity<?> retornaTransacoesFiltroAno(@AuthenticationPrincipal Usuario usuario, @RequestBody TransacaoDTO transacaoDTO){
        if (usuarioService.usuarioExistePorEmail(usuario.getEmail())){
            return ResponseEntity.ok(transacaoService.retornaTransacoesDoUsuarioPorAno(usuario.getId(), transacaoDTO.year()));
        } else {
            throw new UsernameNotFoundException("Usuário não existe");
        }
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<?> alteraTransacao(@AuthenticationPrincipal Usuario usuario,@RequestBody TransacaoDTO transacaoDTO, @PathVariable Long id){
        if(usuarioService.usuarioExistePorEmail(usuario.getEmail())){
            Transacao transacao = transacaoService.retornaTransacaoPorId(id);

            transacao.setTipo(transacaoDTO.tipoTransacao());
            transacao.setDate(transacaoDTO.date());
            transacao.setValor(transacaoDTO.valor());
            if(transacaoDTO.categoriaId() != null){
                transacao.setCategoria(categoriaService.retornaCategoriaPorId(transacaoDTO.categoriaId()));
            }


            transacaoService.alteraTransacao(transacao);

            return ResponseEntity.ok(transacaoDTO);
        } else {
            throw new UsernameNotFoundException("Usuário não encontrado");
        }
    }

    @GetMapping("/get")
    public ResponseEntity<?> retornaTransacaoPorUsuario(@AuthenticationPrincipal Usuario usuario){
        if (usuarioService.usuarioExistePorEmail(usuario.getEmail())){
            return ResponseEntity.ok(transacaoService.retornaTransacoesPorUsuarioId(usuario.getId()));
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletaTransacao(@AuthenticationPrincipal Usuario usuario, @PathVariable Long id){
        if (usuarioService.usuarioExistePorEmail(usuario.getEmail())){
            transacaoService.deletaTransacao(id);
            return ResponseEntity.ok(transacaoService.retornaTransacoesPorUsuarioId(usuario.getId()));
        } else {
            throw new RuntimeException("Erro ao deletar Transação");
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> retornaDashboard(@AuthenticationPrincipal Usuario usuario){
        BigDecimal saldoAtual = transacaoService.retornaSaldoAtualPorUsuarioId(usuario.getId());

        BigDecimal saldoEntradas = transacaoService.retornaEntradasPorUsuarioId(usuario.getId());

        BigDecimal saldoSaidas = transacaoService.retornaSaidasPorUsuarioId(usuario.getId());

        int qntTransacao = transacaoService.retornaQntDeTransacaoPorUsuarioId(usuario.getId());

        DashboardDTO dashboardDTO = new DashboardDTO(saldoAtual, saldoEntradas, saldoSaidas, qntTransacao);

        return ResponseEntity.ok(dashboardDTO);


    }
}
