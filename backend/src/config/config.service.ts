import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import z from "zod";

const validationObject = z.object({
	PORT: z.string().min(0).max(65535),
	DATABASE_URL: z.string().min(1),
});

@Injectable()
export class AppConfigService {
	static validate = (
		config: Record<string, unknown>,
	): z.infer<typeof validationObject> => validationObject.parse(config);

	constructor(
		private readonly configService: ConfigService<
			z.infer<typeof validationObject>,
			true
		>,
	) {}

	get port(): number {
		return Number(this.configService.get("PORT"));
	}

	get databaseUrl(): string {
		return this.configService.get("DATABASE_URL");
	}
}
