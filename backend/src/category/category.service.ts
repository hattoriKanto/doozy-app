import { Injectable } from "@nestjs/common";
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

	createCategory = ({ title }: CreateCategoryArgs): Promise<Category> => {
		return this.prisma.category.create({ data: { title } });
	};

	deleteCategory = ({ id }: DeleteCategoryArgs): Promise<Category> => {
		return this.prisma.category.delete({ where: { id } });
	};
}
