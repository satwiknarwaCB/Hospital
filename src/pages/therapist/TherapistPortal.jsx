// ============================================================
// NeuroBridge™ - Therapist Portal
// Complete Therapist Experience with All Modules
// ============================================================

import React from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
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
import MyChildren from './MyPatients';
import TherapyIntelligence from './TherapyIntelligence';
import RoadmapEditor from './RoadmapEditor';
import TherapistMessages from './TherapistMessages';
import TherapistProgressTracking from './TherapistProgressTracking';
import BaselineArchive from './BaselineArchive';
import SessionLog from './SessionLog';

// ============================================================
// Therapist Layout Wrapper with Logout
// ============================================================
const TherapistLayoutWrapper = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const { privateUnreadCount, communityUnreadCount } = useApp();
    const totalMessagesUnread = (privateUnreadCount || 0) + (communityUnreadCount || 0);

    const sidebarItems = [
        { label: 'Command Center', path: '/therapist/command-center', icon: LayoutDashboard },
        { label: 'Schedule', path: '/therapist/schedule', icon: Calendar },
        { label: 'Care Hub', path: '/therapist/care-hub', icon: Users },
        { label: 'Growth Tracking', path: '/therapist/growth-tracking', icon: Activity },
        { label: 'Clinical Brain', path: '/therapist/clinical-brain', icon: Brain },
        { label: 'Blueprints', path: '/therapist/blueprints', icon: Target },
        { label: 'Dossier', path: '/therapist/dossier', icon: ClipboardList },
        { label: 'Connect', path: '/therapist/connect', icon: MessageSquare, badge: totalMessagesUnread },
    ];

    return (
        <DashboardLayout
            title="Therapist Console"
            sidebarItems={sidebarItems}
            roleColor="bg-secondary-600"
            onLogout={handleLogout}
        >
            <Outlet />
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
        getTodaysSessions,
        privateUnreadCount,
        communityUnreadCount
    } = useApp();

    const therapistId = currentUser?.id;

    // DEFENSIVE DATA
    const safeKids = Array.isArray(kids) ? kids : [];
    const safeSessions = Array.isArray(sessions) ? sessions : [];

    // RELAXED FILTER: Show all kids if none are specifically assigned to avoid empty states
<<<<<<< HEAD
    const myChildren = safeKids.filter(k => k.therapistId === therapistId).length > 0
        ? safeKids.filter(k => k.therapistId === therapistId)
        : safeKids;
=======
    const myChildren = kids.filter(k => (k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : [])).includes(therapistId)).length > 0
        ? kids.filter(k => (k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : [])).includes(therapistId))
        : kids;
