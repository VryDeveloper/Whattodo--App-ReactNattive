import React from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useTodos } from "../context/TodoContext";
import { useSettings } from "../context/SettingsContext";
import { REMINDER_LEAD_OPTIONS } from "../types/settings";

export function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const { todos, clearCompleted } = useTodos();

  const completedCount = todos.filter((t) => t.completed).length;

  function confirmClearCompleted() {
    if (completedCount === 0) return;
    Alert.alert(
      "Limpar tarefas concluídas",
      `Remover ${completedCount} tarefa(s) concluída(s)? Essa ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => clearCompleted() },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Notificações</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Ativar lembretes</Text>
            <Text style={styles.rowHint}>
              Quando desligado, nenhuma tarefa dispara notificação, mesmo com lembrete habilitado.
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.rowLabel}>Antecedência padrão do lembrete</Text>
        <View style={styles.chipsRow}>
          {REMINDER_LEAD_OPTIONS.map((option) => {
            const selected = settings.reminderLeadMinutes === option.minutes;
            return (
              <TouchableOpacity
                key={option.minutes}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => updateSettings({ reminderLeadMinutes: option.minutes })}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Lista de tarefas</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Pendentes primeiro</Text>
            <Text style={styles.rowHint}>Mostra as tarefas não concluídas no topo da lista.</Text>
          </View>
          <Switch
            value={settings.sortPendingFirst}
            onValueChange={(value) => updateSettings({ sortPendingFirst: value })}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Dados</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.clearButton, completedCount === 0 && styles.clearButtonDisabled]}
          onPress={confirmClearCompleted}
          disabled={completedCount === 0}
        >
          <Text style={styles.clearButtonText}>
            Limpar tarefas concluídas ({completedCount})
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>"Whattodo?" - Horizon Challenge · v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowText: { flex: 1, paddingRight: 12 },
  rowLabel: { fontSize: 15, fontWeight: "600", color: "#111" },
  rowHint: { fontSize: 12, color: "#888", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 16 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: { backgroundColor: "#F5C400", borderColor: "#F5C400" },
  chipText: { fontSize: 13, color: "#333", fontWeight: "500" },
  chipTextSelected: { color: "#111", fontWeight: "700" },
  clearButton: { alignItems: "center", paddingVertical: 8 },
  clearButtonDisabled: { opacity: 0.4 },
  clearButtonText: { color: "#D32F2F", fontSize: 15, fontWeight: "700" },
  footer: { textAlign: "center", color: "#AAA", fontSize: 12, marginTop: 28 },
});
