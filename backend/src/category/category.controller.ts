import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { Category } from '../@generated/prisma-client/client'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dtos/category.dto'

@Controller('api/categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  getCategories(): Promise<Category[]> {
    return this.service.getCategories()
  }

  @Post()
  createCategory(@Body() data: CreateCategoryDto): Promise<Category> {
    return this.service.createCategory(data)
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: string): Promise<Category> {
    return this.service.deleteCategory({ id })
  }
}
