export type BatchUndoToastProps = {
  count: number
  onUndo: () => void
}

export const BatchUndoToast: React.FC<BatchUndoToastProps> = ({
  count,
  onUndo,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{`${count} tasks completed`}</span>
      <button
        type="button"
        className="cursor-pointer font-semibold text-blue-600 hover:text-blue-800"
        onClick={onUndo}
      >
        {'Undo'}
      </button>
    </div>
  )
}
