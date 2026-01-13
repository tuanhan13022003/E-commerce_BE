import { db } from '@/config/database';
import { brands } from '@/database/schema/products.schema';
import { eq } from 'drizzle-orm';

class BrandsService {
  // Get all active brands
  async getBrands() {
    const result = await db
      .select({
        brandId: brands.brandId,
        brandName: brands.brandName,
        slug: brands.slug,
        logoUrl: brands.logoUrl,
        description: brands.description,
      })
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(brands.brandName);

    return result;
  }

  // Get brand by ID
  async getBrandById(brandId: number) {
    const result = await db
      .select({
        brandId: brands.brandId,
        brandName: brands.brandName,
        slug: brands.slug,
        logoUrl: brands.logoUrl,
        description: brands.description,
      })
      .from(brands)
      .where(eq(brands.brandId, brandId))
      .limit(1);

    return result[0] || null;
  }
}

export default new BrandsService();