>>>>>>> 748b94b9a72a8862b168f48cef7cb41e2e2f7dfc

    const stats = typeof getTherapistStats === 'function' ? getTherapistStats(therapistId) : { totalChildren: 0, pendingReports: 0, weeklyHours: 0 };
    const totalUnread = (privateUnreadCount || 0) + (communityUnreadCount || 0);

    // Get today's sessions dynamically
    const todaySessions = typeof getTodaysSessions === 'function' ? getTodaysSessions(therapistId) : [];
    const completedSessions = todaySessions.filter(s => s.status === 'completed');

    // Get children needing attention
    const childrenNeedingAttention = myChildren.filter(child => {
        if (typeof getLatestSkillScores !== 'function') return false;
        const scores = getLatestSkillScores(child.id) || [];
        return scores.filter(s => s.trend === 'attention').length >= 2;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Welcome back, {currentUser?.name?.split(' ')[0] || 'Doctor'}! 👋</h2>
                        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 shadow-sm animate-pulse-slow">
                            <Lock className="h-3 w-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Bridge Active</span>
                        </div>
                    </div>
                    <p className="text-neutral-500">Here's your therapy overview for today.</p>
                </div>
                <Button className="w-full sm:w-auto shrink-0" onClick={() => navigate('/therapist/schedule', { state: { activeTab: 'logs' } })}>+ Log New Session</Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <Card className="border-l-4 border-l-secondary-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/therapist/care-hub')}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Active Children</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-neutral-800">{stats?.totalChildren || 0}</p>
                        <p className="text-sm text-neutral-500">Total Caseload</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary-500 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/therapist/schedule', { state: { activeTab: 'schedule' } })}>
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
                <Card className={`border-l-4 ${totalUnread > 0 ? 'border-l-violet-500 bg-violet-50' : 'border-l-neutral-300'} hover:shadow-lg transition-shadow cursor-pointer`} onClick={() => navigate('/therapist/connect')}>
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
                <Card className={`border-l-4 ${childrenNeedingAttention.length > 0 ? 'border-l-red-500 bg-red-50' : 'border-l-green-500 bg-green-50'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Need Attention</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-3xl font-bold ${childrenNeedingAttention.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {childrenNeedingAttention.length}
                        </p>
                        <p className={`text-sm ${childrenNeedingAttention.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {childrenNeedingAttention.length > 0 ? 'Review Required' : 'All Good!'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-violet-500 to-purple-600 text-white" onClick={() => navigate('/therapist/clinical-brain')}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Brain className="h-10 w-10 text-violet-200" />
                        <div>
                            <h3 className="font-semibold">AI Intelligence</h3>
                            <p className="text-sm text-violet-200">View insights & analytics</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-primary-500 to-primary-600 text-white" onClick={() => navigate('/therapist/blueprints')}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Target className="h-10 w-10 text-primary-200" />
                        <div>
                            <h3 className="font-semibold">Roadmap Editor</h3>
                            <p className="text-sm text-primary-200">Manage goals</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-secondary-500 to-secondary-600 text-white" onClick={() => navigate('/therapist/schedule', { state: { activeTab: 'schedule' } })}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Calendar className="h-10 w-10 text-secondary-200" />
                        <div>
                            <h3 className="font-semibold">Sessions</h3>
                            <p className="text-sm text-secondary-200">Manage calendar & logs</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-indigo-500 to-blue-600 text-white" onClick={() => navigate('/therapist/growth-tracking')}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <Activity className="h-10 w-10 text-indigo-200" />
                        <div>
                            <h3 className="font-semibold">Child Progress</h3>
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
                        <Button variant="ghost" size="sm" onClick={() => navigate('/therapist/schedule', { state: { activeTab: 'schedule' } })}>
                            View All →
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {todaySessions.length > 0 ? todaySessions.slice(0, 5).map(session => {
                            const child = kids.find(c => c.id === session.childId);
                            return (
                                <div key={session.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center text-lg font-bold text-neutral-600 shrink-0">
                                        {new Date(session.date).getHours()}:{new Date(session.date).getMinutes().toString().padStart(2, '0')}
                                    </div>
                                    <img
                                        src={child?.photoUrl}
                                        alt={child?.name}
                                        className="w-10 h-10 rounded-full shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-neutral-900 truncate">{child?.name || 'Unknown'}</h4>
                                        <p className="text-sm text-neutral-500">{session.type} • {session.duration} mins</p>
                                    </div>
                                    <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                        {session.status === 'completed' ? (
                                            <span className="block sm:inline-block text-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Completed</span>
                                        ) : (
                                            <Button size="sm" variant="secondary" className="w-full sm:w-auto" onClick={(e) => { e.stopPropagation(); navigate('/therapist/log', { state: { childId: session.childId, sessionId: session.id, sessionType: session.type } }); }}>
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

            {/* Children Needing Attention */}
            {childrenNeedingAttention.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700">⚠️ Children Needing Attention</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {childrenNeedingAttention.map(child => (
                                <div key={child.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                    <img
                                        src={child.photoUrl}
                                        alt={child.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-neutral-800">{child.name}</p>
                                        <p className="text-sm text-red-600">Multiple skills showing decline</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => navigate('/therapist/care-hub')}>
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
                <Route path="command-center" element={<TherapistDashboard />} />
                <Route path="schedule" element={<Sessions />} />
                <Route path="care-hub" element={<MyChildren />} />
                <Route path="clinical-brain" element={<TherapyIntelligence />} />
                <Route path="blueprints" element={<RoadmapEditor />} />
                <Route path="dossier" element={<BaselineArchive />} />
                <Route path="connect/*" element={<TherapistMessages />} />
                <Route path="growth-tracking" element={<TherapistProgressTracking />} />
                <Route path="log" element={<SessionLog />} />
                <Route path="*" element={<Navigate to="command-center" replace />} />
            </Route>
        </Routes>
    );
};

export default TherapistPortal;
