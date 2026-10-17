import type { ReminderPlan } from "./reminder-core";
export async function scheduleReminders(
  _owner: string,
  _plans: ReminderPlan[],
  _ask: boolean,
) {
  return "Lembretes locais não são suportados neste navegador. Use um build Android/iOS e autorize as notificações.";
}
export async function cancelReminders(_owner: string) {}
