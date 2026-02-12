package com.controlefinancas.controlefinancas.services;

import com.controlefinancas.controlefinancas.models.Categoria;
import com.controlefinancas.controlefinancas.models.Transacao;
import com.controlefinancas.controlefinancas.repository.CategoriaRepository;
import com.controlefinancas.controlefinancas.repository.TransacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    @Autowired
    CategoriaRepository categoriaRepository;

    @Autowired
    TransacaoRepository transacaoRepository;

    public void criaCategoria(Categoria categoria){
        if(categoria.getCategoria() != null){
            categoriaRepository.save(categoria);
        }
    }

    public Categoria retornaCategoriaPorId(Long id){
        if(categoriaRepository.existsById(id)){
            return categoriaRepository.getReferenceById(id);
        } else {
            throw new IllegalArgumentException("Categoria não encontrada");
        }
    }

    public void alteraCategoria(Categoria categoria){
        if(categoriaRepository.existsById(categoria.getId())){
            categoriaRepository.save(categoria);
        } else {
            throw new IllegalArgumentException("Categoria não encontrada");
        }
    }

    public void deletaCategoria(Long id){
        if (categoriaRepository.existsById(id)){
            categoriaRepository.deleteById(id);
        }
    }

    public void insereCategoriaNaTransacao(Long transacaoId, Long categoriaId){
        if (transacaoRepository.existsById(transacaoId) && categoriaRepository.existsById(categoriaId)){
            Transacao transacao = transacaoRepository.getReferenceById(transacaoId);
            Categoria categoria = categoriaRepository.getReferenceById(categoriaId);
            transacao.setCategoria(categoria);
            transacaoRepository.save(transacao);
        }
    }

    public List<Categoria> listaCategoriasPorUsuario(Long id){
        return categoriaRepository.findByUsuarioId(id);
    }

}
