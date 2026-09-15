import { StatusBar } from "expo-status-bar";
import React from "react";
import { TodoProvider } from "./src/context/TodoContext";
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    <TodoProvider>
      <StatusBar style="light" backgroundColor="#111111" />
      <RootNavigator />
    </TodoProvider>
  );
}
