import { useCallback, useEffect, useRef, useState } from 'react'
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

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const timerId of timers.values()) {
        clearTimeout(timerId)
      }
    }
  }, [])

  return { completeTodo, pendingDeletionIds, cancelCompletion }
}
