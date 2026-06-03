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
import { Todo } from '../@generated/prisma-client/client';
import { CreateTodoDto, UpdateTodosDto } from './dtos/todo.dto';
import { TodoService } from './todo.service';

@Controller('api/todos')
export class TodoController {
  constructor(private readonly service: TodoService) {}

  @Get()
  getTodos(@Query('categoryId') categoryId: string): Promise<Todo[]> {
    return this.service.getTodos({ categoryId });
  }

  @Post()
  createTodo(@Body() data: CreateTodoDto): Promise<Todo> {
    return this.service.createTodo({ data });
  }

  @Patch()
  updateTodos(@Body() { todos }: UpdateTodosDto): Promise<Todo[]> {
    return this.service.updateTodos({ todos });
  }

  @Delete(':id')
  deleteTodo(@Param('id') id: string): Promise<Todo> {
    return this.service.deleteTodo({ id });
  }
}
