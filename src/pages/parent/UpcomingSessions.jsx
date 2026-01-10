// ============================================================
// NeuroBridge™ - Upcoming Sessions Module
// Parent Portal - View and Manage Scheduled Sessions
// ============================================================

import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    MapPin,
    Bell,
    Plus,
    Video,
    User,
    ChevronRight,
    ExternalLink,
    X,
    CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// Local Session Detail Modal
const DetailModal = ({ session, child, users, onClose }) => {
    if (!session) return null;
    const therapist = users.find(u => u.id === session.therapistId);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <CardTitle className="text-xl">Session Details</CardTitle>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl">
                        <div className="p-3 bg-white rounded-lg shadow-sm">
                            <Calendar className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-neutral-800">{session.type}</p>
                            <p className="text-sm text-neutral-600">
                                {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Time</p>
                            <p className="text-neutral-800 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary-500" />
                                {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Duration</p>
                            <p className="text-neutral-800">{session.duration} minutes</p>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Location</p>
                            <p className="text-neutral-800 flex items-center gap-2">
                                {session.location?.toLowerCase().includes('virtual') ? <Video className="h-4 w-4 text-primary-500" /> : <MapPin className="h-4 w-4 text-primary-500" />}
                                {session.location || 'Clinic Center'}
                            </p>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Therapist</p>
                            <div className="flex items-center gap-3 mt-1">
                                <img src={therapist?.avatar} className="h-10 w-10 rounded-full border border-neutral-200" alt="" />
                                <div>
                                    <p className="font-medium text-neutral-800">{therapist?.name}</p>
                                    <p className="text-xs text-neutral-500">{therapist?.specialization}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full mt-4" onClick={onClose}>Close</Button>
                </CardContent>
            </Card>
        </div>
    );
};

const UpcomingSessions = () => {
    const { currentUser, kids, users, getChildSessions, addNotification, sendMessage } = useApp();
    const [selectedSession, setSelectedSession] = useState(null);

    // Get current child
    const child = kids.find(k => k.id === currentUser?.childId);
    if (!child) return <div className="p-8">No child profile found.</div>;

    const childSessions = getChildSessions(child.id);
    const upcomingSessions = childSessions
        .filter(s => s.status === 'scheduled')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSessionReminder = (session) => {
        addNotification({
            type: 'success',
            title: 'Reminder Set',
            message: `We'll remind you 24 hours before your ${session.type} session.`
        });
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Upcoming Sessions</h2>
                    <p className="text-neutral-500">Scheduled therapy sessions for {child.name}</p>
                </div>
            </div>

            {/* Session List */}
            <div className="grid grid-cols-1 gap-6">
                {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session) => {
                        const therapist = users.find(u => u.id === session.therapistId);
                        const isVirtual = session.location?.toLowerCase().includes('virtual') || session.location?.toLowerCase().includes('zoom');

                        return (
                            <Card key={session.id} className="overflow-hidden border-l-4 border-l-primary-500 hover:shadow-lg transition-shadow">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Date Section */}
                                        <div className="md:w-48 bg-neutral-50 p-6 flex flex-col items-center justify-center border-r border-neutral-100">
                                            <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">
                                                {new Date(session.date).toLocaleDateString(undefined, { month: 'short' })}
                                            </span>
                                            <span className="text-4xl font-black text-neutral-800 my-1">
                                                {new Date(session.date).getDate()}
                                            </span>
                                            <span className="text-sm text-neutral-500">
                                                {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short' })}
                                            </span>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 p-6">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-neutral-800">{session.type}</h3>
                                                            <div className="flex items-center gap-2 text-neutral-500 mt-1">
                                                                <User className="h-4 w-4" />
                                                                <span className="text-sm">with {therapist?.name || 'Your Therapist'}</span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-neutral-400 hover:text-primary-600"
                                                            onClick={() => handleSessionReminder(session)}
                                                            title="Set Reminder"
                                                        >
                                                            <Bell className="h-5 w-5" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div className="flex items-center gap-2 text-neutral-600">
                                                            <Clock className="h-4 w-4 text-primary-500" />
                                                            <span className="text-sm font-medium">{formatTime(session.date)} ({session.duration || 45} mins)</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-neutral-600">
                                                            {isVirtual ? (
                                                                <Video className="h-4 w-4 text-primary-500" />
                                                            ) : (
                                                                <MapPin className="h-4 w-4 text-primary-500" />
                                                            )}
                                                            <span className="text-sm font-medium">{session.location || 'Clinic Location'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row md:flex-col gap-2 min-w-[140px]">
                                                    {isVirtual && (
                                                        <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={() => window.open('#', '_blank')}>
                                                            Join Session
                                                            <ExternalLink className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="sm" className="w-full text-neutral-500" onClick={() => setSelectedSession(session)}>
                                                        View Details
                                                        <ChevronRight className="ml-1 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <Card className="border-dashed border-2 py-12">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <div className="bg-neutral-100 p-4 rounded-full mb-4">
                                <Calendar className="h-8 w-8 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-800">No sessions scheduled</h3>
                            <p className="text-neutral-500 max-w-xs mt-2">
                                Your therapist hasn't scheduled any upcoming sessions yet.
                            </p>
                            <Button variant="outline" className="mt-6">
                                Contact Therapist
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Preparation Card */}
            {upcomingSessions.length > 0 && (
                <Card className="bg-gradient-to-br from-primary-50 to-indigo-50 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            < Bell className="h-5 w-5 text-primary-600" />
                            Preparation Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-neutral-600 space-y-2">
                        <p>• Ensure {child.name} has a light snack 30 minutes before the session.</p>
                        <p>• Prepare the physical space or tech setup 10 minutes prior.</p>
                        <p>• Have the requested materials (if any) ready and within reach.</p>
                    </CardContent>
                </Card>
            )}

            {/* Modal */}
            {selectedSession && (
                <DetailModal
                    session={selectedSession}
                    child={child}
                    users={users}
                    onClose={() => setSelectedSession(null)}
                />
            )}
        </div>
    );
};

export default UpcomingSessions;
