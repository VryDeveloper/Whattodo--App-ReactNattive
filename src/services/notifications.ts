import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Todo } from "../types/todo";
import { computeReminderTriggerDate } from "../utils/reminderTime";

export { computeReminderTriggerDate };

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

/**
 * Agenda uma notificação local para a tarefa, cancelando antes qualquer
 * lembrete anterior dela (evita duplicidade ao reagendar). Retorna o novo
 * id da notificação, ou `null` se não havia o que agendar (sem data, sem
 * notificação habilitada, ou o horário calculado já está no passado).
 */
export async function scheduleTodoReminder(
  todo: Todo,
  leadMinutes: number
): Promise<string | null> {
  await cancelTodoReminder(todo.notificationId);

  if (!todo.dueDate || !todo.notifyEnabled || todo.completed) return null;

  const triggerDate = computeReminderTriggerDate(todo.dueDate, leadMinutes);
  if (triggerDate.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: todo.title,
      body: todo.description || "Está na hora de executar esta tarefa.",
      categoryIdentifier: REMINDER_CATEGORY_ID,
      data: { todoId: todo.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
}

export async function cancelTodoReminder(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Agenda um novo lembrete "adiado" a partir de agora (usado pela ação
 * "Adiar 30 min" da notificação). Diferente de scheduleTodoReminder, não
 * depende de dueDate/notifyEnabled — o usuário pediu explicitamente para
 * ser lembrado de novo, então respeitamos isso mesmo que a tarefa em si
 * não tenha lembrete configurado.
 */
export async function scheduleSnoozeReminder(todo: Todo, minutes: number): Promise<string> {
  const triggerDate = new Date(Date.now() + minutes * 60_000);
  return Notifications.scheduleNotificationAsync({
    content: {
      title: todo.title,
      body: todo.description || "Lembrete adiado — está na hora desta tarefa.",
      categoryIdentifier: REMINDER_CATEGORY_ID,
      data: { todoId: todo.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
}
