package br.edu.vivamais;

import java.time.*;
import java.util.*;
import jakarta.validation.constraints.*;

public final class CareModels {
 private CareModels() {}
 public record Page<T>(List<T> items,long total,int page,int size) {}
 public record PatientCreate(@NotBlank @Size(max=160) String displayName,@Pattern(regexp="APP|BRACELET_DIARY") @NotNull String modality,@Email @Size(max=254) String email) {}
 public record PatientCreated(ApiModels.PatientView patient,String activationToken,Instant expiresAt) {}
 public record Activation(@NotBlank @Size(max=128) String token,@NotBlank @Size(min=12,max=72) String password) {}
 public record Reauthenticate(@NotBlank @Size(max=72) String password) {}
 public record AccessCode(String activationToken,Instant expiresAt) {}
 public record Assignment(@NotNull UUID professionalId) {}
 public record ReadingInput(@NotNull UUID id,@Min(1) @Max(400) int systolic,@Min(1) @Max(400) int diastolic,@Min(1) @Max(300) Integer pulse,@NotNull Instant measuredAt,@NotNull @Pattern(regexp="MANUAL|PROFESSIONAL|PRINTED_DIARY|OCR_CONFIRMED") String source,UUID ocrDocumentId,Boolean ocrConfirmed) {}
 public record Reading(UUID id,UUID patientId,int systolic,int diastolic,Integer pulse,Instant measuredAt,Instant createdAt,Instant syncedAt,String source,UUID authorId,UUID ocrDocumentId) {}
 public record MedicationInput(@NotBlank @Size(max=160) String name,@NotBlank @Size(max=1000) String instruction,@NotNull LocalDate startsOn,LocalDate endsOn,@NotBlank String timeZone,@NotEmpty @Size(max=12) List<@Pattern(regexp="([01][0-9]|2[0-3]):[0-5][0-9]") String> schedules,Integer version) {}
 public record ReportInput(@NotNull UUID id,@NotNull UUID planId,@NotNull Instant scheduledAt,@Pattern(regexp="TAKEN|NOT_TAKEN") @NotNull String status,@NotNull Instant reportedAt) {}
 public record ActivityProfile(@NotBlank @Size(max=300) String mobility,@NotBlank @Size(max=300) String balance,@NotNull @Size(max=2000) String restrictions,@NotNull @Size(max=2000) String professionalGuidance) {}
 public record ActivityInput(@NotNull UUID id,@NotBlank @Size(max=160) String type,@Min(1) @Max(1440) int durationMinutes,@NotNull Instant occurredAt,@Size(max=2000) String notes,@NotNull @Pattern(regexp="WELL|TIRED|UNWELL") String feeling) {}
 public record DiaryInput(@NotNull UUID id,@NotNull Instant occurredAt,@Min(1) @Max(400) Integer systolic,@Min(1) @Max(400) Integer diastolic,@Min(1) @Max(300) Integer pulse,@Size(max=2000) String medicationReport,@Size(max=2000) String notes) {}
 public record ConsultationInput(@NotNull UUID id,@NotNull Instant occurredAt,@NotBlank @Size(max=4000) String notes,@NotBlank @Size(max=2000) String goals,@NotBlank @Size(max=4000) String carePlan) {}
 public record DeviceInput(@NotBlank @Size(max=160) String label,@Size(max=160) String serialNumber) {}
 public record DeviceConfigurationInput(@NotEmpty @Size(max=12) List<@Pattern(regexp="([01][0-9]|2[0-3]):[0-5][0-9]") String> schedules,@NotNull @Pattern(regexp="SIMULATED|HARDWARE") String adapter) {}
}
