import { converterHorarioFuso } from "../lembretes/calculoLembretes";
export function dataLocalHoje() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function deslocarData(data: string, dias: number) {
  const nova = new Date(`${data}T12:00:00Z`);
  nova.setUTCDate(nova.getUTCDate() + dias);
  return nova.toISOString().slice(0, 10);
}
export function segundaDaSemana(data = dataLocalHoje()) {
  const dia = new Date(`${data}T12:00:00Z`).getUTCDay();
  return deslocarData(data, -((dia + 6) % 7));
}
export function instanteLocal(data: string) {
  return new Date(
    converterHorarioFuso(data, "00:00", "America/Sao_Paulo"),
  ).toISOString();
}
