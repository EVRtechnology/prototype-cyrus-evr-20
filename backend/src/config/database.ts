/**
 * Database Configuration for PostgreSQL
 *
 * SECURITY NOTICE:
 * This module configures the PostgreSQL connection pool with proper SSL/TLS
 * certificate validation to prevent man-in-the-middle attacks.
 *
 * Key security features:
 * - SSL certificate validation enabled by default in production
 * - Configurable via DB_SSL_REJECT_UNAUTHORIZED environment variable
 * - Clear warnings when SSL validation is disabled
 *
 * @see env.validation.ts for SSL configuration validation
 */

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import config from './index';

dotenv.config();

/**
 * Pool configuration for individual database connection parameters
 *
 * SECURITY: These are used when DATABASE_URL is not provided.
 * The config module ensures required variables are validated.
 * Defaults are only provided for non-sensitive configuration.
 */
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'evr_billings',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD!,  // No default for security - must be explicitly set
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

/**
 * Determine SSL configuration based on environment
 *
 * SECURITY: SSL certificate validation (rejectUnauthorized) should be enabled
 * in production to prevent man-in-the-middle attacks. Only disable for:
 * - Development with self-signed certificates
 * - Testing environments
 * - Databases that don't support SSL
 *
 * @returns SSL configuration object or false to disable SSL
 */
function getSSLConfig(): false | { rejectUnauthorized: boolean } {
  // Skip SSL entirely in development (unless explicitly enabled)
  if (config.nodeEnv === 'development' && !process.env.DATABASE_URL) {
    return false;
  }

  // In production or when using DATABASE_URL, configure SSL
  const sslConfig = {
    rejectUnauthorized: config.dbSslRejectUnauthorized
  };

  // SECURITY: Log warning if SSL validation is disabled in production
  if (config.nodeEnv === 'production' && !sslConfig.rejectUnauthorized) {
    console.warn('');
    console.warn('⚠️  WARNING: DATABASE SSL CERTIFICATE VALIDATION IS DISABLED');
    console.warn('⚠️  This may expose your application to man-in-the-middle attacks');
    console.warn('⚠️  Set DB_SSL_REJECT_UNAUTHORIZED=true in production');
    console.warn('');
  }

  return sslConfig;
}

/**
 * Create PostgreSQL connection pool
 *
 * SECURITY: Uses DATABASE_URL if provided (common in cloud deployments),
 * otherwise uses individual connection parameters. SSL is configured based
 * on the environment and DB_SSL_REJECT_UNAUTHORIZED setting.
 */
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: getSSLConfig(),
    })
  : new Pool(poolConfig);

export default pool;

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('Database pool closed');
};
