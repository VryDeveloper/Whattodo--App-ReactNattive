import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Todo } from "../types/todo";

interface Props {
  todo: Todo;
  onPress: (todo: Todo) => void;
  onToggleComplete: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

function formatDueDate(iso: string): string {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("pt-BR");
  const timePart = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} às ${timePart}`;
}

export function TodoItem({ todo, onPress, onToggleComplete, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggleComplete(todo)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={[styles.checkboxCircle, todo.completed && styles.checkboxCircleDone]}>
          {todo.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.content} onPress={() => onPress(todo)} activeOpacity={0.7}>
        <Text style={[styles.title, todo.completed && styles.titleDone]} numberOfLines={2}>
          {todo.title}
        </Text>
        <Text style={styles.status}>
          {todo.completed ? "Concluída" : "Pendente"}
          {todo.dueDate ? ` · ${formatDueDate(todo.dueDate)}` : ""}
          {todo.notifyEnabled && todo.dueDate ? " 🔔" : ""}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(todo)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteIcon}>🗑</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  checkbox: { marginRight: 12 },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCC",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCircleDone: { backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  content: { flex: 1 },
  title: { fontSize: 15, color: "#111", fontWeight: "500" },
  titleDone: { textDecorationLine: "line-through", color: "#888" },
  status: { fontSize: 12, color: "#888", marginTop: 2 },
  deleteButton: { marginLeft: 8, padding: 4 },
  deleteIcon: { fontSize: 18 },
});
