/**
 * API client utility for making authenticated requests
 * Handles JWT token management and HTTP requests
 */
import axios from 'axios';

// API base URL - update this to match your backend
// API base URL - Using 127.0.0.1 for maximum stability
const API_BASE_URL = 'http://127.0.0.1:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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

// Community API
export const communityAPI = {
    /**
     * Get all communities (therapist/admin only)
     * @returns {Promise} - List of communities
     */
    getAll: async () => {
        try {
            const response = await apiClient.get('/api/communities/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get default parent support community
     * @returns {Promise} - Default community data
     */
    getDefault: async () => {
        try {
            const response = await apiClient.get('/api/communities/default');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get specific community by ID
     * @param {string} communityId - Community ID
     * @returns {Promise} - Community data
     */
    getById: async (communityId) => {
        try {
            const response = await apiClient.get(`/api/communities/${communityId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get community messages with pagination
     * @param {string} communityId - Community ID
     * @param {number} limit - Number of messages to fetch
     * @param {number} offset - Offset for pagination
     * @returns {Promise} - Messages list response
     */
    getMessages: async (communityId, limit = 50, offset = 0) => {
        try {
            const response = await apiClient.get(`/api/communities/${communityId}/messages`, {
                params: { limit, offset }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Send a message to the community
     * @param {string} communityId - Community ID
     * @param {string} content - Message content
     * @param {Array} attachments - Optional attachment URLs
     * @returns {Promise} - Created message
     */
    sendMessage: async (communityId, content, attachments = []) => {
        try {
            const response = await apiClient.post(`/api/communities/${communityId}/messages`, {
                content,
                attachments
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get community members
     * @param {string} communityId - Community ID
     * @returns {Promise} - List of members
     */
    getMembers: async (communityId) => {
        try {
            const response = await apiClient.get(`/api/communities/${communityId}/members`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Join a community
     * @param {string} communityId - Community ID
     * @returns {Promise} - Join response
     */
    join: async (communityId) => {
        try {
            const response = await apiClient.post(`/api/communities/${communityId}/join`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Leave a community
     * @param {string} communityId - Community ID
     * @returns {Promise} - Leave response
     */
    leave: async (communityId) => {
        try {
            const response = await apiClient.delete(`/api/communities/${communityId}/leave`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

// Direct Messages API
export const messagesAPI = {
    /**
     * Send a direct message
     * @param {Object} messageData - Message content and recipient info
     * @returns {Promise} - Created message
     */
    send: async (messageData) => {
        try {
            const response = await apiClient.post('/api/messages/', messageData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get all messages for a specific user
     * @param {string} userId - User ID
     * @returns {Promise} - List of messages
     */
    getByUser: async (userId) => {
        try {
            const response = await apiClient.get(`/api/messages/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Mark a message as read
     * @param {string} messageId - Message ID
     * @returns {Promise} - Success response
     */
    markRead: async (messageId) => {
        try {
            const response = await apiClient.patch(`/api/messages/${messageId}/read`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get unread messages count for current user
     * @returns {Promise} - Count object {count: number}
     */
    getUnreadCount: async () => {
        try {
            const response = await apiClient.get('/api/messages/unread/count');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

// Progress Tracking API
export const progressAPI = {
    // === Goals ===
    createGoal: async (goalData) => {
        try {
            console.log('🌐 API: Sending goal data to backend:', goalData);
            const response = await apiClient.post('/api/progress/goals', goalData);
            console.log('✅ API: Goal created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ API: Failed to create goal:', error);
            console.error('❌ API: Error response:', error.response);
            console.error('❌ API: Error data:', error.response?.data);
            throw error.response?.data || error.message;
        }
    },

    getGoalsByChild: async (childId) => {
        try {
            const response = await apiClient.get(`/api/progress/goals/child/${childId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateGoal: async (goalId, updates) => {
        try {
            const response = await apiClient.put(`/api/progress/goals/${goalId}`, updates);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteGoal: async (goalId) => {
        try {
            const response = await apiClient.delete(`/api/progress/goals/${goalId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // === Actual Progress ===
    createProgress: async (progressData) => {
        try {
            const response = await apiClient.post('/api/progress/actual', progressData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getProgressByChild: async (childId) => {
        try {
            const response = await apiClient.get(`/api/progress/actual/child/${childId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateProgress: async (progressId, updates) => {
        try {
            const response = await apiClient.put(`/api/progress/actual/${progressId}`, updates);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteProgress: async (progressId) => {
        try {
            const response = await apiClient.delete(`/api/progress/actual/${progressId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

// User Management API
export const userManagementAPI = {
    /**
     * Create a new therapist account
     * @param {Object} data - Therapist data
     * @param {string} [assignedChildId] - Optional ID of child to assign
     */
    createTherapist: async (data, assignedChildId = null) => {
        let url = '/api/admin/users/therapist';
        if (assignedChildId) {
            url += `?assigned_child=${assignedChildId}`;
        }
        const response = await apiClient.post(url, data);
        return response.data;
    },

    /**
     * Create a new parent account
     * @param {Object} data - Parent creation data
     */
    createParent: async (data) => {
        const response = await apiClient.post('/api/admin/users/parent', data);
        return response.data;
    },

    /**
     * List all therapist accounts
     */
    listTherapists: async () => {
        const response = await apiClient.get('/api/admin/users/therapists');
        return response.data;
    },

    /**
     * List all parent accounts
     */
    listParents: async () => {
        const response = await apiClient.get('/api/admin/users/parents');
        return response.data;
    },

    /**
     * Delete a therapist
     */
    deleteTherapist: async (id) => {
        await apiClient.delete(`/api/admin/users/therapist/${id}`);
    },

    /**
     * Delete a parent
     */
    deleteParent: async (id) => {
        await apiClient.delete(`/api/admin/users/parent/${id}`);
    },

    /**
     * Get list of children for assignment
     */
    listChildren: async () => {
        const response = await apiClient.get('/api/admin/users/children');
        return response.data;
    },

    /**
     * Get global admin statistics
     */
    getStats: async () => {
        const response = await apiClient.get('/api/admin/users/stats');
        return response.data;
    },

    /**
     * Create a new child record
     * @param {Object} data - Child data including parent_id
     */
    createChild: async (data) => {
        const response = await apiClient.post('/api/admin/users/child', data);
        return response.data;
    },

    /**
     * Delete a child record
     */
    deleteChild: async (id) => {
        await apiClient.delete(`/api/admin/users/child/${id}`);
    },

    /**
     * Assign a child to a therapist
     */
    assignTherapist: async (childId, therapistId) => {
        const tId = therapistId || 'none';
        const response = await apiClient.patch(`/api/admin/users/child/${childId}/assign/${tId}`);
        return response.data;
    }
};

// Public API
export const publicAPI = {
    getDemoUsers: async () => {
        const response = await apiClient.get('/api/public/demo-users');
        return response.data;
    },

    /**
     * Activate account with token and password
     */
    activateAccount: async (data) => {
        const response = await apiClient.post('/api/public/activate', data);
        return response.data;
    }
};

export default apiClient;
