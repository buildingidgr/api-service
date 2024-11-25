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

prisma.$on('query', (e) => {
  logger.debug('Query: ' + e.query)
  logger.debug('Params: ' + e.params)
  logger.debug('Duration: ' + e.duration + 'ms')
})

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

