type BulkActionsBarProps = {
  selectedCount: number
  onMarkAsDone: () => void
  onClearSelection: () => void
  isProcessing: boolean
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onMarkAsDone,
  onClearSelection,
  isProcessing,
}) => {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
      <span className="text-sm font-medium text-blue-700">
        {`${selectedCount} selected`}
      </span>
      <button
        type="button"
        onClick={onMarkAsDone}
        disabled={isProcessing}
        className="cursor-pointer rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Mark as done'}
      </button>
      <button
        type="button"
        onClick={onClearSelection}
        className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
      >
        {'Clear'}
      </button>
    </div>
  )
}
