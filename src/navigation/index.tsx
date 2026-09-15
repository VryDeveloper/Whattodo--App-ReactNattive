import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { TodoDetailScreen } from "../screens/TodoDetailScreen";
import { TodoFormScreen } from "../screens/TodoFormScreen";
import { TodoListScreen } from "../screens/TodoListScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#111111" },
          headerTintColor: "#F5C400",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="TodoList" component={TodoListScreen} options={{ title: "Tarefas" }} />
        <Stack.Screen name="TodoDetail" component={TodoDetailScreen} options={{ title: "Detalhe" }} />
        <Stack.Screen
          name="TodoForm"
          component={TodoFormScreen}
          options={({ route }) => ({ title: route.params?.id ? "Editar tarefa" : "Nova tarefa" })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
