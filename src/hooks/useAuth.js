/**
 * Authentication Hook
 * Manages doctor and parent authentication state and operations
 */
import { useState, useEffect } from 'react';
import { doctorAuthAPI, parentAuthAPI, adminAuthAPI } from '../lib/api';

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
            // Automatic role detection if not provided
            let detectedRole = role;
            if (!detectedRole) {
                if (email.includes('@parent.com')) {
                    detectedRole = 'parent';
                } else if (email.includes('@neurobridge.com')) {
                    detectedRole = 'admin';
                } else if (email.includes('@therapist.com') || email.includes('@hospital.com')) {
                    detectedRole = 'doctor';
                } else {
                    detectedRole = 'doctor'; // Default
                }
            }

            console.log(`🔐 useAuth.login: Attempting login as ${detectedRole} for ${email}`);
            setLoading(true);
            setError(null);

            const attemptLogin = async (currentRole) => {
                if (currentRole === 'parent') {
                    return await parentAuthAPI.login(email, password);
                } else if (currentRole === 'admin') {
                    return await adminAuthAPI.login(email, password);
                } else {
                    return await doctorAuthAPI.login(email, password);
                }
            };

            let response;
            try {
                response = await attemptLogin(detectedRole);
            } catch (err) {
                // If auto-detected and failed, try the other role (parent <-> doctor)
                if (!role && (detectedRole === 'doctor' || detectedRole === 'parent')) {
                    const fallbackRole = detectedRole === 'doctor' ? 'parent' : 'doctor';
                    console.log(`⚠️ Login as ${detectedRole} failed. Trying fallback role: ${fallbackRole}`);
                    try {
                        response = await attemptLogin(fallbackRole);
                        detectedRole = fallbackRole; // Update role if fallback succeeded
                    } catch (fallbackErr) {
                        throw err; // Throw original error if fallback also fails
                    }
                } else {
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
                return response.parent;
            } else if (detectedRole === 'admin') {
                localStorage.setItem('admin_token', response.access_token);
                localStorage.setItem('admin_data', JSON.stringify(response.admin));
                setAdmin(response.admin);
                // Clear others
                localStorage.removeItem('doctor_token'); localStorage.removeItem('doctor_data'); setDoctor(null);
                localStorage.removeItem('parent_token'); localStorage.removeItem('parent_data'); setParent(null);
                return response.admin;
            } else {
                localStorage.setItem('doctor_token', response.access_token);
                localStorage.setItem('doctor_data', JSON.stringify(response.doctor));
                setDoctor(response.doctor);
                // Clear others
                localStorage.removeItem('parent_token'); localStorage.removeItem('parent_data'); setParent(null);
                localStorage.removeItem('admin_token'); localStorage.removeItem('admin_data'); setAdmin(null);
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

    return {
        doctor,
        parent,
        admin,
        user: parent || doctor || admin, // Convenience property for current user
        loading,
        error,
        login,
        logout,
        getToken,
        isAuthenticated,
        getDoctorProfile,
        getParentProfile,
        getAdminProfile,
    };
};

export default useAuth;
