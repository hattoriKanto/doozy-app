import { useCallback, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import type { TodoStatus } from '../types/todo'

const completionDelayMs = 5000

type UseDelayedDeleteArgs = {
  onStatusChange: (todoId: string, status: TodoStatus) => Promise<void>
  onDelete: (todoId: string) => Promise<void>
}

export const useDelayedDelete = ({
  onStatusChange,
  onDelete,
}: UseDelayedDeleteArgs) => {
  const cancelledIdsRef = useRef<Set<string>>(new Set())
  const [pendingDeletionIds, setPendingDeletionIds] = useState<Set<string>>(
    new Set(),
  )

  const removePending = useCallback((todoId: string) => {
    setPendingDeletionIds((prev) => {
      const next = new Set(prev)
      next.delete(todoId)
      return next
    })
  }, [])

  const cancelCompletion = useCallback(
    async (todoId: string) => {
      cancelledIdsRef.current.add(todoId)
      removePending(todoId)
      await onStatusChange(todoId, 'notCompleted')
    },
    [onStatusChange, removePending],
  )

  const completeTodo = useCallback(
    async (todoId: string) => {
      await onStatusChange(todoId, 'completed')
      cancelledIdsRef.current.delete(todoId)

      setPendingDeletionIds((prev) => new Set(prev).add(todoId))

      toast(
        <div className="flex items-center justify-between gap-4 w-full px-4">
          <span>{'Task completed'}</span>
          <button
            type="button"
            className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            onClick={() => {
              cancelCompletion(todoId)
            }}
          >
            {'Undo'}
          </button>
        </div>,
        {
          autoClose: completionDelayMs,
          closeOnClick: false,
          closeButton: true,
          onClose: () => {
            if (cancelledIdsRef.current.has(todoId)) {
              cancelledIdsRef.current.delete(todoId)
              return
            }
            removePending(todoId)
            onDelete(todoId)
          },
        },
      )
    },
    [onStatusChange, onDelete, cancelCompletion, removePending],
  )

  return { completeTodo, pendingDeletionIds, cancelCompletion }
}
