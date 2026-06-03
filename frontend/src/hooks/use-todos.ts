import { useCallback, useEffect, useState } from 'react'
import { getTodos } from '../api/todos'
import type { Todo, TodoStatus } from '../types/todo'

export const useTodos = (categoryId: string | null) => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = useCallback(() => {
    setLoading(true)
    setError(null)
    getTodos(categoryId ?? undefined)
      .then(setTodos)
      .catch((err: Error) => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [categoryId])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const addTodo = useCallback((todo: Todo) => {
    setTodos((prev) => [todo, ...prev])
  }, [])

  const removeTodo = useCallback((todoId: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== todoId))
  }, [])

  const updateTodoStatus = useCallback((todoId: string, status: TodoStatus) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, status } : t)),
    )
  }, [])

  return {
    todos,
    loading,
    error,
    refetch: fetchTodos,
    addTodo,
    removeTodo,
    updateTodoStatus,
  }
}
