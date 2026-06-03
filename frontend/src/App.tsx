import { useMemo, useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { TodoFilter } from './components/todos/TodoFilter'
import { TodoList } from './components/todos/TodoList'
import { useCategories } from './hooks/use-categories'
import { useTodos } from './hooks/use-todos'

const emptyPendingSet = new Set<string>()
const noop = () => {}

export const App: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )

  const { categories, loading: categoriesLoading } = useCategories()
  const {
    todos,
    loading: todosLoading,
    error: todosError,
  } = useTodos(selectedCategoryId)

  const categoryNameMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.title])),
    [categories],
  )

  return (
    <AppLayout>
      <div className="mb-6">
        <TodoFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onFilterChange={setSelectedCategoryId}
        />
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
