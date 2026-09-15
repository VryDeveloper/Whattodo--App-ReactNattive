import { computeReminderTriggerDate } from "../src/utils/reminderTime";

describe("computeReminderTriggerDate", () => {
  it("retorna a própria data/hora da tarefa quando a antecedência é zero", () => {
    const dueDate = "2026-01-10T15:00:00.000Z";
    const trigger = computeReminderTriggerDate(dueDate, 0);
    expect(trigger.toISOString()).toBe(dueDate);
  });

  it("subtrai a antecedência em minutos da data da tarefa", () => {
    const dueDate = "2026-01-10T15:00:00.000Z";
    const trigger = computeReminderTriggerDate(dueDate, 30);
    expect(trigger.toISOString()).toBe("2026-01-10T14:30:00.000Z");
  });

  it("lida com antecedência maior que uma hora, inclusive virando o dia", () => {
    const dueDate = "2026-01-10T00:30:00.000Z";
    const trigger = computeReminderTriggerDate(dueDate, 60);
    expect(trigger.toISOString()).toBe("2026-01-09T23:30:00.000Z");
  });
});
