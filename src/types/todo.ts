export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

export type NewTodo = Pick<Todo, "title" | "completed">;

export type LoadStatus = "idle" | "loading" | "success" | "error";
