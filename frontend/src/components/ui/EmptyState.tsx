import { ClipboardList } from 'lucide-react'

type EmptyStateProps = {
  message?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No tasks yet',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <ClipboardList className="mb-4 h-16 w-16" strokeWidth={1} />
      <p className="text-lg">{message}</p>
    </div>
  )
}
