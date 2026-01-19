/**
 * API client utility for making authenticated requests
 * Handles JWT token management and HTTP requests
 */
import axios from 'axios';

// API base URL - update this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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
        // Try to get token based on the endpoint
        let token = null;

        if (config.url.includes('/api/parent')) {
            token = localStorage.getItem('parent_token');
        } else if (config.url.includes('/api/doctor')) {
            token = localStorage.getItem('doctor_token');
        } else if (config.url.includes('/api/admin')) {
            token = localStorage.getItem('admin_token');
        } else {
            // Fallback: try all
            token = localStorage.getItem('parent_token') ||
                localStorage.getItem('doctor_token') ||
                localStorage.getItem('admin_token');
        }

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
            const currentPath = window.location.pathname;

            // Determine which role based on current path
            if (currentPath.includes('/parent')) {
                localStorage.removeItem('parent_token');
                localStorage.removeItem('parent_data');
                if (currentPath !== '/parent/login') {
                    window.location.href = '/parent/login';
                }
            } else if (currentPath.includes('/doctor')) {
                localStorage.removeItem('doctor_token');
                localStorage.removeItem('doctor_data');
                if (currentPath !== '/doctor/login') {
                    window.location.href = '/doctor/login';
                }
            } else {
                // Clear both just in case
                localStorage.removeItem('doctor_token');
                localStorage.removeItem('doctor_data');
                localStorage.removeItem('parent_token');
                localStorage.removeItem('parent_data');
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

// Parent Authentication API
export const parentAuthAPI = {
    /**
     * Login with email and password
     * @param {string} email - Parent's email
     * @param {string} password - Parent's password
     * @returns {Promise} - Login response with token and parent data
     */
    login: async (email, password) => {
        const response = await apiClient.post('/api/parent/login', {
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
        const response = await apiClient.post('/api/parent/logout');
        return response.data;
    },

    /**
     * Get current parent profile
     * @returns {Promise} - Parent profile data
     */
    getProfile: async () => {
        const response = await apiClient.get('/api/parent/profile');
        return response.data;
    },

    /**
     * Get current parent (alias)
     * @returns {Promise} - Parent profile data
     */
    getMe: async () => {
        const response = await apiClient.get('/api/parent/me');
        return response.data;
    },
};

// Admin Authentication API
export const adminAuthAPI = {
    /**
     * Login with email and password
     * @param {string} email - Admin's email
     * @param {string} password - Admin's password
     * @returns {Promise} - Login response with token and admin data
     */
    login: async (email, password) => {
        const response = await apiClient.post('/api/admin/login', {
            email,
            password,
        });
        return response.data;
    },

    /**
     * Get current admin profile
     * @returns {Promise} - Admin profile data
     */
    getProfile: async () => {
        const response = await apiClient.get('/api/admin/profile');
        return response.data;
    },
};

// Session API
export const appointmentAPI = {
    create: (data) => apiClient.post('/api/appointments/', data),
};

export const sessionAPI = {
    /**
     * Log a new therapy session record
     * @param {Object} sessionData - Validated session inputs
     */
    create: async (sessionData) => {
        try {
            console.log('📡 POST /api/sessions', sessionData);
            const response = await apiClient.post('/api/sessions', sessionData);
            return response.data;
        } catch (error) {
            console.error('❌ POST /api/sessions failed:', error);
            throw error.response?.data || error.message;
        }
    },

    /**
     * Retrieve session history for a specific child
     * @param {string} childId 
     */
    getByChild: async (childId) => {
        try {
            const response = await apiClient.get(`/api/sessions/child/${childId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Retrieve dashboard sessions for a specific therapist
     * @param {string} therapistId 
     */
    getByTherapist: async (therapistId) => {
        try {
            const response = await apiClient.get(`/api/sessions/therapist/${therapistId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default apiClient;
