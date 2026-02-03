// ============================================================
// NeuroBridge™ - Schedule Management
// Therapist Console - Session Calendar & Scheduling
// ============================================================

import React, { useState, useMemo } from 'react';
import {
    Calendar,
    Clock,
    Plus,
    ChevronLeft,
    ChevronRight,
    Users,
    MapPin,
    CheckCircle2,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';
import { THERAPY_TYPES } from '../../data/mockData';
import { sessionAPI } from '../../lib/api';
import { Loader2 } from 'lucide-react';

// Time Slot Component
const TimeSlot = ({ session, child, onClick }) => {
    const therapyType = THERAPY_TYPES.find(t => t.name === session.type);
    const statusColor = session.status === 'completed'
        ? 'border-l-green-500 bg-green-50'
        : session.status === 'scheduled'
            ? 'border-l-primary-500 bg-primary-50'
            : 'border-l-yellow-500 bg-yellow-50';

    return (
        <div
            className={`p-3 rounded-lg border-l-4 ${statusColor} cursor-pointer hover:shadow-md transition-shadow`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-medium text-neutral-800">{child?.name || 'Unknown'}</p>
                    <p className="text-sm text-neutral-600">{session.type}</p>
                </div>
                <span className="text-lg">{therapyType?.icon || '📋'}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span>{session.duration} min</span>
                {session.location && (
                    <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                    </span>
                )}
            </div>
        </div>
    );
};

// Calendar Day Cell
const CalendarDay = ({ date, sessions, kids, isToday, isSelected, onClick }) => {
    const dayNumber = date.getDate();
    const hasSession = sessions.length > 0;

    return (
        <div
            className={`min-h-[100px] p-2 border border-neutral-100 cursor-pointer transition-colors ${isSelected ? 'bg-primary-50 border-primary-300' :
                isToday ? 'bg-blue-50' :
                    'hover:bg-neutral-50'
                }`}
            onClick={onClick}
        >
            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-neutral-700'
                }`}>
                {dayNumber}
            </div>
            <div className="space-y-1">
                {sessions.slice(0, 3).map(session => {
                    const child = kids.find(k => k.id === session.childId);
                    return (
                        <div
                            key={session.id}
                            className={`text-xs p-1 rounded truncate ${session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                                }`}
                        >
                            {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {child?.name.split(' ')[0]}
                        </div>
                    );
                })}
                {sessions.length > 3 && (
                    <div className="text-xs text-neutral-500">+{sessions.length - 3} more</div>
                )}
            </div>
        </div>
    );
};

// Session Detail Modal
const SessionDetailModal = ({ session, child, onClose, onStatusChange }) => {
    if (!session) return null;

    const therapyType = THERAPY_TYPES.find(t => t.name === session.type);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{therapyType?.icon || '📋'}</span>
                            <div>
                                <h3 className="font-bold text-neutral-800">{session.type}</h3>
                                <p className="text-sm text-neutral-500">
                                    {new Date(session.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">✕</button>
                    </div>

                    {/* Child Info */}
                    {child && (
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg mb-4">
                            <img
                                src={child.photoUrl}
                                alt={child.name}
                                className="w-12 h-12 rounded-full"
                            />
                            <div>
                                <p className="font-medium text-neutral-800">{child.name}</p>
                                <p className="text-sm text-neutral-500">{child.diagnosis}</p>
                            </div>
                        </div>
                    )}

                    {/* Session Details */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-500">Time</span>
                            <span className="font-medium">
                                {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-500">Duration</span>
                            <span className="font-medium">{session.duration} minutes</span>
                        </div>
                        {session.location && (
                            <div className="flex items-center justify-between">
                                <span className="text-neutral-500">Location</span>
                                <span className="font-medium">{session.location}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-neutral-500">Status</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-green-100 text-green-700' :
                                session.status === 'scheduled' ? 'bg-primary-100 text-primary-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-6">
                        {session.status === 'scheduled' && (
                            <>
                                <Button className="flex-1" onClick={() => onStatusChange(session.id, 'start')}>
                                    Start Session
                                </Button>
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                    Cancel
                                </Button>
                            </>
                        )}
                        {session.status === 'completed' && (
                            <Button variant="outline" className="flex-1">
                                View Report
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// New Session Modal
const NewSessionModal = ({ children, onSave, onClose, isLoading }) => {
    const [formData, setFormData] = useState({
        childId: children[0]?.id || '',
        type: THERAPY_TYPES[0].name,
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 45,
        location: ''
    });

    const handleSave = () => {
        // Validation
        if (!formData.childId) {
            alert('Please select a child');
            return;
        }
        if (!formData.date || !formData.time) {
            alert('Please select both date and time');
            return;
        }

        // Combine date and time, ensuring we preserve the local date
        const dateTime = new Date(`${formData.date}T${formData.time}`);

        // Validate date is not in the past
        if (dateTime < new Date()) {
            if (!confirm('This session is scheduled in the past. Continue anyway?')) {
                return;
            }
        }

        onSave({
            ...formData,
            date: dateTime.toISOString(),
            status: 'scheduled'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-neutral-800 mb-6">Schedule New Session</h3>

                    <div className="space-y-4">
                        {/* Child */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Child</label>
                            <select
                                className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                                value={formData.childId}
                                onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                            >
                                {children.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Therapy Type */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Therapy Type</label>
                            <select
                                className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                {THERAPY_TYPES.map(t => (
                                    <option key={t.id} value={t.name}>{t.icon} {t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700">Date</label>
                                <input
                                    type="date"
                                    className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700">Time</label>
                                <input
                                    type="time"
                                    className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Duration (minutes)</label>
                            <select
                                className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            >
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>60 minutes</option>
                                <option value={90}>90 minutes</option>
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Location</label>
                            <input
                                type="text"
                                className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                                placeholder="e.g., Therapy Room A"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <Button className="flex-1" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...</>
                            ) : (
                                'Schedule Session'
                            )}
                        </Button>
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Schedule Component
const ScheduleManagement = () => {
    const { currentUser, kids, sessions, addSession, addNotification } = useApp();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // week or month
    const [showNewSession, setShowNewSession] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Get therapist's data
    const therapistId = currentUser?.id || 't1';
    const myChildren = kids.filter(k => k.therapistId === therapistId);
    const mySessions = sessions.filter(s => s.therapistId === therapistId);

    // Calendar navigation
    const navigateCalendar = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else {
            newDate.setMonth(newDate.getMonth() + direction);
        }
        setCurrentDate(newDate);
    };

    // Get calendar days
    const calendarDays = useMemo(() => {
        const days = [];
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    }, [currentDate]);

    // Get sessions for a specific date
    const getSessionsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return mySessions.filter(s => s.date.startsWith(dateStr));
    };

    // Get selected date sessions
    const selectedDateSessions = getSessionsForDate(selectedDate);

    // Today's stats
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todaySessions = mySessions.filter(s => s.date.startsWith(todayStr));
    const completedToday = todaySessions.filter(s => s.status === 'completed').length;
    const upcomingToday = todaySessions.filter(s => s.status === 'scheduled').length;

    const handleNewSession = async (sessionData) => {
        try {
            // Validate required fields
            if (!sessionData.childId || !sessionData.date || !sessionData.type) {
                addNotification({
                    type: 'error',
                    title: 'Validation Error',
                    message: 'Please fill in all required fields'
                });
                return;
            }

            setIsLoading(true);
            console.log('📡 Scheduling new session to MongoDB...');

            // 1. Persist to MongoDB via existing sessionAPI
            const sessionToAdd = {
                ...sessionData,
                therapistId: therapistId,
                status: 'scheduled'
            };

            const savedSession = await sessionAPI.create(sessionToAdd);
            console.log('✅ Session scheduled in database:', savedSession);

            // 2. Add session to local state using context function
            addSession({
                ...sessionToAdd,
                id: savedSession.id || savedSession._id
            });

            // Close modal
            setShowNewSession(false);

            // Show success notification
            const childName = myChildren.find(p => p.id === sessionData.childId)?.name || 'child';
            addNotification({
                type: 'success',
                title: 'Session Scheduled',
                message: `Session scheduled successfully in MongoDB for ${childName}!`
            });

            // 3. Update UI Focus
            const sessionDate = new Date(sessionData.date);
            setSelectedDate(sessionDate);
            setCurrentDate(sessionDate);
        } catch (error) {
            console.error('❌ Error scheduling session:', error);
            const errorMsg = typeof error === 'object' ? (error.detail || JSON.stringify(error)) : error;
            addNotification({
                type: 'error',
                title: 'Scheduling Failed',
                message: `Database error: ${errorMsg}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => setShowNewSession(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Session
                </Button>
            </div>
            {/* Today's Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                    <CardContent className="p-4">
                        <Calendar className="h-6 w-6 text-primary-200 mb-2" />
                        <p className="text-3xl font-bold">{todaySessions.length}</p>
                        <p className="text-primary-100">Today's Sessions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                        <p className="text-3xl font-bold text-neutral-800">{completedToday}</p>
                        <p className="text-neutral-500">Completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <Clock className="h-6 w-6 text-yellow-500 mb-2" />
                        <p className="text-3xl font-bold text-neutral-800">{upcomingToday}</p>
                        <p className="text-neutral-500">Upcoming</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <Users className="h-6 w-6 text-violet-500 mb-2" />
                        <p className="text-3xl font-bold text-neutral-800">{myChildren.length}</p>
                        <p className="text-neutral-500">Children</p>
                    </CardContent>
                </Card>
            </div>

            {/* Calendar Navigation */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-neutral-500" />
                            {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => navigateCalendar(-1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
                            >
                                Today
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => navigateCalendar(1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 gap-0 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-neutral-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-0">
                        {calendarDays.map((date, idx) => (
                            <CalendarDay
                                key={idx}
                                date={date}
                                sessions={getSessionsForDate(date)}
                                kids={kids}
                                isToday={date.toDateString() === today.toDateString()}
                                isSelected={date.toDateString() === selectedDate.toDateString()}
                                onClick={() => setSelectedDate(date)}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Selected Date Sessions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Sessions for {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedDateSessions.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDateSessions
                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                .map(session => {
                                    const child = kids.find(k => k.id === session.childId);
                                    return (
                                        <TimeSlot
                                            key={session.id}
                                            session={session}
                                            child={child}
                                            onClick={() => setSelectedSession({ session, child })}
                                        />
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-neutral-400">
                            <Calendar className="h-10 w-10 mx-auto mb-2" />
                            <p>No sessions scheduled for this day</p>
                            <Button className="mt-4" size="sm" onClick={() => setShowNewSession(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Session
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            {showNewSession && (
                <NewSessionModal
                    children={myChildren}
                    onSave={handleNewSession}
                    onClose={() => setShowNewSession(false)}
                    isLoading={isLoading}
                />
            )}

            {selectedSession && (
                <SessionDetailModal
                    session={selectedSession.session}
                    child={selectedSession.child}
                    onClose={() => setSelectedSession(null)}
                    onStatusChange={(id, action) => console.log('Status change:', id, action)}
                />
            )}
        </div>
    );
};

export default ScheduleManagement;
