import { BadRequestException, Injectable } from "@nestjs/common";
import { Category } from "../@generated/prisma-client/client";
import { PrismaService } from "../database/prisma.service";

type CreateCategoryArgs = {
	title: string;
};

type DeleteCategoryArgs = {
	id: string;
};

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	getCategories = (): Promise<Category[]> => {
		return this.prisma.category.findMany({ orderBy: { createdAt: "desc" } });
	};

	async createCategory({
		title,
	}: CreateCategoryArgs): Promise<Category | void> {
		return this.prisma.category.create({ data: { title } }).catch((error) => {
			if (error.code === "P2002") {
				throw new BadRequestException(
					"Category with the same title already exists.",
				);
			}

			throw error;
		});
	}

	deleteCategory = ({ id }: DeleteCategoryArgs): Promise<Category> => {
		return this.prisma.category.delete({ where: { id } });
	};
}
