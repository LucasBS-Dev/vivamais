import { useQuery } from "@tanstack/react-query";
import type { components } from "@viva/contracts";
import { useAutenticacao } from "./useAutenticacao";
import { filaRegistros } from "../services/sincronizacao/filaRegistros";
export function useResultadoPressao(idPaciente: string, idRegistro: string) {
  const { sessao: sessao, requisicao: requisicao } = useAutenticacao();
  return useQuery({
    queryKey: ["resultado-pressao", sessao?.usuario.id, idRegistro],
    enabled: Boolean(sessao && idPaciente && idRegistro),
    refetchInterval: 15000,
    queryFn: async () => {
      if (!sessao) throw new Error("Entre novamente.");
      await filaRegistros.sync(sessao.usuario.id, (caminho, body) =>
        requisicao(caminho, { method: "POST", body }),
      );
      const pendente = (await filaRegistros.read(sessao.usuario.id)).find(
        (item) => item.id === idRegistro,
      );
      if (pendente) {
        const entrada =
          pendente.body as components["schemas"]["EntradaRegistroPressao"];
        return {
          pendente: true,
          erroEnvio: pendente.state === "ERROR",
          sistolica: entrada.systolic,
          diastolica: entrada.diastolic,
          dataMedicao: entrada.measuredAt,
        };
      }
      const registro = await requisicao<
        components["schemas"]["RegistroPressao"]
      >(`/pacientes/${idPaciente}/registros-pressao/${idRegistro}`);
      return {
        pendente: false,
        erroEnvio: false,
        sistolica: registro.systolic,
        diastolica: registro.diastolic,
        dataMedicao: registro.measuredAt,
      };
    },
  });
}
