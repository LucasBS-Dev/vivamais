package com.vivamais.controller;

import com.vivamais.dto.ModelosApi.SessaoAutenticada;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import static com.vivamais.service.CuidadoService.error;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/conta/preferencias")
@SecurityRequirement(name="bearerAuth")
public class PreferenciasController {
    public record Preferencias(@NotNull Boolean textoAmpliado, @NotNull Integer tamanhoPagina, @NotNull @Min(0) Integer versao) {}
    private final JdbcTemplate banco;
    public PreferenciasController(JdbcTemplate banco) { this.banco = banco; }

    @GetMapping
    public Preferencias buscar(@AuthenticationPrincipal SessaoAutenticada sessao) {
        return banco.query("SELECT texto_ampliado,tamanho_pagina,versao FROM preferencia_conta WHERE id_usuario=?",
                (linha, indice) -> new Preferencias(linha.getBoolean(1), linha.getInt(2), linha.getInt(3)), sessao.usuario().id())
                .stream().findFirst().orElse(new Preferencias(false,20,0));
    }

    @PutMapping
    @Transactional
    public Preferencias salvar(@Valid @RequestBody Preferencias entrada, @AuthenticationPrincipal SessaoAutenticada sessao) {
        if (!List.of(10,20,50).contains(entrada.tamanhoPagina())) throw error(400,"Escolha 10, 20 ou 50 registros por página.");
        int alteradas;
        if (entrada.versao() == 0) {
            alteradas = banco.update("INSERT INTO preferencia_conta(id_usuario,texto_ampliado,tamanho_pagina) VALUES(?,?,?) ON CONFLICT DO NOTHING",
                    sessao.usuario().id(), entrada.textoAmpliado(), entrada.tamanhoPagina());
        } else {
            alteradas = banco.update("UPDATE preferencia_conta SET texto_ampliado=?,tamanho_pagina=?,versao=versao+1,atualizado_em=now() WHERE id_usuario=? AND versao=?",
                    entrada.textoAmpliado(), entrada.tamanhoPagina(), sessao.usuario().id(), entrada.versao());
        }
        if (alteradas != 1) throw error(409,"As preferências foram alteradas em outro acesso. Atualize a página e tente novamente.");
        return buscar(sessao);
    }
}
