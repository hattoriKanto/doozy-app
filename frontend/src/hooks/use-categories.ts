import { useCallback, useEffect, useState } from 'react'
import {
  createCategory as createCategoryApi,
  getCategories,
} from '../api/categories'
import type { Category } from '../types/todo'

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err: Error) => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const addCategory = useCallback(async (title: string): Promise<Category> => {
    const category = await createCategoryApi({ title })
    setCategories((prev) => [category, ...prev])
    return category
  }, [])

  return { categories, loading, error, addCategory }
}
