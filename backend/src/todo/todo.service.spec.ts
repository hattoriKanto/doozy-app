import { BadRequestException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import type { Todo } from '../@generated/prisma-client/client'
import { TodoStatus } from '../@generated/prisma-client/enums'
import { PrismaService } from '../database/prisma.service'
import { TodoService } from './todo.service'

type PrismaMock = {
  todo: {
    findMany: jest.Mock
    count: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
  $transaction: jest.Mock
}

const buildSubject = async (): Promise<{
  service: TodoService
  prisma: PrismaMock
}> => {
  const prisma: PrismaMock = {
    todo: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  }

  const moduleRef = await Test.createTestingModule({
    providers: [TodoService, { provide: PrismaService, useValue: prisma }],
  }).compile()

  return { service: moduleRef.get(TodoService), prisma }
}

const buildTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'todo-1',
  title: 'Write tests',
  description: null,
  status: TodoStatus.TODO,
  categoryId: 'cat-1',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
})

describe('TodoService', () => {
  describe('getTodos', () => {
    it('passes categoryId into the where clause when provided', async () => {
      const { service, prisma } = await buildSubject()
      const todos = [buildTodo()]
      prisma.todo.findMany.mockResolvedValue(todos)

      const result = await service.getTodos({ categoryId: 'cat-1' })

      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        where: { categoryId: 'cat-1' },
      })
      expect(result).toBe(todos)
    })

    it('passes undefined categoryId when not provided', async () => {
      const { service, prisma } = await buildSubject()
      prisma.todo.findMany.mockResolvedValue([])

      await service.getTodos({})

      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        where: { categoryId: undefined },
      })
    })
  })

  describe('createTodo', () => {
    const baseData = {
      title: 'New task',
      description: null,
      categoryId: 'cat-1',
    }

    it('creates the todo when category has fewer than 5 todos', async () => {
      const { service, prisma } = await buildSubject()
      const created = buildTodo({ id: 'todo-99' })
      const tx = {
        todo: {
          count: jest.fn().mockResolvedValue(4),
          create: jest.fn().mockResolvedValue(created),
        },
      }
      prisma.$transaction.mockImplementation((cb) => cb(tx))

      const result = await service.createTodo({ data: baseData })

      expect(tx.todo.count).toHaveBeenCalledWith({
        where: { categoryId: 'cat-1' },
      })
      expect(tx.todo.create).toHaveBeenCalledWith({ data: baseData })
      expect(result).toBe(created)
    })

    it.each([
      5, 6, 100,
    ])('throws BadRequestException and never calls create when count is %s', async (existingCount) => {
      const { service, prisma } = await buildSubject()
      const tx = {
        todo: {
          count: jest.fn().mockResolvedValue(existingCount),
          create: jest.fn(),
        },
      }
      prisma.$transaction.mockImplementation((cb) => cb(tx))

      await expect(service.createTodo({ data: baseData })).rejects.toThrow(
        BadRequestException,
      )
      await expect(service.createTodo({ data: baseData })).rejects.toThrow(
        'A category can contain at most 5 tasks.',
      )
      expect(tx.todo.create).not.toHaveBeenCalled()
    })
  })

  describe('updateTodos', () => {
    it('runs all status updates in a single $transaction', async () => {
      const { service, prisma } = await buildSubject()
      const updates = [
        { id: 'todo-1', status: TodoStatus.IN_PROGRESS },
        { id: 'todo-2', status: TodoStatus.DONE },
      ]
      const updateSentinel1 = { __mock: 'update-1' }
      const updateSentinel2 = { __mock: 'update-2' }
      prisma.todo.update
        .mockReturnValueOnce(updateSentinel1)
        .mockReturnValueOnce(updateSentinel2)
      const results = [buildTodo({ id: 'todo-1' }), buildTodo({ id: 'todo-2' })]
      prisma.$transaction.mockResolvedValue(results)

      const result = await service.updateTodos({ todos: updates })

      expect(prisma.todo.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'todo-1' },
        data: { status: TodoStatus.IN_PROGRESS },
      })
      expect(prisma.todo.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'todo-2' },
        data: { status: TodoStatus.DONE },
      })
      expect(prisma.$transaction).toHaveBeenCalledWith([
        updateSentinel1,
        updateSentinel2,
      ])
      expect(result).toBe(results)
    })
  })

  describe('deleteTodo', () => {
    it('calls prisma.todo.delete with the id and returns the result', async () => {
      const { service, prisma } = await buildSubject()
      const deleted = buildTodo({ id: 'todo-9' })
      prisma.todo.delete.mockResolvedValue(deleted)

      const result = await service.deleteTodo({ id: 'todo-9' })

      expect(prisma.todo.delete).toHaveBeenCalledWith({
        where: { id: 'todo-9' },
      })
      expect(result).toBe(deleted)
    })
  })
})
