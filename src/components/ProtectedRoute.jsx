/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, redirectTo = '/doctor/login' }) => {
    // Determine which token to check based on the redirect path
    const isParentRoute = redirectTo.includes('/parent');

    const token = isParentRoute
        ? localStorage.getItem('parent_token')
        : localStorage.getItem('doctor_token');

    const userData = isParentRoute
        ? localStorage.getItem('parent_data')
        : localStorage.getItem('doctor_data');

    // Check if user is authenticated
    if (!token || !userData) {
        // Redirect to login if not authenticated
        return <Navigate to={redirectTo} replace />;
    }

    // Render protected content if authenticated
    return children;
};

export default ProtectedRoute;
