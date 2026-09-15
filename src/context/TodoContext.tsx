import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createTodoRemote,
  deleteTodoRemote,
  fetchTodos,
  updateTodoRemote,
} from "../services/api";
import { cancelTodoReminder, scheduleTodoReminder } from "../services/notifications";
import { loadTodosFromStorage, saveTodosToStorage } from "../services/storage";
import { LoadStatus, NewTodo, Todo } from "../types/todo";
import { useSettings } from "./SettingsContext";

interface TodoContextValue {
  todos: Todo[];
  status: LoadStatus;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  addTodo: (data: NewTodo) => Promise<void>;
  editTodo: (id: number, data: NewTodo) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
  toggleCompleted: (id: number) => Promise<void>;
  clearCompleted: () => Promise<void>;
  getTodoById: (id: number) => Todo | undefined;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

// IDs locais começam bem acima da faixa usada pelo JSONPlaceholder (1-200)
// para nunca colidir com os itens vindos da API.
function generateLocalId(): number {
  return Date.now();
}

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const persist = useCallback(async (next: Todo[]) => {
    setTodos(next);
    await saveTodosToStorage(next);
  }, []);

  // Agenda (ou cancela) o lembrete local da tarefa conforme as preferências
  // atuais do usuário, devolvendo a tarefa já com o notificationId
  // atualizado para ser persistida.
  const syncReminder = useCallback(
    async (todo: Todo): Promise<Todo> => {
      if (!settings.notificationsEnabled) {
        await cancelTodoReminder(todo.notificationId);
        return { ...todo, notificationId: null };
      }
      const notificationId = await scheduleTodoReminder(todo, settings.reminderLeadMinutes);
      return { ...todo, notificationId };
    },
    [settings.notificationsEnabled, settings.reminderLeadMinutes]
  );

  const refresh = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    // 1) Sempre exibe o que já existe em cache local primeiro (permite uso
    //    parcial offline na segunda abertura do app).
    const cached = await loadTodosFromStorage();
    if (cached) {
      setTodos(cached);
    }

    // 2) Tenta buscar dados "frescos" da API pública.
    try {
      const remote = await fetchTodos();
      if (cached) {
        // Mescla: mantém tarefas criadas/editadas localmente que não vieram
        // da API (ids gerados localmente) e atualiza as que vieram dela.
        const remoteIds = new Set(remote.map((t) => t.id));
        const onlyLocal = cached.filter((t) => !remoteIds.has(t.id));
        const merged = [...remote, ...onlyLocal];
        await persist(merged);
      } else {
        await persist(remote);
      }
      setStatus("success");
    } catch (err) {
      // Sem conexão / erro na API: se já havia cache, seguimos com ele.
      setStatus(cached && cached.length > 0 ? "success" : "error");
      setErrorMessage(
        err instanceof Error ? err.message : "Falha ao carregar tarefas."
      );
    }
  }, [persist]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Quando o usuário muda as preferências de notificação (chave geral ou
  // antecedência padrão), reagenda/cancela os lembretes de todas as tarefas
  // já carregadas para refletir a nova configuração. O ref evita disparar
  // essa ressincronização logo no primeiro render.
  const prevSettingsRef = useRef(settings);
  useEffect(() => {
    const prev = prevSettingsRef.current;
    prevSettingsRef.current = settings;
    const changed =
      prev.notificationsEnabled !== settings.notificationsEnabled ||
      prev.reminderLeadMinutes !== settings.reminderLeadMinutes;
    if (!changed || todos.length === 0) return;

    (async () => {
      const withReminders = await Promise.all(todos.map(syncReminder));
      await persist(withReminders);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reagimos a mudanças de settings
  }, [settings.notificationsEnabled, settings.reminderLeadMinutes]);

  const addTodo = useCallback(
    async (data: NewTodo) => {
      const optimistic: Todo = {
        id: generateLocalId(),
        title: data.title.trim(),
        completed: data.completed,
        userId: 1,
        description: data.description.trim(),
        dueDate: data.dueDate,
        notifyEnabled: data.notifyEnabled,
        notificationId: null,
      };
      // A API simula o POST (retorna 201 mas não persiste de verdade).
      // Tratamos a resposta simulada como confirmação e seguimos com o
      // estado local/otimista, que é a fonte de verdade do app.
      try {
        await createTodoRemote({ title: optimistic.title, completed: optimistic.completed });
      } catch {
        // mesmo se a chamada falhar (ex: offline), a tarefa é criada localmente.
      }
      const withReminder = await syncReminder(optimistic);
      await persist([withReminder, ...todos]);
    },
    [todos, persist, syncReminder]
  );

  const editTodo = useCallback(
    async (id: number, data: NewTodo) => {
      const target = todos.find((t) => t.id === id);
      if (!target) return;
      const updated: Todo = {
        ...target,
        title: data.title.trim(),
        completed: data.completed,
        description: data.description.trim(),
        dueDate: data.dueDate,
        notifyEnabled: data.notifyEnabled,
      };
      const withReminder = await syncReminder(updated);
      try {
        await updateTodoRemote(withReminder);
      } catch {
        // segue com a atualização local mesmo se a API simulada falhar.
      }
      await persist(todos.map((t) => (t.id === id ? withReminder : t)));
    },
    [todos, persist, syncReminder]
  );

  const removeTodo = useCallback(
    async (id: number) => {
      const target = todos.find((t) => t.id === id);
      if (target) await cancelTodoReminder(target.notificationId);
      try {
        await deleteTodoRemote(id);
      } catch {
        // segue com a remoção local mesmo se a API simulada falhar.
      }
      await persist(todos.filter((t) => t.id !== id));
    },
    [todos, persist]
  );

  const toggleCompleted = useCallback(
    async (id: number) => {
      const target = todos.find((t) => t.id === id);
      if (!target) return;
      const toggled: Todo = { ...target, completed: !target.completed };
      // Concluir cancela o lembrete; reabrir a tarefa reagenda, se aplicável.
      const withReminder = await syncReminder(toggled);
      try {
        await updateTodoRemote(withReminder);
      } catch {
        // segue com a atualização local mesmo se a API simulada falhar.
      }
      await persist(todos.map((t) => (t.id === id ? withReminder : t)));
    },
    [todos, persist, syncReminder]
  );

  const clearCompleted = useCallback(async () => {
    const completed = todos.filter((t) => t.completed);
    await Promise.all(completed.map((t) => cancelTodoReminder(t.notificationId)));
    await persist(todos.filter((t) => !t.completed));
  }, [todos, persist]);

  const getTodoById = useCallback(
    (id: number) => todos.find((t) => t.id === id),
    [todos]
  );

  const value = useMemo(
    () => ({
      todos,
      status,
      errorMessage,
      refresh,
      addTodo,
      editTodo,
      removeTodo,
      toggleCompleted,
      clearCompleted,
      getTodoById,
    }),
    [
      todos,
      status,
      errorMessage,
      refresh,
      addTodo,
      editTodo,
      removeTodo,
      toggleCompleted,
      clearCompleted,
      getTodoById,
    ]
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error("useTodos deve ser usado dentro de um TodoProvider");
  }
  return ctx;
}
