export type TodoStatus = 'completed' | 'notCompleted'

export type Todo = {
  id: string
  title: string
  description: string | null
  status: TodoStatus
  categoryId: string
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export type CreateTodoPayload = {
  title: string
  description: string | null
  categoryId: string
}

export type UpdateTodosPayload = {
  todos: { id: string; status: TodoStatus }[]
}

export type CreateCategoryPayload = {
  title: string
}
