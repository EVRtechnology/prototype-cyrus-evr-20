# EVR Billings Score V1 - Quick Start Guide

Get the backend running in 5 minutes!

## Step 1: Start Database

```bash
# From project root
docker-compose up -d

# Verify it's running
docker-compose ps
```

Expected output:
```
NAME            STATUS
evr-postgres    Up
evr-redis       Up
```

## Step 2: Install Dependencies

```bash
cd backend
npm install
```

## Step 3: Setup Environment

```bash
# From backend directory
cd ../backend
cp .env.example .env
```

The default `.env` values work with docker-compose. No changes needed!

## Step 4: Run Migrations

```bash
# From backend directory
npm run migrate:up
```

Expected output:
```
> Migrating files:
> === 001_create_sessions_table
> === 002_create_participants_table
> === 003_create_suggestions_table
> === 004_create_votes_table
> === 005_create_support_stakes_table
```

## Step 5: Start the Server

```bash
# From backend directory
npm run dev
```

Expected output:
```
Testing database connection...
✅ Database connected successfully
Socket.io initialized

=================================
Server Environment: development
Server running on port 3000
API available at: http://localhost:3000/api
Health check at: http://localhost:3000/health
=================================
```

## Step 6: Test the API

### Option A: Using the Test Script

```bash
# Make script executable (you may need to approve this)
chmod +x test-api.sh

# Run the test
./test-api.sh
```

### Option B: Manual Testing with curl

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Create a session
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Session",
    "facilitatorId": "facilitator-1"
  }'

# Copy the session ID from the response above, then:

# 3. Join the session
curl -X POST http://localhost:3000/api/sessions/YOUR_SESSION_ID/join \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Alice",
    "role": "voter"
  }'
```

## Success Criteria

You should be able to:
- ✅ Start the server without errors
- ✅ Get a healthy response from `/health`
- ✅ Create a session via API
- ✅ Join a session as a participant
- ✅ See database records being created

## Troubleshooting

### "Database connection failed"

```bash
# Check if PostgreSQL is running
docker-compose ps

# If not running, start it
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### "Port 3000 already in use"

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or change the port in .env
echo "PORT=3001" >> .env
```

### "Migrations failed"

```bash
# Drop and recreate database
docker-compose down -v
docker-compose up -d

# Wait a few seconds, then run migrations again
npm run migrate:up
```

### TypeScript errors

```bash
# Rebuild shared types
cd ../shared
npm run build

# Then try starting the backend again
cd ../backend
npm run dev
```

## Next Steps

Now that you have a working backend, check out:

1. **[TESTING.md](./TESTING.md)** - Comprehensive API testing guide
2. **[backend/README.md](./backend/README.md)** - Full backend documentation
3. **Database inspection** - Connect to PostgreSQL and explore the data

## What's Working

The V1 backend includes:

### API Endpoints
- ✅ Session creation and management
- ✅ Participant joining and management
- ✅ Score updates
- ✅ Health checks

### Database Models
- ✅ Session model with CRUD operations
- ✅ Participant model with score tracking
- ✅ Suggestion model (ready for V2)
- ✅ Vote model (ready for V2)
- ✅ Support Stake model (ready for V2)

### WebSocket Support
- ✅ Socket.io integration
- ✅ Session room management
- ✅ Basic event handling

### Infrastructure
- ✅ PostgreSQL with migrations
- ✅ Express with middleware
- ✅ Error handling
- ✅ Logging
- ✅ CORS configuration

## What's Next (V2)

To make it feature-complete:
- Suggestion submission routes
- Voting routes
- Support stake routes
- Real-time event broadcasting
- Billings Score calculation logic
- Frontend applications (facilitator & participant)

## Quick Commands Reference

```bash
# Start everything
docker-compose up -d && cd backend && npm run dev

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Reset database
docker-compose down -v && docker-compose up -d && npm run migrate:up

# Check database
docker exec -it evr-postgres psql -U postgres -d evr_billings
```

## Getting Help

If you're stuck:
1. Check the server logs in your terminal
2. Check database logs: `docker-compose logs postgres`
3. Review [TESTING.md](./TESTING.md) for detailed examples
4. Connect to database directly to inspect data

Happy testing!
