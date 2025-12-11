# EVR Billings Score - Testing Guide

This guide provides step-by-step instructions for testing Version 1 of the EVR Billings Score backend.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Starting the Server](#starting-the-server)
- [API Testing](#api-testing)
- [WebSocket Testing](#websocket-testing)
- [Database Verification](#database-verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before testing, ensure you have:
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (optional, for production features)
- Docker and Docker Compose (recommended)
- curl, Postman, or similar API testing tool

## Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install shared types
cd ../shared
npm install
```

### 2. Start Database Services

Using Docker Compose (recommended):

```bash
# From the project root
docker-compose up -d

# Verify services are running
docker-compose ps
```

Or manually start PostgreSQL and ensure it's running on port 5432.

### 3. Configure Environment

```bash
# Copy the example environment file
cd backend
cp .env.example .env

# Edit .env if needed (default values should work with docker-compose)
```

Default configuration:
- Server: `http://localhost:3000`
- Database: `postgresql://postgres:password@localhost:5432/evr_billings`
- Redis: `redis://localhost:6379`

### 4. Run Database Migrations

```bash
# From the backend directory
npm run migrate:up
```

You should see output indicating 5 migrations were applied:
- `001_create_sessions_table`
- `002_create_participants_table`
- `003_create_suggestions_table`
- `004_create_votes_table`
- `005_create_support_stakes_table`

## Starting the Server

### Development Mode (with auto-reload)

```bash
cd backend
npm run dev
```

You should see:
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

### Production Mode

```bash
cd backend
npm run build
npm start
```

## API Testing

### 1. Health Check

Verify the server is running and database is connected:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-11T...",
  "uptime": 123.456,
  "database": "connected",
  "environment": "development"
}
```

### 2. Create a Session

Create a new session:

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Session",
    "facilitatorId": "facilitator-123"
  }'
```

Expected response (save the `id` and `code` for later):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "ABCD-1234",
  "name": "Test Session",
  "facilitatorId": "facilitator-123",
  "status": "setup",
  "config": {
    "maxParticipants": 500,
    "totalRounds": 3,
    "anonymousMode": false,
    "retryConfig": {
      "frequency": "every",
      "supportCollectionTime": 30
    },
    "displayOptions": {
      "liveDashboard": true,
      "retryQueue": true,
      "finalResults": true
    }
  },
  "currentRound": 1,
  "createdAt": "2024-12-11T..."
}
```

### 3. Get Session by Code

Retrieve a session using its code:

```bash
curl http://localhost:3000/api/sessions/ABCD-1234
```

### 4. Update Session

Update session configuration:

```bash
curl -X PATCH http://localhost:3000/api/sessions/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "lobby",
    "config": {
      "maxParticipants": 100
    }
  }'
```

### 5. Join Session as Participant

Add a participant to the session:

```bash
# Replace SESSION_ID with your actual session ID
curl -X POST http://localhost:3000/api/sessions/SESSION_ID/join \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Alice",
    "role": "submitter"
  }'
```

Expected response (save the participant `id`):
```json
{
  "id": "participant-uuid",
  "sessionId": "session-uuid",
  "username": "Alice",
  "billingsScore": 0.5,
  "role": "submitter",
  "hasSubmitted": false,
  "votesCompleted": 0,
  "scoreHistory": [],
  "joinedAt": "2024-12-11T...",
  "isActive": true
}
```

### 6. Add Multiple Participants

Add more participants:

```bash
# Voter 1
curl -X POST http://localhost:3000/api/sessions/SESSION_ID/join \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Bob",
    "role": "voter"
  }'

# Voter 2
curl -X POST http://localhost:3000/api/sessions/SESSION_ID/join \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Charlie",
    "role": "voter"
  }'

# Anonymous participant (auto-generated username)
curl -X POST http://localhost:3000/api/sessions/SESSION_ID/join \
  -H "Content-Type: application/json" \
  -d '{
    "role": "voter"
  }'
```

### 7. Get Participant Info

Retrieve participant details:

```bash
curl http://localhost:3000/api/participants/PARTICIPANT_ID
```

### 8. Get All Participants in Session

List all participants:

```bash
# All participants
curl http://localhost:3000/api/participants/session/SESSION_ID

