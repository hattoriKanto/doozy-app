import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import type { Category, CreateTodoPayload, Todo } from '../../types/todo'

type CreateTodoFormValues = {
  title: string
  description: string
  categoryId: string
}

type CreateTodoFormProps = {
  categories: Category[]
  onSubmit: (payload: CreateTodoPayload) => Promise<Todo>
}

export const CreateTodoForm: React.FC<CreateTodoFormProps> = ({
  categories,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTodoFormValues>({
    defaultValues: { title: '', description: '', categoryId: '' },
  })

  const handleFormSubmit = async (values: CreateTodoFormValues) => {
    try {
      await onSubmit({
        title: values.title,
        description: values.description || null,
        categoryId: values.categoryId,
      })
      reset()
      toast.success('Task created')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        toast.error(err.response.data.message)
      } else {
        toast.error('Failed to create task')
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      <h2 className="mb-3 text-sm font-semibold text-gray-700">{'New Task'}</h2>
      <div className="flex flex-col gap-3">
        <div>
          <input
            {...register('title', { required: 'Task title is required' })}
            type="text"
            placeholder="What needs to be done?"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {errors.title && (
            <span className="mt-1 block text-xs text-red-600">
              {errors.title.message}
            </span>
          )}
        </div>
        <div>
          <textarea
            {...register('description')}
            placeholder="Description (optional)"
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <select
            {...register('categoryId', { required: 'Category is required' })}
            defaultValue=""
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="" disabled hidden>
              {'Select category'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <span className="mt-1 block text-xs text-red-600">
              {errors.categoryId.message}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
