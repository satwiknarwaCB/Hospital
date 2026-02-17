// ============================================================
// NeuroBridge™ - CDC Admin Portal
// Complete Administrative Experience with All Modules
// ============================================================

import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

import TherapistProgressOverview from '../../components/admin/TherapistProgressOverview';
import UserManagement from '../../components/admin/UserManagement';
import Modal from '../../components/ui/Modal';

// ============================================================
// Admin Dashboard - Main Overview
// ============================================================
const AdminDashboard = () => {
    const { cdcMetrics, kids, sessions, users, adminStats } = useApp();

    // Calculate real metrics
    const MAX_CASELOAD = 15;
    const activeChildren = kids.filter(k => k.status === 'active').length;
    const therapists = users.filter(u => u.role === 'therapist');

    // Dynamic Therapist Performance Data
    const therapistPerformance = therapists.map(t => {
        const assignedKids = kids.filter(k => (k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : [])).includes(t.id));
        const caseload = assignedKids.length;
        const utilization = Math.min(Math.round((caseload / MAX_CASELOAD) * 100), 100);

        return {
            id: t.id,
            name: t.name,
            caseload: caseload,
            utilization: utilization,
            status: utilization >= 80 ? 'Optimal' : 'Available'
        };
    }).sort((a, b) => b.utilization - a.utilization);

    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const avgEngagement = sessions.length > 0
        ? Math.round(sessions.filter(s => s.engagement).reduce((a, b) => a + (b.engagement || 0), 0) / sessions.filter(s => s.engagement).length)
        : 0;

    return (
        <div className="space-y-4 md:space-y-6 overflow-x-hidden max-w-full">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 max-w-full">
                <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200 border-none rounded-xl md:rounded-2xl overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] md:text-xs font-black text-primary-100 uppercase tracking-widest truncate">Active Children</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between gap-2">
                            <p className="text-xl md:text-2xl lg:text-3xl font-black">{adminStats.active_children}</p>
                            <span className="text-[9px] md:text-[10px] font-black text-primary-200 bg-primary-400/30 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg uppercase tracking-tighter whitespace-nowrap">
                                Real-time
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm ring-1 ring-neutral-200 rounded-xl md:rounded-2xl overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] md:text-xs font-black text-neutral-400 uppercase tracking-widest truncate">Total Therapists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between gap-2">
                            <p className="text-xl md:text-2xl lg:text-3xl font-black text-neutral-800">{adminStats.therapist_count}</p>
                            <Building2 className="h-4 w-4 md:h-5 md:w-5 text-violet-500 shrink-0" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm ring-1 ring-neutral-200 rounded-xl md:rounded-2xl overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] md:text-xs font-black text-neutral-400 uppercase tracking-widest truncate">Therapy Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between gap-2">
                            <p className="text-xl md:text-2xl lg:text-3xl font-black text-neutral-800">{cdcMetrics.therapyCompletionRate}%</p>
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 shrink-0" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm ring-1 ring-neutral-200 rounded-xl md:rounded-2xl overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] md:text-xs font-black text-neutral-400 uppercase tracking-widest truncate">Parent Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between gap-2">
                            <p className="text-xl md:text-2xl lg:text-3xl font-black text-neutral-800">{cdcMetrics.parentEngagementRate}%</p>
                            <Heart className="h-4 w-4 md:h-5 md:w-5 text-pink-500 shrink-0" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Therapist & Child Progress Graphs */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-full overflow-hidden">
                <TherapistProgressOverview />
            </div>

            {/* Dashboard Statistics & Trends removed as requested */}

            {/* Therapist Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Therapist Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Mobile View (Card Stack) */}
                    <div className="md:hidden space-y-4">
                        {therapistPerformance.length > 0 ? (
                            therapistPerformance.map((data) => (
                                <div key={data.id} className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-neutral-800">{data.name}</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">{data.caseload} children</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${data.utilization >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {data.status}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase text-neutral-400 mb-1.5">
                                            <span>Utilization</span>
                                            <span className="text-neutral-800">{data.utilization}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${data.utilization >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                style={{ width: `${data.utilization}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-neutral-400 text-sm">No therapists found</div>
                        )}
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block overflow-x-auto">
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
                                {therapistPerformance.length > 0 ? (
                                    therapistPerformance.map((data) => (
                                        <tr key={data.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                                            <td className="py-3 font-medium text-neutral-800">{data.name}</td>
                                            <td className="py-3 text-neutral-600">{data.caseload} children</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${data.utilization >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${data.utilization}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">{data.utilization}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${data.utilization >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {data.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-neutral-400">No therapists active in the system</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Compliance & Risk Alerts */}
            <Card className="border-none shadow-sm ring-1 ring-neutral-200 rounded-[2rem]">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-black text-neutral-800 uppercase tracking-tight">Compliance & Risk Alerts</CardTitle>
                        <span className={`w-fit px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${cdcMetrics.complianceScore >= 95 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                            Compliance: {cdcMetrics.complianceScore}%
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Mobile View (Card Stack) */}
                    <div className="md:hidden space-y-4">
                        {cdcMetrics.dropoutRisk.map((risk, idx) => (
                            <div key={idx} className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 font-black text-orange-600 text-sm">
                                        <AlertTriangle className="h-4 w-4" />
                                        Dropout Risk
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${risk.riskLevel === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        {risk.riskLevel}
                                    </span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Patient</span>
                                        <span className="text-xs font-bold text-neutral-700">{risk.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Clinician</span>
                                        <span className="text-xs font-bold text-neutral-700">Dr. Rajesh</span>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" className="w-full text-xs font-black uppercase tracking-widest h-8">
                                    Review Case
                                </Button>
                            </div>
                        ))}
                        <div className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 font-black text-red-600 text-sm">
                                    <ShieldAlert className="h-4 w-4" />
                                    Low Engagement
                                </div>
                                <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600">
                                    Critical
                                </span>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Patient</span>
                                    <span className="text-xs font-bold text-neutral-700">Diya Sharma (C2)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Clinician</span>
                                    <span className="text-xs font-bold text-neutral-700">Dr. Rajesh</span>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="w-full text-xs font-black uppercase tracking-widest h-8">
                                Review Case
                            </Button>
                        </div>
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block overflow-x-auto">
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
    const { cdcMetrics, sessions, kids, users, adminStats, assignChildToTherapist, unassignChildFromTherapist } = useApp();
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const assignedKids = useMemo(() => {
        if (!selectedTherapist) return [];
        return kids.filter(k => {
            const ids = k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : []);
            return ids.includes(selectedTherapist.id);
        });
    }, [kids, selectedTherapist]);

    const availableKids = useMemo(() => {
        if (!selectedTherapist) return [];
        return kids.filter(k => {
            const ids = k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : []);
            return !ids.includes(selectedTherapist.id) && k.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [kids, selectedTherapist, searchTerm]);

    const usersMap = useMemo(() => {
        return users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
    }, [users]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-neutral-800">Operations Management</h2>
                <p className="text-neutral-500">Monitor and manage center operations</p>
            </div>

            {/* Operational Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <Card className="rounded-2xl md:rounded-[2rem] border-none shadow-sm ring-1 ring-neutral-200">
                    <CardContent className="p-4 md:p-6 text-center md:text-left">
                        <div className="h-10 w-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3 mx-auto md:mx-0">
                            <Users className="h-5 w-5 text-primary-500" />
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-neutral-800 leading-none">{adminStats.active_children}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Active Kids</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl md:rounded-[2rem] border-none shadow-sm ring-1 ring-neutral-200">
                    <CardContent className="p-4 md:p-6 text-center md:text-left">
                        <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 mx-auto md:mx-0">
                            <Activity className="h-5 w-5 text-emerald-500" />
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-neutral-800 leading-none">{cdcMetrics.avgSessionsPerWeek}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Sess / Week</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl md:rounded-[2rem] border-none shadow-sm ring-1 ring-neutral-200">
                    <CardContent className="p-4 md:p-6 text-center md:text-left">
                        <div className="h-10 w-10 bg-violet-50 rounded-xl flex items-center justify-center mb-3 mx-auto md:mx-0">
                            <Building2 className="h-5 w-5 text-violet-500" />
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-neutral-800 leading-none">{adminStats.therapist_count}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Team Size</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl md:rounded-[2rem] border-none shadow-sm ring-1 ring-neutral-200">
                    <CardContent className="p-4 md:p-6 text-center md:text-left">
                        <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3 mx-auto md:mx-0">
                            <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-neutral-800 leading-none">{cdcMetrics.waitlistSize}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Waitlist</p>
                    </CardContent>
                </Card>
            </div>

            {/* Therapist Allocation */}
            <Card className="rounded-[2rem] border-none shadow-sm ring-1 ring-neutral-200">
                <CardHeader>
                    <CardTitle className="text-xl font-black text-neutral-800 uppercase tracking-tight">Therapist Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {users.filter(u => u.role === 'therapist').map((therapist) => {
                            const assignedKidsCount = kids.filter(k => (k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : [])).includes(therapist.id)).length;
                            const utilization = Math.min(Math.round((assignedKidsCount / 15) * 100), 100);

                            return (
                                <div key={therapist.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-neutral-50 rounded-[1.5rem] border border-neutral-100 hover:bg-white hover:shadow-lg transition-all">
                                    <div className="flex-1">
                                        <p className="font-black text-neutral-900 uppercase text-sm tracking-tight">{therapist.name}</p>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">
                                            {assignedKidsCount} patients assigned
                                        </p>
                                    </div>
                                    <div className="flex-1 max-w-none sm:max-w-[180px]">
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                                            <span className="text-neutral-400">Utilization</span>
                                            <span className={utilization >= 80 ? 'text-emerald-600' : 'text-amber-600'}>{utilization}%</span>
                                        </div>
                                        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${utilization >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                style={{ width: `${utilization}%` }}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setSelectedTherapist(therapist)}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full sm:w-auto mt-2 sm:mt-0 font-black text-[10px] uppercase tracking-widest hover:bg-white border border-transparent hover:border-neutral-200"
                                    >
                                        Manage
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Allocation Modal */}
            <Modal
                isOpen={!!selectedTherapist}
                onClose={() => setSelectedTherapist(null)}
                title={selectedTherapist ? `Manage Caseload: ${selectedTherapist.name}` : 'Allocation'}
            >
                <div>
                    <div className="mb-6 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                        <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Currently Assigned ({assignedKids.length})</h4>
                        {assignedKids.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {assignedKids.map(kid => (
                                    <div key={kid.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-neutral-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                {kid.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-neutral-900">{kid.name}</p>
                                                <p className="text-[10px] text-neutral-500 uppercase tracking-wide">{kid.id}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-3 text-[10px] font-black uppercase"
                                            onClick={() => unassignChildFromTherapist(kid.id, selectedTherapist.id)}
                                        >
                                            Unassign
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-500 italic text-center py-2">No patients assigned yet.</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Available Patients</h4>
                            <div className="relative w-40">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Find patient..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {availableKids.map(kid => (
                                <div key={kid.id} className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-xl transition-colors border border-transparent hover:border-neutral-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center font-bold text-xs">
                                            {kid.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-neutral-900">{kid.name}</p>
                                            <p className="text-[10px] text-neutral-500 uppercase tracking-wide">
                                                {(kid.therapistIds && kid.therapistIds.length > 0)
                                                    ? `Assigned to: ${kid.therapistIds.map(id => usersMap[id]?.name || id).join(', ')}`
                                                    : (kid.therapistId
                                                        ? `Assigned to ${usersMap[kid.therapistId]?.name || kid.therapistId}`
                                                        : 'Unassigned')}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-primary-600 hover:bg-primary-700 text-white h-7 px-3 text-[10px] font-black uppercase rounded-lg shadow-sm"
                                        onClick={() => assignChildToTherapist(kid.id, selectedTherapist.id)}
                                    >
                                        Assign
                                    </Button>
                                </div>
                            ))}
                            {availableKids.length === 0 && (
                                <p className="text-sm text-neutral-500 italic text-center py-4">No matching patients found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-neutral-900 uppercase tracking-tight">Clinical Reports</h2>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Generate and distribute clinical records</p>
                </div>
                <Button className="bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-100 rounded-xl h-12 md:h-14 px-6 font-black text-[11px] uppercase tracking-widest">
                    <FileBarChart className="h-5 w-5 mr-3" />
                    Generate New Report
                </Button>
            </div>

            {/* Report Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="rounded-[1.5rem] border-none shadow-sm ring-1 ring-neutral-200">
                    <CardContent className="p-6 text-center">
                        <p className="text-3xl font-black text-primary-600 leading-none">{reports.length}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Total Reports</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[1.5rem] border-none shadow-sm ring-1 ring-neutral-200">
                    <CardContent className="p-6 text-center">
                        <p className="text-3xl font-black text-emerald-600 leading-none">{reports.filter(r => r.status === 'ready').length}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Secured & Ready</p>
                    </CardContent>
                </Card>
                <Card className="rounded-[1.5rem] border-none shadow-sm ring-1 ring-neutral-200">
                    <CardContent className="p-6 text-center">
                        <p className="text-3xl font-black text-amber-600 leading-none">{reports.filter(r => r.status === 'pending').length}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Processing</p>
                    </CardContent>
                </Card>
            </div>

            {/* Reports List */}
            <Card className="rounded-[2rem] border-none shadow-sm ring-1 ring-neutral-200 overflow-hidden">
                <CardHeader className="bg-neutral-50/50 border-b border-neutral-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <CardTitle className="text-lg font-black text-neutral-800 uppercase tracking-tight">Available Reports</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-tight focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                            <Button variant="outline" className="rounded-xl font-black text-xs uppercase h-10 px-4">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 gap-4">
                        {reports.map(report => (
                            <div
                                key={report.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 border border-neutral-100 rounded-[1.5rem] hover:bg-neutral-50 transition-all gap-6 shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-primary-100/50 rounded-2xl flex items-center justify-center shrink-0">
                                        <FileBarChart className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-neutral-900 uppercase text-sm tracking-tight leading-tight">{report.name}</p>
                                        <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                                            <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase">{report.type}</span>
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest truncate">{new Date(report.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${report.status === 'ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        {report.status}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest hover:bg-white rounded-xl">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {report.status === 'ready' && (
                                            <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary-50">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-lg shadow-emerald-100 rounded-2xl md:rounded-[2rem]">
                    <CardContent className="p-4 md:p-6">
                        <ShieldAlert className="h-6 w-6 text-emerald-100 mb-2" />
                        <p className="text-2xl md:text-3xl font-black">{cdcMetrics.complianceScore}%</p>
                        <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mt-1">Audit Score</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl md:rounded-[2rem] border-none shadow-sm ring-1 ring-neutral-200">
                    <CardContent className="p-4 md:p-6">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-2" />
                        <p className="text-2xl md:text-3xl font-black text-neutral-800">{consentRecords.filter(c => c.status === 'active').length}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Active Consents</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl md:rounded-[2rem] border-none shadow-sm ring-1 ring-neutral-200">
                    <CardContent className="p-4 md:p-6">
                        <Activity className="h-6 w-6 text-primary-500 mb-2" />
                        <p className="text-2xl md:text-3xl font-black text-neutral-800">{auditLogs.length}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Audit Logs</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl md:rounded-[2rem] border-none shadow-sm ring-1 ring-neutral-200">
                    <CardContent className="p-4 md:p-6">
                        <Calendar className="h-6 w-6 text-amber-500 mb-2" />
                        <p className="text-2xl md:text-3xl font-black text-neutral-800">0</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Pending Review</p>
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
                <Card className="rounded-[2rem] border-none shadow-sm ring-1 ring-neutral-200 overflow-hidden">
                    <CardHeader className="bg-neutral-50/50 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-black text-neutral-800 uppercase tracking-tight">Recent Audit Events</CardTitle>
                            <Button variant="outline" className="rounded-xl font-black text-xs uppercase h-10 px-4">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        <div className="grid grid-cols-1 gap-3">
                            {auditLogs.map(log => (
                                <div key={log.id} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-white hover:shadow-lg transition-all">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${log.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-600' :
                                        log.action.includes('UPDATE') ? 'bg-amber-100 text-amber-600' :
                                            log.action.includes('LOGIN') ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-600'
                                        }`}>
                                        <Activity className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                            <p className="font-black text-neutral-900 uppercase text-sm tracking-tight">{log.action.replace(/_/g, ' ')}</p>
                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs font-medium text-neutral-500 leading-relaxed mb-2">{log.details}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 rounded-full bg-neutral-200 shrink-0" />
                                            <p className="text-[10px] font-black text-neutral-900 uppercase tracking-tight">Actor: {log.userName}</p>
                                        </div>
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
    const navigate = useNavigate();
    const { logout } = useApp();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    const sidebarItems = [
        { label: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
        { label: 'Operations', path: '/admin/operations', icon: Building2 },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Reports', path: '/admin/reports', icon: FileBarChart },
        { label: 'Compliance', path: '/admin/compliance', icon: ShieldAlert },
    ];

    return (
        <Routes>
            <Route element={<DashboardLayout title="CDC Admin" sidebarItems={sidebarItems} roleColor="bg-neutral-800" onLogout={handleLogout} />}>
                <Route path="overview" element={<AdminDashboard />} />
                <Route path="operations" element={<OperationsPage />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="compliance" element={<CompliancePage />} />
                <Route path="*" element={<Navigate to="overview" replace />} />
            </Route>
        </Routes>
    );
};

export default AdminPortal;
