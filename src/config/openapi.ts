import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import {
  registerEmailSchema,
  registerPhoneSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginEmailSchema,
  loginPhoneSchema,
  logoutSchema,
} from '@/validators/auth.validator';
import { updateProfileSchema } from '@/validators/profile.validator';
import { getProductsQuerySchema, getProductDetailParamsSchema } from '@/validators/products.validator';

const registry = new OpenAPIRegistry();

// Auth endpoints
registry.registerPath({
  method: 'post',
  path: '/auth/register/email',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: registerEmailSchema } } } },
  responses: {
    201: { description: 'User registered successfully' },
    400: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/register/phone',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: registerPhoneSchema } } } },
  responses: {
    201: { description: 'User registered successfully' },
    400: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/verify-otp',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: verifyOtpSchema } } } },
  responses: {
    200: { description: 'OTP verified successfully' },
    400: { description: 'Invalid OTP' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/resend-otp',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: resendOtpSchema } } } },
  responses: {
    200: { description: 'OTP resent successfully' },
    404: { description: 'User not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login/email',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: loginEmailSchema } } } },
  responses: {
    200: { description: 'Login successful' },
    401: { description: 'Invalid credentials' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login/phone',
  tags: ['Authentication'],
  request: { body: { content: { 'application/json': { schema: loginPhoneSchema } } } },
  responses: {
    200: { description: 'Login successful' },
    401: { description: 'Invalid credentials' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Authentication'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Logout successful' },
  },
});

// Profile endpoints
registry.registerPath({
  method: 'get',
  path: '/profile',
  tags: ['Profile'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'Profile retrieved successfully' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/profile',
  tags: ['Profile'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: updateProfileSchema } } } },
  responses: {
    200: { description: 'Profile updated successfully' },
    401: { description: 'Unauthorized' },
    404: { description: 'User not found' },
  },
});

// Add Products endpoints
registry.registerPath({
  method: 'get',
  path: '/products',
  tags: ['Products'],
  request: {
    query: getProductsQuerySchema,
  },
  responses: {
    200: { description: 'Products list retrieved' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/products/{identifier}',
  tags: ['Products'],
  request: {
    params: getProductDetailParamsSchema,
  },
  responses: {
    200: { description: 'Product retrieved' },
    404: { description: 'Product not found' },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'E-Commerce API',
      description: 'API documentation for E-Commerce platform',
    },
    servers: [{ url: 'http://localhost:5000/api/v1' }],
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