# Active participants only
curl http://localhost:3000/api/participants/session/SESSION_ID?activeOnly=true
```

### 9. Update Participant Score

Update a participant's Billings Score:

```bash
curl -X POST http://localhost:3000/api/participants/PARTICIPANT_ID/score \
  -H "Content-Type: application/json" \
  -d '{
    "newScore": 0.6,
    "round": 1,
    "reason": "Submitted a suggestion"
  }'
```

### 10. Start Session

Move session from setup to lobby:

```bash
curl -X POST http://localhost:3000/api/sessions/SESSION_ID/start
```

### 11. End Session

End the session:

```bash
curl -X POST http://localhost:3000/api/sessions/SESSION_ID/end
```

## WebSocket Testing

### Using Browser Console

1. Open your browser's developer console
2. Connect to the WebSocket server:

```javascript
const socket = io('http://localhost:3000');

// Listen for connection
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// Join a session
socket.emit('join_session', {
  sessionId: 'YOUR_SESSION_ID',
  participantId: 'YOUR_PARTICIPANT_ID',
  role: 'voter'
});

// Listen for join confirmation
socket.on('joined_session', (data) => {
  console.log('Joined session:', data);
});

// Listen for participant events
socket.on('facilitator:participant:joined', (data) => {
  console.log('Participant joined:', data);
});

socket.on('facilitator:participant:left', (data) => {
  console.log('Participant left:', data);
});

// Send ping
socket.emit('ping');

socket.on('pong', () => {
  console.log('Pong received');
});
```

### Using Node.js Script

Create a file `test-websocket.js`:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);

  // Join session
  socket.emit('join_session', {
    sessionId: 'YOUR_SESSION_ID',
    participantId: 'test-participant',
    role: 'voter'
  });
});

socket.on('joined_session', (data) => {
  console.log('Joined session:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

Run it:
```bash
npm install socket.io-client
node test-websocket.js
```

## Database Verification

### Connect to PostgreSQL

Using Docker:
```bash
docker exec -it evr-postgres psql -U postgres -d evr_billings
```

Or connect directly:
```bash
psql -h localhost -U postgres -d evr_billings
```

### Verify Tables

```sql
-- List all tables
\dt

-- Check sessions
SELECT id, code, name, status, current_round FROM sessions;

-- Check participants
SELECT id, username, role, billings_score, is_active FROM participants;

-- Count participants by session
SELECT session_id, COUNT(*) as participant_count
FROM participants
WHERE is_active = true
GROUP BY session_id;

-- View participant scores
SELECT username, billings_score, score_history
FROM participants
ORDER BY billings_score DESC;
```

## Postman Collection

### Import into Postman

1. Create a new collection: "EVR Billings Score API"
2. Add these requests:

**Base URL Variable**: `{{baseUrl}}` = `http://localhost:3000`

#### Requests

1. **Health Check**
   - GET `{{baseUrl}}/health`

2. **Create Session**
   - POST `{{baseUrl}}/api/sessions`
   - Body (JSON):
     ```json
     {
       "name": "My Test Session",
       "facilitatorId": "facilitator-123"
     }
     ```

3. **Get Session by Code**
   - GET `{{baseUrl}}/api/sessions/{{sessionCode}}`

4. **Join Session**
   - POST `{{baseUrl}}/api/sessions/{{sessionId}}/join`
   - Body (JSON):
     ```json
     {
       "username": "Test User",
       "role": "voter"
     }
     ```

5. **Get Participant**
   - GET `{{baseUrl}}/api/participants/{{participantId}}`

6. **Update Participant Score**
   - POST `{{baseUrl}}/api/participants/{{participantId}}/score`
   - Body (JSON):
     ```json
     {
       "newScore": 0.6,
       "round": 1,
       "reason": "Test score update"
     }
     ```

## Complete Test Flow

Here's a complete test flow from start to finish:

