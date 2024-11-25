import { PrismaClient } from '@prisma/client'
import { createLogger } from './logger'

const logger = createLogger('database');

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

prisma.$use(async (params, next) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  logger.debug(`Query ${params.model}.${params.action} took ${after - before}ms`)
  return result
})

export async function connectToDatabase() {
  try {
    await prisma.$connect()
    logger.info('Connected to MongoDB database')
  } catch (error) {
    logger.error('Failed to connect to MongoDB database', error)
    process.exit(1)
  }
}

