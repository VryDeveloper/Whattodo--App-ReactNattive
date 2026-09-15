import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { useTodos } from "../context/TodoContext";
import { navigateToTodoDetail } from "../navigation/navigationRef";
import { COMPLETE_ACTION_ID, SNOOZE_ACTION_ID } from "../services/notifications";

const SNOOZE_MINUTES = 30;

/**
 * Reage ao toque do usuário em uma notificação de lembrete de tarefa:
 * - ação "Adiar 30 min": reagenda o lembrete para daqui a 30 minutos;
 * - ação "Concluir tarefa": marca a tarefa como concluída no app;
 * - toque no corpo da notificação (sem ação): abre a tela de detalhe.
 */
export function useNotificationResponseListener(): void {
  const { completeTodo, snoozeTodo } = useTodos();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { todoId?: number } | undefined;
      const todoId = data?.todoId;
      if (todoId === undefined) return;

      switch (response.actionIdentifier) {
        case SNOOZE_ACTION_ID:
          snoozeTodo(todoId, SNOOZE_MINUTES);
          break;
        case COMPLETE_ACTION_ID:
          completeTodo(todoId);
          break;
        default:
          navigateToTodoDetail(todoId);
      }
    });

    return () => subscription.remove();
  }, [completeTodo, snoozeTodo]);
}
