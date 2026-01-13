/**
 * API client utility for making authenticated requests
 * Handles JWT token management and HTTP requests
 */
import axios from 'axios';

// API base URL - update this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('doctor_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage and redirect to login
            localStorage.removeItem('doctor_token');
            localStorage.removeItem('doctor_data');

            // Only redirect if not already on login page
            if (window.location.pathname !== '/doctor/login') {
                window.location.href = '/doctor/login';
            }
        }
        return Promise.reject(error);
    }
);

// Doctor Authentication API
export const doctorAuthAPI = {
    /**
     * Login with email and password
     * @param {string} email - Doctor's email
     * @param {string} password - Doctor's password
     * @returns {Promise} - Login response with token and doctor data
     */
    login: async (email, password) => {
        const response = await apiClient.post('/api/doctor/login', {
            email,
            password,
        });
        return response.data;
    },

    /**
     * Logout (clears token on server if needed)
     * @returns {Promise} - Logout response
     */
    logout: async () => {
        const response = await apiClient.post('/api/doctor/logout');
        return response.data;
    },

    /**
     * Get current doctor profile
     * @returns {Promise} - Doctor profile data
     */
    getProfile: async () => {
        const response = await apiClient.get('/api/doctor/profile');
        return response.data;
    },

    /**
     * Get current doctor (alias)
     * @returns {Promise} - Doctor profile data
     */
    getMe: async () => {
        const response = await apiClient.get('/api/doctor/me');
        return response.data;
    },
};

export default apiClient;
