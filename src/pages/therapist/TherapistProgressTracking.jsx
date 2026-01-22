// ============================================================
// NeuroBridge™ - Therapist Progress Management
// Clinical View for Patient Progress Tracking
// ============================================================

import React, { useState } from 'react';
import { useApp } from '../../lib/context';
import ChildProgressTracking from '../parent/ChildProgressTracking';
import {
    Users,
    Search,
    ChevronRight,
    Activity,
    Brain,
    HeartPulse
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import ActualProgress from '../../components/ActualProgress';

const TherapistProgressTracking = () => {
    const { currentUser, kids } = useApp();
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeView, setActiveView] = useState('clinical'); // 'clinical' or 'actual'

    // Filter kids assigned to this therapist or all if admin (demo logic)
    const therapistKids = kids.filter(k =>
        (k.therapistId === (currentUser?.id || 't1')) &&
        k.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedChild = kids.find(k => k.id === selectedChildId);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Patient Selection Sidebar */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
                <header className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-black text-neutral-800 tracking-tight">Case Load</h2>
                        <p className="text-sm text-neutral-500">Manage mastery for your patients</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Find a patient..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {therapistKids.map(child => (
                        <button
                            key={child.id}
                            onClick={() => setSelectedChildId(child.id)}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border-2 ${selectedChildId === child.id
                                ? 'bg-primary-50 border-primary-200 shadow-sm'
                                : 'bg-white border-transparent hover:bg-neutral-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedChildId === child.id ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'
                                        }`}>
                                        {child.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-neutral-800 text-sm">{child.name}</p>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{child.diagnosis}</p>
                                    </div>
                                </div>
                                <ChevronRight className={`h-4 w-4 transition-transform ${selectedChildId === child.id ? 'text-primary-600 translate-x-1' : 'text-neutral-300'}`} />
                            </div>
                        </button>
                    ))}

                    {therapistKids.length === 0 && (
                        <div className="text-center py-12 px-4 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                            <Users className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
                            <p className="text-sm text-neutral-500 font-medium">No patients found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-[2.5rem] border border-neutral-200/50 shadow-sm overflow-hidden flex flex-col">
                {selectedChildId ? (
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="flex items-center gap-4 mb-8 p-1 bg-neutral-100 rounded-2xl w-fit">
                            <button
                                onClick={() => setActiveView('clinical')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === 'clinical'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-700'
                                    }`}
                            >
                                1️⃣ Child Progress Tracking
                            </button>
                            <button
                                onClick={() => setActiveView('actual')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === 'actual'
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-700'
                                    }`}
                            >
                                2️⃣ Actual Progress (Planned vs Achieved)
                            </button>
                        </div>

                        {activeView === 'clinical' ? (
                            <ChildProgressTracking
                                forceChildId={selectedChildId}
                                role="therapist"
                            />
                        ) : (
                            <ActualProgress
                                childId={selectedChildId}
                                role="therapist"
                            />
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-50/50">
                        <div className="relative mb-6">
                            <div className="absolute -inset-4 bg-primary-100/50 rounded-full animate-pulse" />
                            <div className="relative h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-primary-50">
                                <Activity className="h-10 w-10 text-primary-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-neutral-800 mb-2">Patient Progress Portal</h3>
                        <p className="text-neutral-500 max-w-sm leading-relaxed">
                            Select a patient from the left to view their functional skill mastery, growth trends, and validate clinical progress.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-12 max-w-lg w-full">
                            <Card className="border-none bg-indigo-50/50 shadow-none ring-1 ring-indigo-100">
                                <CardContent className="p-4 flex flex-col items-center">
                                    <Brain className="h-6 w-6 text-indigo-500 mb-2" />
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Cognitive</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none bg-rose-50/50 shadow-none ring-1 ring-rose-100">
                                <CardContent className="p-4 flex flex-col items-center">
                                    <HeartPulse className="h-6 w-6 text-rose-500 mb-2" />
                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Adaptive</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistProgressTracking;
