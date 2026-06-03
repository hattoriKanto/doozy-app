import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsIn,
	IsNotEmpty,
	IsString,
	ValidateNested,
} from "class-validator";
import { TodoStatus } from "../../@generated/prisma-client/enums";

export class CreateTodoDto {
	@IsString()
	@IsNotEmpty()
	title!: string;

	@IsString()
	description!: string | null;

	@IsString()
	@IsNotEmpty()
	categoryId!: string;
}

export class UpdateTodoItemDto {
	@IsString()
	@IsNotEmpty()
	id!: string;

	@IsString()
	@IsNotEmpty()
	@IsIn(Object.values(TodoStatus))
	status!: TodoStatus;
}

export class UpdateTodosDto {
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => UpdateTodoItemDto)
	todos!: UpdateTodoItemDto[];
}
