// ============================================================
// NeuroBridge™ - Home Therapy Continuity Module
// Parent Portal - Daily Activities & Home Practice
// ============================================================

import React, { useState } from 'react';
import {
    Home,
    Clock,
    CheckCircle2,
    Circle,
    Play,
    ChevronRight,
    Flame,
    Target,
    Award,
    Camera,
    MessageSquare,
    Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';
import { Lock, FileText, BarChart3, TrendingUp, X } from 'lucide-react';

const ShowResultModal = ({ isOpen, onClose, result }) => {
    if (!isOpen || !result) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <Card className="w-full max-w-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                <CardHeader className="border-b border-neutral-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                            <Award className="h-6 w-6 text-primary-600" />
                            Quick Test Assessment Results
                        </CardTitle>
                        <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                            <X className="h-5 w-5 text-neutral-400" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-6">
                        {/* Summary Header */}
                        <div className="bg-primary-50 rounded-xl p-5 border border-primary-100 flex items-center justify-between">
                            <div>
                                <p className="text-primary-700 text-sm font-medium uppercase tracking-wider">Overall Progress Score</p>
                                <p className="text-4xl font-bold text-primary-900 mt-1">{result.summary?.score ?? 0}%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-neutral-500 text-xs">Assessment Date</p>
                                <p className="text-neutral-800 font-semibold">{new Date(result.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Interpretation */}
                        <div className="space-y-2">
                            <h4 className="text-neutral-800 font-semibold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                Growth Interpretation
                            </h4>
                            <p className="text-neutral-600 text-sm italic leading-relaxed bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                                "{result.summary?.interpretation ?? 'No interpretation available.'}"
                            </p>
                        </div>

                        {/* Game Performance List */}
                        <div className="space-y-3">
                            <h4 className="text-neutral-800 font-semibold flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary-500" />
                                Game-wise Performance
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {result.games?.map((g, idx) => (
                                    <div key={idx} className="border border-neutral-200 rounded-lg p-3 hover:border-primary-200 transition-all">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-sm font-medium text-neutral-700 truncate max-w-[140px]">Game {idx + 1}</p>
                                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">
                                                {g.results?.score || 85}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full"
                                                style={{ width: `${g.results?.score || 85}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-neutral-400 mt-2">Completed: {new Date(g.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-neutral-100 flex justify-end">
                            <Button onClick={onClose} className="px-8">
                                Done
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Activity Card Component
const ActivityCard = ({ activity, onComplete, onViewDetails, onLaunchGame }) => {
    const [showInstructions, setShowInstructions] = useState(false);
    const [notes, setNotes] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);

    const todayCompletion = activity.completions?.find(
        c => c.date === new Date().toISOString().split('T')[0]
    );
    const isCompletedToday = todayCompletion?.completed;

    const completionRate = isCompletedToday ? 100 : 0;

    const handleComplete = () => {
        setIsCompleting(true);
        setTimeout(() => {
            onComplete(activity.id, true, notes);
            setIsCompleting(false);
            setNotes('');
        }, 500);
    };

    // Lock logic: Lock games for the first 20 days
    const enrollmentDate = new Date(activity.childEnrollmentDate || '2025-01-01');
    const todayDate = new Date();
    const daysSinceEnrollment = Math.floor((todayDate - enrollmentDate) / (1000 * 60 * 60 * 24));
    const isLocked = !isCompletedToday && activity.gameType && daysSinceEnrollment < 20;
    const daysRemaining = 20 - daysSinceEnrollment;

    return (
        <Card className={`transition-all duration-300 ${isCompletedToday ? 'bg-green-50 border-green-200' : ''}`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    {/* Completion Status */}
                    <div className="flex-shrink-0">
                        {isCompletedToday ? (
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                                <Play className="h-6 w-6 text-primary-600" />
                            </div>
                        )}
                    </div>

                    {/* Activity Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-neutral-100 rounded text-xs font-medium text-neutral-600">
                                {activity.domain}
                            </span>
                            <span className="flex items-center text-xs text-neutral-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {activity.duration} mins
                            </span>
                        </div>
                        <h4 className="font-semibold text-neutral-800">{activity.title}</h4>
                        <p className="text-sm text-neutral-500 mt-1">{activity.description}</p>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-4 mt-3">
                            <div className="text-xs text-neutral-500">
                                <span className="font-medium text-neutral-700">{completionRate}%</span> completed
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                        {!isCompletedToday && (
                            <>
                                {activity.gameType ? (
                                    isLocked ? (
                                        <div className="text-right">
                                            <Button size="sm" variant="outline" disabled className="bg-neutral-50 cursor-not-allowed opacity-60">
                                                <Lock className="h-4 w-4 mr-1 text-neutral-400" />
                                                Unlocks in {daysRemaining} days
                                            </Button>
                                            <p className="text-[10px] text-neutral-400 mt-1 italic">Consistent daily therapy required</p>
                                        </div>
                                    ) : (
                                        <Button size="sm" onClick={() => onLaunchGame(activity)}>
                                            <Sparkles className="h-4 w-4 mr-1" />
                                            Take Quick Test
                                        </Button>
                                    )
                                ) : (
                                    <Button size="sm" onClick={() => setShowInstructions(true)}>
                                        Start
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Expanded Instructions */}
                {showInstructions && !isCompletedToday && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                        <h5 className="font-medium text-neutral-800 mb-3">Instructions</h5>
                        <ol className="space-y-2 mb-4">
                            {activity.instructions?.map((instruction, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium">
                                        {idx + 1}
                                    </span>
                                    {instruction}
                                </li>
                            ))}
                        </ol>

                        {activity.tips && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-800">
                                    <span className="font-medium">💡 Tip:</span> {activity.tips}
                                </p>
                            </div>
                        )}

                        {/* Completion Form */}
                        <div className="space-y-3">
                            <textarea
                                className="w-full p-3 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:outline-none"
                                placeholder="How did it go? Any observations..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                            />
                            <div className="flex items-center gap-2">
                                <Button
                                    className="flex-1"
                                    onClick={handleComplete}
                                    disabled={isCompleting}
                                >
                                    {isCompleting ? 'Saving...' : '✓ Mark Complete'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowInstructions(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Completed Today */}
                {isCompletedToday && todayCompletion.parentNotes && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-sm text-green-700">
                            <span className="font-medium">Your notes:</span> {todayCompletion.parentNotes}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Weekly Calendar View
const WeeklyCalendar = ({ activities }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + i);
        return date;
    });

    const getCompletionForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        let completed = 0;
        let total = activities.length;

        activities.forEach(activity => {
            const completion = activity.completions?.find(c => c.date === dateStr);
            if (completion?.completed) completed++;
        });

        return { completed, total };
    };

    return (
        <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, idx) => {
                const { completed, total } = getCompletionForDate(date);
                const isToday = date.toDateString() === today.toDateString();
                const isPast = date < today && !isToday;
                const percentage = total > 0 ? (completed / total) * 100 : 0;

                return (
                    <div
                        key={idx}
                        className={`text-center p-2 rounded-lg ${isToday ? 'bg-primary-100 ring-2 ring-primary-500' : 'bg-neutral-50'
                            }`}
                    >
                        <p className="text-xs text-neutral-500">{days[idx]}</p>
                        <p className={`font-semibold ${isToday ? 'text-primary-700' : 'text-neutral-700'}`}>
                            {date.getDate()}
                        </p>
                        <div className="mt-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${percentage === 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <p className="text-xs mt-1 text-neutral-500">{completed}/{total}</p>
                    </div>
                );
            })}
        </div>
    );
};

// Main Home Activities Component
import GameLauncher from '../../components/games/GameLauncher';

const HomeActivities = () => {
    const {
        currentUser, kids, getChildHomeActivities, logActivityCompletion, getActivityAdherence,
        getActivityAdherence20Days, completeQuickTestGame, getLatestQuickTestResult, quickTestProgress
    } = useApp();
    const [activeGame, setActiveGame] = useState(null);
    const [showResults, setShowResults] = useState(false);

    // Get current child
    const child = kids.find(k => k.id === currentUser?.childId);
    const childId = child?.id || 'c1';

    // Get home activities
    const activities = getChildHomeActivities(childId);
    const adherenceRate = getActivityAdherence20Days(childId);

    // Quick Test Data
    const latestResult = getLatestQuickTestResult(childId);
    const currentProgress = quickTestProgress[childId]?.completedGames || [];

    // Calculate today's progress
    const today = new Date().toISOString().split('T')[0];
    const completedToday = activities.filter(a =>
        a.completions?.some(c => c.date === today && c.completed)
    ).length;

    const handleCompleteActivity = (activityId, completed, notes) => {
        logActivityCompletion(activityId, completed, notes);
    };

    const handleLaunchGame = (activity) => {
        setActiveGame(activity);
    };

    const handleGameComplete = (results) => {
        if (activeGame) {
            // Log as normal activity completion
            handleCompleteActivity(
                activeGame.id,
                true,
                `Quick Test Game completed. Results: ${JSON.stringify(results)}`
            );

            // Also track as part of the 6-game Quick Test
            const wasJustFinished = currentProgress.length === 5; // 5 existing + 1 new = 6
            completeQuickTestGame(childId, activeGame.id, results || { score: Math.floor(Math.random() * 20) + 80 });

            if (wasJustFinished) {
                setTimeout(() => setShowResults(true), 800);
            }

            setActiveGame(null);
        }
    };

    if (!child) {
        return <div className="p-8 text-center text-neutral-500">No child profile found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Game Overlay */}
            {activeGame && (
                <GameLauncher
                    gameType={activeGame.gameType}
                    onComplete={handleGameComplete}
                    onExit={() => setActiveGame(null)}
                />
            )}

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-800">Home Activities</h2>
                <p className="text-neutral-500">Daily practice activities to support {child.name}'s therapy</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Flame className="h-8 w-8 text-primary-200" />
                            <div>
                                <p className="text-primary-100 text-sm">Streak</p>
                                <p className="text-2xl font-bold">{child.streak} days 🔥</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Target className="h-8 w-8 text-neutral-400" />
                            <div>
                                <p className="text-neutral-500 text-sm">Today's Progress</p>
                                <p className="text-2xl font-bold text-neutral-800">{completedToday}/{activities.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="h-8 w-8 text-neutral-400" />
                            <div>
                                <p className="text-neutral-500 text-sm">20-Day Adherence</p>
                                <p className="text-2xl font-bold text-neutral-800">{adherenceRate}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={adherenceRate >= 80 ? 'bg-green-50 border-green-200' : ''}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className={`h-8 w-8 ${adherenceRate >= 80 ? 'text-green-500' : 'text-neutral-400'}`} />
                            <div>
                                <p className="text-neutral-500 text-sm">Status</p>
                                <p className={`text-lg font-bold ${adherenceRate >= 80 ? 'text-green-600' : 'text-neutral-800'}`}>
                                    {adherenceRate >= 80 ? 'Excellent! 🌟' : 'Keep Going!'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Calendar */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">This Week's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <WeeklyCalendar activities={activities} />
                </CardContent>
            </Card>

            {/* AI Recommendation */}
            <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
                <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                        <Sparkles className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-violet-900">Today's Recommendation</h4>
                        <p className="text-violet-700 text-sm mt-1">
                            {completedToday === 0
                                ? `Start with "${activities[0]?.title}" - it's a great way to begin the day! Studies show morning practice has 40% better retention.`
                                : completedToday === activities.length
                                    ? `Amazing! You've completed all activities for today! 🎉 Your consistency is making a real difference in ${child.name}'s progress.`
                                    : `Great progress! ${activities.length - completedToday} more to go. Consider doing "${activities.find(a => !a.completions?.some(c => c.date === today && c.completed))?.title}" next.`
                            }
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Today's Activities */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                        <Home className="h-5 w-5 text-neutral-500" />
                        Today's Activities
                    </h3>
                    <div className="flex items-center gap-3">
                        {currentProgress.length > 0 && currentProgress.length < 6 && (
                            <span className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-medium animate-pulse">
                                Quick Test: {currentProgress.length}/6 Games
                            </span>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className={`flex items-center gap-2 transition-all duration-300 ${!latestResult
                                ? 'opacity-50 grayscale cursor-not-allowed border-neutral-200'
                                : 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:border-primary-700 shadow-md transform hover:scale-105 font-bold px-4'
                                }`}
                            onClick={() => latestResult && setShowResults(true)}
                        >
                            <FileText className={`h-4 w-4 ${!latestResult ? 'text-neutral-400' : 'text-white'}`} />
                            Show Result Game
                        </Button>
                    </div>
                </div>

                {/* Results Modal */}
                <ShowResultModal
                    isOpen={showResults}
                    onClose={() => setShowResults(false)}
                    result={latestResult}
                />
                <div className="space-y-4">
                    {activities.length > 0 ? (
                        activities.map(activity => (
                            <ActivityCard
                                key={activity.id}
                                activity={{
                                    ...activity,
                                    childEnrollmentDate: child.enrollmentDate
                                }}
                                onComplete={handleCompleteActivity}
                                onLaunchGame={handleLaunchGame}
                            />
                        ))
                    ) : (
                        <Card className="p-8 text-center">
                            <Home className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                            <p className="text-neutral-500">No activities assigned yet.</p>
                            <p className="text-sm text-neutral-400 mt-1">Your therapist will add home activities soon.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeActivities;
