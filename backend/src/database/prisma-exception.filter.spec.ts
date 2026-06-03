import { ArgumentsHost, NotFoundException } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { PrismaExceptionFilter } from './prisma-exception.filter'

const buildPrismaError = (code: string): PrismaClientKnownRequestError =>
  new PrismaClientKnownRequestError('test error', {
    code,
    clientVersion: 'test',
  })

const noopHost: ArgumentsHost = {
  switchToHttp: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
  getArgs: jest.fn(),
  getArgByIndex: jest.fn(),
  getType: jest.fn(),
  getHandler: jest.fn(),
  getClass: jest.fn(),
}

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter()

  it('throws NotFoundException when exception code is P2025', () => {
    const exception = buildPrismaError('P2025')

    expect(() => filter.catch(exception, noopHost)).toThrow(NotFoundException)
    expect(() => filter.catch(exception, noopHost)).toThrow('Record not found')
  })

  it.each([
    'P2002',
    'P2003',
    'P2014',
    'P9999',
  ])('re-throws the original exception when code is %s', (code) => {
    const exception = buildPrismaError(code)

    expect(() => filter.catch(exception, noopHost)).toThrow(exception)
  })
})
