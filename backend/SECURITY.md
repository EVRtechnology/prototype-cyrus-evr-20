# Security Hardening Documentation

## Overview

This document describes the security hardening measures implemented for the EVR Billings Score prototype application. All critical security vulnerabilities identified in the security audit have been addressed.

## Critical Security Fixes

### 1. Removed Hardcoded Secrets

**Files Modified:**
- `/backend/src/config/index.ts`
- `/backend/src/config/env.validation.ts` (new)

**What Was Fixed:**
- Removed hardcoded default values for `JWT_SECRET`, `SESSION_SECRET`, and `QR_HMAC_SECRET`
- Application now fails immediately on startup if any required secrets are missing or weak
- Implemented comprehensive environment variable validation using Zod

**Security Requirements:**
All secrets must now:
- Be at least 32 characters long
- Be cryptographically random (generated via `openssl rand -base64 32`)
- Not contain placeholder text like "secret", "dev", "change", "production", etc.
- Be different for each environment
- Never be committed to version control

**Error Messages:**
The application provides clear, actionable error messages when secrets are missing or invalid:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 ENVIRONMENT CONFIGURATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The application cannot start due to invalid or missing
environment variables. Please check your .env file.

Validation Errors:
  ❌ JWT_SECRET: JWT_SECRET must be at least 32 characters long for security. Generate using: openssl rand -base64 32

Security Tips:
  • Generate secure secrets: openssl rand -base64 32
  • Never commit .env files to version control
  • Use different secrets for each environment
  • Ensure all required variables are set

See .env.example for a complete configuration template.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Fixed SSL Certificate Validation

**Files Modified:**
- `/backend/src/config/database.ts`

**What Was Fixed:**
- Changed `rejectUnauthorized: false` to configurable via `DB_SSL_REJECT_UNAUTHORIZED` environment variable
- Default is now `true` (secure by default)
- Added clear warning messages when SSL validation is disabled in production

**Production Security:**
```javascript
// Before (INSECURE):
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false

// After (SECURE):
ssl: getSSLConfig()  // Returns { rejectUnauthorized: true } by default
```

**Warning System:**
If SSL validation is disabled in production, the application logs:
```
⚠️  WARNING: DATABASE SSL CERTIFICATE VALIDATION IS DISABLED
⚠️  This may expose your application to man-in-the-middle attacks
⚠️  Set DB_SSL_REJECT_UNAUTHORIZED=true in production
```

### 3. Implemented Input Validation

**Files Modified:**
- `/backend/src/utils/qrcode.ts`
- `/backend/src/utils/billingsScore.ts`

#### QR Code Data Validation

Added strict Zod schema validation for QR code data:

```typescript
const QRCodeDataSchema = z.object({
  participantId: z.string().uuid(),
  sessionId: z.string().uuid(),
  billingsScore: z.number().min(0).max(1),
  expiresAt: z.string().datetime(),
  signature: z.string().min(64).max(64).regex(/^[a-f0-9]+$/),
}).strict();
```

**Protections Added:**
- Type confusion attacks prevented
- Missing required fields rejected
- Invalid data types rejected
- Malformed timestamps rejected
- Score manipulation prevented (must be 0-1)
- DoS protection (10KB size limit on QR data)
- Strict mode rejects unexpected properties

#### Billings Score Validation

Added validation to all score calculation functions:

```typescript
const ScoreSchema = z.number()
  .min(0)
  .max(1)
  .finite(); // Rejects NaN and Infinity
```

**Functions Protected:**
- `calculateSuccessScore()`
- `calculateFailureScore()`
- `calculateHelpSuccessScore()`
- `calculateHelpFailureScore()`
- `calculatePassiveScore()`
- `normalizeScore()`
- `formatScore()`
- `scoreToPercentage()`

All functions now validate inputs and throw clear errors for invalid values.

### 4. Added CORS Origin Validation

**Files Modified:**
- `/backend/src/config/env.validation.ts`

**What Was Fixed:**
- CORS origins are now validated and trimmed
- Each origin must be a valid URL or the wildcard "*"
- Warning logged if wildcard is used in production

**Validation Logic:**
```typescript
CORS_ORIGIN: z.string()
  .transform(val => val.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0))
  .refine(origins => origins.length > 0)
  .refine(origins => {
    return origins.every(origin => {
      if (origin === '*') return true;
      try {
        new URL(origin);
        return true;
      } catch {
        return false;
      }
    });
  })
```

### 5. Environment Variable Validation

**New File:**
- `/backend/src/config/env.validation.ts`

**Features:**
- Comprehensive Zod schema for all environment variables
- Validates on application startup (fail-fast approach)
- Clear error messages with remediation steps
- Production-specific security checks
- Type-safe environment configuration

**Validation Includes:**
- Port number range validation (1-65535)
- Node environment (development/production/test)
- Database configuration completeness
- Secret strength validation
- CORS origin format validation
- Timeout values are positive numbers
- QR code expiry within reasonable range (1-1440 minutes)

## Environment Configuration

### Updated .env.example

