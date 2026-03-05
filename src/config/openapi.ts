/**
 * OpenAPI / Swagger Documentation
 * Aggregates all endpoint definitions
 */

import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { env } from '@/config/env';
import { registerAuthEndpoints } from './openapi/auth.endpoints';
import { registerProfileEndpoints } from './openapi/profile.endpoints';
import { registerProductsEndpoints } from './openapi/products.endpoints';
import { registerCartEndpoints } from './openapi/cart.endpoints';

const registry = new OpenAPIRegistry();

// ============ Register All Endpoints ============
registerAuthEndpoints(registry);
registerProfileEndpoints(registry);
registerProductsEndpoints(registry);
registerCartEndpoints(registry);

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  // Determine base URL based on environment
  const getBaseUrl = (): string => {
    if (env.NODE_ENV === 'production') {
      return process.env.API_URL || 'https://api.example.com';
    }
    return `http://localhost:${process.env.PORT || 5000}`;
  };

  const baseUrl = getBaseUrl();

  const doc = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'E-Commerce API',
      description: 'API documentation for E-Commerce platform',
    },
    servers: [
      {
        url: `${baseUrl}/api/${env.API_VERSION}`,
        description: env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
      },
    ],
  });

  // Add security schemes
  if (!doc.components) {
    doc.components = {};
  }
  doc.components.securitySchemes = {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  };

  return doc;
}
