import { Router } from 'express';
import { resourceRoutes } from './resources';

export const routes = Router();

routes.use('/resources', resourceRoutes);

// Health check endpoint
routes.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

