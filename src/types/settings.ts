export interface AppSettings {
  /** Chave geral: se desligada, nenhum lembrete é agendado, mesmo que a tarefa peça notificação. */
  notificationsEnabled: boolean;
  /** Quantos minutos antes do horário da tarefa o lembrete deve disparar (0 = na hora exata). */
  reminderLeadMinutes: number;
  /** Se true, tarefas pendentes aparecem antes das concluídas na listagem. */
  sortPendingFirst: boolean;
}

export const REMINDER_LEAD_OPTIONS: { label: string; minutes: number }[] = [
  { label: "Na hora", minutes: 0 },
  { label: "10 min antes", minutes: 10 },
  { label: "30 min antes", minutes: 30 },
  { label: "1 hora antes", minutes: 60 },
];

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  reminderLeadMinutes: 0,
  sortPendingFirst: true,
};
