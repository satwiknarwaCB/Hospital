// ============================================================
// NeuroBridge™ - Progress Analytics Module
// Parent Portal - Skill-wise Progress Tracking
// ============================================================

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Info, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';
import ActualProgress from '../../components/ActualProgress';

// Simple Progress Bar Component
const ProgressBar = ({ value, max = 100, color = 'primary', showLabel = true }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const colorClasses = {
        primary: 'bg-primary-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        purple: 'bg-purple-500'
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-sm font-semibold text-neutral-700 w-12 text-right">{value}%</span>
            )}
        </div>
    );
};

// Trend Indicator Component
const TrendIndicator = ({ trend }) => {
    const config = {
        improving: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50', label: 'Improving' },
        stable: { icon: Minus, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Stable' },
        attention: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50', label: 'Needs Attention' }
    };

    const { icon: Icon, color, bg, label } = config[trend] || config.stable;

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${bg}`}>
            <Icon className={`h-3 w-3 ${color}`} />
            <span className={`text-xs font-medium ${color}`}>{label}</span>
        </div>
    );
};

// Simple Line Chart Component
const MiniChart = ({ data, color = '#4F46E5' }) => {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 80 - 10;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 50" className="w-full h-12">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {data.map((value, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((value - min) / range) * 80 - 10;
                return (
                    <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="3"
                        fill={color}
                    />
                );
            })}
        </svg>
    );
};

// Skill Domain Card
const SkillDomainCard = ({ domain, currentScore, trend, weeklyChange, historicalData, isExpanded, onToggle }) => {
    const getColor = (score) => {
        if (score >= 70) return 'green';
        if (score >= 50) return 'yellow';
        return 'red';
    };

    const chartColor = {
        improving: '#10B981',
        stable: '#F59E0B',
        attention: '#EF4444'
    }[trend] || '#4F46E5';

    return (
        <Card className={`transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary-200' : ''}`}>
            <div
                className="p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-neutral-800">{domain}</h4>
                        <TrendIndicator trend={trend} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-neutral-800">{currentScore}%</span>
                        {weeklyChange !== 0 && (
                            <span className={`text-sm font-medium ${weeklyChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {weeklyChange > 0 ? '+' : ''}{weeklyChange}
                            </span>
                        )}
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-neutral-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-neutral-400" />
                        )}
                    </div>
                </div>

                <ProgressBar value={currentScore} color={getColor(currentScore)} />
            </div>

            {isExpanded && (
                <CardContent className="pt-0 border-t border-neutral-100">
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p className="text-sm text-neutral-500 mb-2">4-Week Trend</p>
                            <MiniChart data={historicalData} color={chartColor} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">This Week</span>
                                <span className="font-medium">{currentScore}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Last Week</span>
                                <span className="font-medium">{currentScore - weeklyChange}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Monthly Avg</span>
                                <span className="font-medium">
                                    {historicalData ? Math.round(historicalData.reduce((a, b) => a + b, 0) / historicalData.length) : currentScore}%
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

// Main Progress Analytics Component
const ProgressAnalytics = () => {
    const { currentUser, kids, getLatestSkillScores, getSkillHistory } = useApp();
    const [expandedDomain, setExpandedDomain] = useState(null);
    const [timeRange, setTimeRange] = useState('month');
    const [activeView, setActiveView] = useState('analytics'); // 'analytics' or 'actual'

    // Get current child
    const child = kids.find(k => k.id === currentUser?.childId);
    const childId = child?.id || 'c1';

    // Get skill scores
    const latestScores = getLatestSkillScores(childId);

    // Filter skill history based on time range
    const getFilteredHistory = (history, range) => {
        if (!history || history.length === 0) return [];

        const now = new Date();
        let cutoffDate = new Date();

        switch (range) {
            case 'week':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                cutoffDate.setMonth(now.getMonth() - 3);
                break;
            default:
                return history;
        }

        return history.filter(h => new Date(h.date) >= cutoffDate);
    };

    // Process skill data with history filtered by time range
    const skillData = useMemo(() => {
        return latestScores.map(score => {
            const allHistory = getSkillHistory(childId, score.domain);
            const filteredHistory = getFilteredHistory(allHistory, timeRange);
            const historicalData = filteredHistory.map(h => h.score);

            // Calculate change based on filtered data
            const weeklyChange = filteredHistory.length >= 2
                ? filteredHistory[filteredHistory.length - 1].score - filteredHistory[filteredHistory.length - 2].score
                : allHistory.length >= 2
                    ? allHistory[allHistory.length - 1].score - allHistory[allHistory.length - 2].score
                    : 0;

            return {
                ...score,
                weeklyChange,
                historicalData: historicalData.length > 0 ? historicalData : [score.score],
                filteredHistory
            };
        });
    }, [latestScores, childId, getSkillHistory, timeRange]);

    // Calculate overall stats
    const overallStats = useMemo(() => {
        if (skillData.length === 0) return { average: 0, improving: 0, stable: 0, attention: 0 };

        return {
            average: Math.round(skillData.reduce((a, b) => a + b.score, 0) / skillData.length),
            improving: skillData.filter(s => s.trend === 'improving').length,
            stable: skillData.filter(s => s.trend === 'stable').length,
            attention: skillData.filter(s => s.trend === 'attention').length
        };
    }, [skillData]);

    if (!child) {
        return <div className="p-8 text-center text-neutral-500">No child profile found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Progress Analytics</h2>
                    <p className="text-neutral-500">Track {child.name}'s development across key skill areas</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={timeRange === 'week' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('week')}
                    >
                        Week
                    </Button>
                    <Button
                        variant={timeRange === 'month' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('month')}
                    >
                        Month
                    </Button>
                    <Button
                        variant={timeRange === 'quarter' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange('quarter')}
                    >
                        Quarter
                    </Button>
                </div>
            </div>

            {/* View Selection Buttons */}
            <div className="flex items-center gap-4 p-1 bg-neutral-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveView('analytics')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === 'analytics'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                >
                    1️⃣ Progress Analytics
                </button>
                <button
                    onClick={() => setActiveView('actual')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === 'actual'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                >
                    2️⃣ Actual Progress
                </button>
            </div>

            {activeView === 'analytics' ? (
                <>
                    {/* Overall Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                            <CardContent className="p-4">
                                <p className="text-primary-100 text-sm">Overall Score</p>
                                <p className="text-3xl font-bold mt-1">{overallStats.average}%</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-4">
                                <p className="text-neutral-500 text-sm">Improving</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{overallStats.improving} areas</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-yellow-500">
                            <CardContent className="p-4">
                                <p className="text-neutral-500 text-sm">Stable</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">{overallStats.stable} areas</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-red-500">
                            <CardContent className="p-4">
                                <p className="text-neutral-500 text-sm">Needs Focus</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{overallStats.attention} areas</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Insight */}
                    <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <Info className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-violet-900">AI Insight</h4>
                                <p className="text-violet-700 text-sm mt-1">
                                    {overallStats.improving >= 3
                                        ? `Great progress this ${timeRange}! ${child.name} is showing improvement in ${overallStats.improving} skill areas. Keep up the excellent work with home practice!`
                                        : overallStats.attention >= 2
                                            ? `${child.name} may benefit from extra focus on a few areas this ${timeRange}. The therapy team will address these in upcoming sessions.`
                                            : `${child.name} is making steady progress across most skill areas. Consistency in therapy and home activities is key!`
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skill Domains */}
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-neutral-500" />
                            Skill Development by Domain
                        </h3>
                        <div className="space-y-3">
                            {skillData.map((skill) => (
                                <SkillDomainCard
                                    key={skill.id}
                                    domain={skill.domain}
                                    currentScore={skill.score}
                                    trend={skill.trend}
                                    weeklyChange={skill.weeklyChange}
                                    historicalData={skill.historicalData}
                                    isExpanded={expandedDomain === skill.domain}
                                    onToggle={() => setExpandedDomain(
                                        expandedDomain === skill.domain ? null : skill.domain
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <Card className="bg-neutral-50">
                        <CardContent className="p-4">
                            <h4 className="font-medium text-neutral-700 mb-3">Understanding the Scores</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-neutral-600">70-100%: On track for age</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <span className="text-neutral-600">50-69%: Developing well</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-neutral-600">0-49%: Focus area</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <ActualProgress childId={childId} role="parent" />
            )}
        </div>
    );
};

export default ProgressAnalytics;
