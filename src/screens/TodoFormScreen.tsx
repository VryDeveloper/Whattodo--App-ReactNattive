import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DateTimeField } from "../components/DateTimeField";
import { useTodos } from "../context/TodoContext";
import { RootStackParamList } from "../navigation/types";
import { validateTitle } from "../utils/validation";

type Props = NativeStackScreenProps<RootStackParamList, "TodoForm">;

export function TodoFormScreen({ route, navigation }: Props) {
  const { getTodoById, addTodo, editTodo } = useTodos();
  const editingId = route.params?.id;
  const existing = editingId ? getTodoById(editingId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [completed, setCompleted] = useState(existing?.completed ?? false);
  const [dueDate, setDueDate] = useState<Date | null>(
    existing?.dueDate ? new Date(existing.dueDate) : null
  );
  const [notifyEnabled, setNotifyEnabled] = useState(existing?.notifyEnabled ?? false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleDueDateChange(next: Date | null) {
    setDueDate(next);
    if (!next) {
      // Sem data não há lembrete possível.
      setNotifyEnabled(false);
    }
    if (next) setNotifyError(null);
  }

  function handleNotifyToggle(value: boolean) {
    if (value && !dueDate) {
      setNotifyError("Defina uma data e hora para ativar o lembrete.");
      return;
    }
    setNotifyError(null);
    setNotifyEnabled(value);
  }

  async function handleSave() {
    const titleValidationError = validateTitle(title);
    if (titleValidationError) {
      setTitleError(titleValidationError);
      return;
    }
    if (notifyEnabled && !dueDate) {
      setNotifyError("Defina uma data e hora para ativar o lembrete.");
      return;
    }
    setTitleError(null);
    setSaving(true);
    try {
      const data = {
        title,
        completed,
        description: description.trim(),
        dueDate: dueDate ? dueDate.toISOString() : null,
        notifyEnabled,
      };
      if (editingId) {
        await editTodo(editingId, data);
      } else {
        await addTodo(data);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={[styles.input, titleError ? styles.inputError : null]}
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (titleError) setTitleError(null);
        }}
        placeholder="Ex.: Comprar leite"
        maxLength={120}
      />
      {titleError && <Text style={styles.errorText}>{titleError}</Text>}

      <Text style={[styles.label, styles.sectionSpacing]}>Descrição (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Detalhes sobre a tarefa..."
        maxLength={500}
        multiline
        numberOfLines={4}
      />

      <View style={styles.sectionSpacing}>
        <DateTimeField label="Data e hora (opcional)" value={dueDate} onChange={handleDueDateChange} />
      </View>

      <View style={[styles.switchRow, styles.sectionSpacing]}>
        <View style={styles.switchLabelBox}>
          <Text style={styles.label}>Notificar na hora da tarefa</Text>
          {notifyError && <Text style={styles.errorText}>{notifyError}</Text>}
        </View>
        <Switch value={notifyEnabled} onValueChange={handleNotifyToggle} />
      </View>

      <View style={[styles.switchRow, styles.sectionSpacing]}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 40 },
  sectionSpacing: { marginTop: 24 },
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
  textArea: { minHeight: 90, textAlignVertical: "top" },
  inputError: { borderColor: "#D32F2F" },
  errorText: { color: "#D32F2F", fontSize: 13, marginTop: 6 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabelBox: { flex: 1, paddingRight: 12 },
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
