import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppConfigService } from "./config/config.service";
import { PrismaExceptionFilter } from "./database/prisma-exception.filter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const appConfig = app.get<AppConfigService>(AppConfigService);

	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	app.useGlobalFilters(new PrismaExceptionFilter());

	await app.listen(appConfig.port);
}
bootstrap();
