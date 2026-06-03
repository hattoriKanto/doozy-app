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
  onToggleComplete: (todoId: string) => void
  onDelete: (todoId: string) => void
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  loading,
  error,
  categoryNameMap,
  pendingDeletionIds,
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

  return (
    <div className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          title={todo.title}
          description={todo.description}
          categoryName={categoryNameMap.get(todo.categoryId) ?? 'Unknown'}
          isCompleted={todo.status === 'completed'}
          isPendingDeletion={pendingDeletionIds.has(todo.id)}
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
