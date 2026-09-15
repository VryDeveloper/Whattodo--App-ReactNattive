import AsyncStorage from "@react-native-async-storage/async-storage";
import { Todo } from "../types/todo";

const STORAGE_KEY = "@horizon-todo/tasks";

// Preenche os campos novos (description/dueDate/notifyEnabled/notificationId)
// caso o cache local tenha sido salvo por uma versão anterior do app.
function withLocalDefaults(todo: Todo): Todo {
  return {
    ...todo,
    description: todo.description ?? "",
    dueDate: todo.dueDate ?? null,
    notifyEnabled: todo.notifyEnabled ?? false,
    notificationId: todo.notificationId ?? null,
  };
}

export async function loadTodosFromStorage(): Promise<Todo[] | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Todo[];
    return parsed.map(withLocalDefaults);
  } catch {
    return null;
  }
}

export async function saveTodosToStorage(todos: Todo[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
