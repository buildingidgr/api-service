import { Router } from 'express';
import { prisma } from '../utils/database';
import { BadRequestError } from '../utils/errors';

export const resourceRoutes = Router();

resourceRoutes.get('/', async (req, res) => {
  const resources = await prisma.resource.findMany();
  res.json(resources);
});

resourceRoutes.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new BadRequestError('Name and description are required');
  }
  const resource = await prisma.resource.create({
    data: { name, description }
  });
  res.status(201).json(resource);
});

