import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { reminderTimes, type ReminderPlan } from "./reminder-core";
export async function cancelReminders(owner: string) {
  for (const item of await Notifications.getAllScheduledNotificationsAsync()) {
    if (item.content.data?.owner === owner)
      await Notifications.cancelScheduledNotificationAsync(item.identifier);
  }
}
export async function scheduleReminders(
  owner: string,
  plans: ReminderPlan[],
  ask: boolean,
) {
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("medication-reminders", {
      name: "Lembretes de medicamentos",
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && ask)
    permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted)
    return "Notificações desativadas. Você pode autorizá-las nas configurações do aparelho.";
  await cancelReminders(owner);
  const times = reminderTimes(plans);
  for (const item of times)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Viva+ · lembrete",
        body:
          item.kind === "BEFORE"
            ? "Em cinco minutos há um horário de medicamento. Consulte seu plano no aplicativo."
            : "Há um horário de medicamento no seu plano. Consulte o aplicativo e as instruções profissionais.",
        data: { owner, planId: item.planId, kind: item.kind },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(item.date),
        channelId: "medication-reminders",
      },
    });
  return `${times.length} lembretes locais agendados para os próximos dias, incluindo antecipação de cinco minutos quando possível. Reabra o app para renovar. Restrições do sistema podem afetar a entrega; agendamento não comprova ingestão.`;
}
