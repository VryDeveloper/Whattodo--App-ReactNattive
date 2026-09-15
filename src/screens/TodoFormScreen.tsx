import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTodos } from "../context/TodoContext";
import { RootStackParamList } from "../navigation/types";
import { validateTitle } from "../utils/validation";

type Props = NativeStackScreenProps<RootStackParamList, "TodoForm">;

export function TodoFormScreen({ route, navigation }: Props) {
  const { getTodoById, addTodo, editTodo } = useTodos();
  const editingId = route.params?.id;
  const existing = editingId ? getTodoById(editingId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [completed, setCompleted] = useState(existing?.completed ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const validationError = validateTitle(title);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (editingId) {
        await editTodo(editingId, { title, completed });
      } else {
        await addTodo({ title, completed });
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (error) setError(null);
        }}
        placeholder="Ex.: Comprar leite"
        maxLength={120}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Concluída</Text>
        <Switch value={completed} onValueChange={setCompleted} />
      </View>

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>{saving ? "Salvando..." : "Salvar"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
  },
  inputError: { borderColor: "#D32F2F" },
  errorText: { color: "#D32F2F", fontSize: 13, marginTop: 6 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  button: {
    marginTop: 32,
    backgroundColor: "#F5C400",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#111" },
});
