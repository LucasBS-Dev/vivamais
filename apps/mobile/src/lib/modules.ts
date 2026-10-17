import type { ModuleKey } from "@viva/contracts";

export const moduleLabels: Record<ModuleKey, string> = {
  "blood-pressure": "Minha Pressão",
  medications: "Meus Medicamentos",
  food: "Minha Alimentação",
  activity: "Atividade Física",
  diary: "Diário impresso",
  consultations: "Consultas",
  bracelet: "Pulseira Pulso em Dia",
};

export const mainActions: {
  key: ModuleKey;
  title: string;
  icon: string;
  description: string;
}[] = [
  {
    key: "blood-pressure",
    title: "Minha Pressão",
    icon: "♡",
    description: "Medições e acompanhamento",
  },
  {
    key: "medications",
    title: "Meus Medicamentos",
    icon: "✚",
    description: "Seu plano e seus lembretes",
  },
  {
    key: "food",
    title: "Minha Alimentação",
    icon: "◉",
    description: "Registros das refeições",
  },
  {
    key: "activity",
    title: "Atividade Física",
    icon: "↗",
    description: "Movimento no seu dia",
  },
];

export function moduleStatusLabel(status: string): string {
  if (status === "AVAILABLE") return "Disponível na demonstração";
  if (status === "NOT_STARTED") return "Ainda não iniciado";
  if (status === "BLOCKED_PENDING_CLINICAL_APPROVAL")
    return "Aguarda aprovação clínica";
  if (status === "BLOCKED_PENDING_HARDWARE_SPEC")
    return "Aguarda especificação do dispositivo";
  return "Disponibilidade não confirmada";
}
