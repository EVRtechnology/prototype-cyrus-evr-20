// Participant Functions

// Join Session Form Handler
async function handleJoinSession(event) {
    event.preventDefault();

    const code = document.getElementById('join-code').value.trim().toUpperCase();
    const username = document.getElementById('join-username').value.trim();
    const role = document.getElementById('join-role').value;

    if (!code || !username || !role) {
        showToast('Error', 'Please fill in all fields', 'error');
        return;
    }

    // Validate session code format
    if (!isValidSessionCode(code)) {
        showToast('Error', 'Invalid session code format. Use XXXX-1234', 'error');
        return;
    }

    showLoading();

    try {
        // Get session by code
        const session = await api.sessions.getByCode(code);

        if (!session) {
            showToast('Error', 'Session not found', 'error');
            hideLoading();
            return;
        }

        // Check session status
        if (session.status === 'ended' || session.status === 'completed') {
            showToast('Error', 'This session has ended', 'error');
            hideLoading();
            return;
        }

        // Join session
        const participant = await api.participants.join(session.id, username, role);

        // Update app state
        appState.currentSession = session;
        appState.currentParticipant = participant;

        // Join the session room via WebSocket
        socketManager.joinSession(session.id, participant.id, role);

        // Update UI
        document.getElementById('join-card').classList.add('hidden');
        document.getElementById('participant-active-card').classList.remove('hidden');
        document.getElementById('participant-session-name').textContent = session.name;
        document.getElementById('participant-username').textContent = username;
        document.getElementById('participant-role').textContent = role;
        document.getElementById('participant-score').textContent = participant.billingsScore.toFixed(2);

        // Update session status
        updateSessionStatus(session.status);

        // Load other participants
        await loadOtherParticipants();

        showToast('Success', `Joined session: ${session.name}`, 'success');
    } catch (error) {
        console.error('Failed to join session:', error);
        showToast('Error', error.message || 'Failed to join session', 'error');
    } finally {
        hideLoading();
    }
}

// Load Other Participants
async function loadOtherParticipants() {
    if (!appState.currentSession || !appState.currentParticipant) return;

    try {
        const allParticipants = await api.participants.listBySession(appState.currentSession.id);

        // Filter out current participant
        const otherParticipants = allParticipants.filter(
            p => p.id !== appState.currentParticipant.id
        );

        // Update participant count
        document.getElementById('other-participant-count').textContent = otherParticipants.length;

        // Render participants list
        renderParticipants(otherParticipants, 'other-participants-list');

        // Update own score if it changed
        const currentParticipant = allParticipants.find(
            p => p.id === appState.currentParticipant.id
        );

        if (currentParticipant) {
            appState.currentParticipant = currentParticipant;
            document.getElementById('participant-score').textContent =
                currentParticipant.billingsScore.toFixed(2);
        }
    } catch (error) {
        console.error('Failed to load participants:', error);
    }
}

// Leave Session
async function leaveSession() {
    if (!appState.currentSession || !appState.currentParticipant) return;

    if (!confirm('Are you sure you want to leave this session?')) {
        return;
    }

    showLoading();

    try {
        // Leave session via WebSocket
        socketManager.leaveSession(appState.currentSession.id, appState.currentParticipant.id);

        // Remove participant via API
        await api.participants.remove(appState.currentParticipant.id);

        showToast('Success', 'Left session successfully', 'success');

        // Reset after a delay
        setTimeout(() => {
            resetToHome();
        }, 1000);
    } catch (error) {
        console.error('Failed to leave session:', error);
        showToast('Error', error.message || 'Failed to leave session', 'error');
    } finally {
        hideLoading();
    }
}

// Format join code input as user types
document.addEventListener('DOMContentLoaded', () => {
    const joinCodeInput = document.getElementById('join-code');
    if (joinCodeInput) {
        joinCodeInput.addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (value.length > 8) {
                value = value.substring(0, 8);
            }
            if (value.length > 4) {
                value = value.substring(0, 4) + '-' + value.substring(4);
            }
            e.target.value = value;
        });
    }
});
