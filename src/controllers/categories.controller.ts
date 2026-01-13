import { Request, Response, NextFunction } from 'express';
import categoriesService from '@/services/categories/categories.service';

class CategoriesController {
  /**
   * Get all categories
   * GET /categories
   */
  async getCategories(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Categories']
    // #swagger.summary = 'Lấy danh sách tất cả categories'
    // #swagger.description = 'Lấy danh sách tất cả categories đang active, được sắp xếp theo displayOrder và tên'
    /* #swagger.responses[200] = {
      description: 'Lấy danh sách categories thành công',
      schema: {
        success: true,
        data: [
          {
            categoryId: 1,
            categoryName: 'Smartphones',
            slug: 'smartphones',
            imageUrl: '/images/categories/smartphones.png'
          }
        ]
      }
    } */
    try {
      const categories = await categoriesService.getCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID
   * GET /categories/:id
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Categories']
    // #swagger.summary = 'Lấy thông tin category theo ID'
    /* #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID của category',
      required: true,
      type: 'number'
    } */
    /* #swagger.responses[200] = {
      description: 'Lấy thông tin category thành công',
      schema: {
        success: true,
        data: {
          categoryId: 1,
          parentId: null,
          categoryName: 'Smartphones',
          slug: 'smartphones',
          description: 'Latest smartphones and mobile devices',
          imageUrl: '/images/categories/smartphones.png',
          displayOrder: 1
        }
      }
    } */
    /* #swagger.responses[404] = {
      description: 'Category không tồn tại',
      schema: {
        success: false,
        message: 'Category not found'
      }
    } */
    try {
      const categoryId = parseInt(req.params.id);
      const category = await categoriesService.getCategoryById(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoriesController();
