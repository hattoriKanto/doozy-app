import { BadRequestException, Injectable } from '@nestjs/common'
import { Category } from '../@generated/prisma-client/client'
import { PrismaService } from '../database/prisma.service'
import { CreateCategoryDto } from './dtos/category.dto'

type DeleteCategoryArgs = {
  id: string
}

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  getCategories = (): Promise<Category[]> => {
    return this.prisma.category.findMany({ orderBy: { createdAt: 'desc' } })
  }

  createCategory = async (data: CreateCategoryDto): Promise<Category> => {
    return this.prisma.category.create({ data }).catch((error) => {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Category with the same title already exists.',
        )
      }

      throw error
    })
  }

  deleteCategory = ({ id }: DeleteCategoryArgs): Promise<Category> => {
    return this.prisma.category.delete({ where: { id } })
  }
}
