import { useCallback, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { createTodo, deleteTodo, updateTodos } from './api/todos'
import { CreateCategoryForm } from './components/categories/CreateCategoryForm'
import { AppLayout } from './components/layout/AppLayout'
import { BulkActionsBar } from './components/todos/BulkActionsBar'
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
  const [selectedTodoIds, setSelectedTodoIds] = useState<Set<string>>(new Set())
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

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

  const handleBatchStatusChange = useCallback(
    async (todoIds: string[], status: TodoStatus) => {
      await updateTodos({
        todos: todoIds.map((id) => ({ id, status })),
      })
      for (const todoId of todoIds) {
        updateTodoStatus(todoId, status)
      }
    },
    [updateTodoStatus],
  )

  const handleDelete = useCallback(
    async (todoId: string) => {
      await deleteTodo(todoId)
      removeTodo(todoId)
      setSelectedTodoIds((prev) => {
        const next = new Set(prev)
        next.delete(todoId)
        return next
      })
    },
    [removeTodo],
  )

  const { completeTodo, completeTodos, pendingDeletionIds } = useDelayedDelete({
    onStatusChange: handleStatusChange,
    onBatchStatusChange: handleBatchStatusChange,
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
        completeTodo(todoId)
        setSelectedTodoIds((prev) => {
          const next = new Set(prev)
          next.delete(todoId)
          return next
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

  const handleToggleSelect = useCallback((todoId: string) => {
    setSelectedTodoIds((prev) => {
      const next = new Set(prev)
      if (next.has(todoId)) {
        next.delete(todoId)
      } else {
        next.add(todoId)
      }
      return next
    })
  }, [])

  const handleToggleSelectAll = useCallback(() => {
    const selectableTodos = todos.filter((t) => !pendingDeletionIds.has(t.id))
    const allSelected = selectableTodos.every((t) => selectedTodoIds.has(t.id))
    if (allSelected) {
      setSelectedTodoIds(new Set())
    } else {
      setSelectedTodoIds(new Set(selectableTodos.map((t) => t.id)))
    }
  }, [todos, pendingDeletionIds, selectedTodoIds])

  const handleBulkMarkAsDone = useCallback(async () => {
    const idsToComplete = [...selectedTodoIds].filter(
      (id) => !pendingDeletionIds.has(id),
    )
    if (idsToComplete.length === 0) {
      return
    }
    setIsBulkProcessing(true)
    try {
      await completeTodos(idsToComplete)
      setSelectedTodoIds(new Set())
    } finally {
      setIsBulkProcessing(false)
    }
  }, [selectedTodoIds, pendingDeletionIds, completeTodos])

  const handleClearSelection = useCallback(() => {
    setSelectedTodoIds(new Set())
  }, [])

  const handleFilterChange = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId)
    setSelectedTodoIds(new Set())
  }, [])

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <TodoFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onFilterChange={handleFilterChange}
        />
        <CreateCategoryForm onSubmit={addCategory} />
      </div>

      <div className="mb-6">
        <CreateTodoForm categories={categories} onSubmit={handleCreateTodo} />
      </div>

      <div className="mb-3">
        <BulkActionsBar
          selectedCount={selectedTodoIds.size}
          onMarkAsDone={handleBulkMarkAsDone}
          onClearSelection={handleClearSelection}
          isProcessing={isBulkProcessing}
        />
      </div>

      <TodoList
        todos={todos}
        loading={todosLoading || categoriesLoading}
        error={todosError}
        categoryNameMap={categoryNameMap}
        pendingDeletionIds={pendingDeletionIds}
        selectedTodoIds={selectedTodoIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleComplete={handleToggleComplete}
        onDelete={handleImmediateDelete}
      />
    </AppLayout>
  )
}
