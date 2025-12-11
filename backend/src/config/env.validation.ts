/**
 * Environment Variable Validation Schema
 *
 * This module validates all environment variables on application startup
 * to ensure security-critical configuration is properly set before the
 * application begins processing requests.
 *
 * Security considerations:
 * - All secrets must be explicitly set (no defaults)
 * - Production environments require stricter validation
 * - Clear error messages guide proper configuration
 */

import { z } from 'zod';

/**
 * Environment validation schema
 *
 * SECURITY: Secrets have no default values and will cause startup failure
 * if not properly configured. This is intentional to prevent accidental
 * deployment with insecure defaults.
 */
const envSchema = z.object({
  // Server Configuration
  PORT: z.string()
    .default('3000')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0 && val < 65536, {
      message: 'PORT must be between 1 and 65535'
    }),

  NODE_ENV: z.enum(['development', 'production', 'test'])
    .default('development'),

  // Database Configuration
  // Either DATABASE_URL or individual DB_* variables must be set
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().min(1).optional(),
  DB_PORT: z.string()
    .transform(val => parseInt(val || '5432', 10))
    .refine(val => val > 0 && val < 65536, {
      message: 'DB_PORT must be between 1 and 65535'
    })
    .optional(),
  DB_NAME: z.string().min(1).optional(),
  DB_USER: z.string().min(1).optional(),
  DB_PASSWORD: z.string().min(1).optional(),

  // SSL Certificate Validation
  // SECURITY: In production, SSL certificates should be validated
  // Set to 'false' only for development/testing with self-signed certs
  DB_SSL_REJECT_UNAUTHORIZED: z.string()
    .default('true')
    .transform(val => val === 'true')
    .refine((val, ctx) => {
      if (!val && ctx.path[0] === 'production') {
        return false;
      }
      return true;
    }, {
      message: 'DB_SSL_REJECT_UNAUTHORIZED should be true in production for security'
    }),

  // JWT Configuration
  // SECURITY: JWT_SECRET is required in all environments and must be strong
  JWT_SECRET: z.string()
    .min(32, {
      message: 'JWT_SECRET must be at least 32 characters long for security. Generate using: openssl rand -base64 32'
    })
    .refine(val => {
      // Reject common insecure patterns
      const insecurePatterns = [
        'secret',
        'change',
        'production',
        'dev',
        'test',
        '12345',
        'password',
        'default'
      ];
      const lowerVal = val.toLowerCase();
      return !insecurePatterns.some(pattern => lowerVal.includes(pattern));
    }, {
      message: 'JWT_SECRET appears to contain placeholder text. Please use a cryptographically secure random value. Generate using: openssl rand -base64 32'
    }),

  JWT_EXPIRES_IN: z.string().default('24h'),

  // Session Configuration
  // SECURITY: SESSION_SECRET is required and must be strong
  SESSION_SECRET: z.string()
    .min(32, {
      message: 'SESSION_SECRET must be at least 32 characters long for security. Generate using: openssl rand -base64 32'
    })
    .refine(val => {
      const insecurePatterns = [
        'secret',
        'change',
        'production',
        'dev',
        'test',
        '12345',
        'password',
        'default'
      ];
      const lowerVal = val.toLowerCase();
      return !insecurePatterns.some(pattern => lowerVal.includes(pattern));
    }, {
      message: 'SESSION_SECRET appears to contain placeholder text. Please use a cryptographically secure random value. Generate using: openssl rand -base64 32'
    }),

  // CORS Configuration
  // SECURITY: CORS origins should be explicitly set in production
  CORS_ORIGIN: z.string()
    .transform(val => val.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0))
    .refine(origins => origins.length > 0, {
      message: 'CORS_ORIGIN must contain at least one origin'
    })
    .refine(origins => {
      // Validate each origin is a valid URL or wildcard
      return origins.every(origin => {
        if (origin === '*') return true;
        try {
          new URL(origin);
          return true;
        } catch {
          return false;
        }
      });
    }, {
      message: 'CORS_ORIGIN must contain valid URLs or "*" wildcard'
    })
    .optional(),

  // QR Code Configuration
  QR_CODE_EXPIRY_MINUTES: z.string()
    .default('30')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0 && val <= 1440, {
      message: 'QR_CODE_EXPIRY_MINUTES must be between 1 and 1440 (24 hours)'
    }),

  // SECURITY: QR_HMAC_SECRET is required for QR code signature validation
  QR_HMAC_SECRET: z.string()
    .min(32, {
      message: 'QR_HMAC_SECRET must be at least 32 characters long for security. Generate using: openssl rand -base64 32'
    })
    .refine(val => {
      const insecurePatterns = [
        'secret',
        'change',
        'production',
        'dev',
        'test',
        '12345',
        'password',
        'default'
      ];
      const lowerVal = val.toLowerCase();
      return !insecurePatterns.some(pattern => lowerVal.includes(pattern));
    }, {
      message: 'QR_HMAC_SECRET appears to contain placeholder text. Please use a cryptographically secure random value. Generate using: openssl rand -base64 32'
    }),

  // WebSocket Configuration
  WS_PING_INTERVAL: z.string()
    .default('25000')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, {
      message: 'WS_PING_INTERVAL must be positive'
    }),

  WS_PING_TIMEOUT: z.string()
    .default('60000')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, {
      message: 'WS_PING_TIMEOUT must be positive'
    }),
}).refine(data => {
  // SECURITY: Ensure database configuration is complete
  if (data.DATABASE_URL) {
    return true; // DATABASE_URL is sufficient
  }
  // Otherwise, all individual DB fields must be set
  return data.DB_HOST && data.DB_NAME && data.DB_USER && data.DB_PASSWORD;
}, {
  message: 'Database configuration incomplete: Either set DATABASE_URL or all of (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)',
  path: ['DATABASE_URL']
});

