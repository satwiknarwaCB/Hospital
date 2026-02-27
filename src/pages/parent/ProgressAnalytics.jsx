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
import ChildProgressTracking from './ChildProgressTracking';

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
        if (score >= 40) return 'yellow';
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
    const { currentUser, kids } = useApp();
    const [activeView, setActiveView] = useState('daily'); // 'daily' or 'actual'

    // Get current child
    const child = kids.find(k => k.id === currentUser?.childId);
    const childId = child?.id || 'c1';

    if (!child) {
        return <div className="p-8 text-center text-neutral-500">No child profile found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">New Learning</h2>
                    <p className="text-neutral-500">Track {child.name}'s development across key skill areas</p>
                </div>
            </div>

            {/* View Selection Buttons */}
            <div className="flex items-center gap-4 p-1 bg-neutral-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveView('daily')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === 'daily'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                >
                    Progress Tracking
                </button>
                <button
                    onClick={() => setActiveView('actual')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === 'actual'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                >
                    Actual Progress (Planned vs Achieved)
                </button>
            </div>

            {activeView === 'daily' ? (
                <ChildProgressTracking role="parent" />
            ) : (
                <ActualProgress childId={childId} role="parent" />
            )}
        </div>
    );
};

export default ProgressAnalytics;
