import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * @react-native-community/datetimepicker não tem implementação para web
 * (renderiza null com um warning). Para o app funcionar tanto no celular
 * quanto no navegador, usamos o seletor nativo em iOS/Android e caímos
 * para os inputs HTML nativos de data/hora no web.
 */
export function DateTimeField({ label, value, onChange }: Props) {
  if (Platform.OS === "web") {
    return <WebDateTimeField label={label} value={value} onChange={onChange} />;
  }
  return <NativeDateTimeField label={label} value={value} onChange={onChange} />;
}

function NativeDateTimeField({ label, value, onChange }: Props) {
  const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    const mode = pickerMode;
    setPickerMode(null);
    if (event.type !== "set" || !selected) return;

    const next = new Date(value ?? new Date());
    if (mode === "date") {
      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    } else {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    }
    onChange(next);
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.fieldButton} onPress={() => setPickerMode("date")}>
          <Text style={styles.fieldText}>{value ? formatDate(value) : "Selecionar data"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fieldButton} onPress={() => setPickerMode("time")}>
          <Text style={styles.fieldText}>{value ? formatTime(value) : "Selecionar hora"}</Text>
        </TouchableOpacity>
        {value && (
          <TouchableOpacity style={styles.clearButton} onPress={() => onChange(null)}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>
      {pickerMode && (
        <DateTimePicker
          value={value ?? new Date()}
          mode={pickerMode}
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const webInputStyle = {
  padding: 8,
  fontSize: 14,
  borderRadius: 8,
  border: "1px solid #DDD",
  fontFamily: "inherit",
};

function WebDateTimeField({ label, value, onChange }: Props) {
  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value; // "YYYY-MM-DD"
    if (!raw) {
      onChange(null);
      return;
    }
    const [year, month, day] = raw.split("-").map(Number);
    const next = new Date(value ?? new Date());
    next.setFullYear(year, month - 1, day);
    onChange(next);
  }

  function handleTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value; // "HH:MM"
    if (!raw) return;
    const [hours, minutes] = raw.split(":").map(Number);
    const next = new Date(value ?? new Date());
    next.setHours(hours, minutes, 0, 0);
    onChange(next);
  }

  const dateValue = value ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}` : "";
  const timeValue = value ? `${pad(value.getHours())}:${pad(value.getMinutes())}` : "";

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <input type="date" value={dateValue} onChange={handleDateChange} style={webInputStyle} />
        <input type="time" value={timeValue} onChange={handleTimeChange} style={webInputStyle} />
        {value && (
          <TouchableOpacity style={styles.clearButton} onPress={() => onChange(null)}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  fieldButton: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldText: { fontSize: 14, color: "#111" },
  clearButton: { paddingHorizontal: 8, paddingVertical: 10 },
  clearButtonText: { color: "#D32F2F", fontSize: 13, fontWeight: "600" },
});
