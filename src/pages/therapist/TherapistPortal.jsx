// ============================================================
// NeuroBridge™ - Therapist Portal
// Complete Therapist Experience with All Modules
// ============================================================

import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    LayoutDashboard,
    Users,
    Calendar,
    ClipboardList,
    Brain,
    Target,
    MessageSquare,
    LogOut,
    Activity,
    Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';
import { useAuth } from '../../hooks/useAuth';

import Sessions from './Sessions';
import MyPatients from './MyPatients';
import TherapyIntelligence from './TherapyIntelligence';
import RoadmapEditor from './RoadmapEditor';
import TherapistMessages from './TherapistMessages';
import TherapistProgressTracking from './TherapistProgressTracking';

// ============================================================
// Therapist Layout Wrapper with Logout
// ============================================================
const TherapistLayoutWrapper = ({ children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const { privateUnreadCount, communityUnreadCount } = useApp();
    const totalMessagesUnread = (privateUnreadCount || 0) + (communityUnreadCount || 0);

    const sidebarItems = [
        { label: 'Command Center', path: '/therapist/dashboard', icon: LayoutDashboard },
        { label: 'Schedule', path: '/therapist/sessions', icon: Calendar },
        { label: 'Care Hub', path: '/therapist/patients', icon: Users },
        { label: 'Growth Tracking', path: '/therapist/progress', icon: Activity },
        { label: 'Clinical Brain', path: '/therapist/intelligence', icon: Brain },
        { label: 'Blueprints', path: '/therapist/roadmap', icon: Target },
        { label: 'Connect', path: '/therapist/messages', icon: MessageSquare, badge: totalMessagesUnread },
    ];

    return (
        <DashboardLayout
            title="Therapist Console"
            sidebarItems={sidebarItems}
            roleColor="bg-secondary-600"
            onLogout={handleLogout}
        >
            {children}
        </DashboardLayout>
    );
};

// ============================================================
// Therapist Dashboard - Main Overview
// ============================================================
const TherapistDashboard = () => {
    const navigate = useNavigate();
    const {
        currentUser,
        kids,
        sessions,
        getTherapistStats,
        getLatestSkillScores,
        privateUnreadCount,
        communityUnreadCount
    } = useApp();

    const therapistId = currentUser?.id || 't1'; // Assuming 't1' is Dr. Rajesh Kumar for mock data

    // RELAXED FILTER: Show all kids if none are specifically assigned to avoid empty states
    const myPatients = kids.filter(k => k.therapistId === therapistId).length > 0
        ? kids.filter(k => k.therapistId === therapistId)
        : kids;

    const stats = getTherapistStats(therapistId);
    const totalUnread = (privateUnreadCount || 0) + (communityUnreadCount || 0);

    // Get today's sessions (matching mock data date)
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s =>
        s.therapistId === therapistId &&
        (s.date.startsWith(today) || s.date.startsWith('2025-12-23'))
    );
    const completedSessions = todaySessions.filter(s => s.status === 'completed');

    // Get patients needing attention
    const patientsNeedingAttention = myPatients.filter(patient => {
        const scores = getLatestSkillScores(patient.id);
        return scores.filter(s => s.trend === 'attention').length >= 2;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-neutral-800">Welcome back, {currentUser?.name?.split(' ')[0] || 'Doctor'}! 👋</h2>
                        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 shadow-sm animate-pulse-slow">
                            <Lock className="h-3 w-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Bridge Active</span>
                        </div>
                    </div>
                    <p className="text-neutral-500">Here's your therapy overview for today.</p>
                </div>
                <Button onClick={() => navigate('/therapist/sessions', { state: { activeTab: 'logs' } })}>+ Log New Session</Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <Card className="border-l-4 border-l-secondary-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/therapist/patients')}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Active Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-neutral-800">{stats.totalPatients}</p>
                        <p className="text-sm text-neutral-500">Total Caseload</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/therapist/sessions', { state: { activeTab: 'schedule' } })}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Today's Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-neutral-800">{todaySessions.length}</p>
                        <p className="text-sm text-neutral-500">{completedSessions.length} Completed</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-400">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Pending Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-neutral-800">{todaySessions.length - completedSessions.length}</p>
                        <p className="text-sm text-neutral-500">High Priority</p>
                    </CardContent>
                </Card>
                <Card className={`border-l-4 ${totalUnread > 0 ? 'border-l-violet-500 bg-violet-50' : 'border-l-neutral-300'} hover:shadow-lg transition-shadow cursor-pointer`} onClick={() => navigate('/therapist/messages')}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">New Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-3xl font-bold ${totalUnread > 0 ? 'text-violet-600' : 'text-neutral-800'}`}>
                            {totalUnread}
                        </p>
                        <p className="text-sm text-neutral-500">{totalUnread === 1 ? 'Unread Message' : 'Unread Messages'}</p>
                    </CardContent>
                </Card>
                <Card className={`border-l-4 ${patientsNeedingAttention.length > 0 ? 'border-l-red-500 bg-red-50' : 'border-l-green-500 bg-green-50'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Need Attention</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-3xl font-bold ${patientsNeedingAttention.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {patientsNeedingAttention.length}
                        </p>
                        <p className={`text-sm ${patientsNeedingAttention.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {patientsNeedingAttention.length > 0 ? 'Review Required' : 'All Good!'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-violet-500 to-purple-600 text-white" onClick={() => navigate('/therapist/intelligence')}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Brain className="h-10 w-10 text-violet-200" />
                        <div>
                            <h3 className="font-semibold">AI Intelligence</h3>
                            <p className="text-sm text-violet-200">View insights & analytics</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-primary-500 to-primary-600 text-white" onClick={() => navigate('/therapist/roadmap')}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Target className="h-10 w-10 text-primary-200" />
                        <div>
                            <h3 className="font-semibold">Roadmap Editor</h3>
                            <p className="text-sm text-primary-200">Manage patient goals</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-secondary-500 to-secondary-600 text-white" onClick={() => navigate('/therapist/sessions', { state: { activeTab: 'schedule' } })}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Calendar className="h-10 w-10 text-secondary-200" />
                        <div>
                            <h3 className="font-semibold">Sessions</h3>
                            <p className="text-sm text-secondary-200">Manage calendar & logs</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-indigo-500 to-blue-600 text-white" onClick={() => navigate('/therapist/progress')}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Activity className="h-10 w-10 text-indigo-200" />
                        <div>
                            <h3 className="font-semibold">Patient Progress</h3>
                            <p className="text-sm text-indigo-200">Manage mastery levels</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Today's Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Today's Schedule</span>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/therapist/sessions', { state: { activeTab: 'schedule' } })}>
                            View All →
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {todaySessions.length > 0 ? todaySessions.slice(0, 5).map(session => {
                            const child = kids.find(c => c.id === session.childId);
                            return (
                                <div key={session.id} className="flex items-center p-4 bg-neutral-50 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center text-lg font-bold text-neutral-600 mr-4">
                                        {new Date(session.date).getHours()}:{new Date(session.date).getMinutes().toString().padStart(2, '0')}
                                    </div>
                                    <img
                                        src={child?.photoUrl}
                                        alt={child?.name}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-neutral-900">{child?.name || 'Unknown'}</h4>
                                        <p className="text-sm text-neutral-500">{session.type} • {session.duration} mins</p>
                                    </div>
                                    <div>
                                        {session.status === 'completed' ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Completed</span>
                                        ) : (
                                            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); navigate('/therapist/sessions', { state: { activeTab: 'logs' } }); }}>
                                                Start Session
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-neutral-500 text-center py-4">No sessions scheduled for today.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Patients Needing Attention */}
            {patientsNeedingAttention.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700">⚠️ Patients Needing Attention</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {patientsNeedingAttention.map(patient => (
                                <div key={patient.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                    <img
                                        src={patient.photoUrl}
                                        alt={patient.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-neutral-800">{patient.name}</p>
                                        <p className="text-sm text-red-600">Multiple skills showing decline</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => navigate('/therapist/patients')}>
                                        Review
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

// ============================================================
// Therapist Portal Router
// ============================================================
const TherapistPortal = () => {
    return (
        <Routes>
            <Route element={<TherapistLayoutWrapper />}>
                <Route path="dashboard" element={<TherapistDashboard />} />
                <Route path="sessions" element={<Sessions />} />
                <Route path="patients" element={<MyPatients />} />
                <Route path="intelligence" element={<TherapyIntelligence />} />
                <Route path="roadmap" element={<RoadmapEditor />} />
                <Route path="messages" element={<TherapistMessages />} />
                <Route path="progress" element={<TherapistProgressTracking />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default TherapistPortal;
