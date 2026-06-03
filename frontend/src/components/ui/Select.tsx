import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

type SelectOption = {
  value: string
  label: string
  disabled?: boolean
  hidden?: boolean
}

type SelectProps = {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  className?: string
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'>

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  className,
  ...rest
}) => {
  return (
    <div className={cn('relative', className)}>
      <select
        className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        {...rest}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            hidden={option.hidden}
          >
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}
