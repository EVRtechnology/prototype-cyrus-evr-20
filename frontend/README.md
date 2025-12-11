# EVR Billings Score - Frontend MVP

A real-time collaborative decision-making interface for the EVR Billings Score system.

## Features

### 🎯 Core Functionality
- **Facilitator Dashboard** - Create and manage sessions
- **Participant Interface** - Join sessions and interact with others
- **Real-time Updates** - WebSocket integration for live updates
- **Session Management** - Full session lifecycle support
- **Score Tracking** - Live Billings Score display

### 🎨 User Interface
- Modern, responsive design
- Mobile-friendly layout
- Toast notifications
- Loading states
- Connection status indicator
- Real-time participant list

### 🔌 Backend Integration
- RESTful API client
- WebSocket connection management
- Automatic reconnection
- Error handling
- Health monitoring

## Quick Start

### Prerequisites
1. Backend server running on `http://localhost:3000`
2. Modern web browser with JavaScript enabled

### Running the Frontend

**Option 1: Simple HTTP Server (Recommended)**
```bash
# Navigate to frontend directory
cd frontend

# Using Python 3
python3 -m http.server 8080

# Or using Python 2
python -m SimpleHTTPServer 8080

# Or using Node.js
npx http-server -p 8080
```

**Option 2: Open Directly**
```bash
# Simply open index.html in your browser
open frontend/index.html
# or
firefox frontend/index.html
```

Then open your browser to:
```
http://localhost:8080
```

### First Steps

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Open Frontend**
   ```
   http://localhost:8080
   ```

3. **Test the Connection**
   - You should see "Connected to EVR backend" notification
   - Connection status should show green

## User Flows

### Flow 1: Create a Session (Facilitator)

1. Click **"Start as Facilitator"** on home page
2. Fill in session details:
   - **Session Name**: e.g., "Team Meeting"
   - **Facilitator ID**: e.g., "facilitator-001"
3. Click **"Create Session"**
4. Session is created and started automatically
5. Share the **Session Code** (e.g., ABCD-1234) with participants
6. Monitor participants as they join
7. View real-time statistics

### Flow 2: Join a Session (Participant)

1. Click **"Join as Participant"** on home page
2. Enter session details:
   - **Session Code**: e.g., "ABCD-1234"
   - **Your Name**: e.g., "Alice"
   - **Role**: Choose "Voter" or "Submitter"
3. Click **"Join Session"**
4. View your Billings Score
5. See other participants
6. Receive real-time updates

## Project Structure

```
frontend/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # All styles
├── js/
│   ├── config.js          # Configuration
│   ├── api.js             # API client
│   ├── socket.js          # WebSocket manager
│   ├── ui.js              # UI utilities
│   ├── facilitator.js     # Facilitator logic
│   ├── participant.js     # Participant logic
│   └── app.js             # Main application
└── README.md              # This file
```

## Configuration

Edit `js/config.js` to change settings:

```javascript
const CONFIG = {
    API_URL: 'http://localhost:3000',      // Backend API URL
    WS_URL: 'http://localhost:3000',       // WebSocket URL
    RECONNECT_DELAY: 3000,                 // Reconnect delay (ms)
    TOAST_DURATION: 5000                   // Toast display time (ms)
};
```

## Features by View

### Home View
- Welcome screen
- Connection status indicator
- Navigation to facilitator or participant mode

### Facilitator View
- **Session Creation**
  - Create new sessions
  - Auto-generate session codes
  - Start sessions automatically

- **Session Management**
  - View session code
  - Copy code to clipboard
  - Pause/resume session
  - End session

- **Participant Monitoring**
  - Real-time participant list
  - Participant roles and scores
  - Live statistics:
    - Number of submitters
    - Number of voters
    - Average Billings Score

### Participant View
- **Join Session**
  - Enter session code
  - Choose username and role
  - Auto-formatted code input

- **Session Participation**
  - View your Billings Score
  - See other participants
  - Real-time updates
  - Leave session

## WebSocket Events

### Connection Events
- `connect` - Connected to server
- `disconnect` - Disconnected from server
- `connect_error` - Connection error

### Session Events
- `joined_session` - Successfully joined session
- `facilitator:participant:joined` - New participant joined
- `facilitator:participant:left` - Participant left
- `session_paused` - Session paused by facilitator
- `session_resumed` - Session resumed
- `session_ended` - Session ended
- `phase_skipped` - Phase changed

## API Integration

### Session Endpoints
```javascript
// Create session
POST /api/sessions
{ name, facilitatorId }

// Get session by code
GET /api/sessions/:code

// Start session
POST /api/sessions/:id/start

// End session
POST /api/sessions/:id/end
```

### Participant Endpoints
```javascript
// Join session
POST /api/sessions/:sessionId/join
{ username, role }

// List participants
GET /api/participants/session/:sessionId

// Remove participant
DELETE /api/participants/:id
```

