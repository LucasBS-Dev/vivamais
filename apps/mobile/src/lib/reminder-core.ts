export interface ReminderPlan {
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
function parts(at: Date, zone: string) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const read = (key: string) => Number(p.find((x) => x.type === key)?.value);
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}
export function zonedTime(day: string, time: string, zone: string) {
  const y = Number(day.slice(0, 4)),
    m = Number(day.slice(5, 7)),
    d = Number(day.slice(8, 10)),
    h = Number(time.slice(0, 2)),
    min = Number(time.slice(3, 5));
  const target = Date.UTC(y, m - 1, d, h, min);
  let estimate = target;
  for (let i = 0; i < 3; i++) {
    const p = parts(new Date(estimate), zone);
    const local = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour,
      p.minute,
      p.second,
    );
    estimate += target - local;
  }
  return estimate;
}
export function reminderTimes(plans: ReminderPlan[], now = Date.now()) {
  const out: { planId: string; date: number; kind: "BEFORE" | "AT" }[] = [];
  for (const plan of plans.filter((p) => p.active)) {
    const p = parts(new Date(now), plan.timeZone);
    for (let n = 0; n < 7; n++) {
      const day = new Date(Date.UTC(+p.year, +p.month - 1, +p.day + n))
        .toISOString()
        .slice(0, 10);
      if (day < plan.startsOn || (plan.endsOn && day > plan.endsOn)) continue;
      for (const time of plan.schedules) {
        const at = zonedTime(day, time, plan.timeZone);
        if (at - 300000 > now)
          out.push({ planId: plan.id, date: at - 300000, kind: "BEFORE" });
        if (at > now) out.push({ planId: plan.id, date: at, kind: "AT" });
      }
    }
  }
  return out.sort((a, b) => a.date - b.date).slice(0, 60);
}
