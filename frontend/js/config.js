// Configuration
const CONFIG = {
    API_URL: 'http://localhost:3000',
    WS_URL: 'http://localhost:3000',
    RECONNECT_DELAY: 3000,
    TOAST_DURATION: 5000
};

// Application state
const appState = {
    currentView: 'home',
    currentSession: null,
    currentParticipant: null,
    participants: [],
    socket: null,
    isConnected: false,
    isFacilitator: false
};
