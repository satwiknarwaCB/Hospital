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
    const { cdcMetrics, kids, sessions, users, adminStats, realTherapists, realParents } = useApp();

    // Calculate real metrics - use only DB therapists/parents
    const MAX_CASELOAD = 15;
    const activeChildren = kids.filter(k => k.status === 'active').length;
    const therapists = (realTherapists && realTherapists.length > 0) ? realTherapists.map(t => ({ ...t, id: t.id || t._id, role: 'therapist' })) : users.filter(u => u.role === 'therapist');

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
            {/* Top Metrics - Production Redesign */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {/* Total Parents */}
                <Card className="bg-white border-none shadow-premium rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300 ring-1 ring-neutral-100 hover-lift">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">Parents</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="text-3xl font-black text-neutral-800 tabular-nums tracking-tighter">
                                {adminStats.parent_count || 0}
                            </p>
                            <CardTitle className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Parents</CardTitle>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Therapists */}
                <Card className="bg-white border-none shadow-premium rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300 ring-1 ring-neutral-100 hover-lift">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors">
                                <Building2 className="h-5 w-5 text-violet-600" />
                            </div>
                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-1 rounded-lg uppercase tracking-wider">Therapists</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="text-3xl font-black text-neutral-800 tabular-nums tracking-tighter">
                                {adminStats.therapist_count || 0}
                            </p>
                            <CardTitle className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Therapists</CardTitle>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Children */}
                <Card className="bg-white border-none shadow-premium rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300 ring-1 ring-neutral-100 hover-lift">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                <Heart className="h-5 w-5 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">Children</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="text-3xl font-black text-neutral-800 tabular-nums tracking-tighter">
                                {adminStats.child_count || 0}
                            </p>
                            <CardTitle className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Children</CardTitle>
                        </div>
                    </CardContent>
                </Card>

                {/* Ongoing Therapies */}
                <Card className="bg-white border-none shadow-premium rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300 ring-1 ring-neutral-100 hover-lift">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                                <Activity className="h-5 w-5 text-amber-600" />
                            </div>
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-wider">Therapies</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="text-3xl font-black text-neutral-800 tabular-nums tracking-tighter">
                                {adminStats.ongoing_therapies || 0}
                            </p>
                            <CardTitle className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Ongoing Therapies</CardTitle>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Assignments */}
                <Card className="bg-white border-none shadow-premium rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300 ring-1 ring-neutral-100 hover-lift">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
                                <Clock className="h-5 w-5 text-rose-600" />
                            </div>
                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg uppercase tracking-wider">Assignments</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            <p className="text-3xl font-black text-neutral-800 tabular-nums tracking-tighter">
                                {adminStats.pending_assignments || 0}
                            </p>
                            <CardTitle className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Pending Assignments</CardTitle>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Parents & Therapists Directory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Therapists List */}
                <Card className="glass-card border-none rounded-xl md:rounded-2xl overflow-hidden">
                    <CardHeader className="bg-violet-50/50 border-b border-violet-100/50 pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm md:text-base font-black text-neutral-800 uppercase tracking-tight flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-violet-500" />
                                Therapists
                            </CardTitle>
                            <span className="text-[10px] font-black text-violet-600 bg-violet-100 px-2 py-1 rounded-lg uppercase tracking-widest">
                                {(realTherapists && realTherapists.length > 0) ? realTherapists.length : 0} registered
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[320px] overflow-y-auto divide-y divide-neutral-100">
                            {(realTherapists && realTherapists.length > 0) ? realTherapists.map((t, idx) => (
                                <div key={t.id || t._id || idx} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors">
                                    <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-black text-sm shrink-0">
                                        {(t.name || 'T').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-neutral-800 truncate">{t.name}</p>
                                        <p className="text-[10px] text-neutral-400 truncate">{t.email || t.specialization || 'Therapist'}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight shrink-0 ${t.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                        {t.is_active !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            )) : (
                                <div className="py-8 text-center text-neutral-400 text-xs">
                                    No therapists registered in database yet
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Parents List */}
                <Card className="glass-card border-none rounded-xl md:rounded-2xl overflow-hidden">
                    <CardHeader className="bg-pink-50/50 border-b border-pink-100/50 pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm md:text-base font-black text-neutral-800 uppercase tracking-tight flex items-center gap-2">
                                <Heart className="h-4 w-4 text-pink-500" />
                                Parents
                            </CardTitle>
                            <span className="text-[10px] font-black text-pink-600 bg-pink-100 px-2 py-1 rounded-lg uppercase tracking-widest">
                                {(realParents && realParents.length > 0) ? realParents.length : 0} registered
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[320px] overflow-y-auto divide-y divide-neutral-100">
                            {(realParents && realParents.length > 0) ? realParents.map((p, idx) => (
                                <div key={p.id || p._id || idx} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors">
                                    <div className="h-9 w-9 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 font-black text-sm shrink-0">
                                        {(p.name || 'P').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-neutral-800 truncate">{p.name}</p>
                                        <p className="text-[10px] text-neutral-400 truncate">{p.email || p.relationship || 'Parent'}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight shrink-0 ${p.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                        {p.is_active !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            )) : (
                                <div className="py-8 text-center text-neutral-400 text-xs">
                                    No parents registered in database yet
                                </div>
                            )}
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
            <Card className="glass-card border-none">
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

    const roomStats = useMemo(() => {
        const rooms = ['Therapy Room A', 'Therapy Room B', 'Sensory Room', 'Group Room', 'Virtual Session'];
        // Use local date (YYYY-MM-DD) instead of UTC to avoid off-by-one errors in different timezones
        const today = new Date().toLocaleDateString('en-CA');
        const workDayMinutes = 8 * 60; // 8 hours total capacity per day

        return rooms.map(roomName => {
            const occupiedMinutes = sessions
                .filter(s => {
                    if (!s.location || !s.date) return false;
                    const sessionLoc = s.location.toLowerCase().trim();
                    const targetLoc = roomName.toLowerCase().trim();

                    // Robust date match: convert UTC to local date string (en-CA: YYYY-MM-DD)
                    const sessionDateLocal = new Date(s.date).toLocaleDateString('en-CA');

                    // Match if locations are exact or if one contains the other (e.g. "Room A" matches "Therapy Room A")
                    const isRoomMatch = sessionLoc === targetLoc ||
                        sessionLoc.includes(targetLoc) ||
                        targetLoc.includes(sessionLoc);

                    return isRoomMatch && sessionDateLocal === today;
                })
                .reduce((total, s) => total + (parseInt(s.duration) || 45), 0);

            const utilization = Math.round((occupiedMinutes / workDayMinutes) * 100);
            return {
                name: roomName,
                usage: Math.min(utilization, 100)
            };
        });
    }, [sessions]);

    return (
        <div className="space-y-8 pb-safe-nav animate-slide-up">
            <div>
                <h2 className="text-2xl font-bold text-neutral-800">Operations Management</h2>
                <p className="text-neutral-500">Monitor and manage center operations</p>
            </div>

            {/* Operational Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <Card className="glass-card rounded-2xl md:rounded-[2rem] border-none">
                    <CardContent className="p-4 md:p-6 text-center md:text-left">
                        <div className="h-10 w-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3 mx-auto md:mx-0">
                            <Users className="h-5 w-5 text-primary-500" />
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-neutral-800 leading-none">{adminStats.active_children}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Active Kids</p>
                    </CardContent>
                </Card>
                <Card className="glass-card rounded-2xl md:rounded-[2rem] border-none">
                    <CardContent className="p-4 md:p-6 text-center md:text-left">
                        <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3 mx-auto md:mx-0">
                            <Activity className="h-5 w-5 text-emerald-500" />
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-neutral-800 leading-none">
                            {Math.round(sessions.length / 4) || 0}
                        </p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Sess / Week</p>
                    </CardContent>
                </Card>
                <Card className="glass-card rounded-2xl md:rounded-[2rem] border-none">
                    <CardContent className="p-4 md:p-6 text-center md:text-left">
                        <div className="h-10 w-10 bg-violet-50 rounded-xl flex items-center justify-center mb-3 mx-auto md:mx-0">
                            <Building2 className="h-5 w-5 text-violet-500" />
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-neutral-800 leading-none">{adminStats.therapist_count}</p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Team Size</p>
                    </CardContent>
                </Card>
                <Card className="glass-card rounded-2xl md:rounded-[2rem] border-none">
                    <CardContent className="p-4 md:p-6 text-center md:text-left">
                        <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3 mx-auto md:mx-0">
                            <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-neutral-800 leading-none">
                            {kids.filter(k => !k.therapistId && (!k.therapistIds || k.therapistIds.length === 0)).length}
                        </p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">Waitlist</p>
                    </CardContent>
                </Card>
            </div>

            {/* Therapist Allocation */}
            <Card className="glass-card rounded-[2rem] border-none">
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
                                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-0.5">
                                            {therapist.specialization}
                                        </p>
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
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {assignedKids.map(kid => (
                                    <div key={kid.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-neutral-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                {kid.name.charAt(0)}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-black text-neutral-900 uppercase tracking-tight">{kid.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{kid.id}</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Clock className="h-2.5 w-2.5 text-amber-500" />
                                                    <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                                                        Started: <span className="text-neutral-700">
                                                            {((kid.therapy_start_dates && kid.therapy_start_dates[selectedTherapist.id]) || kid.therapy_start_date || kid.enrollmentDate || kid.created_at)
                                                                ? new Date((kid.therapy_start_dates && kid.therapy_start_dates[selectedTherapist.id]) || kid.therapy_start_date || kid.enrollmentDate || kid.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                : 'Not set'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 px-4 text-[10px] font-black uppercase rounded-xl border border-transparent hover:border-red-100 transition-all"
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
                        {roomStats.map((room, idx) => (
                            <div key={idx} className="p-4 border border-neutral-200 rounded-xl text-center">
                                <p className="font-medium text-neutral-800">{room.name}</p>
                                <p className="text-2xl font-bold text-primary-600 mt-2">{room.usage}%</p>
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
    const { sessions, kids, addNotification } = useApp();
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Build reports dynamically from real session data
    const reports = useMemo(() => {
        const safeSessions = Array.isArray(sessions) ? sessions : [];
        const safeKids = Array.isArray(kids) ? kids : [];

        return safeSessions
            .filter(s => s.status === 'completed' || s.aiSummary)
            .map(session => {
                const child = safeKids.find(k => k.id === (session.childId || session.child_id));
                const childName = child?.name || 'Unknown Child';
                const hasAiSummary = !!session.aiSummary;

                return {
                    id: session.id || session._id,
                    name: `${childName} — ${session.type || 'Therapy'} Report`,
                    type: session.type || 'General',
                    date: session.date || new Date().toISOString(),
                    status: hasAiSummary ? 'ready' : 'pending',
                    childName,
                    childId: session.childId || session.child_id,
                    engagement: session.engagement || 0,
                    aiSummary: session.aiSummary || null,
                    measurableOutcomes: session.measurableOutcomes || [],
                    nonMeasurableOutcomes: session.nonMeasurableOutcomes || [],
                    duration: session.duration || 0
                };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [sessions, kids]);

    // Filter reports by search query
    const filteredReports = useMemo(() => {
        if (!searchQuery.trim()) return reports;
        const q = searchQuery.toLowerCase();
        return reports.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q) ||
            r.childName.toLowerCase().includes(q)
        );
    }, [reports, searchQuery]);

    const handleGenerateReport = () => {
        addNotification({
            type: 'info',
            title: 'Report Generation',
            message: `There are currently ${reports.length} reports derived from completed sessions. Log new sessions to generate more reports.`
        });
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
    };

    const handleDownloadReport = (report) => {
        // Create a text-based report for download
        const content = [
            `CLINICAL REPORT — ${report.name}`,
            `Date: ${new Date(report.date).toLocaleDateString()}`,
            `Type: ${report.type}`,
            `Engagement: ${report.engagement}%`,
            `Duration: ${report.duration} min`,
            `Status: ${report.status.toUpperCase()}`,
            '',
            '--- AI CLINICAL SUMMARY ---',
            report.aiSummary || 'No AI summary available.',
            '',
            '--- MEASURABLE OUTCOMES ---',
            ...(report.measurableOutcomes?.length > 0 ? report.measurableOutcomes : ['None recorded.']),
            '',
            '--- NON-MEASURABLE OUTCOMES ---',
            ...(report.nonMeasurableOutcomes?.length > 0 ? report.nonMeasurableOutcomes : ['None recorded.']),
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        addNotification({
            type: 'success',
            title: 'Report Downloaded',
            message: `"${report.name}" has been exported.`
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-neutral-900 uppercase tracking-tight">Clinical Reports</h2>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Generate and distribute clinical records</p>
                </div>
                <Button
                    className="bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-100 rounded-xl h-12 md:h-14 px-6 font-black text-[11px] uppercase tracking-widest"
                    onClick={handleGenerateReport}
                >
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

            {/* Report Detail Modal */}
            {selectedReport && (
                <Card className="rounded-[2rem] border-none shadow-xl ring-2 ring-primary-200 overflow-hidden animate-in zoom-in-95 duration-200">
                    <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-black uppercase tracking-tight">{selectedReport.name}</CardTitle>
                            <button onClick={() => setSelectedReport(null)} className="text-white/70 hover:text-white text-xl font-bold">✕</button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-3 bg-neutral-50 rounded-xl text-center">
                                <p className="text-lg font-black text-neutral-800">{selectedReport.engagement}%</p>
                                <p className="text-[10px] font-black text-neutral-400 uppercase">Engagement</p>
                            </div>
                            <div className="p-3 bg-neutral-50 rounded-xl text-center">
                                <p className="text-lg font-black text-neutral-800">{selectedReport.duration}m</p>
                                <p className="text-[10px] font-black text-neutral-400 uppercase">Duration</p>
                            </div>
                            <div className="p-3 bg-neutral-50 rounded-xl text-center">
                                <p className="text-lg font-black text-neutral-800">{selectedReport.type}</p>
                                <p className="text-[10px] font-black text-neutral-400 uppercase">Type</p>
                            </div>
                            <div className="p-3 bg-neutral-50 rounded-xl text-center">
                                <p className="text-lg font-black text-neutral-800">{new Date(selectedReport.date).toLocaleDateString()}</p>
                                <p className="text-[10px] font-black text-neutral-400 uppercase">Date</p>
                            </div>
                        </div>

                        {selectedReport.aiSummary && (
                            <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100">
                                <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-2">AI Clinical Summary</p>
                                <p className="text-sm text-violet-800 leading-relaxed italic">"{selectedReport.aiSummary}"</p>
                            </div>
                        )}

                        {selectedReport.measurableOutcomes?.length > 0 && (
                            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-2">Measurable Outcomes</p>
                                <ul className="space-y-1">
                                    {selectedReport.measurableOutcomes.map((m, i) => (
                                        <li key={i} className="text-sm text-primary-800 flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-primary-500 mt-0.5 shrink-0" />
                                            {m}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {selectedReport.nonMeasurableOutcomes?.length > 0 && (
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Qualitative Wins</p>
                                <ul className="space-y-1">
                                    {selectedReport.nonMeasurableOutcomes.map((nm, i) => (
                                        <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                                            <Heart className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            {nm}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                className="flex-1 bg-primary-600 hover:bg-primary-700 font-black text-[11px] uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-primary-100"
                                onClick={() => handleDownloadReport(selectedReport)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Report
                            </Button>
                            <Button variant="outline" className="flex-1 font-black text-[11px] uppercase tracking-widest h-12 rounded-xl" onClick={() => setSelectedReport(null)}>
                                Close
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                        {filteredReports.length > 0 ? filteredReports.map(report => (
                            <div
                                key={report.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 border border-neutral-100 rounded-[1.5rem] hover:bg-neutral-50 transition-all gap-6 shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${report.status === 'ready' ? 'bg-emerald-100/50' : 'bg-amber-100/50'}`}>
                                        <FileBarChart className={`h-6 w-6 ${report.status === 'ready' ? 'text-emerald-600' : 'text-amber-600'}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-neutral-900 uppercase text-sm tracking-tight leading-tight">{report.name}</p>
                                        <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                                            <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase">{report.type}</span>
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest truncate">{new Date(report.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-bold text-neutral-400">•</span>
                                            <span className="text-[10px] font-black text-neutral-400 uppercase">{report.engagement}% Eng</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${report.status === 'ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        {report.status}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest hover:bg-white rounded-xl" onClick={() => handleViewReport(report)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {report.status === 'ready' && (
                                            <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary-50" onClick={() => handleDownloadReport(report)}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-neutral-400">
                                <FileBarChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p className="font-black uppercase tracking-widest text-[10px]">{searchQuery ? 'No reports match your search' : 'No clinical reports available'}</p>
                                <p className="text-[10px] text-neutral-300 mt-2">Reports are generated from completed therapy sessions with AI summaries</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
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
    ];

    return (
        <Routes>
            <Route element={<DashboardLayout title="CDC Admin" sidebarItems={sidebarItems} roleColor="bg-primary-600" onLogout={handleLogout} />}>
                <Route path="overview" element={<AdminDashboard />} />
                <Route path="operations" element={<OperationsPage />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="*" element={<Navigate to="overview" replace />} />
            </Route>
        </Routes>
    );
};

export default AdminPortal;
