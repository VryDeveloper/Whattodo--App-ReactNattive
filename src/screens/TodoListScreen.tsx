import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { SearchBar } from "../components/SearchBar";
import { TodoItem } from "../components/TodoItem";
import { useTodos } from "../context/TodoContext";
import { RootStackParamList } from "../navigation/types";
import { Todo } from "../types/todo";

type Props = NativeStackScreenProps<RootStackParamList, "TodoList">;

export function TodoListScreen({ navigation }: Props) {
  const { todos, status, errorMessage, refresh } = useTodos();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return todos;
    return todos.filter((t) => t.title.toLowerCase().includes(q));
  }, [todos, query]);

  function handleOpenDetail(todo: Todo) {
    navigation.navigate("TodoDetail", { id: todo.id });
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
        renderItem={({ item }) => <TodoItem todo={item} onPress={handleOpenDetail} />}
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
