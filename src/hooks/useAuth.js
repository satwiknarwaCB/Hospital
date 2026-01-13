/**
 * Authentication Hook
 * Manages doctor authentication state and operations
 */
import { useState, useEffect } from 'react';
import { doctorAuthAPI } from '../lib/api';

export const useAuth = () => {
    const [doctor, setDoctor] = useState(null);
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
        const token = localStorage.getItem('doctor_token');
        const doctorData = localStorage.getItem('doctor_data');

        if (token && doctorData) {
            try {
                setDoctor(JSON.parse(doctorData));
            } catch (err) {
                console.error('Error parsing doctor data:', err);
                logout();
            }
        }
        setLoading(false);
    };

    /**
     * Login with email and password
     * @param {string} email - Doctor's email
     * @param {string} password - Doctor's password
     * @returns {Promise<Object>} - Doctor data
     */
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const response = await doctorAuthAPI.login(email, password);

            // Store token and doctor data
            localStorage.setItem('doctor_token', response.access_token);
            localStorage.setItem('doctor_data', JSON.stringify(response.doctor));

            setDoctor(response.doctor);
            setLoading(false);

            // Notify AppProvider to sync
            window.dispatchEvent(new Event('auth-change'));

            return response.doctor;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Login failed. Please try again.';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    };

    /**
     * Logout and clear authentication
     */
    const logout = async () => {
        try {
            // Call logout API (optional, for server-side cleanup)
            await doctorAuthAPI.logout();
        } catch (err) {
            console.error('Logout API error:', err);
        } finally {
            // Clear local storage
            localStorage.removeItem('doctor_token');
            localStorage.removeItem('doctor_data');
            setDoctor(null);

            // Notify AppProvider to sync
            window.dispatchEvent(new Event('auth-change'));
        }
    };

    /**
     * Get stored JWT token
     * @returns {string|null} - JWT token
     */
    const getToken = () => {
        return localStorage.getItem('doctor_token');
    };

    /**
     * Check if user is authenticated
     * @returns {boolean} - Authentication status
     */
    const isAuthenticated = () => {
        return !!getToken() && !!doctor;
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

    return {
        doctor,
        loading,
        error,
        login,
        logout,
        getToken,
        isAuthenticated,
        getDoctorProfile,
    };
};

export default useAuth;
