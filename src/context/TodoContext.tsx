import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createTodoRemote,
  deleteTodoRemote,
  fetchTodos,
  updateTodoRemote,
} from "../services/api";
import { loadTodosFromStorage, saveTodosToStorage } from "../services/storage";
import { LoadStatus, NewTodo, Todo } from "../types/todo";

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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const persist = useCallback(async (next: Todo[]) => {
    setTodos(next);
    await saveTodosToStorage(next);
  }, []);

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
      await persist([optimistic, ...todos]);
    },
    [todos, persist]
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
      try {
        await updateTodoRemote(updated);
      } catch {
        // segue com a atualização local mesmo se a API simulada falhar.
      }
      await persist(todos.map((t) => (t.id === id ? updated : t)));
    },
    [todos, persist]
  );

  const removeTodo = useCallback(
    async (id: number) => {
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
      const updated: Todo = { ...target, completed: !target.completed };
      try {
        await updateTodoRemote(updated);
      } catch {
        // segue com a atualização local mesmo se a API simulada falhar.
      }
      await persist(todos.map((t) => (t.id === id ? updated : t)));
    },
    [todos, persist]
  );

  const clearCompleted = useCallback(async () => {
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
