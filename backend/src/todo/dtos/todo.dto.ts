import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { TodoStatus } from "../../@generated/prisma-client/enums";

export class CreateTodoDto {
	@IsString()
	@IsNotEmpty()
	title!: string;

	@IsString()
	description!: string | null;
}

export class UpdateTodoDto {
	@IsString()
	@IsNotEmpty()
	@IsIn(Object.values(TodoStatus))
	status!: TodoStatus;
}
