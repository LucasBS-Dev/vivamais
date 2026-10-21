import { dataLocalHoje } from "./periodos";

export function calcularIdade(
  dataNascimento: string | null,
  hoje = dataLocalHoje(),
): number | null {
  if (
    !dataNascimento ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento) ||
    dataNascimento > hoje
  )
    return null;
  const data = new Date(`${dataNascimento}T12:00:00Z`);
  if (
    !Number.isFinite(data.getTime()) ||
    data.toISOString().slice(0, 10) !== dataNascimento
  )
    return null;
  const aniversarioPendente = hoje.slice(5) < dataNascimento.slice(5);
  return (
    Number(hoje.slice(0, 4)) -
    Number(dataNascimento.slice(0, 4)) -
    Number(aniversarioPendente)
  );
}
