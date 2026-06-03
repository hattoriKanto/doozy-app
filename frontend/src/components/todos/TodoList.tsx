import type { Todo } from '../../types/todo'
import { EmptyState } from '../ui/EmptyState'
import { ErrorMessage } from '../ui/ErrorMessage'
import { Spinner } from '../ui/Spinner'
import { TodoItem } from './TodoItem'

type TodoListProps = {
  todos: Todo[]
  loading: boolean
  error: string | null
  categoryNameMap: Map<string, string>
  pendingDeletionIds: Set<string>
  selectedTodoIds: Set<string>
  onToggleSelect: (todoId: string) => void
  onToggleSelectAll: () => void
  onToggleComplete: (todoId: string) => void
  onDelete: (todoId: string) => void
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  loading,
  error,
  categoryNameMap,
  pendingDeletionIds,
  selectedTodoIds,
  onToggleSelect,
  onToggleSelectAll,
  onToggleComplete,
  onDelete,
}) => {
  if (loading) {
    return <Spinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (todos.length === 0) {
    return <EmptyState />
  }

  const selectableTodos = todos.filter((t) => !pendingDeletionIds.has(t.id))
  const allSelected =
    selectableTodos.length > 0 &&
    selectableTodos.every((t) => selectedTodoIds.has(t.id))

  return (
    <div className="flex flex-col gap-2">
      {selectableTodos.length > 0 && (
        <label className="flex items-center gap-2 px-1 py-1 text-sm text-gray-500">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleSelectAll}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          {'Select all'}
        </label>
      )}
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          title={todo.title}
          description={todo.description}
          categoryName={categoryNameMap.get(todo.categoryId) ?? 'Unknown'}
          isCompleted={todo.status === 'completed'}
          isPendingDeletion={pendingDeletionIds.has(todo.id)}
          isSelected={selectedTodoIds.has(todo.id)}
          onToggleSelect={() => {
            onToggleSelect(todo.id)
          }}
          onToggleComplete={() => {
            onToggleComplete(todo.id)
          }}
          onDelete={() => {
            onDelete(todo.id)
          }}
        />
      ))}
    </div>
  )
}
