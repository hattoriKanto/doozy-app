import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Todo, TodoStatus } from '../@generated/prisma-client/client';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { TodoService } from './todo.service';

@Controller('api/todos')
export class TodoController {
  constructor(private readonly service: TodoService) {}

  @Get()
  getTodos(): Promise<Todo[]> {
    return this.service.getTodos();
  }

  @Post()
  createTodo(@Body() data: CreateTodoDto): Promise<Todo> {
    return this.service.createTodo({ data });
  }

  @Patch(':id')
  updateTodo(
    @Param('id') id: string,
    @Query('status') status: TodoStatus,
  ): Promise<Todo> {
    return this.service.updateTodo({ id, status });
  }

  @Delete(':id')
  deleteTodo(@Param('id') id: string): Promise<Todo> {
    return this.service.deleteTodo({ id });
  }
}
