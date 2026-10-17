package br.edu.vivamais;

import static br.edu.vivamais.ApiModels.*;
import static br.edu.vivamais.CareModels.*;
import java.time.*;
import java.util.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name="bearerAuth")
public class CareController {
 private final CareService care; private final LoginRateLimiter limiter; private final TokenCodec tokens;
 public CareController(CareService care,LoginRateLimiter limiter,TokenCodec tokens){this.care=care;this.limiter=limiter;this.tokens=tokens;}
 @PostMapping("/patients") public PatientCreated create(@Valid @RequestBody PatientCreate input,@AuthenticationPrincipal SessionPrincipal principal){return care.createPatient(input,principal.user());}
 @GetMapping("/patients/search") public Page<PatientView> search(@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,@AuthenticationPrincipal SessionPrincipal principal){return care.search(principal.user(),q,page,size);}
 @PostMapping("/auth/activate") @io.swagger.v3.oas.annotations.security.SecurityRequirements
 public ResponseEntity<Void> activate(@Valid @RequestBody Activation input,HttpServletRequest request){if(!limiter.allow(request.getRemoteAddr(),tokens.hash(input.token())))throw CareService.error(429,"Muitas tentativas. Aguarde e tente novamente.");care.activate(input);return ResponseEntity.noContent().build();}
 @PostMapping("/patients/{id}/access-reset") public AccessCode reset(@PathVariable UUID id,@Valid @RequestBody Reauthenticate input,@AuthenticationPrincipal SessionPrincipal principal,HttpServletRequest request){if(!limiter.allow(request.getRemoteAddr(),principal.user().email()))throw CareService.error(429,"Muitas tentativas.");return care.reset(id,input,principal.user());}
 @GetMapping("/professionals") public List<Map<String,Object>> professionals(@AuthenticationPrincipal SessionPrincipal principal){return care.professionals(principal.user());}
 @PostMapping("/patients/{id}/assignments") public ResponseEntity<Void> assign(@PathVariable UUID id,@Valid @RequestBody Assignment input,@AuthenticationPrincipal SessionPrincipal principal){care.assign(id,input.professionalId(),principal.user());return ResponseEntity.noContent().build();}
 @GetMapping("/patients/{id}/assignments") public List<Map<String,Object>> assignments(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal){return care.assignments(id,principal.user());}
 @PostMapping("/patients/{id}/assignments/revoke") public ResponseEntity<Void> unassign(@PathVariable UUID id,@Valid @RequestBody Assignment input,@AuthenticationPrincipal SessionPrincipal principal){care.unassign(id,input.professionalId(),principal.user());return ResponseEntity.noContent().build();}
 @GetMapping("/patients/{id}/readings") public Page<Reading> readings(@PathVariable UUID id,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,@RequestParam(required=false) Instant from,@RequestParam(required=false) Instant to,@AuthenticationPrincipal SessionPrincipal principal){return care.readings(id,principal.user(),page,size,from,to);}
 @PostMapping("/patients/{id}/readings") public Reading reading(@PathVariable UUID id,@Valid @RequestBody ReadingInput input,@AuthenticationPrincipal SessionPrincipal principal){return care.reading(id,input,principal.user());}
 @GetMapping("/patients/{id}/medications") public List<Map<String,Object>> medications(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal){return care.medications(id,principal.user());}
 @PostMapping("/patients/{id}/medications") public Map<String,Object> medication(@PathVariable UUID id,@Valid @RequestBody MedicationInput input,@AuthenticationPrincipal SessionPrincipal principal){return care.medication(id,null,input,principal.user());}
 @PutMapping("/medications/{plan}") public Map<String,Object> updateMedication(@PathVariable UUID plan,@Valid @RequestBody MedicationInput input,@AuthenticationPrincipal SessionPrincipal principal){return care.medication(care.planPatient(plan,principal.user()),plan,input,principal.user());}
 @GetMapping("/medications/{plan}/history") public List<Map<String,Object>> history(@PathVariable UUID plan,@AuthenticationPrincipal SessionPrincipal principal){return care.medicationHistory(plan,principal.user());}
 @GetMapping("/patients/{id}/medication-events") public List<Map<String,Object>> events(@PathVariable UUID id,@RequestParam LocalDate date,@AuthenticationPrincipal SessionPrincipal principal){return care.medicationEvents(id,date,principal.user());}
 @PostMapping("/patients/{id}/medication-reports") public Map<String,Object> report(@PathVariable UUID id,@Valid @RequestBody ReportInput input,@AuthenticationPrincipal SessionPrincipal principal){return care.report(id,input,principal.user());}
 private Page<Map<String,Object>> page(String table,UUID id,int page,int size,SessionPrincipal principal){care.access(id,principal.user());return care.page(table,id,page,size);}
 @GetMapping("/patients/{id}/diary") public Page<Map<String,Object>> diary(@PathVariable UUID id,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,@AuthenticationPrincipal SessionPrincipal principal){return page("printed_diary_entry",id,page,size,principal);}
 @PostMapping("/patients/{id}/diary") public Map<String,Object> diary(@PathVariable UUID id,@Valid @RequestBody DiaryInput input,@AuthenticationPrincipal SessionPrincipal principal){return care.diary(id,input,principal.user());}
 @GetMapping("/patients/{id}/activity-profile") public Map<String,Object> profile(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal){return care.profile(id,principal.user());}
 @PutMapping("/patients/{id}/activity-profile") public Map<String,Object> profile(@PathVariable UUID id,@Valid @RequestBody ActivityProfile input,@AuthenticationPrincipal SessionPrincipal principal){return care.profile(id,input,principal.user());}
 @GetMapping("/patients/{id}/activities") public Page<Map<String,Object>> activities(@PathVariable UUID id,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,@AuthenticationPrincipal SessionPrincipal principal){return page("activity_record",id,page,size,principal);}
 @PostMapping("/patients/{id}/activities") public Map<String,Object> activity(@PathVariable UUID id,@Valid @RequestBody ActivityInput input,@AuthenticationPrincipal SessionPrincipal principal){return care.activity(id,input,principal.user());}
 @GetMapping("/patients/{id}/consultations") public Page<Map<String,Object>> consultations(@PathVariable UUID id,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,@AuthenticationPrincipal SessionPrincipal principal){care.professional(principal.user());return page("consultation",id,page,size,principal);}
 @PostMapping("/patients/{id}/consultations") public Map<String,Object> consultation(@PathVariable UUID id,@Valid @RequestBody ConsultationInput input,@AuthenticationPrincipal SessionPrincipal principal){return care.consultation(id,input,principal.user());}
 @GetMapping("/patients/{id}/summary") public Map<String,Object> summary(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal){return care.summary(id,principal.user());}
 @GetMapping("/patients/{id}/export") public Map<String,Object> export(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal){return care.export(id,principal.user());}
 @GetMapping("/patients/{id}/device") public Map<String,Object> device(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal){return care.device(id,principal.user());}
 @PostMapping("/patients/{id}/device") public Map<String,Object> device(@PathVariable UUID id,@Valid @RequestBody DeviceInput input,@AuthenticationPrincipal SessionPrincipal principal){return care.device(id,input,principal.user());}
 @GetMapping("/patients/{id}/device/configurations") public List<Map<String,Object>> configurations(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal){return care.configurations(id,principal.user());}
 @PostMapping("/patients/{id}/device/configurations") public Map<String,Object> configure(@PathVariable UUID id,@Valid @RequestBody DeviceConfigurationInput input,@AuthenticationPrincipal SessionPrincipal principal){return care.configure(id,input,principal.user());}
}
