package com.vivamais.controller;

import static com.vivamais.dto.ModelosApi.*;
import static com.vivamais.dto.ModelosCuidado.*;
import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.vivamais.service.DadosPessoaisService;

@RestController
@RequestMapping("/api/v1/pacientes/{idPaciente}")
@SecurityRequirement(name="bearerAuth")
public class DadosPessoaisController {
    private final DadosPessoaisService dados;
    public DadosPessoaisController(DadosPessoaisService dados) { this.dados=dados; }
    @GetMapping("/dados-pessoais") public DadosPessoaisPaciente buscar(@PathVariable UUID idPaciente,@AuthenticationPrincipal SessaoAutenticada sessao) {return dados.buscar(idPaciente,sessao.usuario());}
    @PutMapping("/dados-pessoais") public DadosPessoaisPaciente atualizar(@PathVariable UUID idPaciente,@Valid @RequestBody AtualizacaoDadosPessoais entrada,@AuthenticationPrincipal SessaoAutenticada sessao) {return dados.atualizar(idPaciente,entrada,sessao.usuario());}
    @PutMapping("/contato") public DadosPessoaisPaciente atualizarContato(@PathVariable UUID idPaciente,@Valid @RequestBody AtualizacaoContatoPaciente entrada,@AuthenticationPrincipal SessaoAutenticada sessao) {return dados.atualizarContato(idPaciente,entrada,sessao.usuario());}
}
