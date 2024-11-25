import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  marketingUrl: process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/database',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:4000', // Add this line
} as const;

