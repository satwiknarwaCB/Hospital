// ============================================================
// NeuroBridge™ - Child Progress Tracking Module
// Parent Portal - Daily, Weekly, & Monthly Insights
// ============================================================

import React, { useState, useMemo } from 'react';
import {
    Calendar,
    TrendingUp,
    Target,
    ChevronRight,
    Award,
    Clock,
    CheckCircle2,
    AlertCircle,
    Activity,
    Download,
    MessageCircle,
    Utensils,
    Eye,
    ListChecks,
    Shirt,
    UserCheck,
    Mic,
    List,
    GlassWater,
    Users,
    ArrowUpCircle,
    Plus,
    PlusCircle,
    Trash2,
    X,
    Save,
    Edit3,
    Heart,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// ============================================================
// Constants & Utilities
// ============================================================

const IconMap = {
    spoon: Utensils,
    utensils: Utensils,
    cup: GlassWater,
    eye: Eye,
    list: List,
    'list-ordered': ListChecks,
    shirt: Shirt,
    clock: Clock,
    mic: Mic,
    users: Users
};

const StatusConfig = {
    'Achieved': { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', dot: 'bg-green-500' },
    'In Progress': { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', dot: 'bg-yellow-500' },
    'Not Started': { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500' }
};

const StatusBadge = ({ status }) => {
    const config = StatusConfig[status] || StatusConfig['Not Started'];
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${config.bg} ${config.color} ${config.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            <span className="text-xs font-semibold">{status}</span>
        </div>
    );
};

const ProgressBar = ({ progress, status }) => {
    const config = StatusConfig[status] || StatusConfig['Not Started'];
    return (
        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div
                className={`h-full transition-all duration-1000 ${config.dot}`}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

// ============================================================
// Update Modal Component
// ============================================================
const UpdateProgressModal = ({ skill, onClose, onSave, role }) => {
    const [progress, setProgress] = useState(skill.progress);
    const [status, setStatus] = useState(skill.status);
    const [note, setNote] = useState(role === 'parent' ? (skill.parentNote || '') : (skill.therapistNotes || ''));

    const handleSubmit = (e) => {
        e.preventDefault();
        const updates = {
            progress: Number(progress),
            status,
            [role === 'parent' ? 'parentNote' : 'therapistNotes']: note,
            updatedByRole: role
        };
        onSave(skill.id, updates);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-xl">
                            <Edit3 className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-neutral-800">Update Mastery</h3>
                            <p className="text-xs text-neutral-500">{skill.skillName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <X className="h-5 w-5 text-neutral-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-neutral-700">Current Status</label>
                        <div className="flex p-1 bg-neutral-100 rounded-xl gap-1">
                            {['Not Started', 'In Progress', 'Achieved'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStatus(s)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${status === s
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-neutral-700">Mastery Level</label>
                            <span className="text-2xl font-black text-primary-600">{progress}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={(e) => setProgress(e.target.value)}
                            className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            <span>Learner</span>
                            <span>Expert</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-neutral-700">
                            {role === 'parent' ? 'Parent Observation (Inform Therapist)' : 'Therapist Clinical Notes'}
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={role === 'parent' ? "Example: Child held spoon for 2 mins at dinner today..." : "Clinical observations for today's session..."}
                            className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none min-h-[100px]"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl py-6 font-bold">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl py-6 font-bold gap-2">
                            <Save className="h-4 w-4" />
                            {role === 'parent' ? 'Share with Therapist' : 'Save Update'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================
// Daily View Component
// ============================================================
const DailyProgressView = ({ records, onUpdate, role }) => {
    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-neutral-800">Growth Tracking 📈</h3>
                    <p className="text-sm text-neutral-500">Collaborative updates from both Home & Center</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {records.map((record) => {
                    const Icon = IconMap[record.icon] || Activity;
                    return (
                        <Card key={record.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ring-1 ring-neutral-100 bg-white">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="p-6 flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-primary-50 rounded-2xl">
                                                <Icon className="h-6 w-6 text-primary-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-neutral-800 text-lg tracking-tight">{record.skillName}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <StatusBadge status={record.status} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{record.category}</p>
                                                    {record.updatedByRole && (
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${record.updatedByRole === 'parent' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            Updated by {record.updatedByRole}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                                                <p className="text-[10px] font-black text-neutral-400 uppercase mb-2 tracking-widest">Therapist Notes</p>
                                                <p className="text-sm text-neutral-700 flex items-start gap-2">
                                                    <ShieldCheck className="h-4 w-4 mt-0.5 text-primary-500 flex-shrink-0" />
                                                    <span className="font-medium">"{record.therapistNotes}"</span>
                                                </p>
                                            </div>

                                            {record.parentNote && (
                                                <div className="bg-pink-50/30 rounded-2xl p-4 border border-pink-100/50">
                                                    <p className="text-[10px] font-black text-pink-400 uppercase mb-2 tracking-widest">Home Observation</p>
                                                    <p className="text-sm text-neutral-700 flex items-start gap-2">
                                                        <Heart className="h-4 w-4 mt-0.5 text-pink-500 flex-shrink-0" />
                                                        <span className="italic">"{record.parentNote}"</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 flex items-center justify-between border-t border-neutral-50 pt-4">
                                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-bold uppercase tracking-widest">
                                                <Clock className="h-3.5 w-3.5" />
                                                Updated {record.lastUpdated}
                                            </div>
                                            <Button
                                                onClick={() => onUpdate(record)}
                                                variant="ghost"
                                                className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl font-bold h-9 px-4 gap-2 border border-primary-100/50"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                                Log Progress
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-50/50 md:w-40 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-neutral-100">
                                        <div className="text-4xl font-black text-primary-600 mb-1">{record.progress}%</div>
                                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">Mastery</div>
                                        <div className="w-full space-y-2">
                                            <ProgressBar progress={record.progress} status={record.status} />
                                            <div className="flex justify-between text-[9px] font-black text-neutral-400">
                                                <span>0</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================
// Weekly View Component
// ============================================================
const WeeklyProgressView = ({ records }) => {
    // Analytics for the week
    const improvedCount = records.filter(r => r.history?.length > 1 && r.history[0].progress > r.history[1].progress).length;
    const avgProgress = Math.round(records.reduce((a, b) => a + b.progress, 0) / (records.length || 1));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary-500 to-primary-600 border-none text-white shadow-lg">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <Activity className="h-6 w-6 text-primary-100" />
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                        <p className="text-4xl font-black mb-1">{records.length}</p>
                        <p className="text-sm font-medium text-primary-50">Skills Practiced This Week</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-none text-white shadow-lg">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <ArrowUpCircle className="h-6 w-6 text-green-100" />
                            <span className="text-[10px) font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Growth</span>
                        </div>
                        <p className="text-4xl font-black mb-1">{improvedCount}</p>
                        <p className="text-sm font-medium text-green-50">Skills Showing Improvement</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 border-none text-white shadow-lg">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="h-6 w-6 text-indigo-100" />
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Score</span>
                        </div>
                        <p className="text-4xl font-black mb-1">{avgProgress}%</p>
                        <p className="text-sm font-medium text-indigo-50">Overall Weekly Progress</p>
                    </CardContent>
                </Card>
            </div>

            <section>
                <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary-500" />
                    Growth Comparison
                </h3>
                <div className="space-y-3">
                    {records.map(record => {
                        const start = record.history?.[record.history.length - 1]?.progress || 0;
                        const growth = record.progress - start;
                        return (
                            <Card key={record.id} className="border-none ring-1 ring-neutral-100 shadow-sm">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-neutral-800 mb-2">{record.skillName}</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                                                    <span>Start: {start}%</span>
                                                    <span>Now: {record.progress}%</span>
                                                </div>
                                                <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                    <div className="absolute inset-0 bg-primary-100" style={{ width: `${start}%` }} />
                                                    <div className="absolute inset-0 bg-primary-500 transition-all duration-1000" style={{ width: `${record.progress}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-6 flex flex-col items-center">
                                        <div className={`text-xl font-black ${growth > 0 ? 'text-green-500' : 'text-neutral-400'}`}>
                                            {growth > 0 ? `+${growth}%` : '0%'}
                                        </div>
                                        <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Growth</div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

            <Card className="bg-neutral-50 border-none ring-1 ring-neutral-200">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-neutral-800">
                        <MessageCircle className="h-5 w-5 text-primary-500" />
                        Weekly Therapist Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-neutral-600 leading-relaxed italic">
                        "Aarav has shown remarkable progress in his adaptive skills this week. We have successfully achieved one-step instructions and eye contact goals. Focus for next week will shift towards two-step instructions and eating with more independence. Home practice for buttoning is recommended."
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

// ============================================================
// Monthly View Component
// ============================================================
const MonthlyProgressView = ({ records }) => {
    const achieved = records.filter(r => r.status === 'Achieved');
    const inProgress = records.filter(r => r.status === 'In Progress');

    return (
        <div className="space-y-6">
            <div className="bg-green-50/50 rounded-3xl p-6 border border-green-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-green-800">Monthly Milestones 🌟</h3>
                        <p className="text-green-600 font-medium">You've mastered {achieved.length} new functional skills this month.</p>
                    </div>
                    <Button variant="outline" className="bg-white border-green-200 text-green-700 hover:bg-green-50 font-bold gap-2">
                        <Download className="h-4 w-4" />
                        Download Report
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achieved.map(skill => (
                        <div key={skill.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-green-50">
                            <div className="p-2.5 bg-green-50 rounded-full">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-neutral-800">{skill.skillName}</h4>
                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Achieved on {new Date(skill.lastUpdated).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <section>
                <h3 className="text-lg font-bold text-neutral-800 mb-4">Continuing Development</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inProgress.map(skill => (
                        <Card key={skill.id} className="border-none ring-1 ring-neutral-100 shadow-sm overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-neutral-800">{skill.skillName}</h4>
                                    <span className="text-sm font-black text-primary-600">{skill.progress}%</span>
                                </div>
                                <ProgressBar progress={skill.progress} status={skill.status} />
                                <p className="mt-3 text-[11px] font-bold text-neutral-400 capitalize bg-neutral-50 w-fit px-2 py-0.5 rounded-full">
                                    Target Level: 100%
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <Card className="border-none ring-1 ring-primary-100 bg-primary-50/30 overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-primary-900 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary-600" />
                        Therapist Recommendations for Next Month
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="h-6 w-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                        <div>
                            <p className="font-bold text-neutral-800 text-sm">Advanced Fine Motor Control</p>
                            <p className="text-xs text-neutral-600 mt-1">Focusing on smaller buttons and complex kitchen utensil handling.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-6 w-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                        <div>
                            <p className="font-bold text-neutral-800 text-sm">Multi-step Sequencing</p>
                            <p className="text-xs text-neutral-600 mt-1">Introducing 3-step commands and memory-based tasks.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ============================================================
// Main Layout & Tab Handler
// ============================================================
const ChildProgressTracking = ({ forceChildId = null, role = 'parent' }) => {
    const { currentUser, kids, getChildProgress, updateSkillProgress } = useApp();
    const [activeTab, setActiveTab] = useState('daily'); // daily, weekly, monthly
    const [selectedSkillForUpdate, setSelectedSkillForUpdate] = useState(null);

    const child = kids.find(k => k.id === (forceChildId || currentUser?.childId));
    const records = getChildProgress(child?.id || 'c1')
        .filter(r => !r.isGoalOnly && !r.skillId?.startsWith('custom-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (!child) return null;

    const TabButton = ({ value, label }) => (
        <button
            onClick={() => setActiveTab(value)}
            className={`flex-1 py-3 px-4 text-sm font-bold transition-all duration-300 ${activeTab === value
                ? 'bg-white text-primary-600 shadow-sm rounded-xl'
                : 'text-neutral-400 hover:text-neutral-600'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="pb-12 space-y-8">

            {/* Tab Navigation & Actions */}
            <div className="flex flex-col md:flex-row gap-4">
                <nav className="flex-1 p-1.5 bg-neutral-100/80 backdrop-blur rounded-2xl flex gap-1 sticky top-0 z-10 shadow-sm border border-neutral-200/50">
                    <TabButton value="daily" label="Daily" />
                    <TabButton value="weekly" label="Weekly" />
                    <TabButton value="monthly" label="Monthly" />
                </nav>
            </div>

            {/* View Transitions */}
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                {activeTab === 'daily' && (
                    <DailyProgressView
                        records={records}
                        role={role}
                        onUpdate={(skill) => setSelectedSkillForUpdate(skill)}
                    />
                )}
                {activeTab === 'weekly' && <WeeklyProgressView records={records} />}
                {activeTab === 'monthly' && <MonthlyProgressView records={records} />}
            </div>

            {/* Update Modal */}
            {selectedSkillForUpdate && (
                <UpdateProgressModal
                    skill={selectedSkillForUpdate}
                    role={role}
                    onClose={() => setSelectedSkillForUpdate(null)}
                    onSave={updateSkillProgress}
                />
            )}

            {/* Help Disclaimer */}
            <div className="p-6 bg-primary-50/30 rounded-3xl border border-primary-100 flex items-start gap-4">
                <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-primary-100">
                    <Activity className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                    <h5 className="font-bold text-neutral-800 text-base mb-1">Collaboration Protocol</h5>
                    <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
                        {role === 'parent'
                            ? "Updates shared here inform your therapist of home progress. Official clinical validation is provided after each session."
                            : "Provide clinical validation here. Parent home observations are highlighted for your consideration in treatment planning."
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChildProgressTracking;
