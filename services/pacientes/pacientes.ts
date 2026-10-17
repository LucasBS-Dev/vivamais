import type { Paciente } from "@viva/contracts";
export type RequisicaoPaciente = <T>(caminho: string) => Promise<T>;
export function buscarIdentificacaoPaciente(requisicao: RequisicaoPaciente) {
  return requisicao<Paciente>("/patients/me");
}
