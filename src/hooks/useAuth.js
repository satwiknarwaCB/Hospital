/**
 * Authentication Hook
 * Manages doctor and parent authentication state and operations
 */
import { useState, useEffect } from 'react';
import { doctorAuthAPI, parentAuthAPI, adminAuthAPI, publicAPI, API_BASE_URL } from '../lib/api';


export const useAuth = () => {
    const [doctor, setDoctor] = useState(null);
    const [parent, setParent] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Check authentication status
     */
    const checkAuth = () => {
        // Check for doctor token
        const doctorToken = localStorage.getItem('doctor_token');
        const doctorData = localStorage.getItem('doctor_data');

        if (doctorToken && doctorData) {
            try {
                setDoctor(JSON.parse(doctorData));
            } catch (err) {
                console.error('Error parsing doctor data:', err);
                localStorage.removeItem('doctor_token');
                localStorage.removeItem('doctor_data');
            }
        }

        // Check for parent token
        const parentToken = localStorage.getItem('parent_token');
        const parentData = localStorage.getItem('parent_data');

        if (parentToken && parentData) {
            try {
                setParent(JSON.parse(parentData));
            } catch (err) {
                console.error('Error parsing parent data:', err);
                localStorage.removeItem('parent_token');
                localStorage.removeItem('parent_data');
            }
        }

        // Check for admin token
        const adminToken = localStorage.getItem('admin_token');
        const adminData = localStorage.getItem('admin_data');

        if (adminToken && adminData) {
            try {
                setAdmin(JSON.parse(adminData));
            } catch (err) {
                console.error('Error parsing admin data:', err);
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_data');
            }
        }

        setLoading(false);
    };

    /**
     * Login with email and password
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @param {string} role - User role ('doctor' or 'parent')
     * @returns {Promise<Object>} - User data
     */
    const login = async (email, password, role = null) => {
        try {
            // Trim credentials to prevent whitespace-related failures
            const cleanEmail = email.trim();
            const cleanPassword = password; // Trimming password is debatable, usually not done, but we'll stick to email
            
            // Automatic role detection if not provided
            let detectedRole = role;
            if (!detectedRole) {
                const lowerEmail = cleanEmail.toLowerCase();
                if (lowerEmail.includes('@parent.com')) {
                    detectedRole = 'parent';
                } else if (lowerEmail.includes('@twinkles.com')) {
                    detectedRole = 'admin';
                } else if (lowerEmail.includes('@therapist.com') || lowerEmail.includes('@hospital.com') || lowerEmail.includes('@doctor.com')) {
                    detectedRole = 'doctor';
                } else {
                    // Default for common providers (gmail, etc.) is usually parent or doctor depending on your app's bias
                    // Since we have fallbacks, the first choice just saves one roundtrip
                    detectedRole = 'doctor'; 
                }
            }

            console.log(`🔐 useAuth.login: Attempting login as ${detectedRole} for ${cleanEmail}`);
            setLoading(true);
            setError(null);

            const attemptLogin = async (currentRole) => {
                if (currentRole === 'parent') {
                    return await parentAuthAPI.login(cleanEmail, cleanPassword);
                } else if (currentRole === 'admin') {
                    return await adminAuthAPI.login(cleanEmail, cleanPassword);
                } else {
                    return await doctorAuthAPI.login(cleanEmail, cleanPassword);
                }
            };

            let response;
            try {
                response = await attemptLogin(detectedRole);
            } catch (err) {
                // Determine if we should try fallback
                // Only fallback if:
                // 1. It's an auto-detected role (no explicit role passed)
                // 2. The error is NOT a network error (server is up)
                // 3. The error is 401 (Unauthorized) or 404 (Not Found)
                const isNetworkError = err.message === 'Network Error' || !err.response;
                const isAuthError = err.response?.status === 401 || err.response?.status === 404;

                if (!role && !isNetworkError && isAuthError) {
                    // Try sequence: doctor -> parent -> admin
                    let fallbackRoles = ['doctor', 'parent', 'admin'];
                    // Remove already tried role
                    fallbackRoles = fallbackRoles.filter(r => r !== detectedRole);
                    
                    let success = false;
                    let lastErr = err;
                    for (const fallbackRole of fallbackRoles) {
                        console.log(`⚠️ Initial login failed. Trying fallback role: ${fallbackRole}`);
                        try {
                            response = await attemptLogin(fallbackRole);
                            detectedRole = fallbackRole;
                            success = true;
                            break;
                        } catch (fallbackErr) {
                            console.warn(`⚠️ Fallback login as ${fallbackRole} also failed.`);
                            lastErr = fallbackErr; // Keep track of the last error
                        }
                    }
                    
                    if (!success) throw lastErr; // Throw the last error if all fallbacks fail
                } else {
                    // Log more helpful message for network errors
                    if (isNetworkError) {
                        console.error(`❌ Connection refused to ${API_BASE_URL}. Is the backend server running?`);
                    }
                    throw err;
                }
            }

            console.log(`✅ Login successful as ${detectedRole}`);

            // Store token and data based on the successful role
            if (detectedRole === 'parent') {
                localStorage.setItem('parent_token', response.access_token);
                localStorage.setItem('parent_data', JSON.stringify(response.parent));
                setParent(response.parent);
                // Clear others
                localStorage.removeItem('doctor_token'); localStorage.removeItem('doctor_data'); setDoctor(null);
                localStorage.removeItem('admin_token'); localStorage.removeItem('admin_data'); setAdmin(null);
                window.dispatchEvent(new Event('auth-change'));
                return response.parent;
            } else if (detectedRole === 'admin') {
                localStorage.setItem('admin_token', response.access_token);
                localStorage.setItem('admin_data', JSON.stringify(response.admin));
                setAdmin(response.admin);
                // Clear others
                localStorage.removeItem('doctor_token'); localStorage.removeItem('doctor_data'); setDoctor(null);
                localStorage.removeItem('parent_token'); localStorage.removeItem('parent_data'); setParent(null);
                window.dispatchEvent(new Event('auth-change'));
                return response.admin;
            } else {
                localStorage.setItem('doctor_token', response.access_token);
                localStorage.setItem('doctor_data', JSON.stringify(response.doctor));
                setDoctor(response.doctor);
                // Clear others
                localStorage.removeItem('parent_token'); localStorage.removeItem('parent_data'); setParent(null);
                localStorage.removeItem('admin_token'); localStorage.removeItem('admin_data'); setAdmin(null);
                window.dispatchEvent(new Event('auth-change'));
                return response.doctor;
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            const errorMessage = err.response?.data?.detail || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
            window.dispatchEvent(new Event('auth-change'));
        }
    };

    /**
     * Logout and clear authentication
     * @param {string} role - User role ('doctor' or 'parent')
     */
    const logout = async (role = null) => {
        try {
            // Determine which role to logout
            const logoutRole = role || (parent ? 'parent' : 'doctor');

            if (logoutRole === 'parent') {
                await parentAuthAPI.logout();
                localStorage.removeItem('parent_token');
                localStorage.removeItem('parent_data');
                setParent(null);
            } else if (logoutRole === 'admin') {
                // No server logout needed for now
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_data');
                setAdmin(null);
            } else {
                await doctorAuthAPI.logout();
                localStorage.removeItem('doctor_token');
                localStorage.removeItem('doctor_data');
                setDoctor(null);
            }
        } catch (err) {
            console.error('Logout API error:', err);
        } finally {
            // Notify AppProvider to sync
            window.dispatchEvent(new Event('auth-change'));
        }
    };

    /**
     * Get stored JWT token
     * @param {string} role - User role ('doctor' or 'parent')
     * @returns {string|null} - JWT token
     */
    const getToken = (role = null) => {
        const checkRole = role || (parent ? 'parent' : 'doctor');
        return localStorage.getItem(`${checkRole}_token`);
    };

    /**
     * Check if user is authenticated
     * @returns {boolean} - Authentication status
     */
    const isAuthenticated = () => {
        return !!(getToken('doctor') && doctor) || !!(getToken('parent') && parent);
    };

    /**
     * Fetch current doctor profile from API
     * @returns {Promise<Object>} - Doctor profile data
     */
    const getDoctorProfile = async () => {
        try {
            setLoading(true);
            const profile = await doctorAuthAPI.getProfile();

            // Update local storage with fresh data
            localStorage.setItem('doctor_data', JSON.stringify(profile));
            setDoctor(profile);
            setLoading(false);

            return profile;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    /**
     * Fetch current parent profile from API
     * @returns {Promise<Object>} - Parent profile data
     */
    const getParentProfile = async () => {
        try {
            setLoading(true);
            const profile = await parentAuthAPI.getProfile();

            // Update local storage with fresh data
            localStorage.setItem('parent_data', JSON.stringify(profile));
            setParent(profile);
            setLoading(false);

            return profile;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    /**
     * Fetch current admin profile from API
     * @returns {Promise<Object>} - Admin profile data
     */
    const getAdminProfile = async () => {
        try {
            setLoading(true);
            const profile = await adminAuthAPI.getProfile();

            // Update local storage with fresh data
            localStorage.setItem('admin_data', JSON.stringify(profile));
            setAdmin(profile);
            setLoading(false);

            return profile;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    /**
     * Signup for parents
     * @param {Object} data - Parent registration data
     * @returns {Promise<Object>} - Created parent data
     */
    const signup = async (data) => {
        try {
            setLoading(true);
            setError(null);
            const response = await publicAPI.signup(data);
            setLoading(false);
            return response;
        } catch (err) {
            console.error('❌ Signup error:', err);
            let errorMessage = 'Signup failed. Please try again.';
            if (err.response?.data?.detail) {
                if (Array.isArray(err.response.data.detail)) {
                    // Handle FastAPI validation error list
                    errorMessage = err.response.data.detail.map(d => d.msg).join(', ');
                } else {
                    errorMessage = err.response.data.detail;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    };

    return {
        doctor,
        parent,
        admin,
        user: parent || doctor || admin, // Convenience property for current user
        loading,
        error,
        login,
        signup,
        logout,
        getToken,
        isAuthenticated,
        getDoctorProfile,
        getParentProfile,
        getAdminProfile,
    };
};

export default useAuth;
