import { Injectable } from "@nestjs/common";
import { Todo, TodoStatus } from "../@generated/prisma-client/client";
import { PrismaService } from "../database/prisma.service";
import { CreateTodoDto } from "./dtos/create-todo.dto";

type CreateTodoArgs = {
	data: CreateTodoDto;
};

type UpdateTodoArgs = {
	id: string;
	status: TodoStatus;
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

	updateTodo = ({ id, status }: UpdateTodoArgs): Promise<Todo> => {
		return this.prisma.todo.update({
			where: { id },
			data: { status },
		});
	};

	deleteTodo = ({ id }: DeleteTodoArgs): Promise<Todo> => {
		return this.prisma.todo.delete({
			where: { id },
		});
	};
}
