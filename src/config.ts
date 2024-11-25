import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  marketingUrl: process.env.NEXT_PUBLIC_MARKETING_URL,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  rabbitmqUrl: process.env.RABBITMQ_URL,
  railwayEnvironment: process.env.RAILWAY_ENVIRONMENT,
  railwayProjectId: process.env.RAILWAY_PROJECT_ID,
} as const;

