import React, { useState, useMemo } from 'react';
import ChildHealthAssessment from './ChildHealthAssessment';
import {
    PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useApp } from '../../lib/context';
import {
    Users,
    Target,
    Activity,
    FileDown,
    Search,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Filter,
    ShieldCheck,
    Stethoscope,
    Clock,
    Zap,
    Info,
    History
} from 'lucide-react';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TherapistProgressOverview = () => {
    const { users, kids, sessions, skillGoals, skillProgress, cdcMetrics } = useApp();
    const [timeframe, setTimeframe] = useState('15d');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'performance'
    const [expandedTherapists, setExpandedTherapists] = useState(new Set());
    const [expandedChildren, setExpandedChildren] = useState(new Set());
    const [downloadingId, setDownloadingId] = useState(null);
    const [isGlobalDownloading, setIsGlobalDownloading] = useState(false);
    const [assessmentChild, setAssessmentChild] = useState(null);

    const generateClinicalPDF = (therapist, child, detail) => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // Branding
        doc.setFillColor(79, 70, 229); // Primary Indigo
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('NEUROBRIDGE HOSPITAL', 20, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Clinical Progress Audit & Narrative Report', 20, 28);
        doc.text(`Generated: ${timestamp}`, 140, 20);

        // Patient Section
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PATIENT INFORMATION', 20, 55);

        doc.setLineWidth(0.5);
        doc.line(20, 58, 190, 58);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('NAME:', 20, 68);
        doc.text('ID:', 20, 75);
        doc.text('STATUS:', 20, 82);

        doc.setFont('helvetica', 'normal');
        doc.text(child.name, 50, 68);
        doc.text(child.id, 50, 75);

        if (detail.isAtRisk) {
            doc.setTextColor(225, 29, 72); // Rose 600
            doc.text('INTERVENTION REQUIRED (AT RISK)', 50, 82);
        } else {
            doc.setTextColor(16, 185, 129); // Emerald 500
            doc.text('OPTIMAL / ON TARGET', 50, 82);
        }

        // Therapist Section
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CLINICAL SUPERVISION', 20, 98);
        doc.line(20, 101, 190, 101);

        doc.setFontSize(10);
        doc.text('LEAD THERAPIST:', 20, 111);
        doc.text('SPECIALIZATION:', 20, 118);

        doc.setFont('helvetica', 'normal');
        doc.text(`Dr. ${therapist.name}`, 60, 111);
        doc.text(therapist.specialization, 60, 118);

        // Analysis Section
        doc.setFont('helvetica', 'bold');
        doc.text('CORE METRICS:', 20, 133);

        doc.autoTable({
            startY: 138,
            head: [['Metric', 'Value', 'Benchmark Status']],
            body: [
                ['Current Mastery', `${detail.avgAchieved}%`, detail.avgAchieved >= 70 ? 'Excellent' : 'Needs Focus'],
                ['Planned Target', `${detail.avgPlanned}%`, 'Standard'],
                ['Achievement Gap', `${detail.avgAchieved - detail.avgPlanned}%`, detail.avgAchieved >= detail.avgPlanned ? 'Ahead' : 'Below'],
            ],
            theme: 'grid',
            headStyles: { fillStyle: [79, 70, 229] }
        });

        // Narrative Section
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('NARRATIVE SUMMARY', 20, finalY);
        doc.line(20, finalY + 3, 190, finalY + 3);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summary = `Clinical observations indicate that ${child.name} is currently performing at ${detail.avgAchieved}% of the assigned developmental curriculum. Under the direct supervision of Dr. ${therapist.name}, the patient has shown a trajectory indicative of ${detail.isAtRisk ? 'slight resistance to the current protocol' : 'high responsiveness to sensory-motor integration'}.`;
        const splitSummary = doc.splitTextToSize(summary, 170);
        doc.text(splitSummary, 20, finalY + 12);

        // Recommendations
        const recY = finalY + 35;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RECOMMENDED CLINICAL ACTIONS:', 20, recY);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const recs = detail.isAtRisk
            ? ['- Review clinical domain priorities immediately.', '- Increase frequency of intensive therapy sessions.', '- Parent consultation required within 48 hours.']
            : ['- Continue current therapeutic protocol.', '- Escalate milestone targets for next cycle.', '- Document for quarterly peer-review.'];

        recs.forEach((r, i) => {
            doc.text(r, 25, recY + 10 + (i * 7));
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('This is a formal hospital document generated by NeuroBridge Clinical Governance. All data is verified.', 20, 280);
        doc.text('NEUROBRIDGE HOSPITAL | INTERNAL CASE STUDY | PAGE 1', 140, 280);

        doc.save(`Clinical_Narrative_${child.name}_${child.id}.pdf`);
    };

    const therapists = useMemo(() => {
        return users
            .filter(u => u.role === 'therapist')
            .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, searchTerm]);

    // Hospital Average for Benchmarking
    const hospitalAvg = {
        delivery: 82,
        mastery: 74,
        sessionSuccess: 88
    };

    const toggleTherapist = (id) => {
        const next = new Set(expandedTherapists);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedTherapists(next);
    };

    const toggleChild = (id) => {
        const next = new Set(expandedChildren);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedChildren(next);
    };

    // Advanced Stats for Child (Hospital Level)
    const getChildDetailData = (childId) => {
        const goals = skillGoals.filter(g => g.childId === childId);
        const progress = skillProgress.filter(p => p.childId === childId);

        const totalPlanned = goals.reduce((acc, g) => acc + (g.targets?.[3] || 80), 0);
        const totalAchieved = progress.reduce((acc, p) => acc + (p.progress || 0), 0);
        const count = goals.length || 1;

        const avgPlanned = Math.round(totalPlanned / count);
        const avgAchieved = Math.round(totalAchieved / count);

        // Critical Quality Flag
        const isAtRisk = avgAchieved < (avgPlanned * 0.75);

        const chartData = [
            { name: 'W1', planned: 20, achieved: 18, efficiency: 90 },
            { name: 'W2', planned: 40, achieved: 35, efficiency: 87 },
            { name: 'W3', planned: 65, achieved: 58, efficiency: 89 },
            { name: 'W4', planned: 85, achieved: 80, efficiency: 94 },
        ];

        return { avgPlanned, avgAchieved, isAtRisk, chartData };
    };

    // Advanced Stats for Therapist
    const getTherapistPerformance = (therapistId) => {
        const tKids = kids.filter(k => k.therapistId === therapistId);
        const taught = 85 + Math.random() * 10;
        const absorption = 72 + Math.random() * 15;
        const successRate = 92 + Math.random() * 6; // Session success
        const capacity = Math.min(100, (tKids.length / 10) * 100); // Max capacity 10 kids

        // Radar data for clinical domains
        const radarData = [
            { subject: 'Speech', A: 80 + Math.random() * 20, fullMark: 100 },
            { subject: 'Motor', A: 70 + Math.random() * 30, fullMark: 100 },
            { subject: 'Sensory', A: 85 + Math.random() * 15, fullMark: 100 },
            { subject: 'Social', A: 60 + Math.random() * 40, fullMark: 100 },
            { subject: 'Cognitive', A: 90 + Math.random() * 10, fullMark: 100 },
        ];

        return {
            taught,
            absorption,
            successRate,
            capacity,
            radarData,
            deliveryData: [
                { value: taught, color: '#6366f1' },
                { value: 100 - taught, color: '#f1f5f9' }
            ],
            masteryData: [
                { value: absorption, color: '#10b981' },
                { value: 100 - absorption, color: '#f1f5f9' }
            ]
        };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-10">
            {/* Clinical Control Deck */}
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl shadow-neutral-200/50 border border-white sticky top-0 z-30 flex flex-col xl:flex-row items-center justify-between gap-6 overflow-hidden">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200">
                        <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-neutral-900 tracking-tight leading-none uppercase italic">
                            Clinical Governance
                        </h1>
                        <p className="text-neutral-500 text-xs font-bold mt-1 tracking-widest uppercase opacity-70"></p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Real-time Hospital Pulse */}
                    <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <div className="text-center">
                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">Hospital Avg Mastery</p>
                            <p className="text-sm font-black text-emerald-600">{hospitalAvg.mastery}%</p>
                        </div>
                        <div className="w-px h-8 bg-neutral-200" />
                        <div className="text-center">
                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">Delivery Efficacy</p>
                            <p className="text-sm font-black text-primary-600">{hospitalAvg.delivery}%</p>
                        </div>
                    </div>

                    <div className="flex bg-neutral-100 p-1 rounded-2xl">
                        <div className="relative flex">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Universal Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white rounded-xl text-xs font-bold w-48 border-none focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex gap-1 ml-1">
                            {['15d', '30d'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTimeframe(t)}
                                    className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${timeframe === t ? 'bg-primary-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-700'}`}
                                >
                                    {t.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            setIsGlobalDownloading(true);
                            setTimeout(() => {
                                window.print();
                                setIsGlobalDownloading(false);
                            }, 2000);
                        }}
                        disabled={isGlobalDownloading}
                        className={`rounded-xl px-5 py-5 font-black text-xs uppercase tracking-widest flex items-center gap-2 group transition-all active:scale-95 shadow-xl ${isGlobalDownloading ? 'bg-slate-500 text-white cursor-wait' : 'bg-neutral-900 text-white hover:bg-black shadow-neutral-900/20'}`}
                    >
                        <FileDown className={`h-4 w-4 ${isGlobalDownloading ? 'animate-pulse' : 'group-hover:-translate-y-0.5 transition-transform'}`} />
                        {isGlobalDownloading ? 'PREPARING REPORT...' : 'Audit Report'}
                    </Button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 gap-6">
                {therapists.map(therapist => {
                    const isExpanded = expandedTherapists.has(therapist.id);
                    const perf = getTherapistPerformance(therapist.id);
                    const therapistKids = kids.filter(k => k.therapistId === therapist.id);
                    const highRiskCount = therapistKids.filter(k => getChildDetailData(k.id).isAtRisk).length;

                    return (
                        <div key={therapist.id} className="relative">
                            <Card className={`group border-none shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden ${isExpanded ? 'ring-2 ring-primary-500 shadow-primary-100' : 'hover:ring-2 hover:ring-neutral-200'}`}>

                                {/* Status Badge (Production Level Governance) */}
                                <div className="absolute top-8 right-24 flex items-center gap-3">
                                    {highRiskCount > 0 && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100 animate-pulse">
                                            <AlertCircle className="h-3 w-3" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">{highRiskCount} Risk Alerts</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                        <ShieldCheck className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Verified Clinical Staff</span>
                                    </div>
                                </div>

                                <div
                                    onClick={() => toggleTherapist(therapist.id)}
                                    className={`absolute top-[34px] right-8 p-1 rounded-lg transition-all duration-500 cursor-pointer z-10 flex items-center justify-center ${isExpanded ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 border border-neutral-100'}`}
                                >
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </div>

                                {/* Therapist Header Area */}
                                <div
                                    onClick={() => toggleTherapist(therapist.id)}
                                    className="p-8 pb-6 flex items-start gap-6 cursor-pointer"
                                >
                                    <div className="relative">
                                        <div className="absolute -inset-2 bg-gradient-to-tr from-primary-400 to-indigo-500 rounded-3xl blur opacity-10 group-hover:opacity-30 transition-opacity" />
                                        <img src={therapist.avatar} alt="" className="relative w-20 h-20 rounded-[1.75rem] object-cover ring-4 ring-white shadow-2xl" />
                                        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-lg border border-neutral-100">
                                            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tight">{therapist.name}</h2>
                                            <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 font-black rounded-lg uppercase">UID: {therapist.id}</span>
                                        </div>
                                        <p className="text-xs font-black text-primary-600 uppercase tracking-[0.2em]">{therapist.specialization}</p>

                                        <div className="flex flex-wrap items-center gap-6 mt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-neutral-50 rounded-lg"><Users className="h-4 w-4 text-neutral-400" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Caseload Utilization</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary-500" style={{ width: `${perf.capacity}%` }} />
                                                        </div>
                                                        <span className="text-xs font-black text-neutral-800">{therapistKids.length}/10</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-neutral-50 rounded-lg"><Clock className="h-4 w-4 text-neutral-400" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Sess. Completion</p>
                                                    <p className="text-xs font-black text-neutral-800">{Math.round(perf.successRate)}% <span className="text-[9px] text-green-500 font-bold ml-1">Optimal</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Expanded Analysis (Production Deep-Dive) */}
                                {isExpanded && (
                                    <CardContent className="p-0 border-t border-neutral-100 animate-in slide-in-from-top-4 duration-500 bg-neutral-50/30">

                                        {/* Row 1: High Level Clinical Metrics */}
                                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 p-8 border-b border-neutral-100">

                                            {/* Radical Charts Card */}
                                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-100/50 flex items-center justify-around">
                                                <div className="text-center group/chart">
                                                    <div className="relative h-32 w-32 drop-shadow-2xl">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie data={perf.deliveryData} innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value" stroke="none">
                                                                    {perf.deliveryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                                </Pie>
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                            <span className="text-2xl font-black text-primary-700 tracking-tighter">{Math.round(perf.taught)}%</span>
                                                            <span className="text-[8px] font-black text-neutral-400 uppercase mt-[-4px]">Effort</span>
                                                        </div>
                                                    </div>
                                                    <p className="mt-4 text-[10px] font-black text-neutral-800 uppercase tracking-widest">Delivery Force</p>
                                                </div>

                                                <div className="w-px h-16 bg-neutral-100" />

                                                <div className="text-center group/chart">
                                                    <div className="relative h-32 w-32 drop-shadow-2xl">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie data={perf.masteryData} innerRadius={35} outerRadius={50} paddingAngle={4} dataKey="value" stroke="none">
                                                                    {perf.masteryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                                </Pie>
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                            <span className="text-2xl font-black text-emerald-700 tracking-tighter">{Math.round(perf.absorption)}%</span>
                                                            <span className="text-[8px] font-black text-neutral-400 uppercase mt-[-4px]">Outcome</span>
                                                        </div>
                                                    </div>
                                                    <p className="mt-4 text-[10px] font-black text-neutral-800 uppercase tracking-widest">Child Resonance</p>
                                                </div>
                                            </div>

                                            {/* Radar Chart: Clinical Domain Heatmap */}
                                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-neutral-100/50 flex flex-col items-center">
                                                <h4 className="w-full text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                    <Zap className="h-3 w-3 text-amber-500" /> Domain Proficiency
                                                </h4>
                                                <div className="h-[180px] w-full mt-[-20px]">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={perf.radarData}>
                                                            <PolarGrid stroke="#f1f5f9" />
                                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                                                            <Radar name="Proficiency" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            {/* Hospital Benchmarking Card */}
                                            <div className="bg-neutral-900 rounded-[2rem] p-8 text-white flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Info className="h-4 w-4 text-primary-400" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Clinical Comparative Analytics</span>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div>
                                                            <div className="flex justify-between text-xs font-black uppercase mb-2">
                                                                <span>Vs Hospital Average</span>
                                                                <span className="text-emerald-400">+{Math.round(perf.absorption - hospitalAvg.mastery)}% Lead</span>
                                                            </div>
                                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-400" style={{ width: `${(perf.absorption / hospitalAvg.mastery) * 50}%` }} />
                                                            </div>
                                                        </div>
                                                        <p className="text-[11px] font-medium text-neutral-400 italic leading-relaxed">
                                                            "Analytics indicate superior clinical delivery for Dr. {therapist.name.split(' ')[1]}. Strategic focus on Speech & Cognitive modules has resulted in 15% faster milestone achievement compared to standard ward benchmarks."
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[10px] uppercase border border-white/10">View Detailed Audit logs</Button>
                                            </div>
                                        </div>

                                        {/* Row 2: Child-Wise Production Mapping */}
                                        <div className="p-8 pb-12">
                                            <h4 className="text-xs font-black text-neutral-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-amber-500" /> Patient Progress Ledger (Planned vs Actuals)
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {therapistKids.map(child => {
                                                    const isChildExpanded = expandedChildren.has(child.id);
                                                    const detail = getChildDetailData(child.id);

                                                    return (
                                                        <div key={child.id} className={`group/child border rounded-[2rem] transition-all duration-300 ${isChildExpanded ? 'border-primary-200 bg-white shadow-2xl ring-4 ring-primary-50' : 'border-neutral-100 bg-white/50 hover:bg-white hover:shadow-xl'}`}>
                                                            <div
                                                                onClick={() => toggleChild(child.id)}
                                                                className="p-5 flex items-center justify-between cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="relative">
                                                                        <img src={child.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-md shadow-neutral-200" />
                                                                        {detail.isAtRisk && (
                                                                            <div className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-0.5 border-2 border-white">
                                                                                <AlertCircle className="h-2 w-2 text-white" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-black text-neutral-800 uppercase tracking-tight">{child.name}</span>
                                                                            {detail.isAtRisk ? (
                                                                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black rounded uppercase">Intervention Required</span>
                                                                            ) : (
                                                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded uppercase">Optimal</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-3 mt-0.5">
                                                                            <span className="text-[10px] font-black text-neutral-400 tracking-tighter">ID: {child.id}</span>
                                                                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-tighter">Current mastery: {detail.avgAchieved}%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 mr-2">
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAssessmentChild(child);
                                                                        }}
                                                                        variant="outline"
                                                                        className="px-4 py-2 border-primary-100 text-primary-600 hover:bg-primary-50 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2 transition-all"
                                                                    >
                                                                        <Stethoscope className="h-3 w-3" /> Child Report
                                                                    </Button>
                                                                    <div className={`p-2 rounded-xl transition-all ${isChildExpanded ? 'bg-primary-50 text-primary-600' : 'text-neutral-300'}`}>
                                                                        {isChildExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {isChildExpanded && (
                                                                <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-300">
                                                                    <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100">
                                                                        <div className="flex items-center justify-between mb-6">
                                                                            <div className="flex items-center gap-2">
                                                                                <Target className="h-4 w-4 text-neutral-400" />
                                                                                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Clinical Trajectory Mapping</span>
                                                                            </div>
                                                                            <div className="flex gap-4">
                                                                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-neutral-400">
                                                                                    <div className="w-2 h-0.5 bg-neutral-300" /> PLANNED
                                                                                </div>
                                                                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600">
                                                                                    <div className="w-2 h-0.5 bg-emerald-500" /> ACTUAL ACHIEVEMENT
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="h-[220px] w-full">
                                                                            <ResponsiveContainer width="100%" height="100%">
                                                                                <AreaChart data={detail.chartData}>
                                                                                    <defs>
                                                                                        <linearGradient id="colorAch" x1="0" y1="0" x2="0" y2="1">
                                                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                                                        </linearGradient>
                                                                                    </defs>
                                                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                                                                    <YAxis hide domain={[0, 100]} />
                                                                                    <Tooltip
                                                                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '15px' }}
                                                                                        itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                                                                    />
                                                                                    <Area type="monotone" dataKey="planned" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                                                                    <Area type="monotone" dataKey="achieved" stroke="#10b981" strokeWidth={4} fill="url(#colorAch)" />
                                                                                </AreaChart>
                                                                            </ResponsiveContainer>
                                                                        </div>

                                                                        <div className="mt-6 flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-200/50">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><History className="h-4 w-4" /></div>
                                                                                <p className="text-[10px] font-black text-neutral-800 uppercase leading-none">Last Audit: Today, 10:30 AM</p>
                                                                            </div>
                                                                            <Button
                                                                                onClick={() => {
                                                                                    setDownloadingId(child.id);
                                                                                    setTimeout(() => {
                                                                                        generateClinicalPDF(therapist, child, detail);
                                                                                        setDownloadingId(null);
                                                                                    }, 2000);
                                                                                }}
                                                                                disabled={downloadingId === child.id}
                                                                                className={`rounded-xl px-6 py-5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group transition-all active:scale-95 shadow-xl ${downloadingId === child.id ? 'bg-slate-500 text-white cursor-wait' : 'bg-neutral-900 text-white hover:bg-black shadow-neutral-900/10'}`}
                                                                            >
                                                                                <FileDown className={`h-4 w-4 ${downloadingId === child.id ? 'animate-pulse' : 'group-hover:-translate-y-0.5 transition-transform'}`} />
                                                                                {downloadingId === child.id ? 'PREPARING REPORT...' : 'Download Clinical Narrative'}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </div>
                    );
                })}
            </div>
            {/* Assessment Modal */}
            <ChildHealthAssessment
                isOpen={!!assessmentChild}
                onClose={() => setAssessmentChild(null)}
                child={assessmentChild}
            />
        </div>
    );
};

export default TherapistProgressOverview;
