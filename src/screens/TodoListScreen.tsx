import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SearchBar } from "../components/SearchBar";
import { TodoItem } from "../components/TodoItem";
import { useSettings } from "../context/SettingsContext";
import { useTodos } from "../context/TodoContext";
import { RootStackParamList } from "../navigation/types";
import { Todo } from "../types/todo";

type Props = NativeStackScreenProps<RootStackParamList, "TodoList">;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function TodoListScreen({ navigation }: Props) {
  const { todos, status, errorMessage, refresh, toggleCompleted, removeTodo } = useTodos();
  const { settings } = useSettings();
  const [query, setQuery] = useState("");

  function handleToggleComplete(todo: Todo) {
    // Anima a transição do item até a área de concluídas ao reordenar a lista.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleCompleted(todo.id);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? todos.filter((t) => t.title.toLowerCase().includes(q)) : todos;
    if (!settings.sortPendingFirst) return base;
    // Ordenação local (só reordena o que já está em memória, sem nova busca).
    return [...base].sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [todos, query, settings.sortPendingFirst]);

  function handleOpenDetail(todo: Todo) {
    navigation.navigate("TodoDetail", { id: todo.id });
  }

  function handleDelete(todo: Todo) {
    Alert.alert(
      "Excluir tarefa",
      `Tem certeza de que deseja excluir "${todo.title}"? Essa ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => removeTodo(todo.id) },
      ]
    );
  }

  function renderContent() {
    if (status === "loading" && todos.length === 0) {
      return <LoadingState />;
    }
    if (status === "error" && todos.length === 0) {
      return <ErrorState message={errorMessage ?? "Erro desconhecido."} onRetry={refresh} />;
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          message={query ? "Nenhuma tarefa corresponde à busca." : "Nenhuma tarefa cadastrada ainda."}
        />
      );
    }
    return (
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onPress={handleOpenDetail}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        )}
        onRefresh={refresh}
        refreshing={status === "loading"}
      />
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar value={query} onChangeText={setQuery} />
      {renderContent()}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("TodoForm", undefined)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5C400",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { fontSize: 28, color: "#111", fontWeight: "700", marginTop: -2 },
});
