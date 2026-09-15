import { StatusBar } from "expo-status-bar";
import React from "react";
import { SettingsProvider } from "./src/context/SettingsContext";
import { TodoProvider } from "./src/context/TodoContext";
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    <SettingsProvider>
      <TodoProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </TodoProvider>
    </SettingsProvider>
  );
}
