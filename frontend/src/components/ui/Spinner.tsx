import { cn } from '../../utils/cn'

type SpinnerProps = {
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ className }) => {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
    </div>
  )
}
