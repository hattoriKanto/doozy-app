import { Trash2 } from 'lucide-react'
import { cn } from '../../utils/cn'

type TodoItemProps = {
  title: string
  description: string | null
  categoryName: string
  isCompleted: boolean
  isPendingDeletion: boolean
  isSelected: boolean
  onToggleSelect: () => void
  onDelete: () => void
}

export const TodoItem: React.FC<TodoItemProps> = ({
  title,
  description,
  categoryName,
  isCompleted,
  isPendingDeletion,
  isSelected,
  onToggleSelect,
  onDelete,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-opacity duration-300',
        isPendingDeletion && 'opacity-50',
        isSelected && !isPendingDeletion && 'border-blue-300 bg-blue-50/30',
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        disabled={isPendingDeletion}
        onChange={onToggleSelect}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
        aria-label="Select task"
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
        className="shrink-0 cursor-pointer rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
