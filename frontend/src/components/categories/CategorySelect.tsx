import type { Category } from '../../types/todo'
import { cn } from '../../utils/cn'

type CategorySelectProps = {
  categories: Category[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  includeAllOption?: boolean
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  value,
  onChange,
  placeholder = 'Select category',
  className,
  includeAllOption = false,
}) => {
  return (
    <select
      className={cn(
        'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none',
        className,
      )}
      value={value}
      onChange={(event) => {
        onChange(event.target.value)
      }}
    >
      {includeAllOption ? (
        <option value="">{'All categories'}</option>
      ) : (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.title}
        </option>
      ))}
    </select>
  )
}
