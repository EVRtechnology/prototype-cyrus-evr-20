/**
 * Health Check Route
 */

import { Router } from 'express';
import { testConnection } from '../config/database';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  const dbHealthy = await testConnection();

  const health = {
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbHealthy ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  };

  const statusCode = dbHealthy ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
