import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { env } from '@/config/env';
import { registerAuthRoutes } from './routes/auth.openapi';
import { registerProductRoutes } from './routes/products.openapi';

// Create OpenAPI Registry
export const registry = new OpenAPIRegistry();

// Register security schemes
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT Authorization token',
});

// Register all routes
registerAuthRoutes();
registerProductRoutes();

// Generate OpenAPI documentation
export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'E-Commerce API',
      description: 'API documentation for E-Commerce platform',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
        description: 'Development server',
      },
      {
        url: `https://api.ecommerce.com/api/${env.API_VERSION}`,
        description: 'Production server',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'Authentication and authorization endpoints' },
      { name: 'Products', description: 'Product management endpoints' },
      { name: 'Categories', description: 'Category management endpoints' },
      { name: 'Brands', description: 'Brand management endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Orders', description: 'Order management endpoints' },
      { name: 'Cart', description: 'Shopping cart endpoints' },
    ],
  });
}
