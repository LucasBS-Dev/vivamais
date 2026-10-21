import type { RespostaAutenticacao } from "./index";
export type TipoDispositivoPaciente = "WEB" | "NATIVO";
export interface RespostaAcessoPaciente {
  estado: "AUTENTICADO" | "VERIFICACAO_NECESSARIA";
  desafio?: string;
  desafioExpiraEm?: string;
  sessao?: RespostaAutenticacao;
  credencialDispositivo?: string;
  dispositivoExpiraEm?: string;
}
export interface EstadoAtivacaoPaciente {
  estado:
    | "AGUARDANDO_EMISSAO"
    | "AGUARDANDO_ATIVACAO"
    | "EXPIRADO"
    | "ATIVADO"
    | "UTILIZADO_OU_SUBSTITUIDO";
  expiraEm: string | null;
  dispositivosAutorizados: number;
  smsDisponivel?: boolean;
  provedorSms?: string;
  envioSms?: {
    idEnvio: string;
    estado: string;
    destinoMascarado: string | null;
    provedor: string;
    atualizadoEm: string;
  } | null;
}

export interface SolicitacaoSmsPaciente {
  idEnvio: string;
  estadoEnvio: string;
  expiraEm: string;
  destinoMascarado: string;
  provedor: string;
}
export function formatarCpf(valor: string): string {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}
export function formatarNascimento(valor: string): string {
  return valor
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}
export function interpretarNascimento(
  valor: string,
  hoje = new Date(),
): string | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!partes) return null;
  const [, dia, mes, ano] = partes;
  const data = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
  if (
    Number(ano) < 1900 ||
    data.getUTCFullYear() !== Number(ano) ||
    data.getUTCMonth() !== Number(mes) - 1 ||
    data.getUTCDate() !== Number(dia)
  )
    return null;
  const iso = `${ano}-${mes}-${dia}`;
  return iso <= hoje.toISOString().slice(0, 10) ? iso : null;
}
