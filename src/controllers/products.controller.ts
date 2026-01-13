import { Request, Response, NextFunction } from 'express';
import productsService from '@/services/products/products.service';
import { getProductsQuerySchema, getProductDetailParamsSchema } from '@/validators/products.validator';

class ProductsController {
  /**
   * Get all products with filters
   * GET /products
   */
  async getProducts(req: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Products']
 
    /* #swagger.parameters['page'] = { in: 'query', description: 'Số trang', required: false, schema: { type: 'number', example: 1 }} */
    /* #swagger.parameters['pageSize'] = { in: 'query', description: 'Số sản phẩm mỗi trang', required: false, schema: { type: 'number', example: 20 }} */
    /* #swagger.parameters['categoryId'] = { in: 'query', description: 'ID danh mục', required: false, schema: { type: 'number' }} */
    /* #swagger.parameters['brandId'] = { in: 'query', description: 'Danh sách ID thương hiệu (comma-separated)', required: false, schema: { type: 'string', example: '1,2' }} */
    /* #swagger.parameters['minPrice'] = { in: 'query', description: 'Giá tối thiểu', required: false, schema: { type: 'number' }} */
    /* #swagger.parameters['maxPrice'] = { in: 'query', description: 'Giá tối đa', required: false, schema: { type: 'number' }} */
    /* #swagger.parameters['minRating'] = { in: 'query', description: 'Đánh giá tối thiểu (1-5)', required: false, schema: { type: 'number' }} */
    /* #swagger.parameters['sortBy'] = { in: 'query', description: 'Sắp xếp theo', required: false, schema: { type: 'string', enum: ['price', 'rating', 'newest', 'popular', 'name', 'discount'] }} */
    /* #swagger.parameters['sortOrder'] = { in: 'query', description: 'Thứ tự sắp xếp', required: false, schema: { type: 'string', enum: ['asc', 'desc'] }} */
    /* #swagger.parameters['search'] = { in: 'query', description: 'Tìm kiếm theo tên sản phẩm', required: false, schema: { type: 'string' }} */
    /* #swagger.responses[200] = {
      description: 'Lấy danh sách sản phẩm thành công',
      content: {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  products: { type: 'array', items: { $ref: '#/definitions/Product' }},
                  pagination: { $ref: '#/definitions/Pagination' },
                  filters: { type: 'object' }
                }
              }
            }
          }
        }
      }
    } */
    try {
      const validatedQuery = getProductsQuerySchema.parse(req.query);
      const result = await productsService.getProducts(validatedQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product detail by ID or slug
   * GET /products/:identifier
   */
  async getProductDetail(req: Request, res: Response, next: NextFunction) {

    try {
      const validatedParams = getProductDetailParamsSchema.parse(req.params);
      const result = await productsService.getProductDetail(validatedParams.identifier);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductsController();
