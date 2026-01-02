import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './lib/context';
import Landing from './pages/Landing';
import ParentPortal from './pages/parent/ParentPortal';
import TherapistPortal from './pages/therapist/TherapistPortal';
import AdminPortal from './pages/admin/AdminPortal';

function App() {
    return (
        <AppProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Landing />} />

                    {/* Portals */}
                    <Route path="/parent/*" element={<ParentPortal />} />
                    <Route path="/therapist/*" element={<TherapistPortal />} />
                    <Route path="/admin/*" element={<AdminPortal />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AppProvider>
    );
}

export default App;
