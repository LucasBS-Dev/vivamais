import type { ModuleStatus } from "@viva/contracts";
import { Icon } from "./icons";

export const moduleNames: Record<ModuleStatus["key"], string> = {
  "blood-pressure": "Pressão arterial",
  medications: "Medicamentos",
  food: "Alimentação",
  activity: "Atividade física",
  diary: "Diário impresso",
  consultations: "Consultas de enfermagem",
  bracelet: "Pulseira Pulso em Dia",
};

export function Modules({
  modules,
  compact = false,
}: {
  modules: ModuleStatus[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? "module-list" : "module-grid"}>
      {modules.map((module) => (
        <article className="module-card" key={module.key}>
          <div className="module-heading">
            <span className="module-lock">
              <Icon name="lock" size={18} />
            </span>
            <h3>{moduleNames[module.key]}</h3>
            <span className="phase-label">Fase {module.phase}</span>
          </div>
          <p className="module-status">
            {module.status === "AVAILABLE"
              ? "Disponível na demonstração"
              : module.status === "BLOCKED_PENDING_CLINICAL_APPROVAL"
                ? "Aguarda validação clínica"
                : module.status === "BLOCKED_PENDING_HARDWARE_SPEC"
                  ? "Aguarda especificação do hardware"
                  : "Implementação planejada"}
          </p>
          <p>{module.reason}</p>
        </article>
      ))}
    </div>
  );
}
