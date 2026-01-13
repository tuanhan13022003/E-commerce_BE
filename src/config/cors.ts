import cors from 'cors';
import { env } from './env';

const corsOptions: cors.CorsOptions = {
  origin: [env.CORS_ORIGIN_CUSTOMER, env.CORS_ORIGIN_ADMIN],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // 10 minutes
};

export default corsOptions;
