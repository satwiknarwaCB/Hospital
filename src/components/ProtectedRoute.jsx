/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, redirectTo = '/doctor/login' }) => {
    const token = localStorage.getItem('doctor_token');
    const doctorData = localStorage.getItem('doctor_data');

    // Check if user is authenticated
    if (!token || !doctorData) {
        // Redirect to login if not authenticated
        return <Navigate to={redirectTo} replace />;
    }

    // Render protected content if authenticated
    return children;
};

export default ProtectedRoute;
