// ============================================================
// NeuroBridge™ - Roadmap Editor
// Therapist Console - Goal Planning & Milestone Management
// ============================================================

import React, { useState } from 'react';
import {
    Target,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    Circle,
    Calendar,
    Lock,
    Unlock,
    Save,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Sparkles,
    Award,
    TrendingUp,
    BarChart3,
    Eye,
    EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// Goal Form Modal
const GoalFormModal = ({ goal, onSave, onClose }) => {
    const [formData, setFormData] = useState(goal || {
        domain: 'Communication',
        title: '',
        description: '',
        targetDate: '',
        priority: 'medium',
        milestones: []
    });
    const [newMilestone, setNewMilestone] = useState('');

    const domains = [
        'Communication',
        'Motor Skills',
        'Social Interaction',
        'Emotional Regulation',
        'Sensory Integration',
        'Behavioral Adaptability',
        'Attention & Focus'
    ];

    const addMilestone = () => {
        if (newMilestone.trim()) {
            setFormData({
                ...formData,
                milestones: [
                    ...formData.milestones,
                    { id: `m${Date.now()}`, title: newMilestone, completed: false, date: null }
                ]
            });
            setNewMilestone('');
        }
    };

    const removeMilestone = (id) => {
        setFormData({
            ...formData,
            milestones: formData.milestones.filter(m => m.id !== id)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-neutral-800 mb-6">
                        {goal ? 'Edit Goal' : 'Create New Goal'}
                    </h3>

                    <div className="space-y-4">
                        {/* Domain */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Domain</label>
                            <select
                                className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            >
                                {domains.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Goal Title</label>
                            <input
                                type="text"
                                className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                                placeholder="e.g., Uses 2-word phrases consistently"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Description</label>
                            <textarea
                                className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                                placeholder="Detailed description of the goal..."
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Target Date */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Target Date</label>
                            <input
                                type="date"
                                className="w-full mt-1 p-2 border border-neutral-200 rounded-lg"
                                value={formData.targetDate}
                                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Priority</label>
                            <div className="flex gap-2 mt-1">
                                {['low', 'medium', 'high'].map(p => (
                                    <button
                                        key={p}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${formData.priority === p
                                            ? p === 'high' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                                                p === 'medium' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                                                    'bg-green-100 text-green-700 border-2 border-green-300'
                                            : 'bg-neutral-100 text-neutral-600'
                                            }`}
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Milestones */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Milestones</label>
                            <div className="mt-2 space-y-2">
                                {formData.milestones.map((m, idx) => (
                                    <div key={m.id} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                                            {idx + 1}
                                        </span>
                                        <span className="flex-1 text-sm text-neutral-700">{m.title}</span>
                                        <button
                                            className="text-neutral-400 hover:text-red-500"
                                            onClick={() => removeMilestone(m.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border border-neutral-200 rounded-lg text-sm"
                                    placeholder="Add milestone..."
                                    value={newMilestone}
                                    onChange={(e) => setNewMilestone(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addMilestone()}
                                />
                                <Button size="sm" onClick={addMilestone}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <Button className="flex-1" onClick={() => onSave(formData)}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Goal
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Roadmap Goal Card
const RoadmapGoalCard = ({ goal, onEdit, onToggleLock, onCompleteMilestone }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const statusColors = {
        'completed': 'border-l-green-500 bg-green-50',
        'in-progress': 'border-l-primary-500',
        'at-risk': 'border-l-red-500 bg-red-50',
        'upcoming': 'border-l-neutral-300'
    };

    const priorityBadge = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-yellow-100 text-yellow-700',
        low: 'bg-green-100 text-green-700'
    };

    const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
    const totalMilestones = goal.milestones?.length || 0;

    return (
        <Card className={`border-l-4 ${statusColors[goal.status] || statusColors['in-progress']}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityBadge[goal.priority]}`}>
                                {goal.priority?.toUpperCase()}
                            </span>
                            <span className="text-xs text-neutral-500">{goal.domain}</span>
                        </div>
                        <h4 className="font-semibold text-neutral-800">{goal.title}</h4>
                        <p className="text-sm text-neutral-500 mt-1">{goal.description}</p>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-neutral-500 mb-1">
                                <span>{completedMilestones}/{totalMilestones} milestones</span>
                                <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                            </div>
                            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 rounded-full transition-all"
                                    style={{ width: `${goal.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        <button
                            className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                            onClick={() => onEdit(goal)}
                        >
                            <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                            className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                            onClick={() => onToggleLock(goal.id)}
                        >
                            {goal.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                        <button
                            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Expanded Milestones */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                        <h5 className="text-sm font-medium text-neutral-700 mb-3">Milestones</h5>
                        <div className="space-y-2">
                            {goal.milestones?.map((milestone) => (
                                <div
                                    key={milestone.id}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${milestone.completed ? 'bg-green-50' : 'bg-neutral-50 hover:bg-neutral-100'
                                        }`}
                                    onClick={() => !milestone.completed && onCompleteMilestone(goal.id, milestone.id)}
                                >
                                    {milestone.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-neutral-300" />
                                    )}
                                    <span className={`text-sm ${milestone.completed ? 'text-green-700 line-through' : 'text-neutral-700'}`}>
                                        {milestone.title}
                                    </span>
                                    {milestone.date && (
                                        <span className="text-xs text-neutral-400 ml-auto">
                                            {new Date(milestone.date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* AI Prediction */}
                        {goal.aiPrediction && (
                            <div className="mt-4 p-3 bg-violet-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-violet-600" />
                                    <span className="text-sm font-medium text-violet-900">AI Prediction</span>
                                </div>
                                <p className="text-sm text-violet-700 mt-1">{goal.aiPrediction}</p>
                            </div>
                        )}

                        {/* Therapist Notes */}
                        {goal.therapistNotes && (
                            <div className="mt-3 p-3 bg-neutral-100 rounded-lg">
                                <span className="text-xs font-medium text-neutral-500">Your Notes</span>
                                <p className="text-sm text-neutral-700 mt-1">{goal.therapistNotes}</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Main Roadmap Editor Component
const RoadmapEditor = () => {
    const { currentUser, kids, getChildRoadmap, updateRoadmapProgress, completeMilestone, quickTestResults } = useApp();
    const [showSharedAssessment, setShowSharedAssessment] = useState(false);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    // Get therapist's patients
    const therapistId = currentUser?.id || 't1';
    const myPatients = kids.filter(k => k.therapistId === therapistId);

    // Set default selected child
    React.useEffect(() => {
        if (myPatients.length > 0 && !selectedChildId) {
            setSelectedChildId(myPatients[0].id);
        }
    }, [myPatients, selectedChildId]);

    const selectedChild = kids.find(k => k.id === selectedChildId);
    const roadmap = selectedChildId ? getChildRoadmap(selectedChildId) : [];

    // Find the latest SHARED assessment for this child
    const latestSharedAssessment = selectedChildId
        ? quickTestResults?.find(r => r.childId === selectedChildId && r.sharedWithTherapist)
        : null;

    const handleSaveGoal = (goalData) => {
        // In production, this would save to the database
        console.log('Saving goal:', goalData);
        setShowGoalForm(false);
        setEditingGoal(null);
    };

    const handleToggleLock = (goalId) => {
        // Toggle lock status
        console.log('Toggling lock for:', goalId);
    };

    const handleCompleteMilestone = (goalId, milestoneId) => {
        completeMilestone(goalId, milestoneId);
    };

    // Group goals by status
    const groupedGoals = {
        'in-progress': roadmap.filter(g => g.status === 'in-progress'),
        'at-risk': roadmap.filter(g => g.status === 'at-risk'),
        'completed': roadmap.filter(g => g.status === 'completed'),
        'upcoming': roadmap.filter(g => g.status === 'upcoming')
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Roadmap Editor</h2>
                    <p className="text-neutral-500">Plan and manage therapy goals</p>
                </div>
                <Button onClick={() => setShowGoalForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Goal
                </Button>
            </div>

            {/* Patient Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {myPatients.map(child => (
                    <button
                        key={child.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedChildId === child.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                        onClick={() => setSelectedChildId(child.id)}
                    >
                        <img
                            src={child.photoUrl}
                            alt={child.name}
                            className="w-6 h-6 rounded-full"
                        />
                        {child.name}
                    </button>
                ))}
            </div>

            {/* Stats */}
            {selectedChild && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-neutral-800">{roadmap.length}</p>
                            <p className="text-sm text-neutral-500">Total Goals</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-primary-50 border-primary-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary-600">{groupedGoals['in-progress'].length}</p>
                            <p className="text-sm text-primary-700">In Progress</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{groupedGoals.completed.length}</p>
                            <p className="text-sm text-green-700">Completed</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">{groupedGoals['at-risk'].length}</p>
                            <p className="text-sm text-red-700">At Risk</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Goals List */}
            {selectedChild ? (
                <div className="space-y-6">
                    {/* At Risk Goals */}
                    {groupedGoals['at-risk'].length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700 mb-3">
                                <AlertTriangle className="h-5 w-5" />
                                Needs Attention
                            </h3>
                            <div className="space-y-3">
                                {groupedGoals['at-risk'].map(goal => (
                                    <RoadmapGoalCard
                                        key={goal.id}
                                        goal={goal}
                                        onEdit={(g) => { setEditingGoal(g); setShowGoalForm(true); }}
                                        onToggleLock={handleToggleLock}
                                        onCompleteMilestone={handleCompleteMilestone}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* In Progress */}
                    {groupedGoals['in-progress'].length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-800">
                                    <Target className="h-5 w-5 text-primary-500" />
                                    In Progress
                                </h3>
                                {latestSharedAssessment && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSharedAssessment(!showSharedAssessment)}
                                        className={`flex items-center gap-2 ${showSharedAssessment ? 'bg-violet-50 border-violet-200 text-violet-700' : 'border-neutral-200 text-neutral-600'}`}
                                    >
                                        {showSharedAssessment ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        {showSharedAssessment ? 'Hide Home Assessment' : 'View Home Assessment'}
                                    </Button>
                                )}
                            </div>

                            {/* Shared Assessment Display (if toggled) */}
                            {showSharedAssessment && latestSharedAssessment && (
                                <Card className="mb-4 border-l-4 border-l-violet-500 bg-gradient-to-r from-violet-50 to-transparent animate-in slide-in-from-top-4 duration-300">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 text-violet-800">
                                                    <Award className="h-4 w-4" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Home Assessment Insights</span>
                                                </div>
                                                <p className="text-sm italic text-neutral-600 bg-white/60 p-3 rounded-lg border border-violet-100 leading-relaxed">
                                                    "{latestSharedAssessment.summary?.score}% Progress: {latestSharedAssessment.summary?.interpretation}"
                                                </p>
                                                <div className="mt-3 grid grid-cols-3 gap-2">
                                                    {latestSharedAssessment.games?.slice(0, 6).map((g, i) => (
                                                        <div key={i} className="bg-white p-2 rounded border border-neutral-100 text-center">
                                                            <p className="text-[10px] text-neutral-400 uppercase font-bold">Game {i + 1}</p>
                                                            <p className="text-xs font-bold text-green-600">{g.results?.score || 100}%</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="md:w-40 flex flex-col items-center justify-center p-4 bg-violet-600 text-white rounded-xl shadow-lg shrink-0">
                                                <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Score</p>
                                                <p className="text-4xl font-black">{latestSharedAssessment.summary?.score}%</p>
                                                <p className="text-[10px] mt-1 opacity-80">Shared: {new Date(latestSharedAssessment.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            <div className="space-y-3">
                                {groupedGoals['in-progress'].map(goal => (
                                    <RoadmapGoalCard
                                        key={goal.id}
                                        goal={goal}
                                        onEdit={(g) => { setEditingGoal(g); setShowGoalForm(true); }}
                                        onToggleLock={handleToggleLock}
                                        onCompleteMilestone={handleCompleteMilestone}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed */}
                    {groupedGoals.completed.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-green-700 mb-3">
                                <CheckCircle2 className="h-5 w-5" />
                                Completed
                            </h3>
                            <div className="space-y-3">
                                {groupedGoals.completed.map(goal => (
                                    <RoadmapGoalCard
                                        key={goal.id}
                                        goal={goal}
                                        onEdit={(g) => { setEditingGoal(g); setShowGoalForm(true); }}
                                        onToggleLock={handleToggleLock}
                                        onCompleteMilestone={handleCompleteMilestone}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {roadmap.length === 0 && (
                        <Card className="p-8 text-center">
                            <Target className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                            <p className="text-neutral-500">No goals created yet.</p>
                            <Button className="mt-4" onClick={() => setShowGoalForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Goal
                            </Button>
                        </Card>
                    )}
                </div>
            ) : (
                <Card cla ssName="p-8 text-center">
                    <Target className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-500">Select a patient to view their roadmap.</p>
                </Card>
            )}

            {/* Goal Form Modal */}
            {showGoalForm && (
                <GoalFormModal
                    goal={editingGoal}
                    onSave={handleSaveGoal}
                    onClose={() => { setShowGoalForm(false); setEditingGoal(null); }}
                />
            )}
        </div>
    );
};

export default RoadmapEditor;
