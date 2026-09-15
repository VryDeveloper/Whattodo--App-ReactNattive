import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const REMINDER_CATEGORY_ID = "todo-reminder";
export const SNOOZE_ACTION_ID = "SNOOZE_30";
export const COMPLETE_ACTION_ID = "COMPLETE";

const ANDROID_CHANNEL_ID = "todo-reminders";

// Enquanto o app está em primeiro plano, mostra a notificação normalmente
// (banner + entrada na lista do sistema), sem badge no ícone.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Configura canal (Android), categoria com as ações rápidas da notificação
 * ("Adiar 30 min" / "Concluir") e pede permissão ao usuário. Deve ser
 * chamado uma vez, na inicialização do app.
 */
export async function initNotifications(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Lembretes de tarefas",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  await Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY_ID, [
    {
      identifier: SNOOZE_ACTION_ID,
      buttonTitle: "Adiar 30 min",
      options: { opensAppToForeground: false },
    },
    {
      identifier: COMPLETE_ACTION_ID,
      buttonTitle: "Concluir tarefa",
      options: { opensAppToForeground: false },
    },
  ]);

  await requestNotificationPermissions();
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}
