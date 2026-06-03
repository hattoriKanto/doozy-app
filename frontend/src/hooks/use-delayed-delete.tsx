import { useCallback, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import type { TodoStatus } from '../types/todo'

const completionDelayMs = 5000

type UseDelayedDeleteArgs = {
  onStatusChange: (todoId: string, status: TodoStatus) => Promise<void>
  onBatchStatusChange: (todoIds: string[], status: TodoStatus) => Promise<void>
  onDelete: (todoId: string) => Promise<void>
}

export const useDelayedDelete = ({
  onStatusChange,
  onBatchStatusChange,
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

  const removePendingBatch = useCallback((todoIds: string[]) => {
    setPendingDeletionIds((prev) => {
      const next = new Set(prev)
      for (const todoId of todoIds) {
        next.delete(todoId)
      }
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

  const cancelBatchCompletion = useCallback(
    async (todoIds: string[]) => {
      for (const todoId of todoIds) {
        cancelledIdsRef.current.add(todoId)
      }
      removePendingBatch(todoIds)
      await onBatchStatusChange(todoIds, 'notCompleted')
    },
    [onBatchStatusChange, removePendingBatch],
  )

  const completeTodo = useCallback(
    async (todoId: string) => {
      await onStatusChange(todoId, 'completed')
      cancelledIdsRef.current.delete(todoId)

      setPendingDeletionIds((prev) => new Set(prev).add(todoId))

      toast(
        <div className="flex items-center justify-between gap-4">
          <span>{'Task completed'}</span>
          <button
            type="button"
            className="font-semibold text-blue-600 hover:text-blue-800"
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

  const completeTodos = useCallback(
    async (todoIds: string[]) => {
      if (todoIds.length === 0) {
        return
      }

      if (todoIds.length === 1) {
        await completeTodo(todoIds[0])
        return
      }

      await onBatchStatusChange(todoIds, 'completed')

      for (const todoId of todoIds) {
        cancelledIdsRef.current.delete(todoId)
      }

      setPendingDeletionIds((prev) => {
        const next = new Set(prev)
        for (const todoId of todoIds) {
          next.add(todoId)
        }
        return next
      })

      toast(
        <BatchUndoToast
          count={todoIds.length}
          onUndo={() => {
            cancelBatchCompletion(todoIds)
          }}
        />,
        {
          autoClose: completionDelayMs,
          closeOnClick: false,
          closeButton: true,
          onClose: () => {
            const idsToDelete = todoIds.filter(
              (id) => !cancelledIdsRef.current.has(id),
            )
            for (const todoId of todoIds) {
              cancelledIdsRef.current.delete(todoId)
            }
            removePendingBatch(idsToDelete)
            for (const todoId of idsToDelete) {
              onDelete(todoId)
            }
          },
        },
      )
    },
    [
      completeTodo,
      onBatchStatusChange,
      onDelete,
      cancelBatchCompletion,
      removePendingBatch,
    ],
  )

  return { completeTodo, completeTodos, pendingDeletionIds, cancelCompletion }
}

type BatchUndoToastProps = {
  count: number
  onUndo: () => void
}

const BatchUndoToast: React.FC<BatchUndoToastProps> = ({ count, onUndo }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{`${count} tasks completed`}</span>
      <button
        type="button"
        className="font-semibold text-blue-600 hover:text-blue-800"
        onClick={onUndo}
      >
        {'Undo'}
      </button>
    </div>
  )
}
