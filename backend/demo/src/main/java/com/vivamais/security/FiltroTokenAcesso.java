package com.vivamais.security;
import com.vivamais.config.*;
import com.vivamais.controller.*;
import com.vivamais.dto.*;
import com.vivamais.repositories.*;
import com.vivamais.security.*;
import com.vivamais.service.*;
import com.vivamais.model.*;

import java.io.IOException;
import java.util.List;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public final class FiltroTokenAcesso extends OncePerRequestFilter {
    private final InstituicaoRepository repositorio;
    private final CodificadorToken codificadorTokens;
    public FiltroTokenAcesso(InstituicaoRepository repositorio, CodificadorToken codificadorTokens) { this.repositorio=repositorio; this.codificadorTokens=codificadorTokens; }
    @Override
    protected void doFilterInternal(HttpServletRequest requisicao, HttpServletResponse resposta, FilterChain chain)
            throws ServletException, IOException {
        String header = requisicao.getHeader("Authorization");
        if (header != null && header.matches("Bearer [A-Za-z0-9_-]{43}")) {
            repositorio.principalAutenticado(codificadorTokens.hash(header.substring(7))).ifPresent(principalAutenticado -> {
                var authentication=new UsernamePasswordAuthenticationToken(principalAutenticado, null,
                        List.of(new SimpleGrantedAuthority("ROLE_"+principalAutenticado.usuario().papel().name())));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }
        chain.doFilter(requisicao, resposta);
    }
}
