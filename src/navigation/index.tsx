import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Text } from "react-native";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TodoDetailScreen } from "../screens/TodoDetailScreen";
import { TodoFormScreen } from "../screens/TodoFormScreen";
import { TodoListScreen } from "../screens/TodoListScreen";
import { RootStackParamList, RootTabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const headerOptions = {
  headerStyle: { backgroundColor: "#111111" },
  headerTintColor: "#F5C400",
  headerTitleStyle: { fontWeight: "700" as const },
};

function TabIcon({ symbol, color }: { symbol: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{symbol}</Text>;
}

function TarefasStackNavigator() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="TodoList" component={TodoListScreen} options={{ title: "Tarefas" }} />
      <Stack.Screen name="TodoDetail" component={TodoDetailScreen} options={{ title: "Detalhe" }} />
      <Stack.Screen
        name="TodoForm"
        component={TodoFormScreen}
        options={({ route }) => ({ title: route.params?.id ? "Editar tarefa" : "Nova tarefa" })}
      />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#F5C400",
          tabBarInactiveTintColor: "#888",
          tabBarStyle: { backgroundColor: "#111111" },
        }}
      >
        <Tab.Screen
          name="TarefasTab"
          component={TarefasStackNavigator}
          options={{
            title: "Tarefas",
            headerShown: false,
            tabBarIcon: ({ color }) => <TabIcon symbol="✓" color={color} />,
          }}
        />
        <Tab.Screen
          name="ConfiguracoesTab"
          component={SettingsScreen}
          options={{
            title: "Configurações",
            ...headerOptions,
            tabBarIcon: ({ color }) => <TabIcon symbol="⚙" color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
