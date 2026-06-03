import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '../@generated/prisma-client/client'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, _: ArgumentsHost) {
    if (exception.code === 'P2025') {
      throw new NotFoundException('Record not found')
    }
    throw exception
  }
}
