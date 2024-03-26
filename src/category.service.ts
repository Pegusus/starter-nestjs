// category.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAllCategories(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [categories, total] = await this.categoryRepository.findAndCount({
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    return {
      categories: categories.map((categoryObj: Category) => {
        return {
          id: categoryObj.id,
          categoryName: categoryObj.category_name,
          displayName: categoryObj.display_name,
          createdAt: categoryObj.created_at,
          updatedAt: categoryObj.updated_at,
        };
      }),
      pageInfo: {
        currentPage: page,
        totalPages,
        hasNextPage,
        totalItems: total,
      },
    };
  }

  async createCategories(
    categories: Array<{ categoryName: string; displayName: string }>,
  ): Promise<Category[]> {
    const createdCategories: Category[] = [];
    for (const categoryObj of categories) {
      const { categoryName, displayName } = categoryObj;
      const category = new Category();
      category.category_name = categoryName;
      category.display_name = displayName;
      const createdCategory = await this.categoryRepository.save(category);
      createdCategories.push(createdCategory);
    }
    return createdCategories;
  }
}
