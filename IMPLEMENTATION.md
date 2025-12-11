# EVR Billings Score Prototype - Implementation Progress

This document tracks the implementation progress of the EVR Billings Score system as outlined in the Technical Implementation Plan.

## 🎯 Project Overview

The EVR Billings Score Prototype is a reputation pooling and collective decision-making system featuring:
- **Facilitator Dashboard**: Web application for session management and live monitoring
- **Participant App**: Mobile-optimized PWA for joining sessions, submitting suggestions, and voting
- **Backend Server**: Node.js/Express server with PostgreSQL, Redis, and Socket.io for real-time communication

## 📁 Project Structure

```
evr-billings-score/
├── backend/                  # Backend server (Express + Socket.io)
│   ├── src/
│   │   ├── config/          # Database, Redis, and app configuration
│   │   ├── models/          # Data models and database queries
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   ├── controllers/     # Request controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Server entry point
│   ├── migrations/          # Database migration files
│   └── package.json
│
├── facilitator-dashboard/    # React + TypeScript web app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management (Zustand)
│   │   ├── services/        # API and WebSocket services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── participant-app/          # React + TypeScript PWA
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management (Zustand)
│   │   ├── services/        # API and WebSocket services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── package.json
│
└── shared/                   # Shared TypeScript types
    ├── types/
    │   ├── session.ts       # Session-related types
    │   ├── participant.ts   # Participant-related types
    │   ├── suggestion.ts    # Suggestion-related types
    │   ├── vote.ts          # Vote and support stake types
    │   ├── events.ts        # WebSocket event types
    │   └── index.ts
    └── package.json
```

## ✅ Completed Items

### Phase 1: Foundation Setup

- [x] **Project Structure**: Monorepo with workspaces for backend, facilitator dashboard, participant app, and shared types
- [x] **Shared Types**: Complete TypeScript type definitions for all data models and WebSocket events
- [x] **Backend Configuration**:
  - Database configuration (PostgreSQL)
  - Redis configuration for session state
  - Environment variables setup
  - Application configuration with defaults
- [x] **Utility Functions**:
  - Session code generation (ABCD-1234 format)
  - Billings score calculation algorithms
  - Vote distribution logic (exponential 3^round)
  - QR code generation and validation with HMAC signatures
- [x] **Database Schema**: SQL migrations for all tables
  - Sessions table
  - Participants table
  - Suggestions table
  - Votes table
  - Support stakes table

## 🚧 In Progress

### Stage 1: Backend Foundation & Session Management

**Next Steps:**
1. Create database model classes with query methods
2. Implement Session Management API endpoints:
   - `POST /api/facilitator/session/create`
   - `GET /api/facilitator/session/:code`
   - `PUT /api/facilitator/session/:code/settings`
   - `DELETE /api/facilitator/session/:code`
3. Create Express server with middleware
4. Set up Socket.io server
5. Build facilitator dashboard setup screen

## 📋 Remaining Stages

### Stage 2: Real-time Infrastructure & Live Monitoring (Week 2-3)
- [ ] WebSocket event system
- [ ] Facilitator dashboard live session control
- [ ] Public display view
- [ ] Real-time broadcasting logic

### Stage 3: Participant Connection & Session Flow (Week 3-4)
- [ ] Participant app join flow
- [ ] Session phase management
- [ ] Participant management backend
- [ ] Facilitator dashboard participant list

### Stage 4: Suggestion Submission & Billings Score Engine (Week 4-5)
- [ ] Participant app submission UI
- [ ] Billings score engine implementation
- [ ] Suggestion management backend
- [ ] Facilitator dashboard submission monitoring

### Stage 5: Voting System & Distribution Logic (Week 5-6)
- [ ] Vote distribution algorithm
- [ ] Participant app voting UI (swipe interface)
- [ ] Voting logic backend
- [ ] Facilitator dashboard voting progress

### Stage 6: Results Processing & Score Updates (Week 6-7)
- [ ] Results calculation engine
- [ ] Participant app results screen
- [ ] Facilitator dashboard results view
- [ ] Public display results screen

### Stage 7: QR Code System & Retry Mechanism (Week 7-8)
- [ ] QR code generation for participants
- [ ] QR code scanning in participant app
- [ ] Retry logic backend
- [ ] Facilitator dashboard retry monitoring

### Stage 8: Multi-Round System & Advanced Features (Week 8-9)
- [ ] Multi-round logic
- [ ] Advanced display controls
- [ ] Data export system
- [ ] Emergency controls

