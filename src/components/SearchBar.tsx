import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

/**
 * Busca 100% local: filtra o array já carregado em memória, sem disparar
 * nenhuma chamada à API a cada tecla digitada.
 */
export function SearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar tarefas..."
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: "#fff" },
  input: {
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
  },
});
