import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CategoryModule } from "./category/category.module";
import { AppConfigModule } from "./config/config.module";
import { PrismaModule } from "./database/prisma.module";
import { TodoModule } from "./todo/todo.module";

@Module({
	imports: [AppConfigModule, PrismaModule, TodoModule, CategoryModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
