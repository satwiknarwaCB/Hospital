// ============================================================
// NeuroBridge™ - CDC Admin Portal
// Complete Administrative Experience with All Modules
// ============================================================

import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    LayoutDashboard,
    Building2,
    FileBarChart,
    ShieldAlert,
    Users,
    TrendingUp,
    TrendingDown,
    Activity,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Download,
    Search,
    Filter,
    Eye,
    Calendar,
    DollarSign,
    Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';
import OccupancyChart from '../../components/charts/OccupancyChart';
import UtilizationChart from '../../components/charts/UtilizationChart';

// ============================================================
// Admin Dashboard - Main Overview
// ============================================================
const AdminDashboard = () => {
    const { cdcMetrics, kids, sessions, users } = useApp();

    // Calculate real metrics
    const activeChildren = kids.filter(k => k.status === 'active').length;
    const therapists = users.filter(u => u.role === 'therapist');
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const avgEngagement = sessions.length > 0
        ? Math.round(sessions.filter(s => s.engagement).reduce((a, b) => a + (b.engagement || 0), 0) / sessions.filter(s => s.engagement).length)
        : 0;

    return (
        <div className="space-y-6">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-primary-100">Active Children</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-bold">{cdcMetrics.activeChildren}</p>
                            <span className="text-sm font-medium text-primary-200 bg-primary-400/30 px-2 py-1 rounded-full">
                                +3 this month
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500">Therapist Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-bold text-neutral-800">
                                {Math.round(Object.values(cdcMetrics.therapistUtilization).reduce((a, b) => a + b.utilization, 0) / Object.keys(cdcMetrics.therapistUtilization).length)}%
                            </p>
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500">Therapy Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-bold text-neutral-800">{cdcMetrics.therapyCompletionRate}%</p>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500">Parent Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-bold text-neutral-800">{cdcMetrics.parentEngagementRate}%</p>
                            <Heart className="h-5 w-5 text-pink-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            Revenue Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-3xl font-bold text-neutral-800">₹{(cdcMetrics.monthlyRevenue / 1000).toFixed(1)}k</p>
                                <p className="text-sm text-neutral-500">Month to Date</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-medium text-neutral-600">Target: ₹{(cdcMetrics.revenueTarget / 1000).toFixed(0)}k</p>
                                <p className="text-sm text-green-600">
                                    {Math.round((cdcMetrics.monthlyRevenue / cdcMetrics.revenueTarget) * 100)}% achieved
                                </p>
                            </div>
                        </div>
                        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                                style={{ width: `${(cdcMetrics.monthlyRevenue / cdcMetrics.revenueTarget) * 100}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Waitlist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-neutral-800">{cdcMetrics.waitlistSize}</p>
                        <p className="text-sm text-neutral-500 mt-1">Pending enrollment</p>
                        <div className="mt-4 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Avg wait time</span>
                                <span className="font-medium">2.5 weeks</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Renewals due</span>
                                <span className="font-medium">{cdcMetrics.upcomingRenewals}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Center Occupancy Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <OccupancyChart />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Therapy Utilization by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UtilizationChart />
                    </CardContent>
                </Card>
            </div>

            {/* Therapist Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Therapist Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-neutral-500 border-b">
                                    <th className="pb-3">Therapist</th>
                                    <th className="pb-3">Caseload</th>
                                    <th className="pb-3">Utilization</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(cdcMetrics.therapistUtilization).map(([id, data]) => (
                                    <tr key={id} className="border-b border-neutral-100">
                                        <td className="py-3 font-medium text-neutral-800">{data.name}</td>
                                        <td className="py-3 text-neutral-600">{data.caseload} patients</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${data.utilization >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                        style={{ width: `${data.utilization}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{data.utilization}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.utilization >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {data.utilization >= 80 ? 'Optimal' : 'Available'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Compliance & Risk Alerts */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Compliance & Risk Alerts</CardTitle>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${cdcMetrics.complianceScore >= 95 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            Compliance Score: {cdcMetrics.complianceScore}%
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b">
                                <tr>
                                    <th className="px-4 py-3">Alert Type</th>
                                    <th className="px-4 py-3">Child / ID</th>
                                    <th className="px-4 py-3">Therapist</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {cdcMetrics.dropoutRisk.map((risk, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 font-medium text-orange-600">
                                            <AlertTriangle className="inline w-4 h-4 mr-1" />
                                            Dropout Risk
                                        </td>
                                        <td className="px-4 py-3">{risk.name}</td>
                                        <td className="px-4 py-3">Dr. Rajesh</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs ${risk.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {risk.riskLevel.charAt(0).toUpperCase() + risk.riskLevel.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-primary-600 hover:underline">Review Case</button>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="px-4 py-3 font-medium text-red-600">
                                        <ShieldAlert className="inline w-4 h-4 mr-1" />
                                        Low Engagement
                                    </td>
                                    <td className="px-4 py-3">Diya Sharma (C2)</td>
                                    <td className="px-4 py-3">Dr. Rajesh</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">Critical</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="text-primary-600 hover:underline">Review Case</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ============================================================
// Operations Management Page
// ============================================================
const OperationsPage = () => {
    const { cdcMetrics, sessions, kids, users } = useApp();

    const therapists = users.filter(u => u.role === 'therapist');
    const weeklySessionCount = sessions.filter(s => s.status === 'completed').length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-neutral-800">Operations Management</h2>
                <p className="text-neutral-500">Monitor and manage center operations</p>
            </div>

            {/* Operational Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <Users className="h-6 w-6 text-primary-500 mb-2" />
                        <p className="text-2xl font-bold">{cdcMetrics.activeChildren}</p>
                        <p className="text-sm text-neutral-500">Active Children</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <Activity className="h-6 w-6 text-green-500 mb-2" />
                        <p className="text-2xl font-bold">{cdcMetrics.avgSessionsPerWeek}</p>
                        <p className="text-sm text-neutral-500">Sessions/Week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <Building2 className="h-6 w-6 text-violet-500 mb-2" />
                        <p className="text-2xl font-bold">{therapists.length}</p>
                        <p className="text-sm text-neutral-500">Therapists</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <Clock className="h-6 w-6 text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold">{cdcMetrics.waitlistSize}</p>
                        <p className="text-sm text-neutral-500">Waitlist</p>
                    </CardContent>
                </Card>
            </div>

            {/* Therapist Allocation */}
            <Card>
                <CardHeader>
                    <CardTitle>Therapist Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(cdcMetrics.therapistUtilization).map(([id, data]) => (
                            <div key={id} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-800">{data.name}</p>
                                    <p className="text-sm text-neutral-500">{data.caseload} patients assigned</p>
                                </div>
                                <div className="w-48">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-neutral-500">Utilization</span>
                                        <span className="font-medium">{data.utilization}%</span>
                                    </div>
                                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${data.utilization >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${data.utilization}%` }}
                                        />
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Manage</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Room Utilization - Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Room Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Therapy Room A', 'Therapy Room B', 'Sensory Room', 'Group Room'].map((room, idx) => (
                            <div key={idx} className="p-4 border border-neutral-200 rounded-xl text-center">
                                <p className="font-medium text-neutral-800">{room}</p>
                                <p className="text-2xl font-bold text-primary-600 mt-2">{70 + Math.random() * 25 | 0}%</p>
                                <p className="text-xs text-neutral-500">Today's usage</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ============================================================
// Reports Page
// ============================================================
const ReportsPage = () => {
    const [selectedReport, setSelectedReport] = useState(null);

    const reports = [
        { id: 1, name: 'Monthly Progress Summary', type: 'Clinical', date: '2025-12-01', status: 'ready' },
        { id: 2, name: 'Therapist Performance Report', type: 'Operations', date: '2025-12-01', status: 'ready' },
        { id: 3, name: 'Parent Satisfaction Survey', type: 'Satisfaction', date: '2025-11-15', status: 'ready' },
        { id: 4, name: 'Compliance Audit Report', type: 'Compliance', date: '2025-11-01', status: 'ready' },
        { id: 5, name: 'Financial Summary Q4', type: 'Financial', date: '2025-12-15', status: 'pending' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Clinical Reports</h2>
                    <p className="text-neutral-500">Generate and download reports</p>
                </div>
                <Button>
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Generate New Report
                </Button>
            </div>

            {/* Report Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-primary-600">{reports.length}</p>
                        <p className="text-sm text-neutral-500">Total Reports</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{reports.filter(r => r.status === 'ready').length}</p>
                        <p className="text-sm text-neutral-500">Ready to Download</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-yellow-600">{reports.filter(r => r.status === 'pending').length}</p>
                        <p className="text-sm text-neutral-500">Pending</p>
                    </CardContent>
                </Card>
            </div>

            {/* Reports List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Available Reports</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm"
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {reports.map(report => (
                            <div
                                key={report.id}
                                className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary-100 rounded-lg">
                                        <FileBarChart className="h-5 w-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-800">{report.name}</p>
                                        <p className="text-sm text-neutral-500">
                                            {report.type} • {new Date(report.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {report.status === 'ready' ? 'Ready' : 'Pending'}
                                    </span>
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    {report.status === 'ready' && (
                                        <Button size="sm">
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ============================================================
// Compliance & Audit Page
// ============================================================
const CompliancePage = () => {
    const { auditLogs, consentRecords, cdcMetrics } = useApp();
    const [activeTab, setActiveTab] = useState('audit');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-neutral-800">Compliance & Audit</h2>
                <p className="text-neutral-500">Monitor compliance and view audit logs</p>
            </div>

            {/* Compliance Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                        <ShieldAlert className="h-6 w-6 text-green-200 mb-2" />
                        <p className="text-3xl font-bold">{cdcMetrics.complianceScore}%</p>
                        <p className="text-green-100">Compliance Score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                        <p className="text-2xl font-bold">{consentRecords.filter(c => c.status === 'active').length}</p>
                        <p className="text-sm text-neutral-500">Active Consents</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <Activity className="h-6 w-6 text-primary-500 mb-2" />
                        <p className="text-2xl font-bold">{auditLogs.length}</p>
                        <p className="text-sm text-neutral-500">Audit Events</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <Calendar className="h-6 w-6 text-yellow-500 mb-2" />
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-neutral-500">Pending Reviews</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-neutral-200">
                <button
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'audit' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-neutral-500'
                        }`}
                    onClick={() => setActiveTab('audit')}
                >
                    Audit Logs
                </button>
                <button
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'consent' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-neutral-500'
                        }`}
                    onClick={() => setActiveTab('consent')}
                >
                    Consent Records
                </button>
            </div>

            {/* Audit Logs */}
            {activeTab === 'audit' && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Audit Events</CardTitle>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {auditLogs.map(log => (
                                <div key={log.id} className="flex items-start gap-4 p-3 bg-neutral-50 rounded-lg">
                                    <div className={`p-2 rounded-lg ${log.action.includes('CREATE') ? 'bg-green-100' :
                                            log.action.includes('UPDATE') ? 'bg-yellow-100' :
                                                log.action.includes('LOGIN') ? 'bg-blue-100' : 'bg-neutral-100'
                                        }`}>
                                        <Activity className={`h-4 w-4 ${log.action.includes('CREATE') ? 'text-green-600' :
                                                log.action.includes('UPDATE') ? 'text-yellow-600' :
                                                    log.action.includes('LOGIN') ? 'text-blue-600' : 'text-neutral-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-neutral-800">{log.action.replace(/_/g, ' ')}</p>
                                        <p className="text-sm text-neutral-500">{log.details}</p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            By {log.userName} • {new Date(log.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Consent Records */}
            {activeTab === 'consent' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Consent Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {consentRecords.map(consent => (
                                <div key={consent.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
                                    <div>
                                        <p className="font-medium text-neutral-800">{consent.description}</p>
                                        <p className="text-sm text-neutral-500">
                                            Granted: {new Date(consent.grantedAt).toLocaleDateString()} •
                                            Expires: {new Date(consent.expiresAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${consent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

// ============================================================
// Admin Portal Router
// ============================================================
const AdminPortal = () => {
    const sidebarItems = [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Operations', path: '/admin/operations', icon: Building2 },
        { label: 'Reports', path: '/admin/reports', icon: FileBarChart },
        { label: 'Compliance', path: '/admin/compliance', icon: ShieldAlert },
    ];

    return (
        <Routes>
            <Route element={<DashboardLayout title="CDC Admin" sidebarItems={sidebarItems} roleColor="bg-neutral-800" />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="operations" element={<OperationsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="compliance" element={<CompliancePage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default AdminPortal;
