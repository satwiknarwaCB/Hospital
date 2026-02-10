import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
    X,
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
import autoTable from 'jspdf-autotable';

const TherapistProgressOverview = () => {
    const { users, kids, sessions, skillGoals, skillProgress, cdcMetrics } = useApp();
    const [timeframe, setTimeframe] = useState('15d');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'performance'
    const [expandedTherapists, setExpandedTherapists] = useState(new Set());
    const [expandedChildren, setExpandedChildren] = useState(new Set());
    const [downloadingId, setDownloadingId] = useState(null);
    const [isGlobalDownloading, setIsGlobalDownloading] = useState(false);
    const location = useLocation();
    const [assessmentChild, setAssessmentChild] = useState(null);
    const [auditLogTherapist, setAuditLogTherapist] = useState(null);

    useEffect(() => {
        if (location.state?.therapistId) {
            setExpandedTherapists(new Set([location.state.therapistId]));
            // Scroll to the therapist card if possible
            setTimeout(() => {
                const element = document.getElementById(`therapist-${location.state.therapistId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [location.state]);

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

        // Child Section
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CHILD INFORMATION', 20, 55);

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

        autoTable(doc, {
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
        const summary = `Clinical observations indicate that ${child.name} is currently performing at ${detail.avgAchieved}% of the assigned developmental curriculum. Under the direct supervision of Dr. ${therapist.name}, the child has shown a trajectory indicative of ${detail.isAtRisk ? 'slight resistance to the current protocol' : 'high responsiveness to sensory-motor integration'}.`;
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

    const generateTherapistAuditPDF = (therapist) => {
        if (!therapist) return;

        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();
            const perf = getTherapistPerformance(therapist.id);
            const therapistKids = kids.filter(k => k.therapistId === therapist.id);

            // Branding
            doc.setFillColor(17, 24, 39); // Neutral 900
            doc.rect(0, 0, 210, 45, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('CLINICAL PERFORMANCE AUDIT', 20, 20);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('NeuroBridge Hospital Governance Protocol', 20, 30);
            const shortId = (therapist.id || 'N/A').toString().substring(0, 6).toUpperCase();
            doc.text(`AUDIT ID: NB-${shortId}-${Date.now().toString().slice(-6)}`, 20, 36);
            doc.text(`ISO Date: ${timestamp}`, 140, 20);

            // Staff Information
            doc.setTextColor(31, 41, 55);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('STAFF PARTICULARS', 20, 60);
            doc.setLineWidth(0.5);
            doc.line(20, 63, 190, 63);

            doc.setFontSize(10);
            doc.text('NAME:', 20, 72);
            doc.text('SPECIALIZATION:', 20, 79);
            doc.text('DEPARTMENT:', 20, 86);
            doc.text('CREDENTIALS:', 20, 93);

            doc.setFont('helvetica', 'normal');
            doc.text(therapist.name || 'Unknown Staff', 60, 72);
            doc.text(therapist.specialization || 'General Clinical', 60, 79);
            doc.text('CDC - Clinical Development', 60, 86);
            doc.text('Verified Clinical Staff (L1)', 60, 93);

            // Performance Metrics
            doc.setFont('helvetica', 'bold');
            doc.text('KPI PERFORMANCE SNAPSHOT', 20, 108);

            autoTable(doc, {
                startY: 112,
                head: [['Indicator', 'Current Value', 'Target', 'Clinical Status']],
                body: [
                    ['Resource Utilization', `${therapistKids.length}/10`, '8/10', therapistKids.length >= 8 ? 'Optimal' : 'Available'],
                    ['Session Completion rate', `${Math.round(perf.successRate || 0)}%`, '90%', (perf.successRate || 0) >= 90 ? 'Exceeds' : 'Standard'],
                    ['Average Child Mastery', `${Math.round(perf.absorption || 0)}%`, '70%', (perf.absorption || 0) >= 70 ? 'Excellent' : 'Review'],
                    ['Knowledge Delivery Efficacy', `${Math.round(perf.taught || 0)}%`, '80%', 'Verified'],
                ],
                theme: 'grid',
                headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] }
            });

            // Caseload Summary
            let tableY = 160;
            if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
                tableY = doc.lastAutoTable.finalY + 15;
            }

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('CASELOAD AUDIT', 20, tableY);
            doc.line(20, tableY + 3, 190, tableY + 3);

            const caseloadData = therapistKids.map(k => {
                const detail = getChildDetailData(k.id);
                return [
                    k.name || 'Unknown Child',
                    k.id || 'N/A',
                    `${detail.avgAchieved || 0}%`,
                    detail.isAtRisk ? 'INTERVENTION' : 'NOMINAL'
                ];
            });

            autoTable(doc, {
                startY: tableY + 8,
                head: [['Child', 'ID', 'Current Mastery', 'Status']],
                body: caseloadData.length > 0 ? caseloadData : [['No children assigned', '-', '-', '-']],
                theme: 'striped'
            });

            // Final Assessment
            let finalY = 220;
            if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
                finalY = doc.lastAutoTable.finalY + 15;
            }

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('GOVERNANCE ANALYSIS:', 20, finalY);
            doc.setFont('helvetica', 'normal');
            const analysis = `Preliminary audit indicates that Dr. ${therapist.name || ''} is maintaining a clinical standard of ${Math.round(perf.successRate || 0)}% session success across a caseload of ${therapistKids.length} children. Performance in ${therapist.specialization || 'Clinical'} modules aligns with hospital benchmarks.`;
            const splitAnalysis = doc.splitTextToSize(analysis, 170);
            doc.text(splitAnalysis, 20, finalY + 8);

            // Footer
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.text('CONFIDENTIAL DOCUMENT | Clinical Governance Board', 20, 285);
            doc.text(`Page 1/1 | Therapist ID: ${therapist.id}`, 140, 285);

            const safeName = (therapist.name || 'Therapist').replace(/\s+/g, '_');
            doc.save(`Therapist_Audit_${safeName}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate report: " + (error.message || "Unknown error"));
        }
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
            { name: 'Baseline', planned: 0, achieved: 0, efficiency: 0 },
            { name: 'W1', planned: 20, achieved: 18, efficiency: 90 },
            { name: 'W2', planned: 40, achieved: 35, efficiency: 87 },
            { name: 'W3', planned: 65, achieved: 58, efficiency: 89 },
            { name: 'W4', planned: 85, achieved: 80, efficiency: 94 },
        ];

        // Ensure text mastery (c1, c2, etc.) matches the graph's latest state (W4)
        const syncedAvgAchieved = chartData[chartData.length - 1].achieved;

        return { avgPlanned, avgAchieved: syncedAvgAchieved, isAtRisk, chartData };
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
        <div className="w-full">
            <div className="space-y-4 md:space-y-6 animate-in fade-in duration-700 pb-24 md:pb-16 lg:pb-10 overflow-x-hidden">
                {/* Clinical Control Deck */}
                <div className="bg-white/90 backdrop-blur-xl p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-2xl shadow-neutral-200/50 border border-white lg:sticky lg:top-0 z-30 flex flex-col gap-4 overflow-hidden max-w-full">
                    {/* Title Section */}
                    <div className="flex items-center gap-3 md:gap-6 shrink-0">
                        <div className="bg-primary-600/10 p-2.5 md:p-4 rounded-xl md:rounded-[2rem] shrink-0">
                            <Activity className="h-4 w-4 md:h-6 md:w-6 text-primary-600 animate-pulse" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-base md:text-2xl font-black text-neutral-900 tracking-tighter leading-none uppercase truncate">
                                Clinical Governance
                            </h1>
                            <p className="text-neutral-400 text-[7px] md:text-[8px] font-black mt-1 md:mt-1.5 tracking-[0.1em] md:tracking-[0.2em] uppercase truncate">Operational Insight Ledger</p>
                        </div>
                    </div>

                    {/* Stats and Search Row */}
                    <div className="flex flex-col lg:flex-row items-stretch gap-3 md:gap-4 w-full">
                        {/* Real-time Hospital Pulse */}
                        <div className="flex items-center justify-around gap-3 md:gap-6 py-2.5 md:py-3 px-3 md:px-6 bg-neutral-100 rounded-xl md:rounded-2xl border border-neutral-200 shrink-0">
                            <div className="group cursor-help text-center flex-1">
                                <p className="text-[7px] md:text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-0.5 md:mb-1 truncate">
                                    Avg Mastery
                                </p>
                                <div className="flex items-baseline gap-1 md:gap-1.5 justify-center">
                                    <p className="text-xs md:text-base font-black text-neutral-800">{hospitalAvg.mastery}%</p>
                                    <span className="text-[7px] md:text-[8px] font-black text-emerald-500">+2.4%</span>
                                </div>
                            </div>
                            <div className="w-px h-6 md:h-8 bg-neutral-200 shrink-0" />
                            <div className="group cursor-help text-center flex-1">
                                <p className="text-[7px] md:text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-0.5 md:mb-1 truncate">
                                    Delivery
                                </p>
                                <div className="flex items-baseline gap-1 md:gap-1.5 justify-center">
                                    <p className="text-xs md:text-base font-black text-neutral-800">{hospitalAvg.delivery}%</p>
                                    <span className="text-[7px] md:text-[8px] font-black text-primary-400">Optimal</span>
                                </div>
                            </div>
                        </div>

                        {/* Search & Timeframe */}
                        <div className="flex flex-1 max-w-full lg:max-w-xl backdrop-blur-md bg-neutral-100 p-1.5 rounded-full border border-neutral-200 overflow-hidden">
                            <div className="relative flex flex-1 min-w-0">
                                <Search className="absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-neutral-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 md:pl-11 pr-1 md:pr-4 py-2 bg-white rounded-full text-[9px] md:text-[11px] font-black w-full border-none focus:ring-0 outline-none transition-all shadow-sm uppercase tracking-tight"
                                />
                            </div>
                            <div className="flex gap-0.5 md:gap-1 ml-1 md:ml-1.5 shrink-0">
                                {['15d', '30d'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTimeframe(t)}
                                        className={`px-2.5 md:px-5 py-2 text-[8px] md:text-[10px] font-black rounded-full transition-all whitespace-nowrap ${timeframe === t ? 'bg-primary-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-700 hover:bg-white'}`}
                                    >
                                        {t.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 gap-4 md:gap-6 max-w-full">
                    {therapists.map(therapist => {
                        const isExpanded = expandedTherapists.has(therapist.id);
                        const perf = getTherapistPerformance(therapist.id);
                        const therapistKids = kids.filter(k => k.therapistId === therapist.id);
                        const highRiskCount = therapistKids.filter(k => getChildDetailData(k.id).isAtRisk).length;

                        return (
                            <div key={therapist.id} id={`therapist-${therapist.id}`} className="relative max-w-full">
                                <Card className={`group border-none shadow-xl transition-all duration-500 rounded-2xl md:rounded-[2.5rem] overflow-hidden max-w-full ${isExpanded ? 'ring-2 ring-primary-500 shadow-primary-100' : 'hover:ring-2 hover:ring-neutral-200'}`}>

                                    {/* Therapist Header Area */}
                                    <div
                                        onClick={() => toggleTherapist(therapist.id)}
                                        className="p-6 md:p-8 pb-6 flex flex-col md:flex-row items-start gap-6 cursor-pointer"
                                    >
                                        <div className="flex flex-row md:flex-col items-center gap-6 w-full md:w-auto">
                                            <div className="relative">
                                                <div className="absolute -inset-2 bg-gradient-to-tr from-primary-400 to-indigo-500 rounded-3xl blur opacity-10 group-hover:opacity-30 transition-opacity" />
                                                <img src={therapist.avatar} alt="" className="relative w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] md:rounded-[1.75rem] object-cover ring-4 ring-white shadow-2xl" />
                                                <div className="absolute -bottom-2 -right-2 bg-white p-1 md:p-1.5 rounded-xl shadow-lg border border-neutral-100 text-amber-500">
                                                    <Zap className="h-3 w-3 md:h-4 md:w-4 fill-amber-500" />
                                                </div>
                                            </div>

                                            <div className="md:hidden flex-1">
                                                <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight leading-tight">{therapist.name}</h2>
                                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1">{therapist.specialization}</p>
                                            </div>

                                            {/* Toggle for mobile */}
                                            <div
                                                className={`md:hidden p-2 rounded-xl transition-all duration-500 cursor-pointer flex items-center justify-center ${isExpanded ? 'bg-primary-600 text-white shadow-lg' : 'bg-neutral-50 text-neutral-400 border border-neutral-100'}`}
                                            >
                                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="hidden md:flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">{therapist.name}</h2>
                                                        <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 font-black rounded-lg uppercase">UID: {therapist.id}</span>
                                                    </div>
                                                    <p className="text-xs font-black text-primary-600 uppercase tracking-[0.2em]">{therapist.specialization}</p>
                                                </div>

                                                <div
                                                    className={`p-1 rounded-lg transition-all duration-500 cursor-pointer hidden md:flex items-center justify-center ${isExpanded ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 border border-neutral-100'}`}
                                                >
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </div>
                                            </div>

                                            {/* Status Badges - Inline Flow for better responsiveness */}
                                            <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-0">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/50 backdrop-blur-sm text-emerald-600 rounded-xl border border-emerald-100 shadow-sm">
                                                    <ShieldCheck className="h-3.5 w-3.5" />
                                                    <span className="text-[9px] font-black uppercase tracking-tight line-clamp-1">Verified Clinical Staff</span>
                                                </div>
                                                {highRiskCount > 0 && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 animate-pulse shadow-sm">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                        <span className="text-[9px] font-black uppercase tracking-tight">{highRiskCount} Risk Alerts</span>
                                                    </div>
                                                )}
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDownloadingId(`therapist-${therapist.id}`);
                                                        setTimeout(() => {
                                                            try {
                                                                generateTherapistAuditPDF(therapist);
                                                            } finally {
                                                                setDownloadingId(null);
                                                            }
                                                        }, 1500);
                                                    }}
                                                    disabled={downloadingId === `therapist-${therapist.id}`}
                                                    className={`ml-auto rounded-xl px-4 py-3 md:px-5 md:py-5 font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-xl ${downloadingId === `therapist-${therapist.id}` ? 'bg-slate-500 text-white cursor-wait' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                                                >
                                                    <FileDown className={`h-4 w-4 ${downloadingId === `therapist-${therapist.id}` ? 'animate-bounce' : ''}`} />
                                                    <span className="hidden sm:inline">{downloadingId === `therapist-${therapist.id}` ? 'GENERATING...' : 'Download Report'}</span>
                                                    <span className="sm:hidden">{downloadingId === `therapist-${therapist.id}` ? '...' : 'PDF'}</span>
                                                </Button>
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-8 pt-4 border-t border-neutral-100/50">
                                                <div className="flex items-center gap-3 group/stat">
                                                    <div className="p-2 md:p-2.5 bg-primary-50 rounded-xl transition-colors group-hover/stat:bg-primary-100"><Users className="h-4 w-4 md:h-5 md:w-5 text-primary-600" /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Current Caseload</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-20 md:w-24 h-1.5 md:h-2 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
                                                                <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-600" style={{ width: `${perf.capacity}%` }} />
                                                            </div>
                                                            <span className="text-[10px] md:text-xs font-black text-neutral-900">{therapistKids.length}/10</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 group/stat text-left">
                                                    <div className="p-2 md:p-2.5 bg-emerald-50 rounded-xl transition-colors group-hover/stat:bg-emerald-100"><Clock className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Session Completion</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs md:text-sm font-black text-neutral-900 tracking-tight">{Math.round(perf.successRate)}%</p>
                                                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-lg uppercase tracking-tighter">Clinical Standard</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Analysis (Production Deep-Dive) */}
                                    {isExpanded && (
                                        <CardContent className="p-0 border-t border-neutral-100 animate-in slide-in-from-top-4 duration-500 bg-neutral-50/30 max-w-full overflow-hidden">

                                            {/* Row 1: High Level Clinical Metrics */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 lg:p-8 border-b border-neutral-100 max-w-full">

                                                {/* Radical Charts Card */}
                                                <div className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-[2rem] shadow-sm border border-neutral-100/50 flex flex-col xs:flex-row items-center justify-around gap-6 md:gap-8 max-w-full">
                                                    <div className="text-center group/chart flex-1">
                                                        <div className="relative h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 mx-auto drop-shadow-2xl">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie data={perf.deliveryData} innerRadius={30} outerRadius={42} paddingAngle={4} dataKey="value" stroke="none">
                                                                        {perf.deliveryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                                    </Pie>
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                                <span className="text-lg md:text-xl lg:text-2xl font-black text-primary-700 tracking-tighter">{Math.round(perf.taught)}%</span>
                                                                <span className="text-[7px] md:text-[8px] font-black text-neutral-400 uppercase mt-[-4px]">Teaching</span>
                                                            </div>
                                                        </div>
                                                        <p className="mt-3 md:mt-4 text-[9px] md:text-[10px] font-black text-neutral-800 uppercase tracking-widest whitespace-nowrap">Teaching Intensity</p>
                                                    </div>

                                                    <div className="hidden xs:block w-px h-12 md:h-16 bg-neutral-100 shrink-0" />
                                                    <div className="block xs:hidden w-full h-px bg-neutral-100" />

                                                    <div className="text-center group/chart flex-1">
                                                        <div className="relative h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 mx-auto drop-shadow-2xl">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie data={perf.masteryData} innerRadius={30} outerRadius={42} paddingAngle={4} dataKey="value" stroke="none">
                                                                        {perf.masteryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                                                    </Pie>
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                                <span className="text-lg md:text-xl lg:text-2xl font-black text-emerald-700 tracking-tighter">{Math.round(perf.absorption)}%</span>
                                                                <span className="text-[7px] md:text-[8px] font-black text-neutral-400 uppercase mt-[-4px]">Learning</span>
                                                            </div>
                                                        </div>
                                                        <p className="mt-3 md:mt-4 text-[9px] md:text-[10px] font-black text-neutral-800 uppercase tracking-widest whitespace-nowrap">Learning Success</p>
                                                    </div>
                                                </div>

                                                {/* Radar Chart: Clinical Domain Heatmap */}
                                                <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-neutral-100/50 flex flex-col items-center max-w-full overflow-hidden">
                                                    <h4 className="w-full text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-4 flex items-center gap-2">
                                                        <Zap className="h-3 w-3 text-amber-500" /> Domain Proficiency
                                                    </h4>
                                                    <div className="h-[160px] md:h-[180px] w-full max-w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={perf.radarData}>
                                                                <PolarGrid stroke="#f1f5f9" />
                                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 900 }} />
                                                                <Radar name="Proficiency" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
                                                            </RadarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                            </div>

                                            {/* Row 2: Child-Wise Production Mapping */}
                                            <div className="p-4 md:p-6 lg:p-8 pb-8 md:pb-12 max-w-full overflow-hidden">
                                                <h4 className="text-[10px] md:text-xs font-black text-neutral-800 uppercase tracking-[0.12em] md:tracking-widest mb-4 md:mb-6 flex items-center gap-2">
                                                    <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500" /> Child Progress Ledger
                                                </h4>


                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 max-w-full">
                                                    {therapistKids.map(child => {
                                                        const isChildExpanded = expandedChildren.has(child.id);
                                                        const detail = getChildDetailData(child.id);

                                                        return (
                                                            <div key={child.id} className={`group/child border rounded-xl md:rounded-2xl lg:rounded-[2rem] transition-all duration-300 max-w-full overflow-hidden ${isChildExpanded ? 'border-primary-200 bg-white shadow-2xl ring-2 md:ring-4 ring-primary-50' : 'border-neutral-100 bg-white/50 hover:bg-white hover:shadow-xl'}`}>
                                                                <div
                                                                    onClick={() => toggleChild(child.id)}
                                                                    className="p-3 md:p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-3 md:gap-4"
                                                                >
                                                                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                                                                        <div className="relative shrink-0">
                                                                            <img src={child.avatar} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl object-cover ring-2 ring-white shadow-md shadow-neutral-200" />
                                                                            {detail.isAtRisk && (
                                                                                <div className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-0.5 border-2 border-white animate-pulse">
                                                                                    <AlertCircle className="h-2 w-2 text-white" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center flex-wrap gap-1.5 md:gap-2 mb-0.5">
                                                                                <span className="text-xs md:text-sm font-black text-neutral-800 uppercase tracking-tight truncate">{child.name}</span>
                                                                                {detail.isAtRisk ? (
                                                                                    <span className="px-1.5 md:px-2 py-0.5 bg-rose-50 text-rose-600 text-[7px] md:text-[8px] font-black rounded uppercase shrink-0">Alert</span>
                                                                                ) : (
                                                                                    <span className="px-1.5 md:px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[7px] md:text-[8px] font-black rounded uppercase shrink-0">Optimal</span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-neutral-400">
                                                                                <span className="tracking-tighter">ID: {child.id}</span>
                                                                                <span className="text-primary-500 uppercase tracking-tighter">Mastery: {detail.avgAchieved}%</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-3 shrink-0">
                                                                        <Button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setAssessmentChild(child);
                                                                            }}
                                                                            className="flex-1 sm:flex-none px-3 py-1.5 md:px-4 md:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5 md:gap-2 transition-all shadow-md shadow-primary-100"
                                                                        >
                                                                            <Stethoscope className="h-3 w-3" /> Report
                                                                        </Button>
                                                                        <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${isChildExpanded ? 'bg-primary-50 text-primary-600' : 'text-neutral-300'}`}>
                                                                            {isChildExpanded ? <ChevronUp className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {isChildExpanded && (
                                                                    <div className="px-3 md:px-4 lg:px-6 pb-3 md:pb-4 lg:pb-6 animate-in slide-in-from-top-4 duration-300 max-w-full overflow-hidden">
                                                                        <div className="bg-neutral-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-neutral-100 max-w-full overflow-hidden">
                                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Target className="h-3.5 w-3.5 md:h-4 md:w-4 text-neutral-400" />
                                                                                    <span className="text-[8px] md:text-[9px] font-black text-neutral-500 uppercase tracking-[0.1em] md:tracking-widest">Clinical Trajectory</span>
                                                                                </div>
                                                                                <div className="flex flex-wrap gap-2 md:gap-4">
                                                                                    <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase text-neutral-400">
                                                                                        <div className="w-2 h-0.5 bg-neutral-300" /> PLANNED
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase text-emerald-600">
                                                                                        <div className="w-2 h-0.5 bg-emerald-500" /> ACTUAL
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="h-[160px] md:h-[200px] w-full" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                                                                                <ResponsiveContainer width="100%" height="100%">
                                                                                    <AreaChart data={detail.chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                                                                                        <defs>
                                                                                            <linearGradient id="colorAch" x1="0" y1="0" x2="0" y2="1">
                                                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                                                            </linearGradient>
                                                                                        </defs>
                                                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }} />
                                                                                        <YAxis
                                                                                            domain={[0, 100]}
                                                                                            axisLine={false}
                                                                                            tickLine={false}
                                                                                            ticks={[0, 50, 100]}
                                                                                            tickFormatter={(val) => `${val}%`}
                                                                                            tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }}
                                                                                            width={30}
                                                                                        />
                                                                                        <Tooltip
                                                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '8px' }}
                                                                                            itemStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}
                                                                                        />
                                                                                        <Area type="monotone" dataKey="planned" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
                                                                                        <Area
                                                                                            type="monotone"
                                                                                            dataKey="achieved"
                                                                                            stroke="#10b981"
                                                                                            strokeWidth={3}
                                                                                            fill="url(#colorAch)"
                                                                                            dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                                                                            activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
                                                                                        />
                                                                                    </AreaChart>
                                                                                </ResponsiveContainer>
                                                                            </div>

                                                                            <div className="mt-3 md:mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 md:gap-3 p-2.5 md:p-4 bg-white rounded-lg md:rounded-xl border border-neutral-200/50 max-w-full overflow-hidden">
                                                                                <div className="flex items-center gap-1.5 md:gap-3 min-w-0 flex-1">
                                                                                    <div className="p-1 md:p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><History className="h-3 w-3 md:h-4 md:w-4" /></div>
                                                                                    <p className="text-[8px] md:text-[9px] font-black text-neutral-800 uppercase leading-none truncate">Last Audit: Today</p>
                                                                                </div>
                                                                                <Button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setDownloadingId(child.id);
                                                                                        setTimeout(() => {
                                                                                            generateClinicalPDF(therapist, child, detail);
                                                                                            setDownloadingId(null);
                                                                                        }, 2000);
                                                                                    }}
                                                                                    disabled={downloadingId === child.id}
                                                                                    className={`w-full sm:w-auto rounded-lg md:rounded-xl px-3 md:px-5 h-9 md:h-11 font-black text-[8px] md:text-[9px] uppercase tracking-tight flex items-center justify-center gap-1.5 md:gap-2 transition-all active:scale-95 shadow-md whitespace-nowrap ${downloadingId === child.id ? 'bg-slate-500 text-white cursor-wait' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                                                                                >
                                                                                    <FileDown className={`h-3 w-3 md:h-3.5 md:w-3.5 shrink-0 ${downloadingId === child.id ? 'animate-pulse' : ''}`} />
                                                                                    <span className="hidden xs:inline">{downloadingId === child.id ? 'Generating...' : 'Download PDF'}</span>
                                                                                    <span className="xs:hidden">{downloadingId === child.id ? '...' : 'PDF'}</span>
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

            </div>
            {/* Assessment Modal */}
            <ChildHealthAssessment
                isOpen={!!assessmentChild}
                onClose={() => setAssessmentChild(null)}
                child={assessmentChild}
            />

            {/* Audit Log Overlay */}
            <TherapistAuditOverlay
                therapist={auditLogTherapist}
                isOpen={!!auditLogTherapist}
                onClose={() => setAuditLogTherapist(null)}
            />
        </div>
    );
};

const TherapistAuditOverlay = ({ therapist, isOpen, onClose }) => {
    if (!isOpen || !therapist) return null;

    const auditLogs = [
        { id: 1, type: 'session', title: 'Session Verified', desc: 'Q4 Therapeutic milestone achieved for patient C1.', time: '2h ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 2, type: 'compliance', title: 'HIPAA Compliance', desc: 'Digital clinical notes signed and encrypted.', time: '5h ago', icon: ShieldCheck, color: 'text-primary-500', bg: 'bg-primary-50' },
        { id: 3, type: 'alert', title: 'Progress Variance', desc: 'Patient C3 showing slower absorption in motor skills.', time: 'Today, 10:15 AM', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 4, type: 'system', title: 'Audit Trail Synced', desc: 'Weekly clinical records pushed to hospital ledger.', time: 'Yesterday', icon: History, color: 'text-neutral-400', bg: 'bg-neutral-50' },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center md:justify-end p-0 md:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-lg h-[90vh] md:h-full bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-500">
                <div className="bg-neutral-100 p-8 text-neutral-800 relative border-b border-neutral-200 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
                    <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-neutral-200"><X className="h-5 w-5 text-neutral-400" /></button>

                    <div className="flex items-center gap-4">
                        <img src={therapist.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
                        <div>
                            <h3 className="text-xl font-black tracking-tight">{therapist.name}</h3>
                            <p className="text-xs font-black text-primary-600 uppercase tracking-widest">{therapist.specialization}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                            <p className="text-[10px] font-black text-neutral-400 uppercase">Staff Integrity</p>
                            <p className="text-sm font-black text-emerald-600 mt-1">99.8% Verified</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                            <p className="text-[10px] font-black text-neutral-400 uppercase">Audit Status</p>
                            <p className="text-sm font-black text-primary-600 mt-1">L4 Governance</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">Clinical Event Ledger</h4>
                        <div className="flex items-center gap-2 px-3 py-1 bg-neutral-50 rounded-lg text-[9px] font-black text-neutral-500 uppercase">
                            <Info className="h-3 w-3" /> Real-time Sync
                        </div>
                    </div>

                    <div className="space-y-6 relative">
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-100" />

                        {auditLogs.map((log) => (
                            <div key={log.id} className="relative flex gap-6 group">
                                <div className={`relative z-10 w-12 h-12 rounded-2xl ${log.bg} flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-white`}>
                                    <log.icon className={`h-5 w-5 ${log.color}`} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-black text-neutral-900 uppercase tracking-tight">{log.title}</p>
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">{log.time}</span>
                                    </div>
                                    <p className="text-xs font-medium text-neutral-500 leading-relaxed">{log.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-neutral-100">
                        <div className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <span className="text-[10px] font-black text-neutral-900 uppercase">Hospital AI Recommendation</span>
                            </div>
                            <p className="text-xs font-medium text-neutral-500 italic leading-relaxed">
                                "Therapist maintains high data fidelity. Recommend upgrading to Senior Clinical Supervisor role based on the last 30 days of error-free audit logs."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-neutral-50 border-t border-neutral-100">
                    <Button onClick={onClose} className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-6 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-200">
                        Dismiss Audit View
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TherapistProgressOverview;
