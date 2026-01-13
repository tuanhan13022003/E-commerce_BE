import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import corsOptions from '@/config/cors';
import { env } from '@/config/env';
import routes from '@/routes';
import { errorMiddleware, notFoundHandler } from '@/middlewares/error.middleware';
import { generateOpenApiDocument } from '@/config/openapi';

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(cors(corsOptions));

// Body parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger Documentation (Generated from Zod schemas)
const openApiDocument = generateOpenApiDocument();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-Commerce API Docs',
}));

// Logging middleware (development only)
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API routes
app.use(`/api/${env.API_VERSION}`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'E-Commerce API',
      version: env.API_VERSION,
      environment: env.NODE_ENV,
      documentation: '/api-docs',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
