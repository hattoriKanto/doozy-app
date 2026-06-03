import type { Category, CreateCategoryPayload } from '../types/todo'
import { apiClient } from './client'

export const getCategories = (): Promise<Category[]> =>
  apiClient.get<Category[]>('/categories').then(({ data }) => data)

export const createCategory = (
  payload: CreateCategoryPayload,
): Promise<Category> =>
  apiClient.post<Category>('/categories', payload).then(({ data }) => data)

export const deleteCategory = (categoryId: string): Promise<Category> =>
  apiClient
    .delete<Category>(`/categories/${categoryId}`)
    .then(({ data }) => data)
