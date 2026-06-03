import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

type CreateCategoryFormValues = {
  title: string
}

type CreateCategoryFormProps = {
  onSubmit: (title: string) => Promise<unknown>
}

export const CreateCategoryForm: React.FC<CreateCategoryFormProps> = ({
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryFormValues>()

  const handleFormSubmit = async ({ title }: CreateCategoryFormValues) => {
    try {
      await onSubmit(title)
      reset()
      toast.success('Category created')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError('title', {
          message: Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : err.response.data.message,
        })
      } else {
        toast.error('Failed to create category')
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex items-start gap-2"
    >
      <div className="flex flex-col">
        <input
          {...register('title', { required: 'Category name is required' })}
          type="text"
          placeholder="New category name"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
        />
        {errors.title && (
          <span className="mt-1 text-xs text-red-600">
            {errors.title.message}
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Adding...' : 'Add'}
      </button>
    </form>
  )
}
