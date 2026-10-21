import { useQuery } from "@tanstack/react-query";
import { useAutenticacao } from "./useAutenticacao";
import { useResumoPaciente } from "./useResumoPaciente";
type Registro = { systolic: number; diastolic: number; measuredAt: string };
export function usePainelPaciente() {
  const { sessao, requisicao } = useAutenticacao(),
    identificacao = useResumoPaciente();
  return useQuery({
    queryKey: ["painel-paciente", sessao?.usuario.id, identificacao.data?.id],
    enabled: !!identificacao.data?.id,
    queryFn: async () => {
      const base = `/patients/${identificacao.data!.id}`;
      const dia = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      const [pressao, horarios, refeicoes, atividades] = await Promise.all([
        requisicao<{ items: Registro[] }>(`${base}/readings?size=1`),
        requisicao<{ status: string }[]>(
          `${base}/medication-events?date=${dia}`,
        ),
        requisicao<{ total: number }>(`${base}/meals?size=1`),
        requisicao<{ total: number }>(`${base}/activities?size=1`),
      ]);
      return {
        pressao: pressao.items[0] ?? null,
        horarios: horarios.length,
        respostas: horarios.filter((h) => h.status !== "NO_CONFIRMATION")
          .length,
        refeicoes: refeicoes.total,
        atividades: atividades.total,
      };
    },
  });
}
