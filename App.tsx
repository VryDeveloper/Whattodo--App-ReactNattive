import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SettingsProvider } from "./src/context/SettingsContext";
import { TodoProvider } from "./src/context/TodoContext";
import { useNotificationResponseListener } from "./src/hooks/useNotificationResponseListener";
import { RootNavigator } from "./src/navigation";
import { initNotifications } from "./src/services/notifications";

// Precisa estar dentro do TodoProvider para poder usar useTodos() ao reagir
// às ações da notificação (adiar/concluir).
function AppContent() {
  useNotificationResponseListener();
  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  useEffect(() => {
    initNotifications();
  }, []);

  return (
    <SettingsProvider>
      <TodoProvider>
        <AppContent />
      </TodoProvider>
    </SettingsProvider>
  );
}
