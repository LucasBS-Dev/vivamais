import type { EstadoModulo } from "@viva/contracts";
import { Icone } from "./Icones";

export const nomesModulos: Record<EstadoModulo["key"], string> = {
  "blood-pressure": "Pressão arterial",
  medications: "Medicamentos",
  food: "Alimentação",
  activity: "Atividade física",
  diary: "Diário impresso",
  consultations: "Consultas de enfermagem",
  bracelet: "Pulseira Pulso em Dia",
};

export function Modulos({
  modules,
  compact = false,
}: {
  modules: EstadoModulo[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? "module-list" : "module-grid"}>
      {modules.map((modulo) => (
        <article className="module-card" key={modulo.key}>
          <div className="module-heading">
            <span className="module-lock">
              <Icone name="lock" size={18} />
            </span>
            <h3>{nomesModulos[modulo.key]}</h3>
          </div>
          <p className="module-status">
            {modulo.status === "AVAILABLE"
              ? "Disponível"
              : modulo.status === "BLOCKED_PENDING_CLINICAL_APPROVAL"
                ? "Aguarda validação clínica"
                : modulo.status === "BLOCKED_PENDING_HARDWARE_SPEC"
                  ? "Integração com aparelho indisponível"
                  : "Indisponível no momento"}
          </p>
          <p>{modulo.reason}</p>
        </article>
      ))}
    </div>
  );
}
