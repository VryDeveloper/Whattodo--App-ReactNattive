import AsyncStorage from "@react-native-async-storage/async-storage";
import { Todo } from "../types/todo";

const STORAGE_KEY = "@horizon-todo/tasks";

export async function loadTodosFromStorage(): Promise<Todo[] | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Todo[];
  } catch {
    return null;
  }
}

export async function saveTodosToStorage(todos: Todo[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
