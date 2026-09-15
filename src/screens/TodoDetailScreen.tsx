import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTodos } from "../context/TodoContext";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "TodoDetail">;

export function TodoDetailScreen({ route, navigation }: Props) {
  const { getTodoById, removeTodo } = useTodos();
  const todo = getTodoById(route.params.id);

  if (!todo) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Tarefa não encontrada (pode ter sido removida).</Text>
      </View>
    );
  }

  function confirmDelete() {
    if (!todo) return;
    const todoId = todo.id;
    Alert.alert(
      "Excluir tarefa",
      "Tem certeza de que deseja excluir esta tarefa? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await removeTodo(todoId);
            navigation.goBack();
          },
        },
      ]
    );
  }

  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{todo.title}</Text>
      <View style={[styles.statusPill, todo.completed ? styles.pillDone : styles.pillPending]}>
        <Text style={styles.statusText}>{todo.completed ? "Concluída" : "Pendente"}</Text>
      </View>

      {todo.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Descrição</Text>
          <Text style={styles.description}>{todo.description}</Text>
        </View>
      ) : null}

      {dueDate && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Data e hora</Text>
          <Text style={styles.description}>
            {dueDate.toLocaleDateString("pt-BR")} às{" "}
            {dueDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            {todo.notifyEnabled ? " · lembrete ativado 🔔" : ""}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.editButton, styles.actionsSpacing]}
        onPress={() => navigation.navigate("TodoForm", { id: todo.id })}
      >
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
        <Text style={styles.deleteButtonText}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  notFound: { color: "#666", fontSize: 15, marginTop: 40, textAlign: "center" },
  title: { fontSize: 20, fontWeight: "700", color: "#111", marginBottom: 12 },
  statusPill: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12 },
  pillDone: { backgroundColor: "#E6F4EA" },
  pillPending: { backgroundColor: "#FFF6DA" },
  statusText: { fontSize: 13, fontWeight: "600", color: "#333" },
  section: { marginTop: 16 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#888", textTransform: "uppercase" },
  description: { fontSize: 15, color: "#333", marginTop: 4, lineHeight: 20 },
  actionsSpacing: { marginTop: 32 },
  editButton: {
    backgroundColor: "#F5C400",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  editButtonText: { fontSize: 16, fontWeight: "700", color: "#111" },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#D32F2F",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteButtonText: { fontSize: 16, fontWeight: "700", color: "#D32F2F" },
});
