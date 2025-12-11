// Main Application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('EVR Billings Score App - Initializing...');

    // Initialize WebSocket
    socketManager.init();

    // Setup navigation
    setupNavigation();

    // Setup form handlers
    const createSessionForm = document.getElementById('create-session-form');
    if (createSessionForm) {
        createSessionForm.addEventListener('submit', handleCreateSession);
    }

    const joinSessionForm = document.getElementById('join-session-form');
    if (joinSessionForm) {
        joinSessionForm.addEventListener('submit', handleJoinSession);
    }

    // Check server health
    try {
        const health = await api.checkHealth();
        console.log('Server health:', health);

        if (health.status === 'healthy') {
            updateConnectionStatus(true);
            showToast('Server Ready', 'Connected to EVR backend', 'success');
        }
    } catch (error) {
        console.error('Health check failed:', error);
        updateConnectionStatus(false);
        showToast('Server Offline', 'Could not connect to backend server. Make sure it is running on port 3000.', 'error');
    }

    console.log('EVR Billings Score App - Ready');
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast('Error', 'An unexpected error occurred', 'error');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden');
    } else {
        console.log('Page visible');

        // Refresh data when page becomes visible
        if (appState.currentSession && appState.isFacilitator) {
            loadParticipants();
        } else if (appState.currentSession && appState.currentParticipant) {
            loadOtherParticipants();
        }
    }
});

// Handle beforeunload
window.addEventListener('beforeunload', (event) => {
    // Clean disconnect
    if (appState.currentSession && appState.socket) {
        if (appState.currentParticipant) {
            socketManager.leaveSession(
                appState.currentSession.id,
                appState.currentParticipant.id
            );
        }
    }
});

console.log('App script loaded');