/**
 * Validated environment variables type
 */
export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validate environment variables and fail fast with clear error messages
 *
 * @throws {Error} If environment variables are invalid or missing
 * @returns {ValidatedEnv} Validated and typed environment variables
 *
 * @example
 * ```typescript
 * import { validateEnv } from './env.validation';
 *
 * // Call this at application startup, before creating any servers
 * const env = validateEnv();
 * ```
 */
export function validateEnv(): ValidatedEnv {
  try {
    const validated = envSchema.parse(process.env);

    // Additional production checks
    if (validated.NODE_ENV === 'production') {
      // SECURITY: Warn about wildcard CORS in production
      if (validated.CORS_ORIGIN?.includes('*')) {
        console.warn('⚠️  WARNING: CORS wildcard (*) is enabled in production. This may pose security risks.');
      }

      // SECURITY: Ensure SSL is properly configured in production
      if (validated.DATABASE_URL && !validated.DB_SSL_REJECT_UNAUTHORIZED) {
        console.warn('⚠️  WARNING: Database SSL certificate validation is disabled in production. This may pose security risks.');
      }
    }

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors with clear, actionable messages
      const errorMessages = error.errors.map(err => {
        const path = err.path.join('.');
        return `  ❌ ${path}: ${err.message}`;
      });

      const errorMessage = [
        '',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '🔒 ENVIRONMENT CONFIGURATION ERROR',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '',
        'The application cannot start due to invalid or missing',
        'environment variables. Please check your .env file.',
        '',
        'Validation Errors:',
        ...errorMessages,
        '',
        'Security Tips:',
        '  • Generate secure secrets: openssl rand -base64 32',
        '  • Never commit .env files to version control',
        '  • Use different secrets for each environment',
        '  • Ensure all required variables are set',
        '',
        'See .env.example for a complete configuration template.',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        ''
      ].join('\n');

      console.error(errorMessage);
      process.exit(1);
    }

    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Helper function to check if running in production
 */
export function isProduction(env: ValidatedEnv): boolean {
  return env.NODE_ENV === 'production';
}

/**
 * Helper function to check if running in development
 */
export function isDevelopment(env: ValidatedEnv): boolean {
  return env.NODE_ENV === 'development';
}

/**
 * Helper function to check if running in test
 */
export function isTest(env: ValidatedEnv): boolean {
  return env.NODE_ENV === 'test';
}
