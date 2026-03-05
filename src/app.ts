import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

// Body parsing middlewares (reduced from 10mb to 100kb for security)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Rate Limiting Middleware
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: 'Too many login/register attempts, please try again later.',
  skipSuccessfulRequests: false, // Count all requests, not just failed ones
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general limiter globally
app.use(generalLimiter);

// Swagger Documentation (Auto-generated from validators)
try {
  const openApiDocument = generateOpenApiDocument();
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'E-Commerce API Docs',
  }));
} catch (error) {
  console.warn('OpenAPI config not available, skipping Swagger docs', error);
}

// Logging middleware (development only)
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API routes
const apiRouter = express.Router();

// Apply stricter auth limiter to auth routes
apiRouter.use('/auth', authLimiter);

// Mount all routes
apiRouter.use(routes);
app.use(`/api/${env.API_VERSION}`, apiRouter);

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
