import type { CreateTodoPayload, Todo, UpdateTodosPayload } from '../types/todo'
import { apiClient } from './client'

export const getTodos = (categoryId?: string): Promise<Todo[]> =>
  apiClient
    .get<Todo[]>('/todos', { params: { categoryId } })
    .then(({ data }) => data)

export const createTodo = (payload: CreateTodoPayload): Promise<Todo> =>
  apiClient.post<Todo>('/todos', payload).then(({ data }) => data)

export const updateTodos = (payload: UpdateTodosPayload): Promise<Todo[]> =>
  apiClient.patch<Todo[]>('/todos', payload).then(({ data }) => data)

export const deleteTodo = (todoId: string): Promise<Todo> =>
  apiClient.delete<Todo>(`/todos/${todoId}`).then(({ data }) => data)
