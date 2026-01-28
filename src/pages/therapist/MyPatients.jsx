// ============================================================
// NeuroBridge™ - My Patients Module
// Therapist Console - Patient Caseload Management
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    Minus,
    Clock,
    Calendar,
    ChevronRight,
    Activity,
    AlertTriangle,
    Star,
    X,
    Heart,
    Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// Patient Card Component
const PatientCard = ({ child, sessions, skillScores, onSelect }) => {
    const recentSession = sessions[0];
    const avgScore = skillScores.length > 0
        ? Math.round(skillScores.reduce((a, b) => a + b.score, 0) / skillScores.length)
        : 0;

    const improvingCount = skillScores.filter(s => s.trend === 'improving').length;
    const attentionCount = skillScores.filter(s => s.trend === 'attention').length;

    const overallTrend = improvingCount > attentionCount ? 'improving' :
        attentionCount > improvingCount ? 'attention' : 'stable';

    const trendConfig = {
        improving: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
        stable: { icon: Minus, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        attention: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' }
    };

    const { icon: TrendIcon, color, bg } = trendConfig[overallTrend];

    return (
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={onSelect}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={child.photoUrl}
                            alt={child.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-neutral-200"
                        />
                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${bg}`}>
                            <TrendIcon className={`h-3 w-3 ${color}`} />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
                                    {child.name}
                                </h3>
                                <p className="text-sm text-neutral-500">{child.age} years • {child.diagnosis}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-primary-500 transition-colors" />
                        </div>

                        {/* Programs */}
                        <div className="flex flex-wrap gap-1 mt-2">
                            {child.program.map((prog, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs">
                                    {prog}
                                </span>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-100">
                            <div className="text-center">
                                <p className="text-lg font-bold text-neutral-800">{avgScore}%</p>
                                <p className="text-xs text-neutral-500">Avg Score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-neutral-800">{sessions.length}</p>
                                <p className="text-xs text-neutral-500">Sessions</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-neutral-800">{child.streak}</p>
                                <p className="text-xs text-neutral-500">Day Streak</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Session */}
                {recentSession && (
                    <div className="mt-4 p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-neutral-400" />
                            <span className="text-sm text-neutral-600">
                                Last: {new Date(recentSession.date).toLocaleDateString()} - {recentSession.type}
                            </span>
                        </div>
                        {recentSession.engagement && (
                            <span className={`text-sm font-medium ${recentSession.engagement >= 80 ? 'text-green-600' :
                                recentSession.engagement >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {recentSession.engagement}% engagement
                            </span>
                        )}
                    </div>
                )}

                {/* Needs Attention Alert */}
                {attentionCount >= 2 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">
                            {attentionCount} skill areas need attention
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Patient Detail Modal
const PatientDetailModal = ({ child, sessions, skillScores, onClose }) => {
    const navigate = useNavigate();

    if (!child) return null;

    const handleLogNewSession = () => {
        // Navigate to session log with childId in state
        navigate('/therapist/log', { state: { childId: child.id } });
        onClose();
    };

    const handleViewFullProfile = () => {
        // Navigate to patient detail or expand view
        // For now, we'll show an expanded view with more details
        // In production, this could navigate to a dedicated patient profile page
        navigate('/therapist/patients', { state: { expandedPatient: child.id } });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 relative">
                    {/* Close Button at Top Right */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors p-1 z-10"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-6 mb-8 pr-8 animate-in slide-in-from-left duration-500">
                        <div className="relative">
                            <img
                                src={child.photoUrl}
                                alt={child.name}
                                className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-xl"
                            />
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                <Heart className="h-4 w-4 text-white fill-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-neutral-800 tracking-tight">{child.name}</h2>
                            <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest mt-1">{child.age} years • {child.diagnosis}</p>
                            <div className="flex gap-2 mt-3">
                                {child.program.map((prog, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-primary-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm">
                                        {prog}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-neutral-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-neutral-800">{child.schoolReadinessScore}%</p>
                            <p className="text-xs text-neutral-500">School Ready</p>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-neutral-800">{child.streak}</p>
                            <p className="text-xs text-neutral-500">Day Streak</p>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-neutral-800">{sessions.filter(s => s.status === 'completed').length}</p>
                            <p className="text-xs text-neutral-500">Sessions</p>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-neutral-800">
                                {Math.round(sessions.reduce((a, b) => a + (b.engagement || 0), 0) / sessions.filter(s => s.engagement).length || 0)}%
                            </p>
                            <p className="text-xs text-neutral-500">Avg Engage</p>
                        </div>
                    </div>

                    {/* Skills Overview */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-neutral-800 mb-3">Skill Scores</h3>
                        <div className="space-y-3">
                            {skillScores.map(skill => (
                                <div key={skill.id} className="flex items-center gap-3">
                                    <span className="w-40 text-sm text-neutral-600 truncate">{skill.domain}</span>
                                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${skill.trend === 'improving' ? 'bg-green-500' :
                                                skill.trend === 'attention' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`}
                                            style={{ width: `${skill.score}%` }}
                                        />
                                    </div>
                                    <span className="w-12 text-sm font-medium text-neutral-700">{skill.score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Wins (Memory Box Integration) */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-black text-neutral-800 tracking-tight uppercase text-xs">Recent Wins from Home 💝</h3>
                            <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">New Unseen</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative aspect-video bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-100 group">
                                <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Win" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="h-6 w-6 text-white fill-white" />
                                </div>
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-[9px] font-bold text-white truncate">"First full sentence!"</p>
                                </div>
                            </div>
                            <div className="relative aspect-video bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-100 group">
                                <img src="https://images.unsplash.com/photo-1544126592-807daa215a05?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Win" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-[9px] font-bold text-white truncate">"Self-feeding success"</p>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:bg-primary-50">
                            See Full Memory Box →
                        </Button>
                    </div>

                    {/* Recent Sessions */}
                    <div>
                        <h3 className="font-black text-neutral-800 mb-3 tracking-tight uppercase text-xs">Recent Clinical Sessions</h3>
                        <div className="space-y-2">
                            {sessions.slice(0, 3).map(session => (
                                <div key={session.id} className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between border border-neutral-100/50">
                                    <div>
                                        <p className="font-bold text-neutral-800 text-sm">{session.type}</p>
                                        <p className="text-[10px] font-medium text-neutral-400">
                                            {new Date(session.date).toLocaleDateString()} • {session.duration}min
                                        </p>
                                    </div>
                                    {session.engagement && (
                                        <span className={`text-[11px] font-black ${session.engagement >= 80 ? 'text-green-600' :
                                            session.engagement >= 60 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {session.engagement}%
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <Button className="flex-1" onClick={handleLogNewSession}>
                            Log New Session
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={handleViewFullProfile}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main My Patients Component
const MyPatients = () => {
    const { currentUser, kids, getChildSessions, getLatestSkillScores } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Get therapist's patients
    const therapistId = currentUser?.id || 't1';
    const myPatients = kids.filter(k => k.therapistId === therapistId);

    // Filter patients
    const filteredPatients = myPatients.filter(child => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                child.name.toLowerCase().includes(query) ||
                child.diagnosis.toLowerCase().includes(query)
            );
        }
        return true;
    });

    // Get patient data for modal
    const selectedPatientData = selectedPatient ? {
        child: selectedPatient,
        sessions: getChildSessions(selectedPatient.id),
        skillScores: getLatestSkillScores(selectedPatient.id)
    } : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">My Patients</h2>
                    <p className="text-neutral-500">Manage your caseload of {myPatients.length} patients</p>
                </div>
                <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Add New Patient
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-primary-100 rounded-xl">
                            <Users className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-800">{myPatients.length}</p>
                            <p className="text-sm text-neutral-500">Total Patients</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-800">
                                {myPatients.filter(p => {
                                    const scores = getLatestSkillScores(p.id);
                                    return scores.filter(s => s.trend === 'improving').length > 2;
                                }).length}
                            </p>
                            <p className="text-sm text-neutral-500">Progressing Well</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-xl">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-800">
                                {myPatients.filter(p => {
                                    const scores = getLatestSkillScores(p.id);
                                    return scores.filter(s => s.trend === 'attention').length >= 2;
                                }).length}
                            </p>
                            <p className="text-sm text-neutral-500">Need Attention</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <Calendar className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-800">
                                {myPatients.reduce((acc, p) => {
                                    const sessions = getChildSessions(p.id);
                                    const today = new Date().toISOString().split('T')[0];
                                    return acc + sessions.filter(s => s.date.startsWith(today)).length;
                                }, 0)}
                            </p>
                            <p className="text-sm text-neutral-500">Sessions Today</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                </Button>
            </div>

            {/* Patient Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPatients.length > 0 ? (
                    filteredPatients.map(child => (
                        <PatientCard
                            key={child.id}
                            child={child}
                            sessions={getChildSessions(child.id).filter(s => s.status === 'completed')}
                            skillScores={getLatestSkillScores(child.id)}
                            onSelect={() => setSelectedPatient(child)}
                        />
                    ))
                ) : (
                    <Card className="col-span-2 p-8 text-center">
                        <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-500">No patients found.</p>
                    </Card>
                )}
            </div>

            {/* Patient Detail Modal */}
            {selectedPatientData && (
                <PatientDetailModal
                    child={selectedPatientData.child}
                    sessions={selectedPatientData.sessions}
                    skillScores={selectedPatientData.skillScores}
                    onClose={() => setSelectedPatient(null)}
                />
            )}
        </div>
    );
};

export default MyPatients;
