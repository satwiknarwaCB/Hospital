import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './lib/context';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import About from './pages/About';
import Services from './pages/Services';
import ParentPortal from './pages/parent/ParentPortal';
import ParentLogin from './pages/parent/ParentLogin';
import TherapistPortal from './pages/therapist/TherapistPortal';
import TherapistLogin from './pages/therapist/TherapistLogin';
import AdminPortal from './pages/admin/AdminPortal';
import AdminLogin from './pages/admin/AdminLogin';
import Login from './pages/Login';
import Contact from './pages/Contact';
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorPortal from './pages/doctor/DoctorPortal';
import ProtectedRoute from './components/ProtectedRoute';
import ActivateAccount from './pages/ActivateAccount';

// Layout wrapper for public pages (Landing, About, Services)
const PublicLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

function AppContent() {
    const location = useLocation();

    // Check if we are in a portal (parent, therapist, doctor, admin)
    const isPortal = location.pathname.startsWith('/parent/') ||
        location.pathname.startsWith('/therapist/') ||
        location.pathname.startsWith('/doctor/') ||
        location.pathname.startsWith('/admin/');

    return (
        <Routes>
            {/* Public Routes with Header/Footer */}
            {/* Public Routes with Header/Footer */}
            <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/activate" element={<ActivateAccount />} />

            {/* Admin Module */}
            <Route path="/admin/login" element={<Login />} />
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute redirectTo="/admin/login">
                        <AdminPortal />
                    </ProtectedRoute>
                }
            />

            {/* Doctor Module */}
            <Route path="/doctor/login" element={<Login />} />
            <Route
                path="/doctor/*"
                element={
                    <ProtectedRoute redirectTo="/doctor/login">
                        <DoctorPortal />
                    </ProtectedRoute>
                }
            />

            {/* Therapist Module */}
            <Route path="/therapist/login" element={<Login />} />
            <Route
                path="/therapist/*"
                element={
                    <ProtectedRoute redirectTo="/therapist/login">
                        <TherapistPortal />
                    </ProtectedRoute>
                }
            />

            {/* Parent Module */}
            <Route path="/parent/login" element={<Login />} />
            <Route
                path="/parent/*"
                element={
                    <ProtectedRoute redirectTo="/parent/login">
                        <ParentPortal />
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AppProvider>
            <Router>
                <AppContent />
            </Router>
        </AppProvider>
    );
}

export default App;
