import type { components } from "@viva/contracts";
import type { RequisicaoPaciente } from "../pacientes/pacientes";
export async function buscarDadosAtividade(
  requisicao: RequisicaoPaciente,
  idPaciente: string,
) {
  const [perfil, medicoes] = await Promise.all([
    requisicao<{
      mobility: string;
      balance: string;
      restrictions: string;
      professionalGuidance: string;
    } | null>(`/patients/${idPaciente}/activity-profile`),
    requisicao<{ items: components["schemas"]["RegistroPressao"][] }>(
      `/patients/${idPaciente}/readings?size=1`,
    ),
  ]);
  const ultima = medicoes.items[0];
  return {
    perfil: perfil
      ? {
          mobilidade: perfil.mobility,
          equilibrio: perfil.balance,
          restricoes: perfil.restrictions,
          orientacoes: perfil.professionalGuidance,
        }
      : null,
    ultimaMedicao: ultima
      ? {
          sistolica: ultima.systolic,
          diastolica: ultima.diastolic,
          dataMedicao: ultima.measuredAt,
        }
      : null,
  };
}
