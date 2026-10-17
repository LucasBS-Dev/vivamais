import type { components } from "@viva/contracts";
export type FormularioPressao = {
  sistolica: number;
  diastolica: number;
  pulso: number | null;
  dataMedicao: string;
  idDocumentoOcr?: string;
};
export function criarCorpoRegistro(
  id: string,
  entrada: FormularioPressao,
): components["schemas"]["EntradaRegistroPressao"] {
  return {
    id,
    systolic: entrada.sistolica,
    diastolic: entrada.diastolica,
    pulse: entrada.pulso ?? undefined,
    measuredAt: entrada.dataMedicao,
    source: entrada.idDocumentoOcr ? "OCR_CONFIRMED" : "MANUAL",
    ocrDocumentId: entrada.idDocumentoOcr,
    ocrConfirmed: entrada.idDocumentoOcr ? true : undefined,
  };
}
