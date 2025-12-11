/**
 * Redis Configuration for Session State and Caching
 */

import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Too many Redis reconnection attempts');
        return new Error('Too many retries');
      }
      return retries * 100; // Exponential backoff
    },
  },
});

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('🔗 Redis client connecting...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});

// Connect to Redis
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
  await redisClient.quit();
  console.log('Redis connection closed');
};

// Helper functions for session state management
export const sessionCache = {
  set: async (sessionId: string, data: any, expirySeconds = 86400): Promise<void> => {
    await redisClient.setEx(`session:${sessionId}`, expirySeconds, JSON.stringify(data));
  },

  get: async (sessionId: string): Promise<any | null> => {
    const data = await redisClient.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  },

  delete: async (sessionId: string): Promise<void> => {
    await redisClient.del(`session:${sessionId}`);
  },

  exists: async (sessionId: string): Promise<boolean> => {
    return (await redisClient.exists(`session:${sessionId}`)) === 1;
  },
};

// Helper functions for participant state
export const participantCache = {
  set: async (participantId: string, data: any, expirySeconds = 86400): Promise<void> => {
    await redisClient.setEx(`participant:${participantId}`, expirySeconds, JSON.stringify(data));
  },

  get: async (participantId: string): Promise<any | null> => {
    const data = await redisClient.get(`participant:${participantId}`);
    return data ? JSON.parse(data) : null;
  },

  delete: async (participantId: string): Promise<void> => {
    await redisClient.del(`participant:${participantId}`);
  },
};

export default redisClient;
