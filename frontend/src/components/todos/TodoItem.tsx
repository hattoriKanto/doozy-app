import { cn } from '../../utils/cn'

type TodoItemProps = {
  title: string
  description: string | null
  categoryName: string
  isCompleted: boolean
  isPendingDeletion: boolean
  onToggleComplete: () => void
  onDelete: () => void
}

export const TodoItem: React.FC<TodoItemProps> = ({
  title,
  description,
  categoryName,
  isCompleted,
  isPendingDeletion,
  onToggleComplete,
  onDelete,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-opacity duration-300',
        isPendingDeletion && 'opacity-50',
      )}
    >
      <input
        type="checkbox"
        checked={isCompleted}
        disabled={isPendingDeletion}
        onChange={onToggleComplete}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
        aria-label="Mark as completed"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium text-gray-900',
            isCompleted && 'text-gray-400 line-through',
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              'mt-0.5 text-xs text-gray-500',
              isCompleted && 'line-through',
            )}
          >
            {description}
          </p>
        )}
      </div>
      <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        {categoryName}
      </span>
      <button
        type="button"
        onClick={onDelete}
        disabled={isPendingDeletion}
        className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Delete task"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  )
}
