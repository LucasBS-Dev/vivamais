import Link from "next/link";
import type { Paciente } from "@viva/contracts";
import { Icone } from "./Icones";

export function ModalidadePaciente({
  value: valor,
}: {
  value: Paciente["modality"];
}) {
  return (
    <span
      className={`modality ${valor === "APP" ? "modality-app" : "modality-diary"}`}
    >
      <Icone name={valor === "APP" ? "phone" : "book"} size={17} />
      {valor === "APP" ? "Aplicativo Viva+" : "Pulseira + diário"}
    </span>
  );
}

export function ListaPacientes({
  patients: pacientes,
  emptyText = "Nenhum paciente disponível para sua conta.",
  abaInicial,
}: {
  patients: Paciente[];
  emptyText?: string;
  abaInicial?: string;
}) {
  if (!pacientes.length)
    return (
      <div className="empty-state">
        <Icone name="people" size={36} />
        <h3>Nenhum paciente encontrado</h3>
        <p>{emptyText}</p>
      </div>
    );
  return (
    <div className="patient-list">
      {pacientes.map((paciente) => (
        <Link
          className="patient-row"
          href={`/pacientes/${paciente.id}${abaInicial ? `?aba=${encodeURIComponent(abaInicial)}` : ""}`}
          key={paciente.id}
        >
          <span className="patient-avatar" aria-hidden="true">
            {paciente.displayName.trim().charAt(0).toLocaleUpperCase("pt-BR")}
          </span>
          <span className="patient-name">
            {paciente.displayName}
            <small>Ver ficha de identificação</small>
          </span>
          <ModalidadePaciente value={paciente.modality} />
          <span className="patient-open">
            Abrir <Icone name="arrow" size={18} />
          </span>
        </Link>
      ))}
    </div>
  );
}
