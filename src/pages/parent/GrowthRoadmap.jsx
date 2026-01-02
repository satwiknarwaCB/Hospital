// ============================================================
// NeuroBridge™ - Predictive Growth Roadmap
// Parent Portal - Milestone Tracking & AI Predictions
// ============================================================

import React, { useState } from 'react';
import {
    Target,
    CheckCircle2,
    Circle,
    Clock,
    AlertTriangle,
    ChevronRight,
    Sparkles,
    Calendar,
    TrendingUp,
    Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// Progress Ring Component
const ProgressRing = ({ progress, size = 60, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    const getColor = (progress) => {
        if (progress >= 80) return '#10B981';
        if (progress >= 50) return '#F59E0B';
        return '#EF4444';
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-neutral-100"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="transition-all duration-500"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke={getColor(progress)}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-neutral-700">{progress}%</span>
            </div>
        </div>
    );
};

// Confidence Badge Component
const ConfidenceBadge = ({ confidence }) => {
    const config = {
        high: { color: 'bg-green-100 text-green-700', label: 'High Confidence' },
        medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium Confidence' },
        low: { color: 'bg-red-100 text-red-700', label: 'Low Confidence' }
    };

    const level = confidence >= 75 ? 'high' : confidence >= 50 ? 'medium' : 'low';
    const { color, label } = config[level];

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {label} ({confidence}%)
        </span>
    );
};

// Milestone Item Component
const MilestoneItem = ({ milestone, isLast }) => {
    return (
        <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
                {milestone.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                    <Circle className="h-5 w-5 text-neutral-300" />
                )}
                {!isLast && (
                    <div className={`w-0.5 h-8 mt-1 ${milestone.completed ? 'bg-green-200' : 'bg-neutral-200'}`} />
                )}
            </div>
            <div className="flex-1 pb-4">
                <p className={`text-sm font-medium ${milestone.completed ? 'text-neutral-800' : 'text-neutral-500'}`}>
                    {milestone.title}
                </p>
                {milestone.date && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                        {milestone.completed ? 'Completed' : 'Target'}: {new Date(milestone.date).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
};

// Goal Card Component
const GoalCard = ({ goal, isExpanded, onToggle }) => {
    const statusConfig = {
        'completed': { color: 'border-l-green-500', badge: 'bg-green-100 text-green-700', icon: CheckCircle2 },
        'in-progress': { color: 'border-l-primary-500', badge: 'bg-primary-100 text-primary-700', icon: Target },
        'at-risk': { color: 'border-l-red-500', badge: 'bg-red-100 text-red-700', icon: AlertTriangle },
        'upcoming': { color: 'border-l-neutral-300', badge: 'bg-neutral-100 text-neutral-700', icon: Clock }
    };

    const { color, badge, icon: StatusIcon } = statusConfig[goal.status] || statusConfig['in-progress'];

    const daysRemaining = Math.ceil(
        (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
        <Card className={`border-l-4 ${color} transition-all duration-300 hover:shadow-md`}>
            <div
                className="p-4 cursor-pointer"
                onClick={onToggle}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge}`}>
                                <StatusIcon className="h-3 w-3" />
                                {goal.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-xs text-neutral-400">•</span>
                            <span className="text-xs text-neutral-500">{goal.domain}</span>
                        </div>
                        <h4 className="font-semibold text-neutral-800">{goal.title}</h4>
                        <p className="text-sm text-neutral-500 mt-1">{goal.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ProgressRing progress={goal.progress} />
                        <ChevronRight className={`h-5 w-5 text-neutral-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                </div>

                {/* Timeline Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                        <span>Progress</span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Past due'}
                        </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${goal.status === 'completed' ? 'bg-green-500' :
                                    goal.status === 'at-risk' ? 'bg-red-500' : 'bg-primary-500'
                                }`}
                            style={{ width: `${goal.progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <CardContent className="pt-0 border-t border-neutral-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* Milestones */}
                        <div>
                            <h5 className="font-medium text-neutral-700 mb-3">Milestones</h5>
                            <div className="space-y-0">
                                {goal.milestones?.map((milestone, idx) => (
                                    <MilestoneItem
                                        key={milestone.id}
                                        milestone={milestone}
                                        isLast={idx === goal.milestones.length - 1}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* AI Prediction */}
                        <div className="space-y-4">
                            <div className="bg-violet-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-4 w-4 text-violet-600" />
                                    <h5 className="font-medium text-violet-900">AI Prediction</h5>
                                </div>
                                <ConfidenceBadge confidence={goal.confidence || 70} />
                                <p className="text-sm text-violet-700 mt-2">
                                    {goal.aiPrediction || `Based on current progress, this goal is likely to be achieved ${goal.progress >= 60 ? 'on schedule' : 'with additional focus'}.`}
                                </p>
                            </div>

                            {goal.therapistNotes && (
                                <div className="bg-neutral-50 rounded-xl p-4">
                                    <h5 className="font-medium text-neutral-700 mb-2">Therapist Notes</h5>
                                    <p className="text-sm text-neutral-600">{goal.therapistNotes}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <Lock className="h-3 w-3" />
                                <span>Therapist-validated goal</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

// Main Roadmap Component
const GrowthRoadmap = () => {
    const { currentUser, kids, getChildRoadmap } = useApp();
    const [expandedGoal, setExpandedGoal] = useState(null);
    const [viewMode, setViewMode] = useState('3-month'); // 3-month or 6-month
    const [filterDomain, setFilterDomain] = useState('all');

    // Get current child
    const child = kids.find(k => k.id === currentUser?.childId);
    const childId = child?.id || 'c1';

    // Get roadmap data
    const roadmapData = getChildRoadmap(childId);

    // Filter by domain
    const filteredRoadmap = filterDomain === 'all'
        ? roadmapData
        : roadmapData.filter(r => r.domain === filterDomain);

    // Get unique domains
    const domains = [...new Set(roadmapData.map(r => r.domain))];

    // Calculate summary stats
    const stats = {
        total: roadmapData.length,
        completed: roadmapData.filter(r => r.status === 'completed').length,
        inProgress: roadmapData.filter(r => r.status === 'in-progress').length,
        atRisk: roadmapData.filter(r => r.status === 'at-risk').length
    };

    if (!child) {
        return <div className="p-8 text-center text-neutral-500">No child profile found.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Growth Roadmap</h2>
                    <p className="text-neutral-500">Predictive milestones and therapy goals for {child.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === '3-month' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('3-month')}
                    >
                        <Calendar className="h-4 w-4 mr-1" />
                        3 Months
                    </Button>
                    <Button
                        variant={viewMode === '6-month' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('6-month')}
                    >
                        <Calendar className="h-4 w-4 mr-1" />
                        6 Months
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
                        <p className="text-sm text-neutral-500">Total Goals</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                        <p className="text-sm text-green-700">Completed</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary-50 border-primary-200">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary-600">{stats.inProgress}</p>
                        <p className="text-sm text-primary-700">In Progress</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-red-600">{stats.atRisk}</p>
                        <p className="text-sm text-red-700">Needs Attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Overview */}
            <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">AI Growth Prediction</h3>
                            <p className="text-violet-100">
                                Based on {child.name}'s current progress trajectory, we predict strong advancement
                                in Communication skills over the next {viewMode}. The therapy plan is optimized
                                for maximum growth with {stats.atRisk === 0 ? 'all goals on track' : `${stats.atRisk} goal(s) needing extra focus`}.
                            </p>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="text-sm">
                                    <span className="text-violet-200">School Readiness Score:</span>
                                    <span className="ml-2 font-bold">{child.schoolReadinessScore}%</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-violet-200">Projected in 3 months:</span>
                                    <span className="ml-2 font-bold">{Math.min(100, child.schoolReadinessScore + 12)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Domain Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-sm text-neutral-500 whitespace-nowrap">Filter by:</span>
                <Button
                    variant={filterDomain === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterDomain('all')}
                >
                    All
                </Button>
                {domains.map(domain => (
                    <Button
                        key={domain}
                        variant={filterDomain === domain ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilterDomain(domain)}
                    >
                        {domain}
                    </Button>
                ))}
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                {filteredRoadmap.length > 0 ? (
                    filteredRoadmap.map(goal => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            isExpanded={expandedGoal === goal.id}
                            onToggle={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                        />
                    ))
                ) : (
                    <Card className="p-8 text-center">
                        <Target className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-500">No goals found for this filter.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default GrowthRoadmap;
