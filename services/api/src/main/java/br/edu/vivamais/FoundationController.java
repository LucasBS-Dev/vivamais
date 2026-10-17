package br.edu.vivamais;

import static br.edu.vivamais.ApiModels.*;
import java.util.List;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name="bearerAuth")
public class FoundationController {
    private final AuthService auth;
    private final FoundationRepository repository;
    private final LoginRateLimiter limiter;
    public FoundationController(AuthService auth, FoundationRepository repository, LoginRateLimiter limiter) {
        this.auth=auth; this.repository=repository; this.limiter=limiter;
    }
    @PostMapping("/auth/login")
    @io.swagger.v3.oas.annotations.security.SecurityRequirements
    @Operation(summary="Abre sessão opaca de 30 minutos", security={})
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        if (!limiter.allow(servletRequest.getRemoteAddr(),request.email())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Muitas tentativas. Aguarde 15 minutos e tente novamente.");
        }
        return auth.login(request);
    }
    @GetMapping("/auth/me")
    public UserView me(@AuthenticationPrincipal SessionPrincipal principal) { return principal.user(); }
    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal SessionPrincipal principal) {
        auth.logout(principal); return ResponseEntity.noContent().build();
    }
    @GetMapping("/organization")
    public OrganizationView organization(@AuthenticationPrincipal SessionPrincipal principal) {
        return repository.organization(principal.user().organizationId());
    }
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSIONAL')")
    public DashboardView dashboard(@AuthenticationPrincipal SessionPrincipal principal) {
        var patients=repository.authorizedPatients(principal.user());
        long appCount=patients.stream().filter(patient -> patient.modality().equals("APP")).count();
        return new DashboardView(patients.size(),appCount,patients.size()-appCount,
                repository.organization(principal.user().organizationId()).name());
    }
    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSIONAL')")
    @Transactional
    public List<PatientView> patients(@AuthenticationPrincipal SessionPrincipal principal) {
        var result=repository.authorizedPatients(principal.user());
        repository.audit(principal.user(),"PATIENT_LIST_VIEWED","patient",null);
        return result;
    }
    @GetMapping("/patients/me")
    @PreAuthorize("hasRole('PATIENT')")
    @Transactional
    public PatientView ownPatient(@AuthenticationPrincipal SessionPrincipal principal) {
        var result=repository.ownPatient(principal.user()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Cadastro de paciente indisponível."));
        repository.audit(principal.user(),"PATIENT_VIEWED","patient",result.id());
        return result;
    }
    @GetMapping("/patients/{id}")
    @Transactional
    public PatientView patient(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal) {
        var result=repository.authorizedPatient(id,principal.user()).orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,"Você não possui permissão para este recurso."));
        repository.audit(principal.user(),"PATIENT_VIEWED","patient",id);
        return result;
    }
    @GetMapping("/system/modules")
    public List<ModuleView> modules() {
        return List.of(
                new ModuleView("blood-pressure",2,"AVAILABLE","Digitação, foto com OCR e revisão obrigatória, histórico e gráfico persistidos na API."),
                new ModuleView("medications",3,"AVAILABLE","Planos profissionais e autorrelatos disponíveis. Notificações locais exigem build nativo e permissão do aparelho."),
                new ModuleView("food",5,"AVAILABLE","Fotos privadas e registros disponíveis. Análise automatizada exige serviço configurado e critérios clínicos aprovados."),
                new ModuleView("activity",5,"AVAILABLE","Registro e perfil profissional disponíveis. Recomendação personalizada bloqueada até aprovação clínica."),
                new ModuleView("diary",3,"AVAILABLE","Transcrição profissional com autoria, origem e horário da ocorrência."),
                new ModuleView("consultations",6,"AVAILABLE","Registro, objetivos, plano individual e resumo dos dados disponíveis."),
                new ModuleView("bracelet",6,"BLOCKED_PENDING_HARDWARE_SPEC","Integração real depende de fabricante, protocolo, firmware e ensaio físico."));
    }
}
