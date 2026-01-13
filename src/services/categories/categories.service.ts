import { db } from '@/config/database';
import { categories } from '@/database/schema/products.schema';
import { eq } from 'drizzle-orm';

class CategoriesService {
  // Get all active categories
  async getCategories() {
    const result = await db
      .select({
        categoryId: categories.categoryId,
        categoryName: categories.categoryName,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.displayOrder, categories.categoryName);

    return result;
  }

  // Get category by ID
  async getCategoryById(categoryId: number) {
    const result = await db
      .select({
        categoryId: categories.categoryId,
        parentId: categories.parentId,
        categoryName: categories.categoryName,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        displayOrder: categories.displayOrder,
      })
      .from(categories)
      .where(eq(categories.categoryId, categoryId))
      .limit(1);

    return result[0] || null;
  }
}

export default new CategoriesService();
