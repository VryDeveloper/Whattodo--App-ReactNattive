export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
  /** Descrição opcional com mais detalhes sobre a tarefa. */
  description: string;
  /**
   * Data/hora (ISO 8601) em que a tarefa deve ser executada, usada como
   * gatilho do lembrete. `null` quando a tarefa não tem prazo definido.
   */
  dueDate: string | null;
  /** Se `true` e houver `dueDate`, um lembrete local é agendado. */
  notifyEnabled: boolean;
  /**
   * Id da notificação local agendada no expo-notifications para esta
   * tarefa (necessário para poder cancelá-la ao editar/excluir/concluir).
   * Campo puramente local, nunca enviado para a API.
   */
  notificationId: string | null;
}

export type NewTodo = Pick<
  Todo,
  "title" | "completed" | "description" | "dueDate" | "notifyEnabled"
>;

export type LoadStatus = "idle" | "loading" | "success" | "error";
