import { Injectable } from "@nestjs/common";
import { Todo } from "../@generated/prisma-client/client";
import { PrismaService } from "../database/prisma.service";
import { CreateTodoDto, UpdateTodoItemDto } from "./dtos/todo.dto";

type CreateTodoArgs = {
	data: CreateTodoDto;
};

type UpdateTodosArgs = {
	todos: UpdateTodoItemDto[];
};

type DeleteTodoArgs = {
	id: string;
};

@Injectable()
export class TodoService {
	constructor(private readonly prisma: PrismaService) {}

	getTodos = (): Promise<Todo[]> => {
		return this.prisma.todo.findMany();
	};

	createTodo = ({ data }: CreateTodoArgs): Promise<Todo> => {
		return this.prisma.todo.create({
			data,
		});
	};

	updateTodos = ({ todos }: UpdateTodosArgs): Promise<Todo[]> => {
		return this.prisma.$transaction(
			todos.map(({ id, status }) =>
				this.prisma.todo.update({ where: { id }, data: { status } }),
			),
		);
	};

	deleteTodo = ({ id }: DeleteTodoArgs): Promise<Todo> => {
		return this.prisma.todo.delete({
			where: { id },
		});
	};
}
