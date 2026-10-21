import { useQuery } from "@tanstack/react-query";
import { useAutenticacao } from "./useAutenticacao";
import { buscarResultadoRefeicao } from "../services/alimentacao/refeicoes";
export function useResultadoRefeicao(idRefeicao: string) {
  const { sessao, requisicao } = useAutenticacao();
  return useQuery({
    queryKey: ["resultado-refeicao", sessao?.usuario.id, idRefeicao],
    enabled: Boolean(sessao && idRefeicao),
    queryFn: () => buscarResultadoRefeicao(requisicao, idRefeicao),
  });
}
