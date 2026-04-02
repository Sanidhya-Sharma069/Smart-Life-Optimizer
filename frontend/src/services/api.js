import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Study API
export const studyAPI = {
    getSessions: () => api.get('/api/study/sessions'),
    createSession: (sessionData) => api.post('/api/study/sessions', sessionData),
    deleteSession: (id) => api.delete(`/api/study/sessions/${id}`),
};

// Sleep API
export const sleepAPI = {
    logSleep: (sleepData) => api.post('/api/log-sleep', sleepData),
};

// Health API
export const healthAPI = {
    logWater: () => api.post('/api/log-water'),
    getScreenTime: () => api.get('/api/screentime'),
    updateScreenTime: (screenTime) => api.post('/api/screentime', { screenTime }),
};

// Chat API
export const chatAPI = {
    sendMessage: (message) => api.post('/api/chat', { text: message }),
};

export default api;