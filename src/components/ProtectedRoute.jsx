/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, redirectTo = '/doctor/login' }) => {
    const location = useLocation();

    // Check for ANY valid authentication token
    const doctorToken = localStorage.getItem('doctor_token');
    const doctorData = localStorage.getItem('doctor_data');
    const parentToken = localStorage.getItem('parent_token');
    const parentData = localStorage.getItem('parent_data');
    const adminToken = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_data');

    // Determine if user is authenticated with ANY role
    const isAuthenticated = !!(
        (doctorToken && doctorData) ||
        (parentToken && parentData) ||
        (adminToken && adminData)
    );

    // Comprehensive debug logging
    useEffect(() => {
        console.log('� [ProtectedRoute] Full Auth Check:', {
            currentPath: location.pathname,
            redirectTo,
            tokens: {
                doctor: { hasToken: !!doctorToken, hasData: !!doctorData },
                parent: { hasToken: !!parentToken, hasData: !!parentData },
                admin: { hasToken: !!adminToken, hasData: !!adminData }
            },
            isAuthenticated,
            willRedirect: !isAuthenticated
        });

        if (doctorData) {
            try {
                const userData = JSON.parse(doctorData);
                console.log('👤 [ProtectedRoute] Doctor/Therapist User Data:', {
                    role: userData.role,
                    email: userData.email,
                    name: userData.name
                });
            } catch (e) {
                console.error('❌ [ProtectedRoute] Failed to parse doctor_data:', e);
            }
        }
    }, [location.pathname, isAuthenticated, doctorToken, doctorData, parentToken, parentData, adminToken, adminData, redirectTo]);

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        console.warn(`🚫 [ProtectedRoute] NOT AUTHENTICATED - Redirecting from ${location.pathname} to ${redirectTo}`);
        return <Navigate to={redirectTo} replace />;
    }

    // Render protected content if authenticated
    console.log(`✅ [ProtectedRoute] AUTHENTICATED - Rendering protected content for ${location.pathname}`);
    return children;
};

export default ProtectedRoute;
