import Link from "next/link";
import type { PatientSummary } from "@viva/contracts";
import { Icon } from "./icons";

export function Modality({ value }: { value: PatientSummary["modality"] }) {
  return (
    <span
      className={`modality ${value === "APP" ? "modality-app" : "modality-diary"}`}
    >
      <Icon name={value === "APP" ? "phone" : "book"} size={17} />
      {value === "APP" ? "Aplicativo Viva+" : "Pulseira + diário"}
    </span>
  );
}

export function PatientList({
  patients,
  emptyText = "Nenhum paciente disponível para sua conta.",
}: {
  patients: PatientSummary[];
  emptyText?: string;
}) {
  if (!patients.length)
    return (
      <div className="empty-state">
        <Icon name="people" size={36} />
        <h3>Nenhum paciente encontrado</h3>
        <p>{emptyText}</p>
      </div>
    );
  return (
    <div className="patient-list">
      {patients.map((patient) => (
        <Link
          className="patient-row"
          href={`/pacientes/${patient.id}`}
          key={patient.id}
        >
          <span className="patient-avatar" aria-hidden="true">
            {patient.displayName.trim().charAt(0).toLocaleUpperCase("pt-BR")}
          </span>
          <span className="patient-name">
            {patient.displayName}
            <small>Ver ficha de identificação</small>
          </span>
          <Modality value={patient.modality} />
          <span className="patient-open">
            Abrir <Icon name="arrow" size={18} />
          </span>
        </Link>
      ))}
    </div>
  );
}
