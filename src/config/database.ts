import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/database/schema';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create postgres connection with connection pooling
const client = postgres(connectionString, {
  max: 20,              // Maximum number of connections in pool
  idle_timeout: 20,     // Close connection if idle for 20 seconds
  connect_timeout: 10,  // Timeout for establishing connection
  ssl: process.env.NODE_ENV === 'production', // Use SSL in production
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

export default db;
