import { Test } from '@nestjs/testing'
import { TodoStatus } from '../@generated/prisma-client/enums'
import { TodoController } from './todo.controller'
import { TodoService } from './todo.service'

type ServiceMock = {
  getTodos: jest.Mock
  createTodo: jest.Mock
  updateTodos: jest.Mock
  deleteTodo: jest.Mock
}

const buildSubject = async (): Promise<{
  controller: TodoController
  service: ServiceMock
}> => {
  const service: ServiceMock = {
    getTodos: jest.fn(),
    createTodo: jest.fn(),
    updateTodos: jest.fn(),
    deleteTodo: jest.fn(),
  }

  const moduleRef = await Test.createTestingModule({
    controllers: [TodoController],
    providers: [{ provide: TodoService, useValue: service }],
  }).compile()

  return { controller: moduleRef.get(TodoController), service }
}

describe('TodoController', () => {
  it('getTodos forwards the categoryId query param to the service', async () => {
    const { controller, service } = await buildSubject()
    const todos = [{ id: 'todo-1' }]
    service.getTodos.mockResolvedValue(todos)

    const result = await controller.getTodos('cat-1')

    expect(service.getTodos).toHaveBeenCalledWith({ categoryId: 'cat-1' })
    expect(result).toBe(todos)
  })

  it('createTodo forwards the body wrapped in { data } to the service', async () => {
    const { controller, service } = await buildSubject()
    const created = { id: 'todo-2' }
    service.createTodo.mockResolvedValue(created)
    const body = {
      title: 'New',
      description: null,
      categoryId: 'cat-1',
    }

    const result = await controller.createTodo(body)

    expect(service.createTodo).toHaveBeenCalledWith({ data: body })
    expect(result).toBe(created)
  })

  it('updateTodos forwards the destructured todos array to the service', async () => {
    const { controller, service } = await buildSubject()
    const updated = [{ id: 'todo-1' }]
    service.updateTodos.mockResolvedValue(updated)
    const todos = [{ id: 'todo-1', status: TodoStatus.DONE }]

    const result = await controller.updateTodos({ todos })

    expect(service.updateTodos).toHaveBeenCalledWith({ todos })
    expect(result).toBe(updated)
  })

  it('deleteTodo forwards { id } to the service', async () => {
    const { controller, service } = await buildSubject()
    const deleted = { id: 'todo-9' }
    service.deleteTodo.mockResolvedValue(deleted)

    const result = await controller.deleteTodo('todo-9')

    expect(service.deleteTodo).toHaveBeenCalledWith({ id: 'todo-9' })
    expect(result).toBe(deleted)
  })
})
