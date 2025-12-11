// UI Helper Functions

// Show/Hide Loading Overlay
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

// Show Toast Notification
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, CONFIG.TOAST_DURATION);
}

// Update Connection Status
function updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('connection-status');
    const indicator = statusElement.querySelector('.status-indicator');
    const text = statusElement.querySelector('.status-text');

    if (isConnected) {
        indicator.classList.add('connected');
        indicator.classList.remove('disconnected');
        text.textContent = 'Connected';
    } else {
        indicator.classList.remove('connected');
        indicator.classList.add('disconnected');
        text.textContent = 'Disconnected';
    }
}

// View Management
function showView(viewName) {
    // Update state
    appState.currentView = viewName;

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    const viewElement = document.getElementById(`${viewName}-view`);
    if (viewElement) {
        viewElement.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.view === viewName) {
            link.classList.add('active');
        }
    });
}

// Render Participants List
function renderParticipants(participants, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!participants || participants.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No participants yet</p>';
        return;
    }

    container.innerHTML = participants.map(p => `
        <div class="participant-item">
            <div class="participant-info-item">
                <div class="participant-name">${escapeHtml(p.username)}</div>
                <div class="participant-role">${p.role}</div>
            </div>
            <div class="participant-score-badge">${p.billingsScore.toFixed(2)}</div>
        </div>
    `).join('');
}

// Update Session Stats
function updateSessionStats(participants) {
    const submitters = participants.filter(p => p.role === 'submitter').length;
    const voters = participants.filter(p => p.role === 'voter').length;
    const avgScore = participants.length > 0
        ? participants.reduce((sum, p) => sum + p.billingsScore, 0) / participants.length
        : 0.5;

    document.getElementById('stat-submitters').textContent = submitters;
    document.getElementById('stat-voters').textContent = voters;
    document.getElementById('stat-avg-score').textContent = avgScore.toFixed(2);
}

// Update Session Status
function updateSessionStatus(status) {
    const statusElement = document.getElementById('session-status');
    if (!statusElement) return;

    const statusBadge = statusElement.querySelector('.status-badge');
    if (!statusBadge) return;

    statusBadge.className = 'status-badge';

    if (status === 'active' || status === 'in_progress') {
        statusBadge.classList.add('status-active');
        statusBadge.textContent = 'Active';
    } else if (status === 'paused') {
        statusBadge.classList.add('status-paused');
        statusBadge.textContent = 'Paused';
    } else if (status === 'ended' || status === 'completed') {
        statusBadge.classList.add('status-ended');
        statusBadge.textContent = 'Ended';
    }
}

// Copy to Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format Session Code (ensure XXXX-1234 format)
function formatSessionCode(code) {
    return code.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/(.{4})(.{4})/, '$1-$2');
}

// Validate Session Code Format
function isValidSessionCode(code) {
    return /^[A-Z]{4}-[0-9]{4}$/.test(code);
}

// Reset to Home
function resetToHome() {
    // Clear session data
    appState.currentSession = null;
    appState.currentParticipant = null;
    appState.participants = [];
    appState.isFacilitator = false;

    // Hide session cards
    document.getElementById('session-create-card').classList.remove('hidden');
    document.getElementById('session-active-card').classList.add('hidden');
    document.getElementById('join-card').classList.remove('hidden');
    document.getElementById('participant-active-card').classList.add('hidden');

    // Reset forms
    document.getElementById('create-session-form').reset();
    document.getElementById('join-session-form').reset();

    // Show home view
    showView('home');
}

// Setup Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const viewName = link.dataset.view;
            showView(viewName);
        });
    });
}
