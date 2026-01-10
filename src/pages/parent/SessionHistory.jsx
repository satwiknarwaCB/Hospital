// ============================================================
// NeuroBridge™ - Session History Module
// Parent Portal - View Past Therapy Sessions
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    History,
    Calendar,
    Clock,
    Filter,
    ChevronDown,
    ChevronUp,
    Search,
    Sparkles,
    Activity,
    Download,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// Engagement Indicator
const EngagementIndicator = ({ value }) => {
    const getColor = (val) => {
        if (val >= 80) return 'bg-green-500';
        if (val >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getColor(value)} rounded-full transition-all`}
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="text-sm font-medium text-neutral-700">{value}%</span>
        </div>
    );
};

// Emotional State Badge
const EmotionalStateBadge = ({ state }) => {
    const config = {
        'Regulated': { color: 'bg-green-100 text-green-700', emoji: '😊' },
        'Neutral': { color: 'bg-yellow-100 text-yellow-700', emoji: '😐' },
        'Dysregulated': { color: 'bg-red-100 text-red-700', emoji: '😔' }
    };

    const { color, emoji } = config[state] || config['Neutral'];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {emoji} {state}
        </span>
    );
};

// Session Card Component
const SessionCard = ({ session, childName, isExpanded, onToggle }) => {
    const sessionDate = new Date(session.date);
    const isToday = sessionDate.toDateString() === new Date().toDateString();

    return (
        <Card className={`transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary-200' : ''}`}>
            <div
                className="p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Date Badge */}
                        <div className={`text-center p-2 rounded-lg min-w-[60px] ${isToday ? 'bg-primary-100' : 'bg-neutral-100'}`}>
                            <p className="text-xs text-neutral-500">
                                {sessionDate.toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                            <p className={`text-lg font-bold ${isToday ? 'text-primary-600' : 'text-neutral-700'}`}>
                                {sessionDate.getDate()}
                            </p>
                            <p className="text-xs text-neutral-500">
                                {sessionDate.toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                        </div>

                        {/* Session Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-neutral-800">{session.type}</h4>
                                {isToday && (
                                    <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                                        Today
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {session.duration} mins
                                </span>
                                <span>•</span>
                                <span>{sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {session.engagement && <EngagementIndicator value={session.engagement} />}
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-neutral-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-neutral-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <CardContent className="pt-0 border-t border-neutral-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Activities */}
                            {session.activities && (
                                <div>
                                    <h5 className="text-sm font-medium text-neutral-700 mb-2">Activities</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {session.activities.map((activity, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-neutral-100 rounded-full text-sm text-neutral-700"
                                            >
                                                {activity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Wins */}
                            {session.wins && (
                                <div>
                                    <h5 className="text-sm font-medium text-neutral-700 mb-2">Today's Wins 🏆</h5>
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

                            {/* Emotional State */}
                            {session.emotionalState && (
                                <div>
                                    <h5 className="text-sm font-medium text-neutral-700 mb-2">Emotional State</h5>
                                    <EmotionalStateBadge state={session.emotionalState} />
                                </div>
                            )}
                        </div>

                        {/* Right Column - AI Summary */}
                        <div>
                            {session.aiSummary && (
                                <div className="bg-violet-50 rounded-xl p-4 h-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-4 w-4 text-violet-600" />
                                        <h5 className="font-medium text-violet-900">Session Summary</h5>
                                    </div>
                                    <p className="text-sm text-violet-700 leading-relaxed">
                                        {session.aiSummary}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clinical Notes (if available) */}
                    {session.notes && (
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                            <h5 className="text-sm font-medium text-neutral-700 mb-2">Therapist Notes</h5>
                            <p className="text-sm text-neutral-600 italic">"{session.notes}"</p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
};

// Filter Modal
const FilterModal = ({ isOpen, onClose, filters, onApply }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Filter Sessions</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Therapy Type */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700">Therapy Type</label>
                        <select
                            className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                            value={localFilters.type}
                            onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
                        >
                            <option value="all">All Types</option>
                            <option value="Speech Therapy">Speech Therapy</option>
                            <option value="Occupational Therapy">Occupational Therapy</option>
                            <option value="ABA Therapy">ABA Therapy</option>
                        </select>
                    </div>

                    {/* Engagement */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700">Engagement Level</label>
                        <select
                            className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                            value={localFilters.engagement}
                            onChange={(e) => setLocalFilters({ ...localFilters, engagement: e.target.value })}
                        >
                            <option value="all">All Levels</option>
                            <option value="high">High (80%+)</option>
                            <option value="medium">Medium (60-79%)</option>
                            <option value="low">Low (&lt;60%)</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700">Date Range</label>
                        <select
                            className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                            value={localFilters.dateRange}
                            onChange={(e) => setLocalFilters({ ...localFilters, dateRange: e.target.value })}
                        >
                            <option value="all">All Time</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <Button
                        className="flex-1"
                        onClick={() => {
                            onApply(localFilters);
                            onClose();
                        }}
                    >
                        Apply Filters
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setLocalFilters({ type: 'all', engagement: 'all', dateRange: 'all' });
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Main Session History Component
const SessionHistory = () => {
    const { currentUser, kids, getChildSessions } = useApp();
    const location = useLocation();
    const [expandedSession, setExpandedSession] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type: 'all',
        engagement: 'all',
        dateRange: 'all'
    });

    // Get current child
    const child = kids.find(k => k.id === currentUser?.childId);
    const childId = child?.id || 'c1';

    // Get all sessions
    const allSessions = getChildSessions(childId);

    // Handle navigation state - expand session if sessionId is provided
    useEffect(() => {
        if (location.state?.sessionId) {
            const session = allSessions.find(s => s.id === location.state.sessionId);
            if (session) {
                setExpandedSession(session.id);
                // Scroll to session after a brief delay
                setTimeout(() => {
                    const element = document.getElementById(`session-${session.id}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        }
    }, [location.state, allSessions]);

    // Apply filters
    const filteredSessions = useMemo(() => {
        return allSessions.filter(session => {
            // Status filter - only completed
            if (session.status !== 'completed') return false;

            // Type filter
            if (filters.type !== 'all' && session.type !== filters.type) return false;

            // Engagement filter
            if (filters.engagement !== 'all') {
                const eng = session.engagement || 0;
                if (filters.engagement === 'high' && eng < 80) return false;
                if (filters.engagement === 'medium' && (eng < 60 || eng >= 80)) return false;
                if (filters.engagement === 'low' && eng >= 60) return false;
            }

            // Date range filter
            if (filters.dateRange !== 'all') {
                const sessionDate = new Date(session.date);
                const now = new Date();
                if (filters.dateRange === 'week') {
                    const weekAgo = new Date(now.setDate(now.getDate() - 7));
                    if (sessionDate < weekAgo) return false;
                }
                if (filters.dateRange === 'month') {
                    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                    if (sessionDate < monthAgo) return false;
                }
                if (filters.dateRange === 'quarter') {
                    const quarterAgo = new Date(now.setMonth(now.getMonth() - 3));
                    if (sessionDate < quarterAgo) return false;
                }
            }

            // Search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    session.type?.toLowerCase().includes(query) ||
                    session.notes?.toLowerCase().includes(query) ||
                    session.activities?.some(a => a.toLowerCase().includes(query))
                );
            }

            return true;
        });
    }, [allSessions, filters, searchQuery]);

    // Calculate stats
    const stats = useMemo(() => {
        const completed = filteredSessions.filter(s => s.status === 'completed');
        return {
            totalSessions: completed.length,
            avgEngagement: completed.length > 0
                ? Math.round(completed.reduce((a, b) => a + (b.engagement || 0), 0) / completed.length)
                : 0,
            totalHours: Math.round(completed.reduce((a, b) => a + (b.duration || 0), 0) / 60)
        };
    }, [filteredSessions]);

    if (!child) {
        return <div className="p-8 text-center text-neutral-500">No child profile found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Session History</h2>
                    <p className="text-neutral-500">View all past therapy sessions for {child.name}</p>
                </div>
                <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <Activity className="h-6 w-6 text-primary-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-neutral-800">{stats.totalSessions}</p>
                        <p className="text-sm text-neutral-500">Total Sessions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Activity className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-neutral-800">{stats.avgEngagement}%</p>
                        <p className="text-sm text-neutral-500">Avg Engagement</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 text-violet-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-neutral-800">{stats.totalHours}</p>
                        <p className="text-sm text-neutral-500">Total Hours</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(true)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {(filters.type !== 'all' || filters.engagement !== 'all' || filters.dateRange !== 'all') && (
                        <span className="ml-2 h-5 w-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                            !
                        </span>
                    )}
                </Button>
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
                {filteredSessions.length > 0 ? (
                    filteredSessions.map(session => (
                        <div key={session.id} id={`session-${session.id}`}>
                            <SessionCard
                                session={session}
                                childName={child.name}
                                isExpanded={expandedSession === session.id}
                                onToggle={() => setExpandedSession(
                                    expandedSession === session.id ? null : session.id
                                )}
                            />
                        </div>
                    ))
                ) : (
                    <Card className="p-8 text-center">
                        <History className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-500">No sessions found.</p>
                        <p className="text-sm text-neutral-400 mt-1">Try adjusting your filters or search query.</p>
                    </Card>
                )}
            </div>

            {/* Filter Modal */}
            <FilterModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onApply={setFilters}
            />
        </div>
    );
};

export default SessionHistory;
