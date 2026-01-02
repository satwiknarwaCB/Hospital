// ============================================================
// NeuroBridge™ - Parent Portal
// Complete Parent Experience with All Modules
// ============================================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    LayoutDashboard,
    History,
    TrendingUp,
    Target,
    Home,
    MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// Import all parent pages
import ProgressAnalytics from './ProgressAnalytics';
import GrowthRoadmap from './GrowthRoadmap';
import HomeActivities from './HomeActivities';
import SessionHistory from './SessionHistory';
import Messages from './Messages';

// ============================================================
// Parent Dashboard - Main Overview
// ============================================================
const ParentDashboard = () => {
    const { currentUser, kids, getChildSessions, getLatestSkillScores, getUnreadCount } = useApp();

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
                                    <Button className="flex-1" variant="outline">View Full Report</Button>
                                    <Button className="flex-1">Send Thanks to Therapist</Button>
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
                                <Button variant="outline" className="w-full mt-6">View Details</Button>
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
                <Route path="messages" element={<Messages />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default ParentPortal;
