import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { TodoService } from "./todo.service";

@Module({
	imports: [PrismaModule],
	controllers: [],
	providers: [TodoService],
})
export class TodoModule {}
