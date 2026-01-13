import { Request, Response, NextFunction } from 'express';
import brandsService from '@/services/brands/brands.service';

class BrandsController {
  /**
   * Get all brands
   * GET /brands
   */
  async getBrands(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Brands']
    // #swagger.summary = 'Lấy danh sách tất cả brands'
    // #swagger.description = 'Lấy danh sách tất cả brands đang active, được sắp xếp theo tên'
    /* #swagger.responses[200] = {
      description: 'Lấy danh sách brands thành công',
      schema: {
        success: true,
        data: [
          {
            brandId: 1,
            brandName: 'Apple',
            slug: 'apple',
            logoUrl: '/images/brands/apple.png',
            description: 'Apple is a global technology company...'
          }
        ]
      }
    } */
    try {
      const brands = await brandsService.getBrands();

      res.json({
        success: true,
        data: brands,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get brand by ID
   * GET /brands/:id
   */
  async getBrandById(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Brands']
    // #swagger.summary = 'Lấy thông tin brand theo ID'
    /* #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID của brand',
      required: true,
      type: 'number'
    } */
    /* #swagger.responses[200] = {
      description: 'Lấy thông tin brand thành công',
      schema: {
        success: true,
        data: {
          brandId: 1,
          brandName: 'Apple',
          slug: 'apple',
          logoUrl: '/images/brands/apple.png',
          description: 'Apple is a global technology company...'
        }
      }
    } */
    /* #swagger.responses[404] = {
      description: 'Brand không tồn tại',
      schema: {
        success: false,
        message: 'Brand not found'
      }
    } */
    try {
      const brandId = parseInt(req.params.id);
      const brand = await brandsService.getBrandById(brandId);

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found',
        });
      }

      res.json({
        success: true,
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BrandsController();
