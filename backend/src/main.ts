import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppConfigService } from "./config/config.service";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const appConfig = app.get<AppConfigService>(AppConfigService);

	await app.listen(appConfig.port);
}
bootstrap();
