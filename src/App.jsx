import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './lib/context';
import Landing from './pages/Landing';
import ParentPortal from './pages/parent/ParentPortal';
import ParentLogin from './pages/parent/ParentLogin';
import TherapistPortal from './pages/therapist/TherapistPortal';
import TherapistLogin from './pages/therapist/TherapistLogin';
import AdminPortal from './pages/admin/AdminPortal';
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorPortal from './pages/doctor/DoctorPortal';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AppProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Landing />} />

                    {/* Doctor Module */}
                    <Route path="/doctor/login" element={<DoctorLogin />} />
                    <Route
                        path="/doctor/*"
                        element={
                            <ProtectedRoute>
                                <DoctorPortal />
                            </ProtectedRoute>
                        }
                    />

                    {/* Therapist Module */}
                    <Route path="/therapist/login" element={<TherapistLogin />} />
                    <Route
                        path="/therapist/*"
                        element={
                            <ProtectedRoute redirectTo="/therapist/login">
                                <TherapistPortal />
                            </ProtectedRoute>
                        }
                    />

                    {/* Parent Module */}
                    <Route path="/parent/login" element={<ParentLogin />} />
                    <Route
                        path="/parent/*"
                        element={
                            <ProtectedRoute redirectTo="/parent/login">
                                <ParentPortal />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Portal */}
                    <Route path="/admin/*" element={<AdminPortal />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AppProvider>
    );
}

export default App;
