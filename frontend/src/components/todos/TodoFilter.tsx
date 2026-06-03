import type { Category } from '../../types/todo'
import { CategorySelect } from '../categories/CategorySelect'

type TodoFilterProps = {
  categories: Category[]
  selectedCategoryId: string | null
  onFilterChange: (categoryId: string | null) => void
}

export const TodoFilter: React.FC<TodoFilterProps> = ({
  categories,
  selectedCategoryId,
  onFilterChange,
}) => {
  return (
    <CategorySelect
      categories={categories}
      value={selectedCategoryId ?? ''}
      onChange={(value) => {
        onFilterChange(value || null)
      }}
      includeAllOption
      className="w-full sm:w-auto"
    />
  )
}
