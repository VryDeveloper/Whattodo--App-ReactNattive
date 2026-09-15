import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Todo } from "../types/todo";

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
 * Calcula o horário de disparo do lembrete: `leadMinutes` antes de
 * `dueDate`. Usado tanto para agendar quanto para decidir se ainda vale a
 * pena agendar (não agendamos lembrete para um horário já passado).
 */
export function computeReminderTriggerDate(dueDate: string, leadMinutes: number): Date {
  return new Date(new Date(dueDate).getTime() - leadMinutes * 60_000);
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
