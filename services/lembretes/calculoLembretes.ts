export interface PlanoLembretes {
  id: string;
  name: string;
  instruction: string;
  startsOn: string;
  endsOn: string | null;
  timeZone: string;
  schedules: string[];
  version: number;
  active: boolean;
}
function partesData(instanteEvento: Date, zone: string) {
  const pacienteConsultado = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instanteEvento);
  const lerParte = (chave: string) =>
    Number(pacienteConsultado.find((x) => x.type === chave)?.value);
  return {
    year: lerParte("year"),
    month: lerParte("month"),
    day: lerParte("day"),
    hour: lerParte("hour"),
    minute: lerParte("minute"),
    second: lerParte("second"),
  };
}
export function converterHorarioFuso(
  diastolicaEmMmhg: string,
  time: string,
  zone: string,
) {
  const y = Number(diastolicaEmMmhg.slice(0, 4)),
    m = Number(diastolicaEmMmhg.slice(5, 7)),
    d = Number(diastolicaEmMmhg.slice(8, 10)),
    h = Number(time.slice(0, 2)),
    min = Number(time.slice(3, 5));
  const target = Date.UTC(y, m - 1, d, h, min);
  let estimate = target;
  for (let i = 0; i < 3; i++) {
    const pacienteConsultado = partesData(new Date(estimate), zone);
    const local = Date.UTC(
      pacienteConsultado.year,
      pacienteConsultado.month - 1,
      pacienteConsultado.day,
      pacienteConsultado.hour,
      pacienteConsultado.minute,
      pacienteConsultado.second,
    );
    estimate += target - local;
  }
  return estimate;
}
export function calcularLembretes(
  planos: PlanoLembretes[],
  agora = Date.now(),
) {
  const saida: { planId: string; date: number; kind: "BEFORE" | "AT" }[] = [];
  for (const plano of planos.filter(
    (pacienteConsultado) => pacienteConsultado.active,
  )) {
    const pacienteConsultado = partesData(new Date(agora), plano.timeZone);
    for (let n = 0; n < 7; n++) {
      const diastolicaEmMmhg = new Date(
        Date.UTC(
          +pacienteConsultado.year,
          +pacienteConsultado.month - 1,
          +pacienteConsultado.day + n,
        ),
      )
        .toISOString()
        .slice(0, 10);
      if (
        diastolicaEmMmhg < plano.startsOn ||
        (plano.endsOn && diastolicaEmMmhg > plano.endsOn)
      )
        continue;
      for (const time of plano.schedules) {
        const instanteEvento = converterHorarioFuso(
          diastolicaEmMmhg,
          time,
          plano.timeZone,
        );
        if (instanteEvento - 300000 > agora)
          saida.push({
            planId: plano.id,
            date: instanteEvento - 300000,
            kind: "BEFORE",
          });
        if (instanteEvento > agora)
          saida.push({ planId: plano.id, date: instanteEvento, kind: "AT" });
      }
    }
  }
  return saida.sort((a, b) => a.date - b.date).slice(0, 60);
}