## Testing the Frontend

### Manual Testing Steps

**Test 1: Create and Join Session**
1. Open frontend in two browser windows
2. Window 1: Create session as facilitator
3. Copy session code
4. Window 2: Join as participant using code
5. Verify participant appears in facilitator view
6. Verify real-time updates work

**Test 2: Connection Status**
1. Stop backend server
2. Verify "Disconnected" status appears
3. Restart backend server
4. Verify "Connected" status returns

**Test 3: Multiple Participants**
1. Create session
2. Join with 3-5 participants in different browsers/tabs
3. Verify all participants appear
4. Verify statistics update correctly
5. Leave one participant
6. Verify updates in facilitator view

**Test 4: Session End**
1. Create session and join as participant
2. End session from facilitator view
3. Verify all participants get notification
4. Verify automatic redirect to home

### Browser Console Testing

```javascript
// Check app state
console.log(appState);

// Check connection
console.log(appState.isConnected);

// Check current session
console.log(appState.currentSession);

// Manually trigger toast
showToast('Test', 'This is a test message', 'success');
```

## Troubleshooting

### Issue: "Server Offline" Message

**Solution:**
1. Check backend is running:
   ```bash
   cd backend
   npm run dev
   ```
2. Verify it's on port 3000
3. Check browser console for errors

### Issue: WebSocket Not Connecting

**Solution:**
1. Check if Socket.io is loaded:
   ```javascript
   console.log(typeof io); // Should be 'function'
   ```
2. Verify CORS is configured in backend
3. Check browser console for WebSocket errors

### Issue: Session Code Not Working

**Solution:**
1. Verify code format: `XXXX-1234` (4 letters, 4 numbers)
2. Check session exists in database
3. Ensure session hasn't ended
4. Try creating a new session

### Issue: Participants Not Appearing

**Solution:**
1. Check browser console for errors
2. Verify WebSocket connection is active
3. Check network tab for failed API calls
4. Refresh the page

### Issue: Styling Not Loading

**Solution:**
1. Verify `styles/main.css` exists
2. Check browser console for 404 errors
3. Clear browser cache
4. Use correct path (relative to index.html)

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required Features
- ES6+ JavaScript
- WebSocket support
- Fetch API
- CSS Grid and Flexbox
- CSS Custom Properties (variables)

## Development Tips

### Debugging

**Enable Verbose Logging:**
```javascript
// In browser console
localStorage.setItem('debug', 'socket.io-client:*');
// Reload page
```

**Monitor WebSocket Traffic:**
1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Click on connection to see messages

**Check API Calls:**
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Inspect request/response

### Common Customizations

**Change Theme Colors:**
Edit CSS variables in `styles/main.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* ... */
}
```

**Add New Toast Types:**
Edit `showToast()` in `js/ui.js`:
```javascript
const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    custom: '🎉'  // Add new type
};
```

**Modify Reconnection Behavior:**
Edit `socketManager` in `js/socket.js`:
```javascript
maxReconnectAttempts: 10,  // Increase attempts
```

## Performance

### Optimizations
- Minimal dependencies (only Socket.io)
- Lazy loading of data
- Efficient DOM updates
- CSS animations (GPU accelerated)
- Debounced event handlers

### Best Practices
- Keep participant count under 100 for optimal performance
- Use modern browsers for best experience
- Stable internet connection recommended
- Clear browser cache if issues occur

## Security Considerations

### Current State (MVP)
⚠️ **This is an MVP - not production ready**

**Missing in MVP:**
- No authentication
- No authorization
- No input sanitization (except XSS prevention)
- No rate limiting
- No HTTPS enforcement

**Implemented:**
- XSS prevention in UI rendering
- Basic input validation
- Connection security via Socket.io

### For Production
Before deploying to production, implement:
1. JWT authentication
2. Input validation/sanitization
3. HTTPS everywhere
4. Rate limiting
5. CSRF protection
6. Content Security Policy

## Future Enhancements

### V2 Features
- [ ] Suggestion submission UI
- [ ] Voting interface
- [ ] Support stake mechanism
- [ ] Round progression
- [ ] Phase management
- [ ] Score history visualization
- [ ] QR code display for joining
- [ ] Sound notifications
- [ ] Dark mode
- [ ] Session history
- [ ] Export results
- [ ] Analytics dashboard

## API Documentation

Full API documentation available in:
- `../backend/README.md` - Backend API reference
- `../TESTING.md` - Testing guide with examples
- `../postman-collection.json` - Import into Postman

## Support

For issues or questions:
1. Check browser console for errors
2. Review backend logs
3. Verify backend is running
4. Check this README's troubleshooting section

## License

Part of the EVR Billings Score project.

---

**Version:** 0.1.0 (MVP)
**Last Updated:** December 11, 2024
**Status:** Ready for Testing
