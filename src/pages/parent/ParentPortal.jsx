// ============================================================
// NeuroBridge™ - Parent Portal
// Complete Parent Experience with All Modules
// ============================================================

import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    LayoutDashboard,
    History,
    TrendingUp,
    Target,
    Home,
    MessageCircle,
    Clock,
    MapPin,
    Calendar,
    X,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// Import all parent pages
import ProgressAnalytics from './ProgressAnalytics';
import GrowthRoadmap from './GrowthRoadmap';
import HomeActivities from './HomeActivities';
import SessionHistory from './SessionHistory';
import UpcomingSessions from './UpcomingSessions';
import Messages from './Messages';

// ============================================================
// Session Detail Modal Component
// ============================================================
const SessionDetailModal = ({ session, child, onClose }) => {
    if (!session) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header with Close Button */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-neutral-800">Session Details</h3>
                        <button
                            onClick={onClose}
                            className="text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Session Info */}
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-primary-50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-primary-100 rounded-lg">
                                    <Calendar className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-neutral-800">{session.type}</h4>
                                    <p className="text-sm text-neutral-600">
                                        {new Date(session.date).toLocaleDateString([], {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-neutral-500" />
                                    <span className="text-sm text-neutral-600">
                                        {new Date(session.date).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-neutral-500" />
                                    <span className="text-sm text-neutral-600">{session.duration} minutes</span>
                                </div>
                                {session.location && (
                                    <div className="flex items-center gap-2 col-span-2">
                                        <MapPin className="h-4 w-4 text-neutral-500" />
                                        <span className="text-sm text-neutral-600">{session.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-700">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                {session.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                            </span>
                        </div>

                        {/* Child Info */}
                        {child && (
                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                                <img
                                    src={child.photoUrl}
                                    alt={child.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-medium text-neutral-800">{child.name}</p>
                                    <p className="text-sm text-neutral-500">{child.diagnosis}</p>
                                </div>
                            </div>
                        )}

                        {/* Additional Details for Completed Sessions */}
                        {session.status === 'completed' && (
                            <>
                                {session.engagement && (
                                    <div>
                                        <p className="text-sm font-medium text-neutral-700 mb-2">Engagement</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${session.engagement >= 80 ? 'bg-green-500' :
                                                            session.engagement >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${session.engagement}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-neutral-700">
                                                {session.engagement}%
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {session.activities && session.activities.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-neutral-700 mb-2">Activities</p>
                                        <div className="flex flex-wrap gap-2">
                                            {session.activities.map((activity, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                                                >
                                                    {activity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {session.wins && session.wins.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-neutral-700 mb-2">Wins 🏆</p>
                                        <div className="flex flex-wrap gap-2">
                                            {session.wins.map((win, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                                                >
                                                    {win}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {session.aiSummary && (
                                    <div className="bg-violet-50 rounded-xl p-4">
                                        <p className="text-sm font-medium text-violet-900 mb-2">Session Summary</p>
                                        <p className="text-sm text-violet-700 leading-relaxed">
                                            {session.aiSummary}
                                        </p>
                                    </div>
                                )}

                                {session.notes && (
                                    <div>
                                        <p className="text-sm font-medium text-neutral-700 mb-2">Therapist Notes</p>
                                        <p className="text-sm text-neutral-600 italic bg-neutral-50 p-3 rounded-lg">
                                            "{session.notes}"
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Close
                        </Button>
                        {session.status === 'scheduled' && (
                            <Button className="flex-1">
                                Add to Calendar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// Parent Dashboard - Main Overview
// ============================================================
const ParentDashboard = () => {
    const {
        currentUser,
        kids,
        users,
        getChildSessions,
        getLatestSkillScores,
        getUnreadCount,
        getChildMessages,
        sendMessage,
        addNotification
    } = useApp();
    const navigate = useNavigate();
    const [selectedSession, setSelectedSession] = useState(null);
    const [showThanksSent, setShowThanksSent] = useState(false);

    // Safety check
    if (!currentUser || currentUser.role !== 'parent') {
        return <div className="p-8 text-center text-neutral-500">Please log in as a parent to view this dashboard.</div>;
    }

    // Get the logged-in parent's child
    const child = kids.find(c => c.id === currentUser.childId);

    if (!child) return <div className="p-8">No child profile found.</div>;

    const childSessions = getChildSessions(child.id);
    const lastSession = childSessions.find(s => s.status === 'completed');
    const nextSession = childSessions.find(s => s.status === 'scheduled');
    const skillScores = getLatestSkillScores(child.id);
    const unreadMessages = getUnreadCount(currentUser.id);

    // Calculate overall progress
    const overallProgress = skillScores.length > 0
        ? Math.round(skillScores.reduce((a, b) => a + b.score, 0) / skillScores.length)
        : 0;

    const improvingAreas = skillScores.filter(s => s.trend === 'improving').length;

    return (
        <div className="space-y-6">
            {/* Welcome Block */}
            <div className="flex items-center space-x-4 mb-8">
                <img
                    src={child.photoUrl}
                    alt={child.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-200"
                />
                <div>
                    <h1 className="text-2xl font-bold text-neutral-800">Hi, {child.name.split(' ')[0]}'s Family! 👋</h1>
                    <p className="text-neutral-500">Here is what's happening with {child.name} today.</p>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                    <CardContent className="p-4">
                        <p className="text-primary-100 text-sm">Current Streak</p>
                        <p className="text-3xl font-bold">{child.streak} days 🔥</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-neutral-500 text-sm">Overall Progress</p>
                        <p className="text-2xl font-bold text-neutral-800">{overallProgress}%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-neutral-500 text-sm">Improving Areas</p>
                        <p className="text-2xl font-bold text-green-600">{improvingAreas} skills</p>
                    </CardContent>
                </Card>
                <Card className={unreadMessages > 0 ? 'bg-violet-50 border-violet-200' : ''}>
                    <CardContent className="p-4">
                        <p className="text-neutral-500 text-sm">New Messages</p>
                        <p className={`text-2xl font-bold ${unreadMessages > 0 ? 'text-violet-600' : 'text-neutral-800'}`}>
                            {unreadMessages}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Recent/Today Session */}
                <Card className="border-t-4 border-t-primary-500 col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Today's Highlights</span>
                            <span className="text-sm font-normal text-neutral-500">
                                {lastSession ? new Date(lastSession.date).toLocaleDateString() : 'No recent sessions'}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lastSession ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-lg font-medium text-neutral-800 mb-1">{lastSession.type}</p>
                                    {lastSession.aiSummary ? (
                                        <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl relative">
                                            <div className="absolute -top-3 -right-3 bg-white p-1.5 rounded-full shadow-sm border border-neutral-100">
                                                <span className="text-xl">✨</span>
                                            </div>
                                            <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
                                                {lastSession.aiSummary}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-neutral-600 italic">"{lastSession.notes}"</p>
                                    )}
                                </div>

                                {lastSession.wins && (
                                    <div className="flex flex-wrap gap-2">
                                        {lastSession.wins.map((win, i) => (
                                            <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                🏆 {win}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-4">
                                    {/* View full report in an overlay */}
                                    <Button
                                        className="flex-1"
                                        variant="outline"
                                        onClick={() => setSelectedSession(lastSession)}
                                    >
                                        View Full Report
                                    </Button>

                                    {/* Send thanks to the therapist in existing chat thread */}
                                    <Button
                                        className="flex-1"
                                        onClick={() => {
                                            const childForSession = kids.find(c => c.id === lastSession.childId);
                                            const therapistId = lastSession.therapistId || childForSession?.therapistId || 't1';

                                            if (therapistId) {
                                                // Find existing thread between this parent and therapist for this child
                                                const existingMessages = getChildMessages(childForSession.id, currentUser.id);
                                                const existingThread = existingMessages.find(
                                                    m =>
                                                        (m.senderId === therapistId || m.recipientId === therapistId) &&
                                                        m.childId === childForSession.id
                                                );

                                                const threadId = existingThread?.threadId || `thread-${currentUser.id}-${therapistId}`;
                                                const therapistUser = users.find(u => u.id === therapistId);

                                                sendMessage({
                                                    threadId,
                                                    senderId: currentUser.id,
                                                    senderName: currentUser.name,
                                                    senderRole: 'parent',
                                                    recipientId: therapistId,
                                                    childId: childForSession.id,
                                                    subject: 'Thank You',
                                                    content: `Thank you so much, ${therapistUser?.name || 'Doctor'}, for the wonderful session with ${childForSession?.name || 'my child'}! We really appreciate your dedication and the progress we're seeing. 🙏`,
                                                    type: 'message'
                                                });

                                                addNotification({
                                                    type: 'success',
                                                    title: 'Message Sent',
                                                    message: `Your thank you message has been sent to ${therapistUser?.name || 'the therapist'}.`
                                                });

                                                setShowThanksSent(true);
                                                setTimeout(() => setShowThanksSent(false), 3000);
                                            } else {
                                                addNotification({
                                                    type: 'error',
                                                    title: 'Error',
                                                    message: 'Unable to send message. Therapist information not available.'
                                                });
                                            }
                                        }}
                                        disabled={showThanksSent}
                                    >
                                        {showThanksSent ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Sent!
                                            </>
                                        ) : (
                                            'Send Thanks to Therapist'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-neutral-500">No recent sessions.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Current Mood */}
                <Card className="border-t-4 border-t-secondary-500">
                    <CardHeader>
                        <CardTitle>Current Mood</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center p-4">
                            <span className="text-5xl animate-bounce">{child.currentMood ? child.currentMood.split(' ')[0] : '😐'}</span>
                        </div>
                        <p className="text-center text-lg font-medium text-neutral-800 mt-2">
                            {child.currentMood ? child.currentMood.split(' ').slice(1).join(' ') : 'Unknown'}
                        </p>
                        <p className="text-center text-sm text-neutral-500 mt-1">{child.moodContext}</p>
                    </CardContent>
                </Card>

                {/* Next Session */}
                <Card className="border-t-4 border-t-neutral-500">
                    <CardHeader>
                        <CardTitle>Up Next</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nextSession ? (
                            <>
                                <p className="text-lg font-medium text-neutral-800">{nextSession.type}</p>
                                <div className="flex items-center mt-2 text-neutral-600">
                                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                    {new Date(nextSession.date).toLocaleString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <p className="text-sm text-neutral-500 mt-2">{nextSession.location}</p>
                                <Button
                                    variant="outline"
                                    className="w-full mt-6"
                                    onClick={() => setSelectedSession(nextSession)}
                                >
                                    View Details
                                </Button>
                            </>
                        ) : (
                            <p className="text-neutral-500">No upcoming sessions scheduled.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Progress Overview */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Progress Snapshot</span>
                            <Button variant="ghost" size="sm" className="text-primary-600">
                                View Details →
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {skillScores.slice(0, 4).map((skill) => (
                                <div key={skill.id} className="text-center p-3 bg-neutral-50 rounded-xl">
                                    <div className="relative h-12 w-12 mx-auto mb-2">
                                        <svg className="transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="text-neutral-200"
                                                strokeWidth="3"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className={skill.trend === 'improving' ? 'text-green-500' : skill.trend === 'attention' ? 'text-red-500' : 'text-yellow-500'}
                                                strokeWidth="3"
                                                strokeDasharray={`${skill.score}, 100`}
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                            {skill.score}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-600 font-medium truncate">{skill.domain.split(' - ')[0]}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Session Detail Modal */}
            {selectedSession && (
                <SessionDetailModal
                    session={selectedSession}
                    child={child}
                    onClose={() => setSelectedSession(null)}
                />
            )}
        </div>
    );
};

// ============================================================
// Parent Portal Router
// ============================================================
const ParentPortal = () => {
    const sidebarItems = [
        { label: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
        { label: 'Progress', path: '/parent/progress', icon: TrendingUp },
        { label: 'Roadmap', path: '/parent/roadmap', icon: Target },
        { label: 'Home Activities', path: '/parent/activities', icon: Home },
        { label: 'Session History', path: '/parent/history', icon: History },
        { label: 'Upcoming Session', path: '/parent/upcoming', icon: Calendar },
        { label: 'Messages', path: '/parent/messages', icon: MessageCircle },
    ];

    return (
        <Routes>
            <Route element={<DashboardLayout title="Parent Portal" sidebarItems={sidebarItems} roleColor="bg-primary-600" />}>
                <Route path="dashboard" element={<ParentDashboard />} />
                <Route path="progress" element={<ProgressAnalytics />} />
                <Route path="roadmap" element={<GrowthRoadmap />} />
                <Route path="activities" element={<HomeActivities />} />
                <Route path="history" element={<SessionHistory />} />
                <Route path="upcoming" element={<UpcomingSessions />} />
                <Route path="messages" element={<Messages />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default ParentPortal;
