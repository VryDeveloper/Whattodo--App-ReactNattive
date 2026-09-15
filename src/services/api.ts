import { NewTodo, Todo } from "../types/todo";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// Quantidade de itens buscados na listagem inicial. Mantemos a lista
// enxuta (4 pendentes + 2 concluídas) para servir só como exemplo inicial.
const LIST_LIMIT = 6;

// O JSONPlaceholder devolve títulos em "lorem ipsum" sem sentido nenhum
// (ex: "delectus aut autem") e um `completed` aleatório. Como isso é só
// para popular a listagem inicial, substituímos por tarefas reais do dia a
// dia com uma situação (pendente/concluída) fixa e conhecida, mantendo
// apenas id/userId vindos da API.
const DAILY_TASKS: { title: string; completed: boolean }[] = [
  { title: "Comprar leite", completed: false },
  { title: "Levar o cachorro para passear", completed: false },
  { title: "Pagar a conta de luz", completed: false },
  { title: "Estudar para a prova", completed: false },
  { title: "Lavar a louça", completed: true },
  { title: "Regar as plantas", completed: true },
];

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Erro na API (HTTP ${res.status})`);
  }
  return res.json() as Promise<T>;
}

/**
 * O JSONPlaceholder só conhece `id`, `title`, `completed` e `userId`.
 * Descrição, data/hora e notificação são extensões locais deste app, então
 * completamos cada item da API com os valores padrão desses campos. Título
 * e situação (concluída ou não) vêm da lista local `DAILY_TASKS`, para que
 * a listagem inicial mostre sempre o mesmo cenário de exemplo.
 */
function withLocalDefaults(todo: Todo, index: number): Todo {
  const seed = DAILY_TASKS[index % DAILY_TASKS.length];
  return {
    ...todo,
    title: seed.title,
    completed: seed.completed,
    description: todo.description ?? "",
    dueDate: todo.dueDate ?? null,
    notifyEnabled: todo.notifyEnabled ?? false,
    notificationId: todo.notificationId ?? null,
  };
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/todos?_limit=${LIST_LIMIT}`);
  const remote = await handle<Todo[]>(res);
  return remote.map(withLocalDefaults);
}

/**
 * O JSONPlaceholder SIMULA a criação: sempre responde 201 com um objeto,
 * mas não persiste nada de verdade no servidor. Por isso o app não confia
 * no id retornado por aqui para nada além de log — o id "real" usado na
 * lista e no storage é gerado localmente (ver TodoContext).
 */
export async function createTodoRemote(
  todo: Pick<NewTodo, "title" | "completed">
): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...todo, userId: 1 }),
  });
  return handle<Todo>(res);
}

export async function updateTodoRemote(todo: Todo): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos/${todo.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  return handle<Todo>(res);
}

export async function deleteTodoRemote(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/todos/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Erro na API (HTTP ${res.status})`);
  }
}
