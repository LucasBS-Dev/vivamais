import { useQuery } from "@tanstack/react-query";
import { useAutenticacao } from "./useAutenticacao";
import { useResumoPaciente } from "./useResumoPaciente";
import { buscarDadosAtividade } from "../services/atividades/atividades";
export function useDadosAtividade() {
  const { requisicao: requisicao } = useAutenticacao(),
    resumo = useResumoPaciente(),
    idPaciente = resumo.data?.id;
  return useQuery({
    queryKey: ["dados-atividade", idPaciente],
    enabled: Boolean(idPaciente),
    queryFn: () => buscarDadosAtividade(requisicao, idPaciente!),
  });
}
