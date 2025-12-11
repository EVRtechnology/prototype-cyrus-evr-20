# Frontend Quick Start Guide

Get the EVR Billings Score frontend running in 2 minutes!

## Step 1: Start the Backend (if not already running)

```bash
# Terminal 1 - Start database
docker-compose up -d

# Terminal 2 - Start backend
cd backend
npm install  # First time only
npm run migrate:up  # First time only
npm run dev
```

You should see:
```
Server running on port 3000
Connected to PostgreSQL
Connected to Redis
```

## Step 2: Start the Frontend

```bash
# Terminal 3 - Start frontend server
cd frontend
python3 -m http.server 8080
```

Or use Node.js:
```bash
npx http-server -p 8080
```

## Step 3: Open in Browser

Open your browser to:
```
http://localhost:8080
```

You should see:
- ✅ Green "Connected" status
- ✅ "Connected to EVR backend" notification

## Step 4: Test It!

### Quick Test (30 seconds)

1. **Create a Session:**
   - Click "Start as Facilitator"
   - Name: "Test Session"
   - Facilitator ID: "facilitator-1"
   - Click "Create Session"
   - Copy the session code (e.g., ABCD-1234)

2. **Join as Participant:**
   - Open new browser tab to `http://localhost:8080`
   - Click "Join as Participant"
   - Enter the session code
   - Name: "Alice"
   - Role: "Voter"
   - Click "Join Session"

3. **Verify Real-time Updates:**
   - Switch back to facilitator tab
   - See Alice appear in participant list!
   - Check statistics update

## What You Can Do

### As Facilitator:
- ✅ Create sessions
- ✅ Share session codes
- ✅ Monitor participants in real-time
- ✅ View statistics
- ✅ Pause/end sessions

### As Participant:
- ✅ Join sessions with code
- ✅ See your Billings Score
- ✅ View other participants
- ✅ Get real-time updates
- ✅ Leave sessions

## Troubleshooting

### Backend Not Running?
```bash
cd backend
npm run dev
```

### Port 8080 Already in Use?
```bash
python3 -m http.server 8081
# Then open http://localhost:8081
```

### Can't Connect to Backend?
1. Check backend is on port 3000
2. Look for errors in browser console (F12)
3. Verify `http://localhost:3000/health` works

### WebSocket Issues?
1. Refresh the page
2. Clear browser cache
3. Check backend logs for errors

## Next Steps

- Read `frontend/README.md` for full documentation
- Read `TESTING.md` for comprehensive testing
- Review `backend/README.md` for API details

## Screenshots

### Home Screen
Clean, modern interface with two main options.

### Facilitator Dashboard
Real-time participant monitoring with statistics.

### Participant View
Simple interface showing your score and other participants.

---

**Ready to test!** 🚀
