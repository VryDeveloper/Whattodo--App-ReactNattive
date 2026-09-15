import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SettingsProvider } from "./src/context/SettingsContext";
import { TodoProvider } from "./src/context/TodoContext";
import { RootNavigator } from "./src/navigation";
import { initNotifications } from "./src/services/notifications";

export default function App() {
  useEffect(() => {
    initNotifications();
  }, []);

  return (
    <SettingsProvider>
      <TodoProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </TodoProvider>
    </SettingsProvider>
  );
}
