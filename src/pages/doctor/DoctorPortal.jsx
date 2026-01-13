/**
 * Doctor Portal Router
 * Routes and layout for the doctor module
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DoctorDashboard from './DoctorDashboard';
import { useAuth } from '../../hooks/useAuth';
import {
    LayoutDashboard,
    Users,
    Calendar,
    ClipboardList,
    MessageSquare,
    Brain,
    Target,
    LogOut,
} from 'lucide-react';

// Wrapper component with logout button
const DoctorLayoutWrapper = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/doctor/login');
    };

    const sidebarItems = [
        { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
        { label: 'My Patients', path: '/therapist/patients', icon: Users },
        { label: 'Schedule', path: '/therapist/schedule', icon: Calendar },
        { label: 'Session Logs', path: '/therapist/logs', icon: ClipboardList },
        { label: 'Messages', path: '/therapist/messages', icon: MessageSquare },
        { label: 'AI Intelligence', path: '/therapist/intelligence', icon: Brain },
        { label: 'Roadmap Editor', path: '/therapist/roadmap', icon: Target },
    ];

    return (
        <DashboardLayout
            title="Doctor Portal"
            sidebarItems={sidebarItems}
            roleColor="bg-primary-600"
            onLogout={handleLogout}
        >
            {children}
        </DashboardLayout>
    );
};

const DoctorPortal = () => {
    return (
        <Routes>
            <Route element={<DoctorLayoutWrapper />}>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default DoctorPortal;

