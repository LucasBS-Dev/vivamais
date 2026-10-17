package br.edu.vivamais;
import static br.edu.vivamais.ApiModels.*;
import java.time.Instant;
import java.util.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController @RequestMapping("/api/v1") @SecurityRequirement(name="bearerAuth")
public class PrivateFileController {
 private final PrivateFileService files;
 public PrivateFileController(PrivateFileService files){this.files=files;}
 @PostMapping(value="/patients/{id}/files",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
 public Map<String,Object> upload(@PathVariable UUID id,@RequestParam String purpose,@RequestPart MultipartFile file,@AuthenticationPrincipal SessionPrincipal principal)throws Exception{return files.upload(id,purpose,file,principal.user());}
 @PostMapping("/files/{id}/link") public Map<String,Object> link(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal){return files.link(id,principal);}
 @GetMapping("/files/{id}/content") @io.swagger.v3.oas.annotations.security.SecurityRequirements
 public ResponseEntity<byte[]> content(@PathVariable UUID id,@RequestParam String access)throws Exception{return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).header("Cache-Control","private, no-store").header("Referrer-Policy","no-referrer").header("Content-Disposition","inline; filename=imagem.png").body(files.content(id,access));}
 @PostMapping("/files/{id}/ocr") public Map<String,Object> ocr(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal)throws Exception{return files.recognize(id,principal.user());}
 public record MealInput(@NotNull UUID fileId,@NotNull Instant occurredAt,@Size(max=2000) String notes){}
 @PostMapping("/patients/{id}/meals") public Map<String,Object> meal(@PathVariable UUID id,@Valid @RequestBody MealInput input,@AuthenticationPrincipal SessionPrincipal principal){return files.meal(id,input.fileId(),input.occurredAt(),input.notes(),principal.user());}
 @GetMapping("/patients/{id}/meals") public CareModels.Page<Map<String,Object>> meals(@PathVariable UUID id,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size,@AuthenticationPrincipal SessionPrincipal principal){return files.meals(id,page,size,principal.user());}
 @PostMapping("/meals/{id}/analyze") public Map<String,Object> analyze(@PathVariable UUID id,@AuthenticationPrincipal SessionPrincipal principal)throws Exception{return files.analyze(id,principal.user());}
}