```bash
# 1. Check health
curl http://localhost:3000/health

# 2. Create session
SESSION=$(curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"name":"Flow Test","facilitatorId":"f1"}' \
  -s | jq -r '.id')

echo "Session ID: $SESSION"

# 3. Join as submitter
SUBMITTER=$(curl -X POST http://localhost:3000/api/sessions/$SESSION/join \
  -H "Content-Type: application/json" \
  -d '{"username":"Alice","role":"submitter"}' \
  -s | jq -r '.id')

echo "Submitter ID: $SUBMITTER"

# 4. Join as voters
VOTER1=$(curl -X POST http://localhost:3000/api/sessions/$SESSION/join \
  -H "Content-Type: application/json" \
  -d '{"username":"Bob","role":"voter"}' \
  -s | jq -r '.id')

VOTER2=$(curl -X POST http://localhost:3000/api/sessions/$SESSION/join \
  -H "Content-Type: application/json" \
  -d '{"username":"Charlie","role":"voter"}' \
  -s | jq -r '.id')

# 5. List participants
curl http://localhost:3000/api/participants/session/$SESSION?activeOnly=true | jq

# 6. Update a score
curl -X POST http://localhost:3000/api/participants/$SUBMITTER/score \
  -H "Content-Type: application/json" \
  -d '{"newScore":0.6,"round":1,"reason":"Good submission"}' | jq

# 7. Start session
curl -X POST http://localhost:3000/api/sessions/$SESSION/start | jq

# 8. Get session status
curl http://localhost:3000/api/sessions/id/$SESSION | jq
```

## Troubleshooting

### Database Connection Fails

**Symptom**: "Database connection failed" error on startup

**Solutions**:
1. Verify PostgreSQL is running:
   ```bash
   docker-compose ps
   # or
   pg_isready -h localhost -p 5432
   ```

2. Check database credentials in `.env`

3. Create database manually if needed:
   ```bash
   docker exec -it evr-postgres psql -U postgres -c "CREATE DATABASE evr_billings;"
   ```

### Port Already in Use

**Symptom**: "EADDRINUSE: address already in use :::3000"

**Solutions**:
1. Find and kill the process using port 3000:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. Or change the PORT in `.env`

### Migrations Not Applied

**Symptom**: "relation 'sessions' does not exist"

**Solution**: Run migrations:
```bash
cd backend
npm run migrate:up
```

### CORS Errors

**Symptom**: CORS errors in browser console

**Solution**: Add your frontend URL to `CORS_ORIGIN` in `.env`:
```
CORS_ORIGIN=http://localhost:5173,http://localhost:3001
```

### WebSocket Connection Fails

**Symptom**: Socket.io cannot connect

**Solutions**:
1. Verify server is running
2. Check CORS configuration
3. Check firewall settings
4. Ensure using correct URL (http://, not https:// in development)

## Next Steps

Once you've verified the basic functionality:

1. **Add Suggestion Routes**: Implement routes for creating and voting on suggestions
2. **Add Vote Routes**: Implement voting logic
3. **Add Support Stake Routes**: Implement the retry mechanism
4. **Add Business Logic**: Implement Billings Score calculation
5. **Add Real-time Updates**: Emit Socket.io events for live updates
6. **Build Frontend**: Create participant and facilitator interfaces

## API Reference Quick Guide

### Sessions

- `POST /api/sessions` - Create session
- `GET /api/sessions/:code` - Get by code
- `GET /api/sessions/id/:id` - Get by ID
- `PATCH /api/sessions/:id` - Update session
- `POST /api/sessions/:id/start` - Start session
- `POST /api/sessions/:id/end` - End session
- `DELETE /api/sessions/:id` - Delete session

### Participants

- `POST /api/sessions/:sessionId/join` - Join session
- `GET /api/participants/:id` - Get participant
- `GET /api/participants/session/:sessionId` - List participants
- `PATCH /api/participants/:id` - Update participant
- `POST /api/participants/:id/score` - Update score
- `DELETE /api/participants/:id` - Remove participant

### Health

- `GET /health` - Server health check

### WebSocket Events

**Client to Server:**
- `join_session` - Join a session room
- `leave_session` - Leave a session room
- `ping` - Connection health check

**Server to Client:**
- `joined_session` - Join confirmation
- `facilitator:participant:joined` - Participant joined
- `facilitator:participant:left` - Participant left
- `pong` - Ping response

## Support

For issues or questions, check:
- Server logs in the terminal
- Database logs: `docker-compose logs postgres`
- PostgreSQL directly using the verification commands above
