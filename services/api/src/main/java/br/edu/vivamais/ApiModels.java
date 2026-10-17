package br.edu.vivamais;

import java.time.Instant;
import java.util.UUID;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

public final class ApiModels {
    private ApiModels() { }
    public enum Role { ADMIN, PROFESSIONAL, PATIENT }
    @Schema(requiredProperties={"id","email","displayName","role","organizationId"})
    public record UserView(UUID id, String email, String displayName, Role role, UUID organizationId) { }
    public record LoginRequest(@NotBlank @Email @Size(max=254) String email,
                               @NotBlank @Size(max=72) String password) { }
    @Schema(requiredProperties={"accessToken","expiresAt","user"})
    public record LoginResponse(String accessToken, Instant expiresAt, UserView user) { }
    @Schema(requiredProperties={"id","name"})
    public record OrganizationView(UUID id, String name) { }
    @Schema(requiredProperties={"id","displayName","modality","organizationId"})
    public record PatientView(UUID id, String displayName, @Schema(allowableValues={"APP","BRACELET_DIARY"}) String modality, UUID organizationId) { }
    @Schema(requiredProperties={"patientCount","appCount","diaryCount","organizationName"})
    public record DashboardView(long patientCount, long appCount, long diaryCount, String organizationName) { }
    @Schema(requiredProperties={"key","phase","status","reason"})
    public record ModuleView(@Schema(allowableValues={"blood-pressure","medications","food","activity","diary","consultations","bracelet"}) String key,
                             int phase,@Schema(allowableValues={"AVAILABLE","NOT_STARTED","BLOCKED_PENDING_CLINICAL_APPROVAL","BLOCKED_PENDING_HARDWARE_SPEC"}) String status,String reason) { }
    public record SessionPrincipal(UserView user, UUID sessionId) { }
}
