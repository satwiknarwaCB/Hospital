// ============================================================
// NeuroBridge™ - Clinical Intelligence Dashboard
// Therapist Console - AI-Powered Analytics & Insights
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Lightbulb,
    Activity,
    Target,
    BarChart3,
    Sparkles,
    ChevronRight,
    RefreshCw,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';
import { generateTherapyIntelligence, detectAnomalies } from '../../lib/aiService';

// Heatmap Cell Component
const HeatmapCell = ({ value, max = 100 }) => {
    const intensity = value / max;
    const getColor = () => {
        if (intensity >= 0.8) return 'bg-green-500';
        if (intensity >= 0.6) return 'bg-green-300';
        if (intensity >= 0.4) return 'bg-yellow-300';
        if (intensity >= 0.2) return 'bg-orange-300';
        return 'bg-red-300';
    };

    return (
        <div
            className={`w-8 h-8 rounded ${getColor()} flex items-center justify-center text-xs font-medium text-white`}
            title={`${value}%`}
        >
            {value}
        </div>
    );
};

// Alert Card Component
const AlertCard = ({ alert, type }) => {
    const config = {
        plateau: { icon: Activity, color: 'border-l-yellow-500', bg: 'bg-yellow-50' },
        regression: { icon: TrendingDown, color: 'border-l-red-500', bg: 'bg-red-50' },
        success: { icon: TrendingUp, color: 'border-l-green-500', bg: 'bg-green-50' }
    };

    const { icon: Icon, color, bg } = config[type] || config.plateau;

    return (
        <Card className={`border-l-4 ${color} ${bg}`}>
            <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Icon className={`h-5 w-5 ${type === 'regression' ? 'text-red-500' :
                        type === 'success' ? 'text-green-500' : 'text-yellow-500'
                        }`} />
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-neutral-800">{alert.title || alert.domain}</h4>
                    <p className="text-sm text-neutral-600 mt-1">
                        {alert.message || alert.recommendation}
                    </p>
                </div>
                <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
};

// Insight Card Component
const InsightCard = ({ insight }) => {
    return (
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
            <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                    <p className="text-sm text-violet-800">{insight.insight}</p>
                    <p className="text-xs text-violet-600 mt-1">{insight.applicability}</p>
                </div>
            </CardContent>
        </Card>
    );
};

// Activity Effectiveness Chart
const ActivityEffectivenessChart = ({ activities }) => {
    const maxEngagement = Math.max(...activities.map(a => a.avgEngagement));

    return (
        <div className="space-y-3">
            {activities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    <span className="w-32 text-sm text-neutral-600 truncate">{activity.activity}</span>
                    <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden relative">
                        <div
                            className={`h-full rounded-full transition-all ${activity.avgEngagement >= 80 ? 'bg-green-500' :
                                activity.avgEngagement >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${(activity.avgEngagement / maxEngagement) * 100}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-neutral-700">
                            {activity.avgEngagement}% avg engagement
                        </span>
                    </div>
                    <span className="w-12 text-xs text-neutral-500">{activity.frequency}x</span>
                </div>
            ))}
        </div>
    );
};

// Child Skill Heatmap
const ChildSkillHeatmap = ({ children, getLatestSkillScores }) => {
    const domains = ['Language - Receptive', 'Language - Expressive', 'Social Interaction', 'Emotional Regulation'];

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="text-left text-sm font-medium text-neutral-500 pb-2">Patient</th>
                        {domains.map(domain => (
                            <th key={domain} className="text-center text-xs font-medium text-neutral-500 pb-2 px-1">
                                {domain.split(' - ')[0].substring(0, 4)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {children.map(child => {
                        const scores = getLatestSkillScores(child.id);
                        return (
                            <tr key={child.id} className="border-t border-neutral-100">
                                <td className="py-2">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={child.photoUrl}
                                            alt={child.name}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span className="text-sm font-medium text-neutral-700">{child.name.split(' ')[0]}</span>
                                    </div>
                                </td>
                                {domains.map(domain => {
                                    const score = scores.find(s => s.domain === domain);
                                    return (
                                        <td key={domain} className="py-2 px-1 text-center">
                                            {score ? <HeatmapCell value={score.score} /> : <span className="text-xs text-neutral-400">-</span>}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// Main Therapy Intelligence Component
const TherapyIntelligence = () => {
    const { currentUser, kids, sessions, getChildSessions, getLatestSkillScores, skillScores } = useApp();
    const [intelligence, setIntelligence] = useState(null);
    const [anomalies, setAnomalies] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Get therapist's patients
    const therapistId = currentUser?.id || 't1';
    const myPatients = kids.filter(k => k.therapistId === therapistId);

    // Load AI intelligence
    useEffect(() => {
        const loadIntelligence = async () => {
            setIsLoading(true);
            try {
                // Get intelligence for first patient or aggregate
                const allSessions = sessions.filter(s => s.therapistId === therapistId);
                const result = await generateTherapyIntelligence('all', allSessions, skillScores);
                setIntelligence(result);

                // Check for anomalies in each patient
                const anomalyResults = {};
                for (const patient of myPatients) {
                    const patientSessions = getChildSessions(patient.id);
                    const result = await detectAnomalies(patient.id, patientSessions);
                    if (result.anomalies.length > 0) {
                        anomalyResults[patient.id] = result;
                    }
                }
                setAnomalies(anomalyResults);
            } catch (error) {
                console.error('Failed to load intelligence:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadIntelligence();
    }, [therapistId, sessions, skillScores, kids]);

    // Calculate overall stats
    const overallStats = useMemo(() => {
        let totalPlateaus = 0;
        let totalRegressions = 0;
        let totalImprovements = 0;

        myPatients.forEach(patient => {
            const scores = getLatestSkillScores(patient.id);
            scores.forEach(score => {
                if (score.trend === 'improving') totalImprovements++;
                if (score.trend === 'attention') totalRegressions++;
            });
        });

        return {
            plateaus: intelligence?.plateauDetection?.length || 0,
            regressions: totalRegressions,
            improvements: totalImprovements,
            alertsCount: Object.keys(anomalies).length
        };
    }, [myPatients, intelligence, anomalies, getLatestSkillScores]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-neutral-500">Updating Clinical Brain...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                        <Brain className="h-7 w-7 text-primary-600" />
                        Clinical Brain
                    </h2>
                    <p className="text-neutral-500">AI-powered insights & analytics</p>
                </div>
                <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run All Analytics
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                    <CardContent className="p-4">
                        <Sparkles className="h-6 w-6 text-violet-200 mb-2" />
                        <p className="text-3xl font-bold">{myPatients.length}</p>
                        <p className="text-violet-100">Patients Analyzed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <TrendingUp className="h-6 w-6 text-green-500 mb-2" />
                        <p className="text-3xl font-bold text-neutral-800">{overallStats.improvements}</p>
                        <p className="text-neutral-500">Skills Improving</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <Activity className="h-6 w-6 text-yellow-500 mb-2" />
                        <p className="text-3xl font-bold text-neutral-800">{overallStats.plateaus}</p>
                        <p className="text-neutral-500">Plateaus Detected</p>
                    </CardContent>
                </Card>
                <Card className={overallStats.alertsCount > 0 ? 'bg-red-50 border-red-200 shadow-sm' : ''}>
                    <CardContent className="p-4">
                        <AlertTriangle className={`h-6 w-6 mb-2 ${overallStats.alertsCount > 0 ? 'text-red-500' : 'text-neutral-400'}`} />
                        <p className="text-3xl font-bold text-neutral-800">{overallStats.alertsCount}</p>
                        <p className="text-neutral-500">Anomalies Found</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Child Skill Heatmap */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-neutral-500" />
                            Skill Heatmap Across Patients
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChildSkillHeatmap
                            children={myPatients}
                            getLatestSkillScores={getLatestSkillScores}
                        />
                    </CardContent>
                </Card>

                {/* Plateau Detection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-yellow-500" />
                            Plateau Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {intelligence?.plateauDetection?.length > 0 ? (
                            intelligence.plateauDetection.map((plateau, idx) => (
                                <AlertCard key={idx} alert={plateau} type="plateau" />
                            ))
                        ) : (
                            <div className="text-center py-6 text-neutral-400">
                                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-400" />
                                <p>No plateaus detected</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Risk Indicators */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Regression Risk
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {intelligence?.riskIndicators?.length > 0 ? (
                            intelligence.riskIndicators.map((risk, idx) => (
                                <AlertCard key={idx} alert={risk} type="regression" />
                            ))
                        ) : Object.keys(anomalies).length > 0 ? (
                            Object.entries(anomalies).map(([childId, data]) => (
                                <div key={childId}>
                                    {data.anomalies.map((anomaly, idx) => (
                                        <AlertCard key={idx} alert={{
                                            title: kids.find(k => k.id === childId)?.name,
                                            message: anomaly.message
                                        }} type="regression" />
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-neutral-400">
                                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-400" />
                                <p>No regression risks detected</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Activity Effectiveness */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary-500" />
                            Activity Effectiveness Comparison
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {intelligence?.effectiveActivities?.length > 0 ? (
                            <ActivityEffectivenessChart activities={intelligence.effectiveActivities} />
                        ) : (
                            <p className="text-center py-6 text-neutral-400">Not enough data to analyze activities</p>
                        )}
                    </CardContent>
                </Card>

                {/* Cross-Child Insights */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-violet-500" />
                            AI-Powered Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {intelligence?.crossChildInsights?.map((insight, idx) => (
                                <InsightCard key={idx} insight={insight} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Suggested Adjustments */}
                {intelligence?.suggestedAdjustments?.length > 0 && (
                    <Card className="lg:col-span-2 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary-800">
                                <Sparkles className="h-5 w-5 text-primary-500" />
                                AI Suggested Adjustments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {intelligence.suggestedAdjustments.map((adjustment, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                        <div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${adjustment.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {adjustment.priority.toUpperCase()}
                                            </span>
                                            <p className="mt-1 text-neutral-700">{adjustment.suggestion}</p>
                                        </div>
                                        <Button size="sm" variant="outline">Apply</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TherapyIntelligence;
