import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Dashboard API
export const dashboardAPI = {
    getData: () => api.get('/api/dashboard'),
};

// Study API
export const studyAPI = {
    getSessions: () => api.get('/api/study/sessions'),
    createSession: (sessionData) => api.post('/api/study/sessions', sessionData),
    deleteSession: (id) => api.delete(`/api/study/sessions/${id}`),
};

// Sleep API
export const sleepAPI = {
    logSleep: (sleepData) => api.post('/api/log-sleep', sleepData), // Legacy
    getSessions: () => api.get('/api/sleep/sessions'),
    createSession: (sessionData) => api.post('/api/sleep/sessions', sessionData),
    deleteSession: (id) => api.delete(`/api/sleep/sessions/${id}`),
};

// Health API
export const healthAPI = {
    logWater: () => api.post('/api/log-water'),
    getScreenTime: () => api.get('/api/screentime'),
    updateScreenTime: (screenTime) => api.post('/api/screentime', { screenTime }),
};

// Settings API
export const settingsAPI = {
    getSettings: () => api.get('/api/settings'),
    updateSettings: (settingsData) => api.post('/api/settings', settingsData),
};

// Chat API
export const chatAPI = {
    sendMessage: (message) => api.post('/api/chat', { text: message }),
};

export default api;