import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  message?: string;
}

export function EmptyState({ message = "Nenhuma tarefa encontrada." }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  text: { color: "#777", fontSize: 15, textAlign: "center" },
});
