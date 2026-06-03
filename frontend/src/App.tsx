import { useCallback, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { createTodo, deleteTodo, updateTodos } from './api/todos'
import { CreateCategoryForm } from './components/categories/CreateCategoryForm'
import { AppLayout } from './components/layout/AppLayout'
import { CreateTodoForm } from './components/todos/CreateTodoForm'
import { TodoFilter } from './components/todos/TodoFilter'
import { TodoList } from './components/todos/TodoList'
import { useCategories } from './hooks/use-categories'
import { useDelayedDelete } from './hooks/use-delayed-delete'
import { useTodos } from './hooks/use-todos'
import type { CreateTodoPayload, TodoStatus } from './types/todo'

export const App: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )

  const {
    categories,
    loading: categoriesLoading,
    addCategory,
  } = useCategories()
  const {
    todos,
    loading: todosLoading,
    error: todosError,
    addTodo,
    removeTodo,
    updateTodoStatus,
  } = useTodos(selectedCategoryId)

  const categoryNameMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.title])),
    [categories],
  )

  const handleStatusChange = useCallback(
    async (todoId: string, status: TodoStatus) => {
      await updateTodos({ todos: [{ id: todoId, status }] })
      updateTodoStatus(todoId, status)
    },
    [updateTodoStatus],
  )

  const handleDelete = useCallback(
    async (todoId: string) => {
      await deleteTodo(todoId)
      removeTodo(todoId)
    },
    [removeTodo],
  )

  const { completeTodo, pendingDeletionIds } = useDelayedDelete({
    onStatusChange: handleStatusChange,
    onDelete: handleDelete,
  })

  const handleCreateTodo = useCallback(
    async (payload: CreateTodoPayload) => {
      const todo = await createTodo(payload)
      if (
        selectedCategoryId === null ||
        selectedCategoryId === payload.categoryId
      ) {
        addTodo(todo)
      }
      return todo
    },
    [selectedCategoryId, addTodo],
  )

  const handleToggleComplete = useCallback(
    (todoId: string) => {
      const todo = todos.find((t) => t.id === todoId)
      if (!todo || pendingDeletionIds.has(todoId)) {
        return
      }
      if (todo.status === 'notCompleted') {
        completeTodo(todoId).catch(() => {
          toast.error('Failed to complete task')
        })
      }
    },
    [todos, pendingDeletionIds, completeTodo],
  )

  const handleImmediateDelete = useCallback(
    (todoId: string) => {
      if (pendingDeletionIds.has(todoId)) {
        return
      }
      handleDelete(todoId).catch(() => {
        toast.error('Failed to delete task')
      })
    },
    [pendingDeletionIds, handleDelete],
  )

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <TodoFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onFilterChange={setSelectedCategoryId}
        />
        <CreateCategoryForm onSubmit={addCategory} />
      </div>

      <div className="mb-6">
        <CreateTodoForm categories={categories} onSubmit={handleCreateTodo} />
      </div>

      <TodoList
        todos={todos}
        loading={todosLoading || categoriesLoading}
        error={todosError}
        categoryNameMap={categoryNameMap}
        pendingDeletionIds={pendingDeletionIds}
        onToggleComplete={handleToggleComplete}
        onDelete={handleImmediateDelete}
      />
    </AppLayout>
  )
}
