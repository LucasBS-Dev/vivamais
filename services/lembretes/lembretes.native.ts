import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { calcularLembretes, type PlanoLembretes } from "./calculoLembretes";
export async function cancelarLembretes(idTitular: string) {
  for (const item of await Notifications.getAllScheduledNotificationsAsync()) {
    if (item.content.data?.owner === idTitular)
      await Notifications.cancelScheduledNotificationAsync(item.identifier);
  }
}
export async function agendarLembretes(
  idTitular: string,
  planos: PlanoLembretes[],
  ask: boolean,
) {
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("medication-reminders", {
      name: "Lembretes de medicamentos",
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    });
  let permissao = await Notifications.getPermissionsAsync();
  if (!permissao.granted && ask)
    permissao = await Notifications.requestPermissionsAsync();
  if (!permissao.granted)
    return "Notificações desativadas. Você pode autorizá-las nas configurações do aparelho.";
  await cancelarLembretes(idTitular);
  const horarios = calcularLembretes(planos);
  for (const item of horarios)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Viva+ · lembrete",
        body:
          item.kind === "BEFORE"
            ? "Em cinco minutos há um horário de medicamento. Consulte seu plano no aplicativo."
            : "Há um horário de medicamento no seu plano. Consulte o aplicativo e as instruções profissionais.",
        data: { owner: idTitular, planId: item.planId, kind: item.kind },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(item.date),
        channelId: "medication-reminders",
      },
    });
  return `${horarios.length} lembretes locais agendados para os próximos dias, incluindo antecipação de cinco minutos quando possível. Reabra o app para renovar. Restrições do sistema podem afetar a entrega; agendamento não comprova ingestão.`;
}
