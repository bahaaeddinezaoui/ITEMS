import axios from 'axios';

const API_URL = '/api/';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear tokens and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth functions
export const authService = {
    login: async (username, password) => {
        const response = await api.post('auth/login/', { username, password });
        const { access, refresh, user } = response.data;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));

        return user;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },

    isSuperuser: () => {
        const user = authService.getUser();
        return user?.is_superuser || false;
    },
};

// Person service
export const personService = {
    getAll: async () => {
        const response = await api.get('persons/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`persons/${id}/`);
        return response.data;
    },

    create: async (personData) => {
        const response = await api.post('persons/', personData);
        return response.data;
    },

    update: async (id, personData) => {
        const response = await api.put(`persons/${id}/`, personData);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`persons/${id}/`);
    },
};

export default api;
