import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Todo } from "../types/todo";

interface Props {
  todo: Todo;
  onPress: (todo: Todo) => void;
}

export function TodoItem({ todo, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(todo)} activeOpacity={0.7}>
      <View style={[styles.badge, todo.completed ? styles.badgeDone : styles.badgePending]} />
      <View style={styles.content}>
        <Text style={[styles.title, todo.completed && styles.titleDone]} numberOfLines={2}>
          {todo.title}
        </Text>
        <Text style={styles.status}>{todo.completed ? "Concluída" : "Pendente"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  badge: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  badgeDone: { backgroundColor: "#2E7D32" },
  badgePending: { backgroundColor: "#F5C400" },
  content: { flex: 1 },
  title: { fontSize: 15, color: "#111", fontWeight: "500" },
  titleDone: { textDecorationLine: "line-through", color: "#888" },
  status: { fontSize: 12, color: "#888", marginTop: 2 },
});
