package com.vivamais.service;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import static com.vivamais.dto.ModelosApi.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AutenticacaoService {
    private final InstituicaoRepository repositorio;
    private final PasswordEncoder codificadorSenhas;
    private final CodificadorToken codificadorTokens;
    private final PropriedadesAplicacao propriedades;
    private final String hashAlternativo;
    public AutenticacaoService(InstituicaoRepository repositorio, PasswordEncoder codificadorSenhas, CodificadorToken codificadorTokens, PropriedadesAplicacao propriedades) {
        this.repositorio=repositorio; this.codificadorSenhas=codificadorSenhas; this.codificadorTokens=codificadorTokens; this.propriedades=propriedades;
        hashAlternativo=codificadorSenhas.encode(codificadorTokens.issue());
    }
    @Transactional
    public RespostaAcesso entrar(SolicitacaoAcesso requisicao) {
        var buscarCredenciais = repositorio.buscarCredenciais(requisicao.email().trim().toLowerCase(Locale.ROOT));
        String hash = buscarCredenciais.map(InstituicaoRepository.Credenciais::hashSenha).orElse(hashAlternativo);
        boolean confere = requisicao.senha().getBytes(StandardCharsets.UTF_8).length <= 72 && codificadorSenhas.matches(requisicao.senha(), hash);
        if (!confere || buscarCredenciais.isEmpty() || buscarCredenciais.orElseThrow().usuario().papel()==Papel.PATIENT) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas.");
        var usuario = buscarCredenciais.orElseThrow().usuario();
        String token = codificadorTokens.issue();
        Instant agora=Instant.now(), expiraEm=agora.plus(propriedades.sessionDuration());
        var idSessao=repositorio.inserirSessao(usuario.id(), codificadorTokens.hash(token), agora, expiraEm);
        repositorio.auditar(usuario, "SESSION_CREATED", "auth_session", idSessao);
        return new RespostaAcesso(token, expiraEm, usuario);
    }
    @Transactional
    public void sair(SessaoAutenticada principalAutenticado) {
        repositorio.desativarRenovacaoPaciente(principalAutenticado.idSessao());
        repositorio.revogarSessao(principalAutenticado.idSessao());
        repositorio.auditar(principalAutenticado.usuario(), "SESSION_REVOKED", "auth_session", principalAutenticado.idSessao());
    }
}