### Stage 9: Polish, Testing & Analytics (Week 9-10)
- [ ] UI/UX polish
- [ ] Analytics and insights
- [ ] Comprehensive testing
- [ ] Documentation

### Stage 10: Deployment & Real-World Testing (Week 10+)
- [ ] Production deployment
- [ ] Pilot sessions
- [ ] Iteration based on feedback

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: PostgreSQL 14+
- **Cache**: Redis 7+
- **Authentication**: JWT tokens
- **QR Generation**: qrcode library
- **TypeScript**: 5.3+

### Frontend (Both Apps)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Real-time**: Socket.io-client
- **UI Components**: Tailwind CSS + Headless UI or shadcn/ui
- **Charts**: Recharts
- **QR Scanning**: html5-qrcode

### Infrastructure
- **Development**: Local Docker containers
- **Production**: Vercel (frontend) + Railway/Render (backend)
- **Database**: Supabase or Railway PostgreSQL
- **Cache**: Railway Redis

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Redis 7+
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EVRtechnology/prototype-cyrus-evr-20.git
   cd prototype-cyrus-evr-20
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Set up database**:
   ```bash
   # Create database
   createdb evr_billings

   # Run migrations
   cd backend
   npm run migrate:up
   ```

5. **Start development servers**:
   ```bash
   # From root directory
   npm run dev
   ```

This will start:
- Backend server on http://localhost:3000
- Facilitator dashboard on http://localhost:5173
- Participant app on http://localhost:5174

## 📊 Core Algorithms

### Billings Score Calculation

```typescript
// Success: Score increases
newScore = min(1.0, currentScore + (0.1 * (1 - currentScore)))

// Failure: Score decreases
newScore = max(0.0, currentScore - (0.1 * currentScore))

// Helped someone (stake success): Small increase
newScore = min(1.0, currentScore + 0.02)

// Helped someone (stake failure): Decrease
newScore = max(0.0, currentScore - 0.05)

// Passive time-based: Tiny increase every 5 minutes
newScore = min(1.0, currentScore + 0.001)
```

### Vote Distribution

```typescript
// Exponential distribution
votesPerSuggestion = 3^round
// Round 1: 3 votes
// Round 2: 9 votes
// Round 3: 27 votes
```

### Approval Threshold

```typescript
// Simple majority
passed = (votesFor / totalVotes) > 0.5
```

## 📝 API Endpoints (Planned)

### Facilitator API
- `POST /api/facilitator/session/create` - Create new session
- `GET /api/facilitator/session/:code` - Get session details
- `PUT /api/facilitator/session/:code/settings` - Update settings
- `DELETE /api/facilitator/session/:code` - End session

### Participant API
- `POST /api/participant/join/:code` - Join session
- `GET /api/participant/:id` - Get participant data
- `POST /api/suggestion/submit` - Submit suggestion
- `POST /api/vote/cast` - Cast vote
- `POST /api/support/stake` - Stake support for retry

### Public API
- `GET /api/public/session/:code` - Get public session info

## 🔌 WebSocket Events

### Facilitator Events
- `facilitator:stats` - Real-time statistics
- `facilitator:participant:joined` - New participant
- `facilitator:participant:left` - Participant left
- `facilitator:phase:changed` - Phase transition
- `facilitator:alert` - System alerts

### Participant Events
- `participant:suggestion:submitted` - Suggestion submitted
- `participant:vote:cast` - Vote cast
- `participant:score:update` - Score updated
- `participant:voting:queue` - Voting queue updated
- `participant:phase:changed` - Phase changed

### Public Events
- `public:stats` - Public statistics
- `public:live_vote_count` - Live vote counts
- `public:results` - Results published

## 🎯 Success Metrics

### Technical Performance
- Handle 500 concurrent participants
- < 500ms latency for vote submission
- 99.9% WebSocket uptime during sessions
- Zero data loss in production

### User Experience
- Facilitators can set up session in < 3 minutes
- Participants can join and vote in < 5 minutes
- < 5% confusion rate during pilot sessions

## 📚 Resources

- [Technical Implementation Plan](https://linear.app/evrapp/issue/EVR-24/)
- [GitHub Repository](https://github.com/EVRtechnology/prototype-cyrus-evr-20)
- [Linear Project](https://linear.app/evrapp)

## 🤝 Contributing

This is a research prototype. For questions or issues, please contact the development team.

---

**Last Updated**: 2025-12-11
**Current Stage**: Stage 1 - Backend Foundation & Session Management
