import { consultarDominio } from "./dominio";
type LinhaApi = Record<string, unknown>;
type ResumoApi = {
  readings: LinhaApi[];
  medicationEvents: LinhaApi[];
  activities: LinhaApi[];
  meals: LinhaApi[];
  generatedAt: string;
  totais: {
    refeicoes: number;
    atividades: number;
    consultas: number;
    pressoes: number;
  };
};
export interface ResumoCuidados {
  ultimaPressao: string | null;
  dataUltimaPressao: string | null;
  horariosHoje: number;
  autorrelatosHoje: number;
  fotosRecentes: number;
  atividadesRecentes: number;
  registros: {
    id: string;
    data: string;
    tipo: string;
    informacao: string;
    origem: string;
  }[];
}
const origens: Record<string, string> = {
  MANUAL: "Digitação no aplicativo",
  OCR_CONFIRMED: "Foto confirmada",
  PROFESSIONAL: "Profissional",
  PRINTED_DIARY: "Diário transcrito",
  SELF_REPORT: "Autorrelato",
};
export async function buscarResumoCuidados(
  idPaciente: string,
): Promise<ResumoCuidados> {
  const resposta = await consultarDominio<ResumoApi>(
    `/patients/${idPaciente}/summary`,
  );
  const ultima = resposta.readings[0];
  const registros = [
    ...resposta.readings.map((linha) => ({
      id: String(linha.id),
      data: String(linha.measuredAt),
      tipo: "Pressão",
      informacao: `${linha.systolic} / ${linha.diastolic} mmHg`,
      origem: origens[String(linha.source)] || "Registro informado",
    })),
    ...resposta.medicationEvents
      .filter((linha) => linha.reportedAt)
      .map((linha) => ({
        id: `${linha.planId}-${linha.scheduledAt}`,
        data: String(linha.reportedAt),
        tipo: "Medicamento",
        informacao: `${linha.name} — ${linha.status === "TAKEN" ? "Tomei" : "Não tomei"} (autorrelato)`,
        origem: origens[String(linha.source)] || "Autorrelato",
      })),
    ...resposta.activities.map((linha) => ({
      id: String(linha.id),
      data: String(linha.occurredAt),
      tipo: "Atividade física",
      informacao: `${linha.type}${linha.durationMinutes ? ` — ${linha.durationMinutes} min` : ""}`,
      origem: "Atividade informada",
    })),
    ...resposta.meals.map((linha) => ({
      id: String(linha.id),
      data: String(linha.occurredAt),
      tipo: "Alimentação",
      informacao: "Foto privada registrada",
      origem: "Foto registrada",
    })),
  ]
    .sort((a, b) => Date.parse(b.data) - Date.parse(a.data))
    .slice(0, 8);
  return {
    ultimaPressao: ultima ? `${ultima.systolic} / ${ultima.diastolic}` : null,
    dataUltimaPressao: ultima ? String(ultima.measuredAt) : null,
    horariosHoje: resposta.medicationEvents.length,
    autorrelatosHoje: resposta.medicationEvents.filter(
      (linha) => linha.reportedAt,
    ).length,
    fotosRecentes: resposta.totais.refeicoes,
    atividadesRecentes: resposta.totais.atividades,
    registros,
  };
}
