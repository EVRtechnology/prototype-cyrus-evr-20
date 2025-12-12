/**
 * Main Configuration Index
 *
 * SECURITY NOTICE:
 * This configuration module uses validated environment variables to ensure
 * all security-critical settings are properly configured before application startup.
 *
 * Key security features:
 * - No hardcoded secret defaults (application will fail if secrets are not set)
 * - Environment validation with clear error messages
 * - CORS origin validation and sanitization
 * - Production-specific security checks
 *
 * @see env.validation.ts for validation schema and security requirements
 */

import dotenv from 'dotenv';
import { validateEnv } from './env.validation';

// Load environment variables from .env file
dotenv.config();

/**
 * Validate environment variables on module load
 *
 * SECURITY: This will cause the application to fail immediately if:
 * - Required secrets are missing or weak
 * - Environment variables are malformed
 * - Production security requirements are not met
 *
 * This is intentional behavior to prevent insecure deployments.
 */
const env = validateEnv();

/**
 * Application configuration derived from validated environment variables
 *
 * SECURITY NOTES:
 * - jwtSecret: No default value, must be set via JWT_SECRET env var
 * - sessionSecret: No default value, must be set via SESSION_SECRET env var
 * - qrHmacSecret: No default value, must be set via QR_HMAC_SECRET env var
 * - corsOrigin: Properly validated and trimmed from CORS_ORIGIN env var
 */
export const config = {
  // Server Configuration
  port: env.PORT,
  nodeEnv: env.NODE_ENV,

  // JWT Configuration
  // SECURITY: JWT_SECRET is required and validated (min 32 chars, no placeholders)
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,

  // Session Configuration
  // SECURITY: SESSION_SECRET is required and validated (min 32 chars, no placeholders)
  sessionSecret: env.SESSION_SECRET,

  // CORS Configuration
  // SECURITY: Origins are validated, trimmed, and checked for proper URL format
  // Defaults to localhost for development if not set
  corsOrigin: env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'],

  // QR Code Configuration
  qrCodeExpiryMinutes: env.QR_CODE_EXPIRY_MINUTES,
  // SECURITY: QR_HMAC_SECRET is required and validated (min 32 chars, no placeholders)
  qrHmacSecret: env.QR_HMAC_SECRET,

  // WebSocket Configuration
  wsPingInterval: env.WS_PING_INTERVAL,
  wsPingTimeout: env.WS_PING_TIMEOUT,

  // Database SSL Configuration
  // SECURITY: SSL certificate validation setting (should be true in production)
  dbSslRejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED,

  // Billings Score Algorithm Parameters
  // These are business logic constants, not security-sensitive
  billings: {
    initialScore: 0.5,
    successIncrement: 0.1,
    failureDecrement: 0.1,
    helpSuccessIncrement: 0.02,
    helpFailureDecrement: 0.05,
    passiveIncrement: 0.001,
    passiveIntervalMinutes: 5,
  },

  // Session Default Settings
  // These are business logic defaults, not security-sensitive
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
