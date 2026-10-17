import { useQuery } from "@tanstack/react-query";
import { useAutenticacao } from "./useAutenticacao";
import { buscarIdentificacaoPaciente } from "../services/pacientes/pacientes";
export function useResumoPaciente() {
  const { sessao: sessao, requisicao: requisicao } = useAutenticacao();
  return useQuery({
    queryKey: ["identificacao-paciente", sessao?.usuario.id],
    enabled: sessao?.usuario.papel === "PATIENT",
    queryFn: () => buscarIdentificacaoPaciente(requisicao),
  });
}
