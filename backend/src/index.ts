/**
 * EVR Billings Score Backend Server
 * Main entry point for the Express + Socket.io server
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import config from './config';
import { testConnection, closePool } from './config/database';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { setupSocketHandlers } from './socket';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = setupSocketHandlers(httpServer);

// Make io available in routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'EVR Billings Score API',
    version: '0.1.0',
    status: 'running',
    endpoints: {
      health: '/health',
      sessions: '/api/sessions',
      participants: '/api/participants',
    },
  });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;

async function startServer() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log('\n=================================');
      console.log(`Server Environment: ${config.nodeEnv}`);
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at: http://localhost:${PORT}/api`);
      console.log(`Health check at: http://localhost:${PORT}/health`);
      console.log('=================================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(async () => {
    await closePool();
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  httpServer.close(async () => {
    await closePool();
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, io };
