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
  try {
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
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: 'Health check failed',
    });
  }
});

export default router;
