// API Client
const api = {
    // Generic request handler
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // Health check
    async checkHealth() {
        return this.request('/health');
    },

    // Session endpoints
    sessions: {
        async create(name, facilitatorId) {
            return api.request('/api/sessions', {
                method: 'POST',
                body: JSON.stringify({ name, facilitatorId })
            });
        },

        async getByCode(code) {
            return api.request(`/api/sessions/${code}`);
        },

        async getById(id) {
            return api.request(`/api/sessions/id/${id}`);
        },

        async update(id, data) {
            return api.request(`/api/sessions/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
        },

        async start(id) {
            return api.request(`/api/sessions/${id}/start`, {
                method: 'POST'
            });
        },

        async end(id) {
            return api.request(`/api/sessions/${id}/end`, {
                method: 'POST'
            });
        },

        async delete(id) {
            return api.request(`/api/sessions/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Participant endpoints
    participants: {
        async join(sessionId, username, role) {
            return api.request(`/api/sessions/${sessionId}/join`, {
                method: 'POST',
                body: JSON.stringify({ username, role })
            });
        },

        async get(id) {
            return api.request(`/api/participants/${id}`);
        },

        async listBySession(sessionId) {
            return api.request(`/api/participants/session/${sessionId}`);
        },

        async update(id, data) {
            return api.request(`/api/participants/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data)
            });
        },

        async updateScore(id, newScore, round, reason) {
            return api.request(`/api/participants/${id}/score`, {
                method: 'POST',
                body: JSON.stringify({ newScore, round, reason })
            });
        },

        async remove(id) {
            return api.request(`/api/participants/${id}`, {
                method: 'DELETE'
            });
        }
    }
};
