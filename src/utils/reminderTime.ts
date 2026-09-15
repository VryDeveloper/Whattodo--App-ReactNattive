/**
 * Calcula o horário de disparo do lembrete: `leadMinutes` antes de
 * `dueDate`. Extraído como função pura (sem depender de expo-notifications
 * ou react-native) para poder ser testado com Jest puro, sem precisar de
 * mocks de módulos nativos.
 */
export function computeReminderTriggerDate(dueDate: string, leadMinutes: number): Date {
  return new Date(new Date(dueDate).getTime() - leadMinutes * 60_000);
}
