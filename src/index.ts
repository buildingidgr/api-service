import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateToken } from './middleware/validateToken';
import { routes } from './routes';
import { prisma } from './utils/database';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    config.appUrl,
    config.marketingUrl
  ].filter((url): url is string => typeof url === 'string'),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json());

// Logging
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// JWT validation for protected routes
app.use('/api', validateToken);

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

async function startServer() {
  try {
    await prisma.$connect();
    app.listen(config.port, () => {
      console.log(`API Service running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

