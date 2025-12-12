# Security Quick Start Guide

## For Developers - Get Started in 5 Minutes

### Step 1: Generate Secrets (2 minutes)

Run these commands to generate three unique secrets:

```bash
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
echo "QR_HMAC_SECRET=$(openssl rand -base64 32)"
```

### Step 2: Create .env File (1 minute)

Copy the template:

```bash
cp .env.example .env
```

### Step 3: Update Secrets (1 minute)

Edit `.env` and replace these lines with your generated values:

```bash
JWT_SECRET=<paste-first-generated-value>
SESSION_SECRET=<paste-second-generated-value>
QR_HMAC_SECRET=<paste-third-generated-value>
```

### Step 4: Start the Application (1 minute)

```bash
npm run dev
```

If you see errors, check the error message - it will tell you exactly what's wrong!

## Common Error Messages and Fixes

### Error: "JWT_SECRET must be at least 32 characters"

**Solution:** Generate a proper secret:
```bash
openssl rand -base64 32
```

### Error: "JWT_SECRET appears to contain placeholder text"

**Solution:** Don't use the example values from `.env.example`. Generate unique secrets with `openssl rand -base64 32`.

### Error: "Database configuration incomplete"

**Solution:** Either set `DATABASE_URL` OR all of `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

### Warning: "DATABASE SSL CERTIFICATE VALIDATION IS DISABLED"

**Solution:**
- For production: Set `DB_SSL_REJECT_UNAUTHORIZED=true`
- For local development: This warning is safe to ignore

## Production Deployment - 3 Minute Checklist

### Before Deploying:

1. **Secrets** (1 min)
   ```bash
   # Generate fresh secrets for production
   openssl rand -base64 32  # JWT_SECRET
   openssl rand -base64 32  # SESSION_SECRET
   openssl rand -base64 32  # QR_HMAC_SECRET
   ```

2. **Security Settings** (1 min)
   ```bash
   NODE_ENV=production
   DB_SSL_REJECT_UNAUTHORIZED=true
   CORS_ORIGIN=https://your-domain.com
   ```

3. **Verify** (1 min)
   ```bash
   # Start application and check logs
   npm start

   # You should see:
   # ✅ Database connected successfully
   #
   # You should NOT see:
   # ⚠️  WARNING: DATABASE SSL CERTIFICATE VALIDATION IS DISABLED
   # ⚠️  WARNING: CORS wildcard (*) is enabled in production
   ```

## Security Best Practices - One-Pagers

### Secrets

✅ DO:
- Generate with `openssl rand -base64 32`
- Use different secrets per environment
- Store in environment variables or secrets manager
- Rotate periodically (every 90 days)

❌ DON'T:
- Use example values from `.env.example`
- Commit secrets to git
- Share secrets across environments
- Use short or predictable secrets

### SSL/TLS

✅ DO:
- Set `DB_SSL_REJECT_UNAUTHORIZED=true` in production
- Use valid SSL certificates
- Keep certificates up to date

❌ DON'T:
- Disable SSL validation in production
- Use self-signed certs in production
- Ignore SSL warnings

### CORS

✅ DO:
- Specify exact origins in production
- Use HTTPS origins in production
- Review allowed origins regularly

❌ DON'T:
- Use wildcard (`*`) in production
- Allow `http://` origins in production
- Add origins without review

## Testing Your Security Setup

### Quick Security Test

```bash
# Test 1: Ensure secrets are required
unset JWT_SECRET
npm run dev
# Expected: Should fail with clear error message

# Test 2: Ensure secrets must be strong
JWT_SECRET=weak npm run dev
# Expected: Should fail - secret too short

# Test 3: Ensure placeholder detection works
JWT_SECRET=change-this-secret-in-production npm run dev
# Expected: Should fail - contains placeholder text

# Test 4: Verify success with proper setup
JWT_SECRET=$(openssl rand -base64 32) \
SESSION_SECRET=$(openssl rand -base64 32) \
QR_HMAC_SECRET=$(openssl rand -base64 32) \
npm run dev
# Expected: Should start successfully
```

## Need Help?

### Documentation

- **Quick Start**: This file (you are here!)
- **Comprehensive Guide**: See `/backend/SECURITY.md`
- **Implementation Details**: See `/SECURITY_IMPLEMENTATION_SUMMARY.md`
- **Configuration Template**: See `/backend/.env.example`

### Common Questions

**Q: Can I use the same secret for development and production?**
A: No! Always use different secrets per environment.

**Q: How often should I rotate secrets?**
A: Every 90 days, or immediately if compromised.

**Q: What if I committed secrets to git accidentally?**
A: Rotate all secrets immediately and use `git filter-branch` to remove from history.

**Q: Can I disable security checks for local development?**
A: No. The security checks are lightweight and help catch issues early.

**Q: What's the minimum secret length?**
A: 32 characters. This provides approximately 256 bits of entropy.

### Getting Unstuck

1. **Read the error message** - It will tell you exactly what's wrong
2. **Check `.env.example`** - It has examples and documentation
3. **Verify secrets are generated** - Use `openssl rand -base64 32`
4. **Check environment variables** - Use `printenv | grep SECRET`

## One-Command Setup (Advanced)

For quick local development setup:

```bash
# Generate .env with secure secrets automatically
cat > .env << EOF
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=evr_billings
DB_USER=postgres
DB_PASSWORD=postgres

DB_SSL_REJECT_UNAUTHORIZED=false

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h

SESSION_SECRET=$(openssl rand -base64 32)

CORS_ORIGIN=http://localhost:5173,http://localhost:5174

QR_CODE_EXPIRY_MINUTES=30
QR_HMAC_SECRET=$(openssl rand -base64 32)

WS_PING_INTERVAL=25000
WS_PING_TIMEOUT=60000
EOF

echo "✅ .env file created with secure secrets!"
```

## Visual Security Status

After starting your application, you should see:

✅ **Good:**
```
✅ Database connected successfully
[Server] Server running on port 3000
```

⚠️ **Warning (Development OK, Production Bad):**
```
⚠️  WARNING: DATABASE SSL CERTIFICATE VALIDATION IS DISABLED
⚠️  WARNING: CORS wildcard (*) is enabled in production
```

❌ **Error (Fix Required):**
```
🔒 ENVIRONMENT CONFIGURATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Validation Errors:
  ❌ JWT_SECRET: Must be at least 32 characters...
```

## Security Checklist (Copy This!)

Development:
- [ ] Copied `.env.example` to `.env`
- [ ] Generated three unique secrets with openssl
- [ ] Application starts without errors
- [ ] `.env` is in `.gitignore`

Production:
- [ ] New secrets generated (different from dev)
- [ ] `NODE_ENV=production`
- [ ] `DB_SSL_REJECT_UNAUTHORIZED=true`
- [ ] `CORS_ORIGIN` set to specific domains
- [ ] No security warnings in logs
- [ ] Secrets stored in secrets manager
- [ ] `.env` not deployed (use environment variables)

---

**Last Updated:** 2025-12-11

**Questions?** See `/backend/SECURITY.md` for comprehensive documentation.
