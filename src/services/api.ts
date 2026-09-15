import { NewTodo, Todo } from "../types/todo";

const BASE_URL = "https://jsonplaceholder.typicode.com";

// Quantidade de itens buscados na listagem inicial. O JSONPlaceholder tem
// 200 registros fixos; limitamos para manter a lista enxuta no app.
const LIST_LIMIT = 20;

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Erro na API (HTTP ${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/todos?_limit=${LIST_LIMIT}`);
  return handle<Todo[]>(res);
}

/**
 * O JSONPlaceholder SIMULA a criação: sempre responde 201 com um objeto,
 * mas não persiste nada de verdade no servidor. Por isso o app não confia
 * no id retornado por aqui para nada além de log — o id "real" usado na
 * lista e no storage é gerado localmente (ver TodoContext).
 */
export async function createTodoRemote(todo: NewTodo): Promise<Todo> {
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
