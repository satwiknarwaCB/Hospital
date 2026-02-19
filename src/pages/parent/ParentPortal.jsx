// ============================================================
// NeuroBridge™ - Parent Portal
// Complete Parent Experience with All Modules
// ============================================================

import React, { useState, useEffect } from 'react';
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
    CheckCircle2,
    Users,
    Activity,
    Lock,
    ChevronRight,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// Import all parent pages
import ProgressAnalytics from './ProgressAnalytics';
import ChildProgressTracking from './ChildProgressTracking';
import GrowthRoadmap from './GrowthRoadmap';
import HomeActivities from './HomeActivities';
import ParentSessions from './ParentSessions';
import Messages from './Messages';
import MemoryBox from './MemoryBox';
import Reports from './Reports';


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
                                                        session.engagement >= 40 ? 'bg-yellow-500' : 'bg-red-500'
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

    // Get the logged-in parent's child
    const child = kids.find(c => c.id === currentUser?.childId);

    // Gajju's Morning Message Logic (Speech)
    useEffect(() => {
        // Only run once per session to avoid annoying the user
        const hasGreeted = sessionStorage.getItem('gajju_greeted');
        if (!hasGreeted && child?.id) {
            const time = new Date().getHours();
            let greeting = 'Good Morning';
            if (time >= 12 && time < 17) greeting = 'Good Afternoon';
            if (time >= 17) greeting = 'Good Evening';

            const messages = [
                `${greeting}! How is ${child.name} feeling today? ☀️`,
                `Ready for another day of breakthroughs for ${child.name}? 🚀`,
                `Hope you and ${child.name} are having a wonderful day! ✨`,
                `Small steps lead to big milestones! How can I help ${child.name} today? 🌱`
            ];

            const randomMsg = messages[Math.floor(Math.random() * messages.length)];

            addNotification({
                type: 'ai_insight',
                title: 'Gajju says...',
                message: randomMsg,
                icon: 'Sparkles'
            });

            sessionStorage.setItem('gajju_greeted', 'true');
        }
    }, [child?.id, addNotification]);

    // Safety check
    if (!currentUser || currentUser.role !== 'parent') {
        return <div className="p-8 text-center text-neutral-500">Please log in as a parent to view this dashboard.</div>;
    }

    if (!child) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <Card className="max-w-2xl w-full border-none shadow-2xl overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl">
                    <CardContent className="p-12 text-center">
                        <div className="w-24 h-24 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
                            <span className="text-5xl">🐘</span>
                        </div>
                        <h2 className="text-3xl font-black text-neutral-800 mb-4 tracking-tight">
                            Welcome to NeuroBridge™, {currentUser.name.split(' ')[0]}!
                        </h2>
                        <p className="text-lg text-neutral-600 mb-10 leading-relaxed font-medium">
                            We're excited to have you join our community. Your account has been created successfully.
                            To start tracking progress and connecting with your therapy team, we just need to set up your child's profile.
                        </p>

                        <div className="space-y-4">
                            <Button
                                className="w-full h-14 text-lg font-bold bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-200 rounded-2xl"
                                onClick={() => navigate('/parent/messages')}
                            >
                                Contact Administrator to Add Child
                            </Button>
                            <p className="text-sm text-neutral-400">
                                Your clinical team will link your child's profile to your account shortly.
                            </p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-neutral-100 grid grid-cols-2 gap-6">
                            <div className="text-left">
                                <p className="text-xl font-bold text-neutral-800">Next Step</p>
                                <p className="text-sm text-neutral-500">An admin will contact you via email or the secure portal messaging system.</p>
                            </div>
                            <div className="flex flex-col items-end justify-center">
                                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-black uppercase tracking-widest border border-green-100">
                                    Account Active
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const childSessions = getChildSessions(child.id);

    // Get all completed sessions sorted by newest first
    const completedSessions = childSessions
        .filter(s => s.status === 'completed')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get today's sessions specifically
    const todayStr = new Date().toISOString().split('T')[0];
    const todayHighlights = completedSessions.filter(s => s.date.startsWith(todayStr));

    // Determine what to show: All of today's, or just the most recent if none today
    const highlightsToShow = todayHighlights.length > 0 ? todayHighlights : (completedSessions[0] ? [completedSessions[0]] : []);

    const nextSession = childSessions.find(s => s.status === 'scheduled');
    const skillScores = getLatestSkillScores(child.id);
    const unreadMessages = getUnreadCount(currentUser.id);

    // Grouping progress by Session Types (Therapy Types)
    const therapyProgress = [
        {
            name: 'Speech Therapy',
            val: skillScores.find(s => s.domain.toLowerCase().includes('language'))?.score || 65,
            trend: 'improving',
            color: 'text-violet-500'
        },
        {
            name: 'Occupational Therapy',
            val: skillScores.find(s => s.domain.toLowerCase().includes('sensory') || s.domain.toLowerCase().includes('interaction'))?.score || 58,
            trend: 'improving',
            color: 'text-orange-500'
        },
        {
            name: 'Physical Therapy',
            val: skillScores.find(s => s.domain.toLowerCase().includes('motor'))?.score || 45,
            trend: 'stable',
            color: 'text-blue-500'
        },
        {
            name: 'Behavioral Therapy',
            val: skillScores.find(s => s.domain.toLowerCase().includes('emotional') || s.domain.toLowerCase().includes('regulation'))?.score || 72,
            trend: 'improving',
            color: 'text-green-500'
        }
    ];

    // Calculate overall progress
    const overallProgress = skillScores.length > 0
        ? Math.round(skillScores.reduce((a, b) => a + b.score, 0) / skillScores.length)
        : 0;

    const improvingAreas = skillScores.filter(s => s.trend === 'improving').length;

    // Simplified labels for parent understanding
    const overallProgressDisplay = overallProgress;
    const improvingCount = improvingAreas;

    // Periodic (15-day/Monthly) Clinical Reviews
    const periodicReviews = [
        {
            id: 'rev1',
            type: 'Speech Therapy',
            title: 'Fortnightly Progress Review',
            date: 'Feb 1, 2026',
            period: 'Jan 15 - Jan 31',
            summary: `${child.name} has shown remarkable consistency in receptive language this fortnight. He is now independently using picture cards to express needs in 4/5 attempts. Engagement levels have stabilized at 75% across all speech activities.`,
            milestone: 'Mastered 2-step instructional sequences',
            isNew: true
        },
        {
            id: 'rev2',
            type: 'Occupational Therapy',
            title: 'Monthly Clinical Insight',
            date: 'Jan 28, 2026',
            period: 'Jan 1 - Jan 28',
            summary: "This month's focus on sensory regulation has been highly productive. We observed a 40% decrease in transition-related anxiety. Fine motor coordination for pincer grasp is reaching age-appropriate milestones. We will continue focusing on auditory desensitization next month.",
            milestone: 'Independent sensory regulation in noisy environments',
            isNew: false
        }
    ];

    return (
        <div className="space-y-8 pb-safe-nav animate-slide-up">
            {/* Gajju Welcome Card */}
            <Card className="glass-card border-none overflow-hidden bg-gradient-to-r from-primary-500/10 to-violet-500/10 mb-8">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="relative shrink-0">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float">
                            <span className="text-3xl sm:text-4xl">🐘</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-white" title="Gajju is online!" />
                    </div>
                    <div className="text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                            <h1 className="text-xl sm:text-2xl font-black text-neutral-800 tracking-tight">
                                Hi, {child.name.split(' ')[0]}'s Family! 👋
                            </h1>
                            <div className="flex items-center gap-1.5 bg-green-500/10 text-green-700 px-3 py-1 rounded-full border border-green-500/20 shadow-sm">
                                <Lock className="h-3 w-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Bridge</span>
                            </div>
                        </div>
                        <p className="text-neutral-500 font-medium">
                            Gajju is ready for today's play session.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats Row - Peer Friendly Labels */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="btn-premium bg-gradient-to-br from-primary-500 to-primary-600 border-none text-white shadow-xl shadow-primary-200/50">
                    <CardContent className="p-5">
                        <p className="text-primary-100 text-[10px] font-black uppercase tracking-widest mb-1">Activity Streak</p>
                        <p className="text-3xl font-black">{child.streak} DAYS 🔥</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none">
                    <CardContent className="p-5">
                        <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-1">New Learning</p>
                        <p className="text-3xl font-black text-neutral-800">{overallProgressDisplay}%</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none">
                    <CardContent className="p-5">
                        <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-1">Small Wins</p>
                        <p className="text-3xl font-black text-green-500">{improvingCount}</p>
                    </CardContent>
                </Card>
                <Card className={`glass-card border-none ${unreadMessages > 0 ? 'bg-violet-50' : ''}`}>
                    <CardContent className="p-5">
                        <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-1">Doctor Notes</p>
                        <p className={`text-3xl font-black ${unreadMessages > 0 ? 'text-violet-600' : 'text-neutral-800'}`}>
                            {unreadMessages}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Recent/Today Sessions */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-neutral-800 tracking-tight">Today's Highlights 🌟</h2>
                        {todayHighlights.length > 0 && (
                            <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                                {todayHighlights.length} Sessions Today
                            </span>
                        )}
                    </div>

                    {highlightsToShow.length > 0 ? (
                        highlightsToShow.map((session, index) => (
                            <Card key={session.id} className={`border-t-4 ${index === 0 ? 'border-t-primary-500' : 'border-t-secondary-500'} animate-slide-up`} style={{ animationDelay: `${index * 100}ms` }}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${index === 0 ? 'bg-primary-50 text-primary-600' : 'bg-secondary-50 text-secondary-600'}`}>
                                                <Activity className="h-4 w-4" />
                                            </div>
                                            <p className="text-lg font-bold text-neutral-800">{session.type}</p>
                                        </div>
                                        <span className="text-sm font-medium text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                                            {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            {session.aiSummary ? (
                                                <div className="bg-neutral-50 border border-neutral-100 p-5 rounded-2xl relative shadow-inner">
                                                    <div className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-md border border-neutral-50 scale-110">
                                                        <span className="text-xl">✨</span>
                                                    </div>
                                                    <p className="text-neutral-700 leading-relaxed text-sm md:text-base font-medium">
                                                        {session.aiSummary}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-neutral-600 italic">"{session.notes || 'No notes available for this session.'}"</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                            {session.wins && (
                                                <div className="flex flex-wrap gap-2">
                                                    {session.wins.map((win, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-green-500/10 text-green-700 rounded-xl text-xs font-black uppercase tracking-wider border border-green-500/20">
                                                            🏆 {win}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="flex-1 md:flex-none h-11 px-6 rounded-xl font-bold"
                                                    onClick={() => navigate('/parent/sessions', { state: { activeTab: 'history', sessionId: session.id } })}
                                                >
                                                    Full Report
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="flex-1 md:flex-none h-11 px-6 rounded-xl font-bold bg-neutral-900 hover:bg-black text-white"
                                                    onClick={() => {
                                                        const therapistId = session.therapistId || 't1';
                                                        const therapistUser = users.find(u => u.id === therapistId);

                                                        sendMessage({
                                                            threadId: `thread-${currentUser.id}-${therapistId}`,
                                                            senderId: currentUser.id,
                                                            senderName: currentUser.name,
                                                            senderRole: 'parent',
                                                            recipientId: therapistId,
                                                            childId: child.id,
                                                            subject: `Thanks for today's ${session.type}!`,
                                                            content: `Hi ${therapistUser?.name || 'Doctor'}, thank you for the wonderful session today. We loved the update!`,
                                                            type: 'message'
                                                        });

                                                        addNotification({
                                                            type: 'success',
                                                            title: 'Thanks Sent!',
                                                            message: `Appreciation sent to ${therapistUser?.name || 'the therapist'}.`
                                                        });
                                                    }}
                                                >
                                                    Say Thanks
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-8 text-center border-dashed border-2 bg-neutral-50/50">
                            <span className="text-4xl block mb-4">🌱</span>
                            <p className="text-neutral-500 font-medium">No sessions logged for today yet.</p>
                        </Card>
                    )}
                </div>

                {/* Periodic Clinical Reviews - 15 Day / Monthly Summaries */}
                <div className="col-span-1 lg:col-span-3 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2">
                        <h2 className="text-lg sm:text-xl font-black text-neutral-800 tracking-tight flex items-center gap-2">
                            <History className="h-5 w-5 text-violet-500 shrink-0" />
                            Clinical Reviews & Milestones 📋
                        </h2>
                        <span className="text-sm font-bold text-neutral-400">15-30 Day Insights</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {periodicReviews.map((review) => (
                            <Card key={review.id} className="relative group overflow-hidden border-none shadow-lg bg-white ring-1 ring-neutral-200">
                                {review.isNew && (
                                    <div className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest z-10">
                                        New Review
                                    </div>
                                )}
                                <CardHeader className="bg-neutral-50/50 border-b border-neutral-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1">{review.type}</p>
                                            <h3 className="text-lg font-black text-neutral-800 tracking-tight">{review.title}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-neutral-500">{review.date}</p>
                                            <p className="text-[10px] font-medium text-neutral-400 italic">{review.period}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <p className="text-neutral-600 text-sm leading-relaxed">
                                                {review.summary}
                                            </p>
                                        </div>

                                        <div className="bg-primary-50 p-3 rounded-xl border border-primary-100/50">
                                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Key Milestone Reached</p>
                                            <p className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                                                <Target className="h-4 w-4 text-primary-500" />
                                                {review.milestone}
                                            </p>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            className="w-full text-xs font-bold text-neutral-500 hover:text-primary-600 hover:bg-primary-50 h-10 rounded-lg group"
                                            onClick={() => navigate('/parent/new-learning')}
                                        >
                                            View Full Progress Roadmap
                                            <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

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
                                    onClick={() => navigate('/parent/sessions', { state: { activeTab: 'upcoming', sessionId: nextSession.id } })}
                                >
                                    View Details
                                </Button>
                            </>
                        ) : (
                            <p className="text-neutral-500">No upcoming sessions scheduled.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Therapy Mastery Overview */}
                <Card className="col-span-1 md:col-span-2 shadow-sm border-neutral-200/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary-500 shrink-0" />
                                <span className="text-lg sm:text-xl font-black text-neutral-800 tracking-tight">Therapy Mastery</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary-600 font-bold hover:bg-primary-50 w-full sm:w-auto" onClick={() => navigate('/parent/new-learning')}>
                                View Detailed Roadmap →
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {therapyProgress.map((therapy) => (
                                <div key={therapy.name} className="flex flex-col items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100/50 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="relative h-20 w-20 mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 36 36">
                                            <path
                                                className="text-neutral-200"
                                                strokeWidth="3.5"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className={therapy.color}
                                                strokeWidth="3.5"
                                                strokeDasharray={`${therapy.val}, 100`}
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-lg font-black text-neutral-800 leading-none">{therapy.val}%</span>
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Done</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-neutral-600 font-black text-center leading-tight">
                                        {therapy.name.split(' ')[0]}<br />{therapy.name.split(' ')[1]}
                                    </p>
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
    const navigate = useNavigate();
    const { privateUnreadCount, communityUnreadCount, logout } = useApp();
    const totalMessagesUnread = (privateUnreadCount || 0) + (communityUnreadCount || 0);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const sidebarItems = [
        { label: 'Today', path: '/parent/today', icon: LayoutDashboard },
        { label: 'Daily Play', path: '/parent/daily-play', icon: Home },
        { label: 'New Learning', path: '/parent/new-learning', icon: TrendingUp },
        { label: 'Our Goals', path: '/parent/our-goals', icon: Target },
        { label: 'Sessions', path: '/parent/sessions', icon: Calendar },
        { label: 'Reports', path: '/parent/reports', icon: FileText },
        { label: 'Memory Box', path: '/parent/memory-box', icon: History },
        { label: 'Messages', path: '/parent/messages', icon: MessageCircle, badge: totalMessagesUnread },
    ];

    return (
        <Routes>
            <Route element={<DashboardLayout title="Parent Portal" sidebarItems={sidebarItems} roleColor="bg-primary-600" onLogout={handleLogout} />}>
                <Route path="today" element={<ParentDashboard />} />
                <Route path="new-learning" element={<ProgressAnalytics />} />
                <Route path="our-goals" element={<GrowthRoadmap />} />
                <Route path="daily-play" element={<HomeActivities />} />
                <Route path="sessions" element={<ParentSessions />} />
                <Route path="reports" element={<Reports />} />
                <Route path="messages" element={<Messages />} />
                <Route path="memory-box" element={<MemoryBox />} />
                <Route path="*" element={<Navigate to="today" replace />} />
            </Route>
        </Routes>
    );
};

export default ParentPortal;
