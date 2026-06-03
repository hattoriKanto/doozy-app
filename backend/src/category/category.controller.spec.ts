import { Test } from '@nestjs/testing'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'

type ServiceMock = {
  getCategories: jest.Mock
  createCategory: jest.Mock
  deleteCategory: jest.Mock
}

const buildSubject = async (): Promise<{
  controller: CategoryController
  service: ServiceMock
}> => {
  const service: ServiceMock = {
    getCategories: jest.fn(),
    createCategory: jest.fn(),
    deleteCategory: jest.fn(),
  }

  const moduleRef = await Test.createTestingModule({
    controllers: [CategoryController],
    providers: [{ provide: CategoryService, useValue: service }],
  }).compile()

  return { controller: moduleRef.get(CategoryController), service }
}

describe('CategoryController', () => {
  it('getCategories delegates to service.getCategories', async () => {
    const { controller, service } = await buildSubject()
    const categories = [{ id: 'cat-1' }]
    service.getCategories.mockResolvedValue(categories)

    const result = await controller.getCategories()

    expect(service.getCategories).toHaveBeenCalledWith()
    expect(result).toBe(categories)
  })

  it('createCategory delegates to service.createCategory with the body', async () => {
    const { controller, service } = await buildSubject()
    const created = { id: 'cat-2', title: 'New' }
    service.createCategory.mockResolvedValue(created)

    const result = await controller.createCategory({ title: 'New' })

    expect(service.createCategory).toHaveBeenCalledWith({ title: 'New' })
    expect(result).toBe(created)
  })

  it('deleteCategory delegates to service.deleteCategory with { id }', async () => {
    const { controller, service } = await buildSubject()
    const deleted = { id: 'cat-9' }
    service.deleteCategory.mockResolvedValue(deleted)

    const result = await controller.deleteCategory('cat-9')

    expect(service.deleteCategory).toHaveBeenCalledWith({ id: 'cat-9' })
    expect(result).toBe(deleted)
  })
})
