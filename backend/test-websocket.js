/**
 * WebSocket Test Client
 * Tests Socket.io connection and basic events
 *
 * Usage:
 *   npm install socket.io-client
 *   node test-websocket.js [sessionId]
 */

const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const sessionId = process.argv[2] || 'test-session-id';
const participantId = 'test-participant-' + Math.floor(Math.random() * 1000);

console.log('=================================');
console.log('EVR WebSocket Test Client');
console.log('=================================');
console.log('Server:', SERVER_URL);
console.log('Session ID:', sessionId);
console.log('Participant ID:', participantId);
console.log('=================================\n');

// Connect to server
const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to server');
  console.log('Socket ID:', socket.id);

  // Join session
  console.log('\nJoining session...');
  socket.emit('join_session', {
    sessionId,
    participantId,
    role: 'voter',
  });
});

socket.on('joined_session', (data) => {
  console.log('✅ Joined session successfully');
  console.log('Data:', data);

  // Test ping/pong
  console.log('\nTesting ping/pong...');
  socket.emit('ping');
});

socket.on('pong', () => {
  console.log('✅ Pong received');

  // Leave session after 2 seconds
  setTimeout(() => {
    console.log('\nLeaving session...');
    socket.emit('leave_session', { sessionId });

    setTimeout(() => {
      console.log('\nDisconnecting...');
      socket.disconnect();
    }, 1000);
  }, 2000);
});

// Facilitator events
socket.on('facilitator:participant:joined', (data) => {
  console.log('📢 Participant joined:', data);
});

socket.on('facilitator:participant:left', (data) => {
  console.log('📢 Participant left:', data);
});

socket.on('facilitator:stats', (data) => {
  console.log('📊 Stats update:', data);
});

socket.on('facilitator:phase:changed', (data) => {
  console.log('🔄 Phase changed:', data);
});

socket.on('facilitator:alert', (data) => {
  console.log('⚠️  Alert:', data);
});

// Participant events
socket.on('participant:suggestion:submitted', (data) => {
  console.log('📝 Suggestion submitted:', data);
});

socket.on('participant:vote:cast', (data) => {
  console.log('🗳️  Vote cast:', data);
});

socket.on('participant:score:update', (data) => {
  console.log('📈 Score update:', data);
});

socket.on('participant:voting:queue', (data) => {
  console.log('📋 Voting queue:', data);
});

socket.on('participant:phase:changed', (data) => {
  console.log('🔄 Phase changed:', data);
});

// Session events
socket.on('session_paused', (data) => {
  console.log('⏸️  Session paused:', data);
});

socket.on('session_resumed', (data) => {
  console.log('▶️  Session resumed:', data);
});

socket.on('phase_skipped', (data) => {
  console.log('⏭️  Phase skipped:', data);
});

socket.on('session_ended', (data) => {
  console.log('🏁 Session ended:', data);
});

// Error events
socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('\n❌ Disconnected:', reason);
  console.log('\nTest complete!');
  process.exit(0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  socket.disconnect();
  process.exit(0);
});

// Keep alive
setInterval(() => {
  if (socket.connected) {
    socket.emit('ping');
  }
}, 30000);