The `.env.example` file has been completely rewritten with:
- Clear security warnings
- Detailed documentation for each variable
- Requirements for each secret
- Step-by-step instructions for generating secure values
- Production deployment checklist
- Examples for different deployment scenarios

### Generating Secure Secrets

To generate cryptographically secure secrets:

```bash
# Generate a 32-character base64 secret
openssl rand -base64 32

# Example output:
# xK8vN2mP9qL4wR7tY6uH3jF1gD5sA8bC0eZ9nM4kV2x
```

### Required Environment Variables

**Critical Security Variables:**
- `JWT_SECRET` - Must be 32+ chars, cryptographically random
- `SESSION_SECRET` - Must be 32+ chars, different from JWT_SECRET
- `QR_HMAC_SECRET` - Must be 32+ chars, different from other secrets
- `DB_SSL_REJECT_UNAUTHORIZED` - Should be `true` in production

**Database Configuration:**
Either set:
- `DATABASE_URL` (recommended for cloud deployments)

Or all of:
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

## Security Best Practices

### For Developers

1. **Never commit .env files**
   - Ensure `.env` is in `.gitignore`
   - Use `.env.example` as a template only

2. **Generate unique secrets per environment**
   - Development, staging, and production should have different secrets
   - Never reuse secrets across environments

3. **Validate all user input**
   - Use the provided Zod schemas
   - Add additional validation for new features
   - Never trust client-side validation alone

4. **Keep dependencies updated**
   - Regularly update npm packages
   - Monitor security advisories
   - Use `npm audit` to check for vulnerabilities

### For Deployment

1. **Use environment-specific configuration**
   - Set `NODE_ENV=production` in production
   - Enable SSL certificate validation
   - Configure specific CORS origins (no wildcards)

2. **Secure secret management**
   - Use environment variables or secret management services
   - Never hardcode secrets in application code
   - Rotate secrets periodically

3. **Monitor and log security events**
   - Review security warnings in logs
   - Monitor for failed authentication attempts
   - Track unusual QR code validation failures

4. **Regular security audits**
   - Review access logs
   - Verify SSL/TLS configuration
   - Check for exposed secrets in version control history

## Testing Security Features

### Test Environment Variable Validation

```bash
# Should fail with clear error message
JWT_SECRET=short npm run dev

# Should fail - contains placeholder text
JWT_SECRET=change-this-secret npm run dev

# Should succeed
JWT_SECRET=$(openssl rand -base64 32) \
SESSION_SECRET=$(openssl rand -base64 32) \
QR_HMAC_SECRET=$(openssl rand -base64 32) \
npm run dev
```

### Test Input Validation

```typescript
// QR Code validation
import { parseQRCodeData } from './utils/qrcode';

// Should return null - invalid JSON
const result1 = parseQRCodeData('invalid json');

// Should return null - missing required fields
const result2 = parseQRCodeData('{"participantId": "123"}');

// Should return null - invalid UUID
const result3 = parseQRCodeData('{"participantId": "not-a-uuid", ...}');

// Billings Score validation
import { calculateSuccessScore } from './utils/billingsScore';

// Should throw error - score out of range
calculateSuccessScore(1.5);

// Should throw error - NaN
calculateSuccessScore(NaN);

// Should succeed
calculateSuccessScore(0.75);
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Generated secure random values for all secrets using `openssl rand -base64 32`
- [ ] `JWT_SECRET` is at least 32 characters and cryptographically random
- [ ] `SESSION_SECRET` is at least 32 characters and different from JWT_SECRET
- [ ] `QR_HMAC_SECRET` is at least 32 characters and different from other secrets
- [ ] `DB_SSL_REJECT_UNAUTHORIZED` is set to `true`
- [ ] `CORS_ORIGIN` contains only trusted domains (no wildcards)
- [ ] `NODE_ENV` is set to `production`
- [ ] Database credentials are secure and not default values
- [ ] `.env` file is listed in `.gitignore`
- [ ] All placeholder values (REPLACE_WITH_*) have been replaced
- [ ] Secrets are stored securely (environment variables, secrets manager, etc.)
- [ ] SSL/TLS certificates are valid and properly configured
- [ ] Security warnings have been reviewed and addressed
- [ ] Application starts successfully with production configuration
- [ ] Security audit has been performed

## Security Contact

If you discover a security vulnerability, please:
1. Do not open a public issue
2. Email security@evr.example.com (update with actual contact)
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Zod Documentation](https://zod.dev/)
- [PostgreSQL SSL Documentation](https://www.postgresql.org/docs/current/ssl-tcp.html)

## Changelog

### 2025-12-11 - Security Hardening Release

- Removed all hardcoded secrets from configuration
- Implemented comprehensive environment variable validation
- Fixed SSL certificate validation vulnerability
- Added input validation for QR code data
- Added input validation for Billings Score calculations
- Improved CORS origin validation
- Updated .env.example with security documentation
- Added fail-fast startup validation
- Added clear error messages for security misconfigurations

---

Last Updated: 2025-12-11
Version: 1.0.0
