/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, redirectTo = '/doctor/login' }) => {
    // Determine which token to check based on the redirect path
    const isParentRoute = redirectTo.includes('/parent');
    const isAdminRoute = redirectTo.includes('/admin');

    let token, userData;

    if (isParentRoute) {
        token = localStorage.getItem('parent_token');
        userData = localStorage.getItem('parent_data');
    } else if (isAdminRoute) {
        token = localStorage.getItem('admin_token');
        userData = localStorage.getItem('admin_data');
    } else {
        token = localStorage.getItem('doctor_token');
        userData = localStorage.getItem('doctor_data');
    }

    // Check if user is authenticated
    if (!token || !userData) {
        // Redirect to login if not authenticated
        return <Navigate to={redirectTo} replace />;
    }

    // Render protected content if authenticated
    return children;
};

export default ProtectedRoute;
