import { BadRequestException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import type { Category } from '../@generated/prisma-client/client'
import { PrismaService } from '../database/prisma.service'
import { CategoryService } from './category.service'

type PrismaMock = {
  category: {
    findMany: jest.Mock
    create: jest.Mock
    delete: jest.Mock
  }
}

const buildSubject = async (): Promise<{
  service: CategoryService
  prisma: PrismaMock
}> => {
  const prisma: PrismaMock = {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  }

  const moduleRef = await Test.createTestingModule({
    providers: [CategoryService, { provide: PrismaService, useValue: prisma }],
  }).compile()

  return { service: moduleRef.get(CategoryService), prisma }
}

const buildCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat-1',
  title: 'Work',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
})

describe('CategoryService', () => {
  describe('getCategories', () => {
    it('returns categories ordered by createdAt desc', async () => {
      const { service, prisma } = await buildSubject()
      const categories = [
        buildCategory({ id: 'a' }),
        buildCategory({ id: 'b' }),
      ]
      prisma.category.findMany.mockResolvedValue(categories)

      const result = await service.getCategories()

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      })
      expect(result).toBe(categories)
    })
  })

  describe('createCategory', () => {
    it('returns the created category on success', async () => {
      const { service, prisma } = await buildSubject()
      const category = buildCategory({ title: 'New' })
      prisma.category.create.mockResolvedValue(category)

      const result = await service.createCategory({ title: 'New' })

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { title: 'New' },
      })
      expect(result).toBe(category)
    })

    it('rethrows P2002 as BadRequestException with the duplicate-title message', async () => {
      const { service, prisma } = await buildSubject()
      prisma.category.create.mockRejectedValue({ code: 'P2002' })

      await expect(service.createCategory({ title: 'Dup' })).rejects.toThrow(
        BadRequestException,
      )
      await expect(service.createCategory({ title: 'Dup' })).rejects.toThrow(
        'Category with the same title already exists.',
      )
    })

    it('rethrows non-P2002 errors untouched', async () => {
      const { service, prisma } = await buildSubject()
      const error = Object.assign(new Error('boom'), { code: 'P9999' })
      prisma.category.create.mockRejectedValue(error)

      await expect(service.createCategory({ title: 'X' })).rejects.toBe(error)
    })
  })

  describe('deleteCategory', () => {
    it('calls prisma.category.delete with the id and returns the result', async () => {
      const { service, prisma } = await buildSubject()
      const category = buildCategory({ id: 'cat-9' })
      prisma.category.delete.mockResolvedValue(category)

      const result = await service.deleteCategory({ id: 'cat-9' })

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-9' },
      })
      expect(result).toBe(category)
    })
  })
})
