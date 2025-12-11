// Facilitator Functions

// Create Session Form Handler
async function handleCreateSession(event) {
    event.preventDefault();

    const name = document.getElementById('session-name').value.trim();
    const facilitatorId = document.getElementById('facilitator-id').value.trim();

    if (!name || !facilitatorId) {
        showToast('Error', 'Please fill in all fields', 'error');
        return;
    }

    showLoading();

    try {
        // Create session via API
        const session = await api.sessions.create(name, facilitatorId);

        // Update app state
        appState.currentSession = session;
        appState.isFacilitator = true;

        // Start the session automatically
        await api.sessions.start(session.id);

        // Join the session room via WebSocket
        socketManager.joinSession(session.id, facilitatorId, 'facilitator');

        // Update UI
        document.getElementById('session-create-card').classList.add('hidden');
        document.getElementById('session-active-card').classList.remove('hidden');
        document.getElementById('active-session-name').textContent = session.name;
        document.getElementById('active-session-code').textContent = session.code;

        // Load participants
        await loadParticipants();

        showToast('Success', `Session created with code: ${session.code}`, 'success');
    } catch (error) {
        console.error('Failed to create session:', error);
        showToast('Error', error.message || 'Failed to create session', 'error');
    } finally {
        hideLoading();
    }
}

// Load Participants
async function loadParticipants() {
    if (!appState.currentSession) return;

    try {
        const participants = await api.participants.listBySession(appState.currentSession.id);
        appState.participants = participants;

        // Update participant count
        document.getElementById('participant-count').textContent = participants.length;

        // Render participants list
        renderParticipants(participants, 'participants-list');

        // Update stats
        updateSessionStats(participants);
    } catch (error) {
        console.error('Failed to load participants:', error);
    }
}

// Copy Session Code
async function copySessionCode() {
    if (!appState.currentSession) return;

    const success = await copyToClipboard(appState.currentSession.code);
    if (success) {
        showToast('Copied', 'Session code copied to clipboard', 'success');
    } else {
        showToast('Error', 'Failed to copy session code', 'error');
    }
}

// Pause Session
async function pauseSession() {
    if (!appState.currentSession) return;

    try {
        socketManager.pauseSession(appState.currentSession.id);
        showToast('Session Paused', 'The session has been paused', 'info');
    } catch (error) {
        console.error('Failed to pause session:', error);
        showToast('Error', 'Failed to pause session', 'error');
    }
}

// End Session
async function endSession() {
    if (!appState.currentSession) return;

    if (!confirm('Are you sure you want to end this session? This cannot be undone.')) {
        return;
    }

    showLoading();

    try {
        // End session via API
        await api.sessions.end(appState.currentSession.id);

        // Notify via WebSocket
        socketManager.endSessionSocket(appState.currentSession.id);

        // Leave the session room
        socketManager.leaveSession(appState.currentSession.id, appState.currentSession.facilitatorId);

        showToast('Success', 'Session ended successfully', 'success');

        // Reset after a delay
        setTimeout(() => {
            resetToHome();
        }, 2000);
    } catch (error) {
        console.error('Failed to end session:', error);
        showToast('Error', error.message || 'Failed to end session', 'error');
    } finally {
        hideLoading();
    }
}
