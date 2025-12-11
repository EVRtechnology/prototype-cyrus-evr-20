# EVR Billings Score Prototype

A reputation pooling and collective decision-making system featuring real-time voting, exponential vote distribution, and innovative QR-based reputation staking.

## 🎯 Overview

The EVR Billings Score system enables groups to make collective decisions through:
- **Dynamic Reputation**: Participants earn/lose reputation (Billings Score) based on suggestion success
- **Exponential Voting**: Vote requirements grow exponentially (3, 9, 27...) across rounds
- **Reputation Pooling**: Failed suggestions can get a second chance through QR-based support staking
- **Real-time Monitoring**: Facilitators track all activity through a live dashboard

## 🏗️ Architecture

This is a monorepo containing:
- **Backend**: Node.js/Express server with PostgreSQL, Redis, and Socket.io
- **Facilitator Dashboard**: React web app for session management
- **Participant App**: React PWA for mobile participation
- **Shared Types**: Common TypeScript definitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure backend**:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database and Redis credentials
   ```

3. **Set up database**:
   ```bash
   # Create database
   createdb evr_billings

   # Run migrations
   cd backend
   npm run migrate:up
   ```

4. **Start development**:
   ```bash
   # From root directory
   npm run dev
   ```

This starts all services:
- Backend: http://localhost:3000
- Facilitator Dashboard: http://localhost:5173
- Participant App: http://localhost:5174

## 📚 Documentation

- [Implementation Progress](./IMPLEMENTATION.md) - Detailed development status
- [Technical Spec](https://linear.app/evrapp/issue/EVR-24/) - Full technical implementation plan

## 🎮 How It Works

### For Facilitators
1. Create a session with custom configuration
2. Share session code with participants
3. Monitor live activity through dashboard
4. Control session phases (submission, voting, results)
5. View real-time statistics and analytics

### For Participants
1. Join session with code
2. Choose role: Submitter or Voter
3. Submit suggestions (if submitter)
4. Vote on distributed suggestions
5. Stake reputation to support failed suggestions (via QR code)
6. Track personal Billings Score

### Billings Score Algorithm

- **Initial Score**: 0.5 (everyone starts equal)
- **Success**: `score + (0.1 × (1 - score))`
- **Failure**: `score - (0.1 × score)`
- **Help Success**: `score + 0.02`
- **Help Failure**: `score - 0.05`
- **Passive Gain**: `score + 0.001` (every 5 min)

## 🛠️ Technology Stack

- **Backend**: Express, Socket.io, PostgreSQL, Redis
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Real-time**: Socket.io (WebSocket)
- **State**: Zustand
- **QR Codes**: qrcode, html5-qrcode

## 📊 Current Status

**Stage 1 In Progress**: Backend foundation and session management

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detailed progress.

## 🤝 Contributing

This is a research prototype for studying reputation pooling and collective decision-making.

## 📄 License

Proprietary - EVR Technology

---

**Repository**: https://github.com/EVRtechnology/prototype-cyrus-evr-20
