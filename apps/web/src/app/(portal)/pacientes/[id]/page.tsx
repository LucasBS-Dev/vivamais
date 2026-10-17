import Link from "next/link";
import { notFound } from "next/navigation";
import type { ModuleStatus, PatientSummary } from "@viva/contracts";
import { ApiError, authenticatedRequest, getSession } from "@/lib/api";
import { safePatientId } from "@/lib/validation";
import { Modality } from "@/components/patient-list";
import { Modules } from "@/components/modules";
import { Icon } from "@/components/icons";
import { PatientCare } from "@/components/patient-care";
import { PatientMeals } from "@/components/patient-meals";
import { PatientAssignments } from "@/components/patient-assignments";

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await getSession();
  if (!safePatientId(id)) notFound();
  let patient: PatientSummary;
  try {
    patient = await authenticatedRequest<PatientSummary>(`/patients/${id}`);
  } catch (error) {
    if (error instanceof ApiError && [403, 404].includes(error.status))
      notFound();
    throw error;
  }
  const modules = await authenticatedRequest<ModuleStatus[]>("/system/modules");
  const visibleModules = modules.filter(
    (module) =>
      patient.modality === "BRACELET_DIARY" ||
      !["bracelet", "diary"].includes(module.key),
  );
  return (
    <>
      <Link href="/pacientes" className="back-link">
        ← Voltar para pacientes
      </Link>
      <div className="patient-profile">
        <span className="profile-avatar" aria-hidden="true">
          {patient.displayName.charAt(0)}
        </span>
        <div>
          <span className="eyebrow">FICHA DE IDENTIFICAÇÃO</span>
          <h1>{patient.displayName}</h1>
          <Modality value={patient.modality} />
        </div>
        <span className="access-label">
          <Icon name="shield" size={19} /> Acesso autorizado
        </span>
      </div>
      {user.role === "ADMIN" && <PatientAssignments patientId={id} />}
      <PatientCare key={id} patient={patient} />
      <PatientMeals key={`meals-${id}`} patientId={id} />
      <details>
        <summary>Estado das integrações</summary>
        <div className="notice">
          <Icon name="lock" size={21} />
          <div>
            <strong>Dados sintéticos de demonstração</strong>
            <p>
              Registros disponíveis são consultados na API. Recomendações
              clínicas e hardware real dependem de aprovação e configuração.
            </p>
          </div>
        </div>
        <section className="patient-modules">
          <h2>Acompanhamento</h2>
          <p className="section-intro">
            Modalidade:{" "}
            {patient.modality === "APP"
              ? "aplicativo Viva+."
              : "pulseira de lembretes e diário impresso. Esta modalidade não exige smartphone."}
          </p>
          <Modules modules={visibleModules} />
        </section>
      </details>
    </>
  );
}
