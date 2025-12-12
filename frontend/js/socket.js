// WebSocket Manager
const socketManager = {
    socket: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,

    // Initialize socket connection
    init() {
        if (this.socket) {
            return;
        }

        this.socket = io(CONFIG.WS_URL, {
            reconnection: true,
            reconnectionDelay: CONFIG.RECONNECT_DELAY,
            reconnectionAttempts: this.maxReconnectAttempts
        });

        appState.socket = this.socket;
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to server');
            appState.isConnected = true;
            this.reconnectAttempts = 0;
            updateConnectionStatus(true);
            showToast('Connected', 'Successfully connected to server', 'success');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            appState.isConnected = false;
            updateConnectionStatus(false);
            showToast('Disconnected', 'Connection to server lost', 'warning');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.reconnectAttempts++;
            updateConnectionStatus(false);

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                showToast('Connection Failed', 'Could not connect to server', 'error');
            }
        });

        // Session events
        this.socket.on('joined_session', (data) => {
            console.log('Joined session:', data);
        });

        this.socket.on('facilitator:participant:joined', (data) => {
            console.log('Participant joined:', data);
            showToast('Participant Joined', `${data.participant.username} joined the session`, 'info');

            if (appState.isFacilitator) {
                loadParticipants();
            } else {
                loadOtherParticipants();
            }
        });

        this.socket.on('facilitator:participant:left', (data) => {
            console.log('Participant left:', data);
            showToast('Participant Left', `${data.participant.username} left the session`, 'info');

            if (appState.isFacilitator) {
                loadParticipants();
            } else {
                loadOtherParticipants();
            }
        });

        this.socket.on('session_paused', (data) => {
            console.log('Session paused:', data);
            showToast('Session Paused', 'The session has been paused', 'warning');
            updateSessionStatus('paused');
        });

        this.socket.on('session_resumed', (data) => {
            console.log('Session resumed:', data);
            showToast('Session Resumed', 'The session has resumed', 'success');
            updateSessionStatus('active');
        });

        this.socket.on('session_ended', (data) => {
            console.log('Session ended:', data);
            showToast('Session Ended', 'The session has ended', 'info');
            updateSessionStatus('ended');

            setTimeout(() => {
                resetToHome();
            }, 3000);
        });

        this.socket.on('phase_skipped', (data) => {
            console.log('Phase skipped:', data);
            showToast('Phase Skipped', `Moved to phase: ${data.newPhase}`, 'info');
        });

        // Ping/Pong for connection health
        this.socket.on('ping', () => {
            this.socket.emit('pong');
        });
    },

    // Join a session room
    joinSession(sessionId, participantId, role) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return;
        }

        this.socket.emit('join_session', {
            sessionId,
            participantId,
            role
        });
    },

    // Leave a session room
    leaveSession(sessionId, participantId) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return;
        }

        this.socket.emit('leave_session', {
            sessionId,
            participantId
        });
    },

    // Facilitator: Pause session
    pauseSession(sessionId) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return;
        }

        this.socket.emit('facilitator:pause', { sessionId });
    },

    // Facilitator: Resume session
    resumeSession(sessionId) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return;
        }

        this.socket.emit('facilitator:resume', { sessionId });
    },

    // Facilitator: End session
    endSessionSocket(sessionId) {
        if (!this.socket) {
            console.error('Socket not initialized');
            return;
        }

        this.socket.emit('facilitator:end_session', { sessionId });
    },

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            appState.socket = null;
        }
    }
};
