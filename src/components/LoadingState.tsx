import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function LoadingState() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#111111" />
      <Text style={styles.text}>Carregando tarefas...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  text: { marginTop: 12, color: "#555", fontSize: 15 },
});
