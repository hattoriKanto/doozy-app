import { useCallback, useEffect, useRef, useState } from 'react'
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
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  )
  const toastIdsRef = useRef<Map<string, string | number>>(new Map())
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
      const timerId = timersRef.current.get(todoId)
      if (timerId) {
        clearTimeout(timerId)
        timersRef.current.delete(todoId)
      }
      const toastId = toastIdsRef.current.get(todoId)
      if (toastId !== undefined) {
        toast.dismiss(toastId)
        toastIdsRef.current.delete(todoId)
      }
      removePending(todoId)
      await onStatusChange(todoId, 'notCompleted')
    },
    [onStatusChange, removePending],
  )

  const cancelBatchCompletion = useCallback(
    async (todoIds: string[], batchToastId: string | number) => {
      for (const todoId of todoIds) {
        const timerId = timersRef.current.get(todoId)
        if (timerId) {
          clearTimeout(timerId)
          timersRef.current.delete(todoId)
        }
        toastIdsRef.current.delete(todoId)
      }
      toast.dismiss(batchToastId)
      setPendingDeletionIds((prev) => {
        const next = new Set(prev)
        for (const todoId of todoIds) {
          next.delete(todoId)
        }
        return next
      })
      await onBatchStatusChange(todoIds, 'notCompleted')
    },
    [onBatchStatusChange],
  )

  const completeTodo = useCallback(
    async (todoId: string) => {
      await onStatusChange(todoId, 'completed')

      setPendingDeletionIds((prev) => new Set(prev).add(todoId))

      const timerId = setTimeout(async () => {
        timersRef.current.delete(todoId)
        toastIdsRef.current.delete(todoId)
        removePending(todoId)
        await onDelete(todoId)
      }, completionDelayMs)
      timersRef.current.set(todoId, timerId)

      const toastId = toast(
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
        },
      )
      toastIdsRef.current.set(todoId, toastId)
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

      setPendingDeletionIds((prev) => {
        const next = new Set(prev)
        for (const todoId of todoIds) {
          next.add(todoId)
        }
        return next
      })

      for (const todoId of todoIds) {
        const timerId = setTimeout(async () => {
          timersRef.current.delete(todoId)
          removePending(todoId)
          await onDelete(todoId)
        }, completionDelayMs)
        timersRef.current.set(todoId, timerId)
      }

      const batchToastId = toast(
        <BatchUndoToast
          count={todoIds.length}
          onUndo={() => {
            cancelBatchCompletion(todoIds, batchToastId)
          }}
        />,
        {
          autoClose: completionDelayMs,
          closeOnClick: false,
          closeButton: true,
        },
      )

      for (const todoId of todoIds) {
        toastIdsRef.current.set(todoId, batchToastId)
      }
    },
    [
      completeTodo,
      onBatchStatusChange,
      onDelete,
      cancelBatchCompletion,
      removePending,
    ],
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const timerId of timers.values()) {
        clearTimeout(timerId)
      }
    }
  }, [])

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
