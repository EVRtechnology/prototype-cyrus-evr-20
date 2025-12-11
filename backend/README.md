# EVR Billings Score Backend

Backend server for the EVR Billings Score system, built with Express.js, Socket.io, and PostgreSQL.

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (recommended)

### 2. Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start database with Docker
docker-compose up -d

# Run migrations
npm run migrate:up
```

### 3. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

### 4. Verify Installation

```bash
# Check health endpoint
curl http://localhost:3000/health

# Or run the test script
chmod +x test-api.sh
./test-api.sh
```

## API Endpoints

### Sessions
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:code` - Get session by code
- `GET /api/sessions/id/:id` - Get session by ID
- `PATCH /api/sessions/:id` - Update session
- `POST /api/sessions/:id/start` - Start session
- `POST /api/sessions/:id/end` - End session

### Participants
- `POST /api/sessions/:sessionId/join` - Join session
- `GET /api/participants/:id` - Get participant
- `GET /api/participants/session/:sessionId` - List participants
- `POST /api/participants/:id/score` - Update score

### Health
- `GET /health` - Server health check

## WebSocket Events

Connect to `ws://localhost:3000` using Socket.io client.

**Events:**
- `join_session` - Join a session room
- `leave_session` - Leave a session room
- `facilitator:participant:joined` - Participant joined notification
- `facilitator:participant:left` - Participant left notification

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # PostgreSQL connection
│   │   ├── redis.ts     # Redis connection
│   │   └── index.ts     # Main config
│   ├── models/          # Database models
│   │   ├── Session.ts
│   │   ├── Participant.ts
│   │   ├── Suggestion.ts
│   │   ├── Vote.ts
│   │   └── SupportStake.ts
│   ├── routes/          # API routes
│   │   ├── sessions.ts
│   │   ├── participants.ts
│   │   ├── health.ts
│   │   └── index.ts
│   ├── socket/          # WebSocket handlers
│   │   └── index.ts
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── utils/           # Utility functions
│   │   ├── billingsScore.ts
│   │   ├── sessionCode.ts
│   │   ├── qrcode.ts
│   │   └── voteDistribution.ts
│   └── index.ts         # Main server file
├── migrations/          # Database migrations
├── test-api.sh         # API test script
└── package.json
```

## Database

The application uses PostgreSQL with the following tables:
- `sessions` - Session information
- `participants` - Participant data and Billings Scores
- `suggestions` - Submitted suggestions
- `votes` - Vote records
- `support_stakes` - Retry mechanism stakes

### Migrations

```bash
# Apply migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down
```

## Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate:up` - Run database migrations
- `npm run migrate:down` - Rollback migrations
- `npm test` - Run tests (when implemented)

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 3000)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database config
- `CORS_ORIGIN` - Allowed CORS origins

## Testing

See [TESTING.md](../TESTING.md) for comprehensive testing guide including:
- API endpoint testing with curl
- WebSocket testing examples
- Database verification queries
- Complete test flows

Quick test:
```bash
./test-api.sh
```

## Next Steps

For Version 1 testing, the following are implemented:
- ✅ Express server with middleware
- ✅ Database models (Session, Participant, Suggestion, Vote, SupportStake)
- ✅ Session management API
- ✅ Participant management API
- ✅ Basic WebSocket support
- ✅ Health check endpoint

To complete the application:
- Add Suggestion API routes
- Add Vote API routes
- Add Support Stake API routes
- Implement Billings Score calculation logic
- Add real-time event broadcasting
- Build frontend applications

## Troubleshooting

**Database connection fails:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Recreate database
docker-compose down -v
docker-compose up -d
npm run migrate:up
```

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
```

## Documentation

- [TESTING.md](../TESTING.md) - Complete testing guide
- [API Documentation](#api-endpoints) - See above
- [Database Schema](migrations/) - See migration files

## License

Private - EVR Technology
