import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
    Calendar, Target, TrendingUp, AlertCircle, CheckCircle2,
    ChevronRight, Edit3, Save, X, Plus, Info, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { useApp } from '../lib/context';

const ActualProgress = ({ childId, role = 'parent' }) => {
    const { getChildGoals, getChildProgress, updateSkillGoal, updateSkillProgress, addSkillGoal } = useApp();
    const goals = getChildGoals(childId);
    const progressRecords = getChildProgress(childId);

    const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id || null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);

    const [isUpdatingActual, setIsUpdatingActual] = useState(false);
    const [actualData, setActualData] = useState({ progress: 0, notes: '', weeklyActuals: [0, 0, 0, 0] });

    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoalData, setNewGoalData] = useState({
        skillName: '',
        duration: '1 Month',
        deadline: '',
        targets: [25, 50, 75, 100],
        notes: ''
    });

    const selectedGoal = goals.find(g => g.id === selectedGoalId);
    const relatedProgress = progressRecords.find(p => p.skillName === selectedGoal?.skillName);

    // Prepare data for the comparison chart
    const chartData = useMemo(() => {
        if (!selectedGoal) return [];

        const history = relatedProgress?.history || [];
        const weeklyActuals = relatedProgress?.weeklyActuals || [0, 0, 0, 0];

        const fullData = [
            { name: 'Start', planned: 0, achieving: 0 },
            { name: 'Week 1', planned: selectedGoal.targets[0], achieving: weeklyActuals[0] || (history.find(h => h.date.includes('-07'))?.progress || null) },
            { name: 'Week 2', planned: selectedGoal.targets[1], achieving: weeklyActuals[1] || (history.find(h => h.date.includes('-14'))?.progress || null) },
            { name: 'Week 3', planned: selectedGoal.targets[2], achieving: weeklyActuals[2] || (history.find(h => h.date.includes('-21'))?.progress || null) },
            { name: 'Week 4', planned: selectedGoal.targets[3], achieving: weeklyActuals[3] || (history.find(h => h.date.includes('-28')) || relatedProgress?.progress && weeklyActuals.every(v => !v)) ? relatedProgress?.progress : null }
        ];

        // Find the index of the last week with actual progress > 0
        let lastIndex = 0;
        for (let i = 1; i < fullData.length; i++) {
            if (fullData[i].achieving !== null && fullData[i].achieving !== undefined) {
                lastIndex = i;
            }
        }

        return fullData.map((d, i) => ({
            ...d,
            achieving: i <= lastIndex ? Math.round(Number(d.achieving)) : null
        }));
    }, [selectedGoal, relatedProgress]);

    const getStatusColor = (planned, achieved, status) => {
        if (status === 'Achieved' || achieved >= 100) return 'text-green-600 bg-green-50 border-green-100';
        if (status === 'Backlog' || achieved < planned) return 'text-red-600 bg-red-50 border-red-100';
        return 'text-yellow-600 bg-yellow-50 border-yellow-100'; // In Progress
    };

    const getChartColor = (planned, achieved, status) => {
        if (status === 'Achieved' || achieved >= 100) return '#10B981'; // Green
        if (status === 'Backlog' || achieved < planned) return '#EF4444'; // Red
        return '#F59E0B'; // Yellow
    };

    const handleEdit = () => {
        setEditData({ ...selectedGoal });
        setIsEditing(true);
    };

    const handleSave = () => {
        updateSkillGoal(selectedGoal.id, editData);
        setIsEditing(false);
    };

    const handleUpdateActual = () => {
        if (!relatedProgress) return;

        // Progress is the latest non-zero value or the last week recorded
        const weeklyValues = actualData.weeklyActuals.map(Number);
        let finalProgress = 0;
        for (let i = 3; i >= 0; i--) {
            if (weeklyValues[i] > 0) {
                finalProgress = weeklyValues[i];
                break;
            }
        }

        updateSkillProgress(relatedProgress.id, {
            progress: finalProgress,
            weeklyActuals: weeklyValues,
            therapistNotes: actualData.notes || relatedProgress.therapistNotes,
            status: finalProgress >= 100 ? 'Achieved' : (finalProgress > 0 ? 'In Progress' : 'Not Started')
        });
        setIsUpdatingActual(false);
    };

    const openActualUpdate = () => {
        setActualData({
            progress: relatedProgress?.progress || 0,
            notes: relatedProgress?.therapistNotes || '',
            weeklyActuals: relatedProgress?.weeklyActuals || [0, 0, 0, 0]
        });
        setIsUpdatingActual(true);
    };

    const handleAddGoal = () => {
        const skill = progressRecords.find(p => p.skillName === newGoalData.skillName);
        addSkillGoal({
            ...newGoalData,
            childId,
            skillId: skill?.id || `temp-${Date.now()}`,
            status: 'In Progress'
        });
        setIsAddingGoal(false);
        // Reset form
        setNewGoalData({
            skillName: '',
            duration: '1 Month',
            deadline: '',
            targets: [25, 50, 75, 100],
            notes: ''
        });
    };

    if (goals.length === 0 && !isAddingGoal) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200">
                <Target className="h-12 w-12 text-neutral-300 mb-4" />
                <h3 className="text-xl font-bold text-neutral-800">No Planned Goals Found</h3>
                <p className="text-neutral-500 text-center max-w-sm mt-2">
                    {role === 'therapist'
                        ? "You haven't defined any 1-month targets for this patient yet."
                        : "No planned progress targets have been set by the therapist yet."}
                </p>
                {role === 'therapist' && (
                    <Button onClick={() => setIsAddingGoal(true)} className="mt-6 gap-2">
                        <Plus className="h-4 w-4" /> Define New Goal
                    </Button>
                )}
            </div>
        );
    }

    if (isAddingGoal) {
        return (
            <Card className="max-w-2xl mx-auto border-none shadow-xl ring-1 ring-neutral-200 animate-in zoom-in-95 duration-200">
                <CardHeader className="border-b border-neutral-100">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary-500" />
                            Define New 1-Month Goal
                        </CardTitle>
                        <button onClick={() => setIsAddingGoal(false)} className="text-neutral-400 hover:text-neutral-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Select Skill</label>
                            <select
                                value={newGoalData.skillName}
                                onChange={(e) => setNewGoalData({ ...newGoalData, skillName: e.target.value })}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="">Choose a skill...</option>
                                {progressRecords.map(p => (
                                    <option key={p.id} value={p.skillName}>{p.skillName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Target Deadline</label>
                            <input
                                type="date"
                                value={newGoalData.deadline}
                                onChange={(e) => setNewGoalData({ ...newGoalData, deadline: e.target.value })}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Weekly Planned Targets (%)</label>
                        <div className="grid grid-cols-4 gap-4">
                            {newGoalData.targets.map((t, i) => (
                                <div key={i} className="space-y-1">
                                    <span className="text-[10px] text-neutral-400 font-bold">WEEK {i + 1}</span>
                                    <input
                                        type="number"
                                        value={t}
                                        onChange={(e) => {
                                            const targets = [...newGoalData.targets];
                                            targets[i] = Number(e.target.value);
                                            setNewGoalData({ ...newGoalData, targets });
                                        }}
                                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-black text-center focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Therapist Notes / Strategy</label>
                        <textarea
                            value={newGoalData.notes}
                            onChange={(e) => setNewGoalData({ ...newGoalData, notes: e.target.value })}
                            placeholder="How do we plan to achieve this?"
                            className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1 py-6" onClick={() => setIsAddingGoal(false)}>Cancel</Button>
                        <Button className="flex-1 py-6 shadow-lg shadow-primary-200" onClick={handleAddGoal} disabled={!newGoalData.skillName || !newGoalData.deadline}>
                            Create Goal Plan
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-3">
                    {goals.map(goal => (
                        <button
                            key={goal.id}
                            onClick={() => setSelectedGoalId(goal.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${selectedGoalId === goal.id
                                ? 'bg-primary-50 border-primary-200 text-primary-600 shadow-sm'
                                : 'bg-white border-neutral-100 text-neutral-500 hover:bg-neutral-50'
                                }`}
                        >
                            {goal.skillName}
                        </button>
                    ))}
                </div>
                {role === 'therapist' && (
                    <Button size="sm" variant="outline" onClick={() => setIsAddingGoal(true)} className="gap-2 rounded-xl">
                        <Plus className="h-4 w-4" /> Add New Goal
                    </Button>
                )}
            </div>

            {selectedGoal && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Goal Info Card */}
                    <Card className="lg:col-span-1 border-none bg-neutral-50/50 shadow-none ring-1 ring-neutral-200/50">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-black text-neutral-800">Goal Overview</CardTitle>
                                {role === 'therapist' && !isEditing && (
                                    <button onClick={handleEdit} className="text-primary-600 p-1 hover:bg-primary-50 rounded-lg transition-colors">
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Skill Name</p>
                                <p className="font-bold text-neutral-800">{selectedGoal.skillName}</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Duration</p>
                                    <div className="flex items-center gap-1.5 font-bold text-neutral-700 text-sm">
                                        <Clock className="h-3.5 w-3.5 text-primary-500" />
                                        {selectedGoal.duration}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${selectedGoal.status === 'Achieved'
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : selectedGoal.status === 'Backlog'
                                            ? 'bg-red-50 text-red-600 border-red-100'
                                            : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                        }`}>
                                        {selectedGoal.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Deadlines</p>
                                <p className="text-sm font-medium text-neutral-600">
                                    {new Date(selectedGoal.startDate).toLocaleDateString()} - {new Date(selectedGoal.deadline).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="pt-2">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Therapist Notes</p>
                                <p className="text-sm text-neutral-600 italic leading-relaxed">
                                    "{selectedGoal.notes}"
                                </p>
                            </div>

                            {isEditing && (
                                <div className="pt-4 space-y-4 border-t border-neutral-200 mt-4 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-neutral-700">Status</label>
                                            <select
                                                value={editData.status}
                                                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                                className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                            >
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Achieved">Achieved</option>
                                                <option value="Backlog">Backlog</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-neutral-700">Target Deadline</label>
                                            <input
                                                type="date"
                                                value={editData.deadline}
                                                onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                                                className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-neutral-700">Weekly Targets (%)</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {editData.targets.map((target, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <span className="text-[9px] text-neutral-400 font-bold uppercase">W{idx + 1}</span>
                                                    <input
                                                        type="number"
                                                        value={target}
                                                        onChange={(e) => {
                                                            const newTargets = [...editData.targets];
                                                            newTargets[idx] = Number(e.target.value);
                                                            setEditData({ ...editData, targets: newTargets });
                                                        }}
                                                        className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none text-center"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-neutral-700">Modify Notes</label>
                                        <textarea
                                            value={editData.notes}
                                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                            className="w-full p-3 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px]"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
                                        <Button size="sm" onClick={handleSave} className="flex-1 gap-2"><Save className="h-3 w-3" /> Save</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Analytics Chart Component */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary-500" />
                                    Planned vs Actual Achievement
                                </CardTitle>
                                <div className="flex items-center gap-4 text-xs font-bold">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 bg-neutral-200 rounded-sm" />
                                        <span className="text-neutral-400 uppercase tracking-widest">Planned</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 bg-primary-500 rounded-sm" />
                                        <span className="text-neutral-400 uppercase tracking-widest">Achieved</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                                unit="%"
                                                domain={[0, 100]}
                                                ticks={[0, 25, 50, 75, 100]}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                                cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="planned"
                                                stroke="#e2e8f0"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#cbd5e1', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="achieving"
                                                name="Actual"
                                                stroke={getChartColor(chartData[chartData.length - 1]?.planned, chartData[chartData.length - 1]?.achieving, selectedGoal.status)}
                                                strokeWidth={4}
                                                dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className={`border-none text-white shadow-xl overflow-hidden relative transition-all duration-500 ${selectedGoal.status === 'Achieved' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                                selectedGoal.status === 'Backlog' ? 'bg-gradient-to-br from-rose-500 to-red-600' :
                                    'bg-gradient-to-br from-indigo-500 via-primary-600 to-blue-700'
                                }`}>
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <TrendingUp className="h-24 w-24" />
                                </div>
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">Live Clinical Progress</p>
                                        {role === 'therapist' && !isUpdatingActual && (
                                            <button
                                                onClick={openActualUpdate}
                                                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    {!isUpdatingActual ? (
                                        <>
                                            <div className="flex items-end gap-2 mb-4">
                                                <h4 className="text-5xl font-black tracking-tighter">{relatedProgress?.progress || 0}%</h4>
                                                <div className="flex flex-col mb-1.5">
                                                    <span className="text-white/60 text-[10px] font-bold uppercase leading-none">Overall</span>
                                                    <span className="text-white/90 text-xs font-black uppercase tracking-tight">Mastery</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
                                                <div
                                                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                                                    style={{ width: `${relatedProgress?.progress || 0}%` }}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/70 uppercase tracking-widest">Weekly Achievement (%)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {actualData.weeklyActuals.map((val, i) => (
                                                        <div key={i} className="space-y-1">
                                                            <span className="text-[8px] text-white/50 font-black uppercase">W{i + 1}</span>
                                                            <input
                                                                type="number"
                                                                value={val}
                                                                onChange={(e) => {
                                                                    const weeks = [...actualData.weeklyActuals];
                                                                    weeks[i] = e.target.value;
                                                                    setActualData({ ...actualData, weeklyActuals: weeks });
                                                                }}
                                                                className="w-full bg-white/10 border border-white/20 rounded-xl py-2 text-white text-sm font-black text-center outline-none focus:ring-2 focus:ring-white/50 transition-all backdrop-blur-md"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/70 uppercase tracking-widest">Clinical Observation</label>
                                                <textarea
                                                    value={actualData.notes}
                                                    onChange={(e) => setActualData({ ...actualData, notes: e.target.value })}
                                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-xs font-medium outline-none focus:ring-2 focus:ring-white/50 min-h-[80px] backdrop-blur-md placeholder:text-white/30"
                                                    placeholder="e.g. Mastered pincer grip today!"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsUpdatingActual(false)}
                                                    className="flex-1 py-3 text-xs font-bold hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdateActual}
                                                    className="flex-1 py-3 bg-white text-primary-600 text-xs font-black rounded-xl hover:bg-neutral-50 transition-all shadow-xl hover:-translate-y-0.5"
                                                >
                                                    Update Plan
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>


                            <Card className="border-none shadow-sm ring-1 ring-neutral-100 bg-white">
                                <CardContent className="p-6 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-neutral-50 rounded-lg">
                                                <AlertCircle className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <p className="text-sm font-bold text-neutral-800">Gap Analysis</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg text-xs font-black border ${getStatusColor(selectedGoal.targets[3], relatedProgress?.progress, selectedGoal.status)}`}>
                                            {selectedGoal.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-black text-neutral-800">
                                            {100 - (relatedProgress?.progress || 0)}%
                                        </p>
                                        <p className="text-xs text-neutral-500 font-medium">Remaining to reach full independence</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActualProgress;
