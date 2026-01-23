import React, { useState, useMemo, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
    Calendar, Target, TrendingUp, AlertCircle, CheckCircle2,
    ChevronRight, Edit3, Save, X, Plus, Minus, Info, Clock, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { useApp } from '../lib/context';

const ActualProgress = ({ childId, role = 'parent' }) => {
    const { getChildGoals, getChildProgress, updateSkillGoal, updateSkillProgress, addSkillGoal, deleteSkillGoal, deleteSkillProgress, kids } = useApp();
    const goals = getChildGoals(childId);
    const progressRecords = getChildProgress(childId);
    const child = kids.find(k => k.id === childId);

    const [selectedGoalId, setSelectedGoalId] = useState(null);

    // Reset selected goal when child changes
    useEffect(() => {
        if (goals.length > 0) {
            setSelectedGoalId(goals[0].id);
        } else {
            setSelectedGoalId(null);
        }
    }, [childId, goals.length]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);

    // Individual field states for granular updates
    const [tempMastery, setTempMastery] = useState(null);
    const [tempStatus, setTempStatus] = useState(null);
    const [tempNotes, setTempNotes] = useState(null);

    const [isUpdatingActual, setIsUpdatingActual] = useState(false);
    const [actualData, setActualData] = useState({ progress: 0, notes: '', weeklyActuals: [] });

    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoalData, setNewGoalData] = useState({
        skillName: '',
        customSkillName: '',
        duration: '1 Month',
        deadline: '',
        targets: [25, 50, 75, 100],
        notes: ''
    });
    const [isCustomSkill, setIsCustomSkill] = useState(false);
    const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);
    const [goalError, setGoalError] = useState('');

    const selectedGoal = goals.find(g => g.id === selectedGoalId);
    const relatedProgress = progressRecords.find(p => p.skillName === selectedGoal?.skillName);

    // Prepare data for the comparison chart
    const chartData = useMemo(() => {
        if (!selectedGoal) return [];

        const history = relatedProgress?.history || [];
        const weeklyActuals = relatedProgress?.weeklyActuals || [];

        const startItem = { name: 'Start', planned: 0, achieving: 0 };
        const weekItems = selectedGoal.targets.map((target, idx) => {
            const weekNum = idx + 1;
            let actual = weeklyActuals[idx] || null;

            // Fallback to history for demo if needed
            if (!actual && actual !== 0) {
                const hist = history.find(h => h.date.includes(`-${7 * weekNum < 10 ? '0' : ''}${7 * weekNum}`));
                actual = hist ? hist.progress : null;
            }

            // Special case for last week if no actuals but overall progress exists
            if (idx === selectedGoal.targets.length - 1 && (actual === null || actual === undefined) && (relatedProgress?.progress && weeklyActuals.every(v => v === 0 || v === '0'))) {
                actual = relatedProgress.progress;
            }

            return {
                name: `W${weekNum}`,
                planned: target,
                achieving: actual
            };
        });

        const fullData = [startItem, ...weekItems];

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
        if (status === 'Achieved' || achieved >= 100) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (status === 'Backlog' || achieved < (planned * 0.5)) return 'text-rose-600 bg-rose-50 border-rose-100';
        return 'text-amber-600 bg-amber-50 border-amber-100'; // In Progress
    };

    const getChartColor = (planned, achieved, status) => {
        if (status === 'Achieved' || achieved >= 100) return '#10B981'; // Emerald/Green
        if (status === 'Backlog' || achieved < (planned * 0.5)) return '#EF4444'; // Rose/Red
        return '#F59E0B'; // Amber/Yellow
    };

    const handleEdit = () => {
        setEditData({ ...selectedGoal });
        setIsEditing(true);
    };

    const handleSave = () => {
        updateSkillGoal(selectedGoal.id, editData);
        setIsEditing(false);
    };

    const handleDeleteSkill = () => {
        if (window.confirm(`Are you sure you want to delete the goal for "${selectedGoal.skillName}"?`)) {
            deleteSkillGoal(selectedGoal.id);
            // Also find and delete related progress if it exists
            if (relatedProgress) {
                deleteSkillProgress(relatedProgress.id);
            }
            setSelectedGoalId(null);
        }
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
            status: actualData.status || (finalProgress >= 100 ? 'Achieved' : (finalProgress > 0 ? 'In Progress' : 'Not Started'))
        });

        // Also update goal if deadline was changed
        if (actualData.deadline && actualData.deadline !== selectedGoal.deadline) {
            updateSkillGoal(selectedGoal.id, { deadline: actualData.deadline });
        }

        setIsUpdatingActual(false);
    };

    const openActualUpdate = () => {
        const targetCount = selectedGoal?.targets?.length || 0;
        let initialActuals = relatedProgress?.weeklyActuals || [];

        // Match length of targets
        if (initialActuals.length < targetCount) {
            const padding = new Array(targetCount - initialActuals.length).fill(0);
            initialActuals = [...initialActuals, ...padding];
        } else if (initialActuals.length > targetCount) {
            initialActuals = initialActuals.slice(0, targetCount);
        }

        setActualData({
            progress: relatedProgress?.progress || 0,
            notes: relatedProgress?.therapistNotes || '',
            weeklyActuals: initialActuals,
            status: relatedProgress?.status || 'In Progress',
            deadline: selectedGoal?.deadline || ''
        });
        setIsUpdatingActual(true);
    };

    const handleAddGoal = async () => {
        setGoalError('');
        setIsSubmittingGoal(true);

        try {
            // Determine the skill name
            const finalSkillName = isCustomSkill ? newGoalData.customSkillName.trim() : newGoalData.skillName;

            // Validation
            if (!finalSkillName) {
                setGoalError('Please select or enter a skill name');
                setIsSubmittingGoal(false);
                return;
            }

            if (!newGoalData.deadline) {
                setGoalError('Please select a target deadline');
                setIsSubmittingGoal(false);
                return;
            }

            // Check if goal already exists for this skill
            const existingGoal = goals.find(g => g.skillName.toLowerCase() === finalSkillName.toLowerCase());
            if (existingGoal) {
                setGoalError(`A goal already exists for "${finalSkillName}"`);
                setIsSubmittingGoal(false);
                return;
            }

            const skill = progressRecords.find(p => p.skillName === finalSkillName);

            // Prepare goal data with only valid fields
            const goalData = {
                childId,
                skillId: skill?.id || `custom-${Date.now()}`,
                skillName: finalSkillName,
                duration: newGoalData.duration,
                startDate: new Date().toISOString().split('T')[0],
                deadline: newGoalData.deadline,
                targets: newGoalData.targets,
                status: 'In Progress',
                notes: newGoalData.notes || ''
            };

            console.log('📋 Submitting goal data:', goalData);

            await addSkillGoal(goalData);

            console.log('✅ Goal added successfully!');

            // Reset form
            setNewGoalData({
                skillName: '',
                customSkillName: '',
                duration: '1 Month',
                deadline: '',
                targets: [25, 50, 75, 100],
                notes: ''
            });
            setIsCustomSkill(false);
            setIsAddingGoal(false);
            setIsSubmittingGoal(false);
        } catch (error) {
            console.error('❌ Failed to add goal:', error);
            setGoalError(typeof error === 'string' ? error : 'Failed to create goal. Please try again.');
            setIsSubmittingGoal(false);
        }
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

    if (isUpdatingActual) {
        return (
            <Card className="max-w-2xl mx-auto border-none shadow-xl ring-1 ring-neutral-200 animate-in zoom-in-95 duration-200">
                <CardHeader className="border-b border-neutral-100">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary-500" />
                            Log Clinical Progress: {selectedGoal.skillName}
                        </CardTitle>
                        <button onClick={() => setIsUpdatingActual(false)} className="text-neutral-400 hover:text-neutral-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Clinical Status</label>
                            <select
                                value={actualData.status || (relatedProgress?.status || 'In Progress')}
                                onChange={(e) => setActualData({ ...actualData, status: e.target.value })}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Achieved">Achieved</option>
                                <option value="Backlog">Backlog</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Target Deadline</label>
                            <input
                                type="date"
                                value={actualData.deadline || (selectedGoal?.deadline || '')}
                                onChange={(e) => setActualData({ ...actualData, deadline: e.target.value })}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Update Weekly Achievement (%)</label>
                        <div className="grid grid-cols-4 gap-3">
                            {actualData.weeklyActuals.map((val, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-neutral-400 font-bold">W{i + 1}</span>
                                    <input
                                        type="number"
                                        value={val}
                                        onChange={(e) => {
                                            const weeklyActuals = [...actualData.weeklyActuals];
                                            weeklyActuals[i] = Number(e.target.value);
                                            setActualData({ ...actualData, weeklyActuals });
                                        }}
                                        className="w-full h-12 bg-white border border-neutral-200 rounded-2xl text-lg font-black text-center text-neutral-900 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Clinical Strategy / Session Notes</label>
                        <textarea
                            value={actualData.notes}
                            onChange={(e) => setActualData({ ...actualData, notes: e.target.value })}
                            placeholder="Document the patient's performance and any adjustments to the strategy..."
                            className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1 py-6 font-bold"
                            onClick={() => setIsUpdatingActual(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 py-6 shadow-lg shadow-primary-200 gap-2 font-bold"
                            onClick={handleUpdateActual}
                        >
                            <Save className="h-4 w-4" />
                            Update Clinical Graph
                        </Button>
                    </div>
                </CardContent>
            </Card>
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
                        <button onClick={() => {
                            setIsAddingGoal(false);
                            setGoalError('');
                            setIsCustomSkill(false);
                        }} className="text-neutral-400 hover:text-neutral-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {goalError && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-rose-700 font-medium">{goalError}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Select Skill</label>
                            <select
                                value={isCustomSkill ? '__custom__' : newGoalData.skillName}
                                onChange={(e) => {
                                    if (e.target.value === '__custom__') {
                                        setIsCustomSkill(true);
                                        setNewGoalData({ ...newGoalData, skillName: '' });
                                    } else {
                                        setIsCustomSkill(false);
                                        setNewGoalData({ ...newGoalData, skillName: e.target.value });
                                    }
                                    setGoalError('');
                                }}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="">Choose a skill...</option>
                                {progressRecords.map(p => (
                                    <option key={p.id} value={p.skillName}>{p.skillName}</option>
                                ))}
                                <option value="__custom__">➕ Add Custom Skill</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Target Deadline</label>
                            <input
                                type="date"
                                value={newGoalData.deadline}
                                onChange={(e) => {
                                    setNewGoalData({ ...newGoalData, deadline: e.target.value });
                                    setGoalError('');
                                }}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    {isCustomSkill && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Custom Skill Name</label>
                            <input
                                type="text"
                                value={newGoalData.customSkillName}
                                onChange={(e) => {
                                    setNewGoalData({ ...newGoalData, customSkillName: e.target.value });
                                    setGoalError('');
                                }}
                                placeholder="e.g., Advanced Pincer Grip"
                                className="w-full p-3 bg-white border-2 border-primary-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Weekly Planned Targets (%)</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (newGoalData.targets.length > 1) {
                                            setNewGoalData({ ...newGoalData, targets: newGoalData.targets.slice(0, -1) });
                                        }
                                    }}
                                    className="p-1 hover:bg-rose-50 text-rose-500 rounded-md transition-colors"
                                    title="Remove Week"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (newGoalData.targets.length < 8) {
                                            setNewGoalData({ ...newGoalData, targets: [...newGoalData.targets, 0] });
                                        }
                                    }}
                                    className="p-1 hover:bg-emerald-50 text-emerald-500 rounded-md transition-colors"
                                    title="Add Week"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {newGoalData.targets.map((t, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-neutral-400 font-bold">W{i + 1}</span>
                                    <input
                                        type="number"
                                        value={t}
                                        onChange={(e) => {
                                            const targets = [...newGoalData.targets];
                                            targets[i] = Number(e.target.value);
                                            setNewGoalData({ ...newGoalData, targets });
                                        }}
                                        className="w-full h-12 bg-white border border-neutral-200 rounded-2xl text-lg font-black text-center text-neutral-900 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                                        placeholder="0"
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
                        <Button
                            variant="outline"
                            className="flex-1 py-6"
                            onClick={() => {
                                setIsAddingGoal(false);
                                setGoalError('');
                                setIsCustomSkill(false);
                            }}
                            disabled={isSubmittingGoal}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 py-6 shadow-lg shadow-primary-200 gap-2"
                            onClick={handleAddGoal}
                            disabled={isSubmittingGoal || (!isCustomSkill && !newGoalData.skillName) || (isCustomSkill && !newGoalData.customSkillName.trim()) || !newGoalData.deadline}
                        >
                            {isSubmittingGoal ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Create Goal Plan
                                </>
                            )}
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
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${selectedGoalId !== null && selectedGoalId === goal.id
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
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Goal Info Card */}
                    <Card className="lg:col-span-2 border-none bg-neutral-50/50 shadow-none ring-1 ring-neutral-200/50">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-black text-neutral-800">Goal Overview</CardTitle>
                                {role === 'therapist' && !isEditing && (
                                    <div className="flex gap-1">
                                        <button onClick={handleEdit} className="text-primary-600 p-1.5 hover:bg-primary-50 rounded-lg transition-colors" title="Edit Goal">
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button onClick={handleDeleteSkill} className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Goal">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
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
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : selectedGoal.status === 'Backlog'
                                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
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
                                <div className="pt-6 space-y-5 border-t border-neutral-200 mt-6 animate-in slide-in-from-top-4 duration-300">
                                    <h4 className="text-xs font-black text-primary-600 uppercase tracking-widest flex items-center gap-2">
                                        <Edit3 className="h-3 w-3" />
                                        Modify Planned Progress
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Goal Status</label>
                                            <select
                                                value={editData.status}
                                                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                                className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                            >
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Achieved">Achieved</option>
                                                <option value="Backlog">Backlog</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Target Deadline</label>
                                            <input
                                                type="date"
                                                value={editData.deadline}
                                                onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                                                className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Modify Weekly Planned Targets (%)</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (editData.targets.length > 1) {
                                                            setEditData({ ...editData, targets: editData.targets.slice(0, -1) });
                                                        }
                                                    }}
                                                    className="p-1 hover:bg-rose-50 text-rose-500 rounded-md transition-colors"
                                                    title="Remove Week"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (editData.targets.length < 8) {
                                                            setEditData({ ...editData, targets: [...editData.targets, 0] });
                                                        }
                                                    }}
                                                    className="p-1 hover:bg-emerald-50 text-emerald-500 rounded-md transition-colors"
                                                    title="Add Week"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-3">
                                            {editData.targets.map((target, idx) => (
                                                <div key={idx} className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] text-neutral-400 font-black">W{idx + 1}</span>
                                                    <input
                                                        type="number"
                                                        value={target}
                                                        onChange={(e) => {
                                                            const newTargets = [...editData.targets];
                                                            newTargets[idx] = Number(e.target.value);
                                                            setEditData({ ...editData, targets: newTargets });
                                                        }}
                                                        className="w-full h-12 bg-white border border-neutral-200 rounded-2xl text-lg font-black text-center text-neutral-900 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Therapeutic Strategy Notes</label>
                                        <textarea
                                            value={editData.notes}
                                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px]"
                                            placeholder="Update notes..."
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="flex-1 py-5 rounded-xl">Cancel</Button>
                                        <Button size="sm" onClick={handleSave} className="flex-1 py-5 rounded-xl gap-2 shadow-lg shadow-primary-100">
                                            <Save className="h-4 w-4" /> Save Plan
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Analytics Chart Component */}
                    <div className="lg:col-span-3 space-y-6">
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
                                                dot={{ r: 6, fill: getChartColor(chartData[chartData.length - 1]?.planned, chartData[chartData.length - 1]?.achieving, selectedGoal.status), strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Card key={selectedGoal.id} className={`md:col-span-3 border-none text-white shadow-xl overflow-hidden relative transition-all duration-500 ${selectedGoal.status === 'Achieved' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                                selectedGoal.status === 'Backlog' ? 'bg-gradient-to-br from-rose-500 to-red-600' :
                                    'bg-gradient-to-br from-indigo-500 via-primary-600 to-blue-700'
                                }`}>
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <TrendingUp className="h-24 w-24" />
                                </div>
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex flex-col gap-6">
                                        {/* Mastery Section */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-wider mb-2">
                                                        <Clock className="h-2.5 w-2.5" /> Updated
                                                    </div>
                                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Log Progress</p>
                                                    <div className="flex items-end gap-2">
                                                        <h4 className="text-6xl font-black tracking-tighter leading-none">
                                                            {tempMastery !== null ? tempMastery : (relatedProgress?.progress || 0)}%
                                                        </h4>
                                                        <span className="text-white/90 text-xs font-black uppercase tracking-tight mb-1">Mastery</span>
                                                    </div>
                                                </div>
                                                {role === 'therapist' && (
                                                    <div className="flex flex-col items-end gap-3">
                                                        <button
                                                            onClick={openActualUpdate}
                                                            className="px-6 py-3 bg-white text-primary-600 text-[10px] font-black rounded-xl shadow-lg hover:bg-neutral-50 transition-all flex items-center gap-2"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                            LOG PROGRESS
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden shadow-inner backdrop-blur-sm p-0.5">
                                                <div
                                                    className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out"
                                                    style={{ width: `${(tempMastery !== null ? tempMastery : (relatedProgress?.progress || 0))}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Status Section */}
                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2 relative group">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black text-white/70 uppercase tracking-widest">Current Status</label>
                                                    {tempStatus !== null ? (
                                                        <button
                                                            onClick={() => {
                                                                updateSkillProgress(relatedProgress.id, { status: tempStatus });
                                                                setTempStatus(null);
                                                            }}
                                                            className="text-[9px] font-black text-white bg-emerald-500/50 px-2 py-0.5 rounded-md"
                                                        >
                                                            SAVE
                                                        </button>
                                                    ) : (
                                                        <Clock className="h-3 w-3 text-white/40" />
                                                    )}
                                                </div>
                                                {role === 'therapist' ? (
                                                    <select
                                                        value={tempStatus !== null ? tempStatus : (relatedProgress?.status || 'Not Started')}
                                                        onChange={(e) => setTempStatus(e.target.value)}
                                                        className="w-full bg-transparent border-none text-white font-black text-sm p-0 focus:ring-0 outline-none cursor-pointer"
                                                    >
                                                        <option value="Not Started" className="text-neutral-900">Not Started</option>
                                                        <option value="In Progress" className="text-neutral-900">In Progress</option>
                                                        <option value="Achieved" className="text-neutral-900">Achieved</option>
                                                        <option value="Backlog" className="text-neutral-900">Backlog</option>
                                                    </select>
                                                ) : (
                                                    <p className="text-sm font-black text-white">{relatedProgress?.status || 'Not Started'}</p>
                                                )}
                                            </div>

                                            {/* Last Updated Section */}
                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black text-white/70 uppercase tracking-widest">Last Activity</label>
                                                    <Calendar className="h-3 w-3 text-white/40" />
                                                </div>
                                                <p className="text-sm font-black text-white">
                                                    {relatedProgress?.lastUpdated ? new Date(relatedProgress.lastUpdated).toLocaleDateString() : 'No recent activity'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 relative group">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Info className="h-4 w-4 text-white/60" />
                                                    <label className="text-[10px] font-black text-white/70 uppercase tracking-widest">Therapist Notes</label>
                                                </div>
                                                {role === 'therapist' && (
                                                    tempNotes !== null ? (
                                                        <button
                                                            onClick={() => {
                                                                updateSkillProgress(relatedProgress.id, { therapistNotes: tempNotes });
                                                                setTempNotes(null);
                                                            }}
                                                            className="text-[9px] font-black text-white bg-indigo-500 px-3 py-1 rounded-lg shadow-lg"
                                                        >
                                                            SAVE NOTES
                                                        </button>
                                                    ) : (
                                                        <span className="text-[8px] font-black text-white/40 uppercase">Modify notes below</span>
                                                    )
                                                )}
                                            </div>
                                            {role === 'therapist' ? (
                                                <textarea
                                                    value={tempNotes !== null ? tempNotes : (relatedProgress?.therapistNotes || '')}
                                                    onChange={(e) => setTempNotes(e.target.value)}
                                                    placeholder="Enter clinical observations..."
                                                    className="w-full bg-transparent border-none text-white text-xs font-medium focus:ring-0 outline-none min-h-[60px] resize-none placeholder:text-white/30 scrollbar-hide"
                                                />
                                            ) : (
                                                <p className="text-xs font-medium text-white/90 italic leading-relaxed">
                                                    "{relatedProgress?.therapistNotes || 'No notes available for this skill yet.'}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>


                            <Card className="md:col-span-2 border-none shadow-sm ring-1 ring-neutral-100 bg-white">
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
