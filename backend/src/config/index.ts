/**
 * Main Configuration Index
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Session
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],

  // QR Code
  qrCodeExpiryMinutes: parseInt(process.env.QR_CODE_EXPIRY_MINUTES || '30'),
  qrHmacSecret: process.env.QR_HMAC_SECRET || 'dev-qr-secret',

  // WebSocket
  wsPingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000'),
  wsPingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000'),

  // Billings Score
  billings: {
    initialScore: 0.5,
    successIncrement: 0.1,
    failureDecrement: 0.1,
    helpSuccessIncrement: 0.02,
    helpFailureDecrement: 0.05,
    passiveIncrement: 0.001,
    passiveIntervalMinutes: 5,
  },

  // Session defaults
  sessionDefaults: {
    maxParticipants: 500,
    totalRounds: 3,
    anonymousMode: false,
    retryConfig: {
      frequency: 'every' as const,
      supportCollectionTime: 30,
    },
    displayOptions: {
      liveDashboard: true,
      retryQueue: true,
      finalResults: true,
    },
  },
};

export default config;
