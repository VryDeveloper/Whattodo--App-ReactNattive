import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Não foi possível carregar</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 17, fontWeight: "700", color: "#111", marginBottom: 6 },
  message: { color: "#666", fontSize: 14, textAlign: "center", marginBottom: 16 },
  button: { backgroundColor: "#F5C400", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: "#111", fontWeight: "700" },
});
