import { useMemo } from 'react'
import type { Category } from '../../types/todo'
import { Select } from '../ui/Select'

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
  const options = useMemo(() => {
    const placeholderOption = includeAllOption
      ? { value: '', label: 'All categories' }
      : { value: '', label: placeholder, disabled: true, hidden: true }

    const categoryOptions = categories.map((c) => ({
      value: c.id,
      label: c.title,
    }))

    return [placeholderOption, ...categoryOptions]
  }, [categories, includeAllOption, placeholder])

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      className={className}
    />
  )
}
