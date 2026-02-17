// ============================================================
// NeuroBridge™ - My Children Module
// Therapist Console - Child Caseload Management
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
    Play,
    FileText,
    Upload,
    Download,
    PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// Child Card Component
const ChildCard = ({ child, sessions, skillScores, onSelect }) => {
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
                                recentSession.engagement >= 40 ? 'text-yellow-600' : 'text-red-600'
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

// Child Detail Modal
const ChildDetailModal = ({ child, sessions, skillScores, onClose }) => {
    const navigate = useNavigate();
    const { getChildDocuments, addDocument, addNotification } = useApp();
    const [activeTab, setActiveTab] = useState('summary');
    const fileInputRef = React.useRef(null);
    const documents = getChildDocuments(child.id);

    if (!child) return null;

    const handleLogNewSession = () => {
        // Navigate to session log with childId in state
        navigate('/therapist/log', { state: { childId: child.id } });
        onClose();
    };

    const handleViewFullProfile = () => {
        // Navigate to child detail or expand view
        // For now, we'll show an expanded view with more details
        // In production, this could navigate to a dedicated child profile page
        navigate('/therapist/patients', { state: { expandedPatient: child.id } });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 relative">
                    {/* Quick Access Documents Badge */}
                    <button
                        onClick={() => setActiveTab('documents')}
                        className="absolute top-4 right-14 flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-full border border-violet-100 hover:bg-violet-100 transition-all group scale-95"
                    >
                        <FileText className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{documents.length} Reports</span>
                    </button>

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

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-neutral-100 mb-6">
                        {['summary', 'skills', 'documents', 'sessions'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'summary' && (
                        <>
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

                            {/* Recent Wins */}
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
                                <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:bg-primary-50" onClick={handleViewFullProfile}>
                                    See Full Memory Box →
                                </Button>
                            </div>

                            {/* Key Clinical Reports (Direct Preview in Summary) */}
                            {documents.length > 0 && (
                                <div className="animate-in slide-in-from-top-4 duration-500">
                                    <h3 className="font-black text-neutral-800 tracking-tight uppercase text-xs mb-3">Key Clinical Reports</h3>
                                    <div className="space-y-2">
                                        {documents.slice(0, 2).map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between p-3 bg-violet-50/50 rounded-xl border border-violet-100/50 hover:bg-violet-100/50 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-violet-600" />
                                                    <span className="text-xs font-bold text-neutral-700">{doc.title}</span>
                                                </div>
                                                <span className="text-[9px] font-black text-violet-400 uppercase tracking-tighter">{doc.category}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'skills' && (
                        <div className="mb-6 animate-in fade-in duration-300">
                            <h3 className="font-semibold text-neutral-800 mb-3">Skill Domains Overview</h3>
                            <div className="space-y-4">
                                {skillScores.map(skill => (
                                    <div key={skill.id} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-neutral-700">{skill.domain}</span>
                                            <span className="font-black text-primary-600">{skill.score}%</span>
                                        </div>
                                        <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${skill.score >= 70 ? 'bg-green-500' :
                                                    skill.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${skill.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="mb-6 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-neutral-800 tracking-tight uppercase text-xs">Clinical & Baseline Archive</h3>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            addDocument({
                                                childId: child.id,
                                                title: file.name.replace(/\.[^/.]+$/, ""),
                                                type: 'Other',
                                                category: 'Clinical',
                                                format: file.type.split('/')[1] || 'pdf',
                                                uploadedBy: 'Therapist',
                                                fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                                                url: URL.createObjectURL(file)
                                            });
                                            addNotification({
                                                type: 'success',
                                                title: 'Document Archived',
                                                message: `${file.name} added to dossier.`
                                            });
                                        }
                                    }}
                                />
                                <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest gap-2"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-3.5 w-3.5" /> Upload File
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {documents.length > 0 ? documents.map(doc => (
                                    <div key={doc.id} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center gap-4 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-primary-50 transition-colors">
                                            <FileText className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-neutral-800 text-sm">{doc.title}</p>
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${doc.category === 'Baseline' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {doc.category}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-medium text-neutral-400 mt-0.5">
                                                Added {new Date(doc.date).toLocaleDateString()} • {doc.fileSize} • By {doc.uploadedBy}
                                            </p>
                                        </div>
                                        <button className="p-2 text-neutral-300 hover:text-primary-600 transition-colors">
                                            <Download className="h-5 w-5" />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                                        <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                                        <p className="text-xs text-neutral-500 font-medium">No documents archived yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="animate-in fade-in duration-300">
                            <h3 className="font-black text-neutral-800 mb-3 tracking-tight uppercase text-xs">Full Session History</h3>
                            <div className="space-y-2">
                                {sessions.map(session => (
                                    <div key={session.id} className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between border border-neutral-100/50 hover:bg-white hover:shadow-sm transition-all">
                                        <div>
                                            <p className="font-bold text-neutral-800 text-sm">{session.type}</p>
                                            <p className="text-[10px] font-medium text-neutral-400">
                                                {new Date(session.date).toLocaleDateString()} • {session.duration}min
                                            </p>
                                            {session.aiSummary && <p className="text-[9px] text-neutral-500 mt-1 line-clamp-1 italic">"{session.aiSummary}"</p>}
                                        </div>
                                        {session.engagement && (
                                            <span className={`text-[11px] font-black ${session.engagement >= 80 ? 'text-green-600' :
                                                session.engagement >= 40 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {session.engagement}%
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex gap-3 mt-8 pt-6 border-t border-neutral-100">
                        <Button className="flex-2 h-12 shadow-lg shadow-primary-200" onClick={handleLogNewSession}>
                            <PlusCircle className="h-4 w-4 mr-2" /> Start New Session
                        </Button>
                        <Button variant="outline" className="flex-1 h-12" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main My Children Component
const MyChildren = () => {
    const { currentUser, kids, getChildSessions, getLatestSkillScores } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChild, setSelectedChild] = useState(null);

    // Get therapist's children
    const therapistId = currentUser?.id || 't1';
    const myChildren = kids.filter(k => (k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : [])).includes(therapistId));

    // Filter children
    const filteredChildren = myChildren.filter(child => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                child.name.toLowerCase().includes(query) ||
                child.diagnosis.toLowerCase().includes(query)
            );
        }
        return true;
    });

    // Get child data for modal
    const selectedChildData = selectedChild ? {
        child: selectedChild,
        sessions: getChildSessions(selectedChild.id),
        skillScores: getLatestSkillScores(selectedChild.id)
    } : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">My Children</h2>
                    <p className="text-neutral-500">Manage your caseload of {myChildren.length} children</p>
                </div>
                <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Add New Child
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
                            <p className="text-2xl font-bold text-neutral-800">{myChildren.length}</p>
                            <p className="text-sm text-neutral-500">Total Children</p>
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
                                {myChildren.filter(p => {
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
                                {myChildren.filter(p => {
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
                                {myChildren.reduce((acc, p) => {
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
                        placeholder="Search children..."
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

            {/* Child Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredChildren.length > 0 ? (
                    filteredChildren.map(child => (
                        <ChildCard
                            key={child.id}
                            child={child}
                            sessions={getChildSessions(child.id).filter(s => s.status === 'completed')}
                            skillScores={getLatestSkillScores(child.id)}
                            onSelect={() => setSelectedChild(child)}
                        />
                    ))
                ) : (
                    <Card className="col-span-2 p-8 text-center">
                        <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-500">No children found.</p>
                    </Card>
                )}
            </div>

            {/* Child Detail Modal */}
            {selectedChildData && (
                <ChildDetailModal
                    child={selectedChildData.child}
                    sessions={selectedChildData.sessions}
                    skillScores={selectedChildData.skillScores}
                    onClose={() => setSelectedChild(null)}
                />
            )}
        </div>
    );
};

export default MyChildren;
