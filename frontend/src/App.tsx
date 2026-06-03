import { useCallback, useMemo, useState } from 'react'
import { createTodo } from './api/todos'
import { CreateCategoryForm } from './components/categories/CreateCategoryForm'
import { AppLayout } from './components/layout/AppLayout'
import { CreateTodoForm } from './components/todos/CreateTodoForm'
import { TodoFilter } from './components/todos/TodoFilter'
import { TodoList } from './components/todos/TodoList'
import { useCategories } from './hooks/use-categories'
import { useTodos } from './hooks/use-todos'
import type { CreateTodoPayload } from './types/todo'

const emptyPendingSet = new Set<string>()
const noop = () => {}

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
  } = useTodos(selectedCategoryId)

  const categoryNameMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.title])),
    [categories],
  )

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
        pendingDeletionIds={emptyPendingSet}
        onToggleComplete={noop}
        onDelete={noop}
      />
    </AppLayout>
  )
}
