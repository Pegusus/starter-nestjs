import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from './auth/auth.guard';
import Role from './auth/user.constants';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @UseGuards(new AuthGuard([Role.USER]))
  async getAllCategories(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<any> {
    return this.categoryService.getAllCategories(page, limit);
  }

  @Post()
  async create(
    @Body() categories: Array<{ categoryName: string; displayName: string }>,
  ) {
    return this.categoryService.createCategories(categories);
  }
}
