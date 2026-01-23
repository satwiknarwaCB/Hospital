import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, History, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import UpcomingSessions from './UpcomingSessions';
import SessionHistory from './SessionHistory';
import { cn } from '../../lib/utils';

const ParentSessions = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Check if a specific tab was requested via state (e.g., from Dashboard)
    const [activeTab, setActiveTab] = useState(() => {
        if (location.state?.activeTab) return location.state.activeTab;
        return 'upcoming'; // Default tab
    });

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    const tabs = [
        { id: 'upcoming', label: 'Upcoming', icon: Calendar },
        { id: 'history', label: 'Past Sessions', icon: History }
    ];

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-neutral-900 tracking-tight">Therapy Sessions</h2>
                    <p className="text-neutral-500">View and manage scheduled and past therapy appointments</p>
                </div>
            </header>

            {/* Tab Navigation */}
            <nav className="p-1.5 bg-neutral-100/80 backdrop-blur rounded-2xl flex gap-1 sticky top-0 z-10 shadow-sm border border-neutral-200/50 max-w-md">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold transition-all duration-300",
                            activeTab === tab.id
                                ? "bg-white text-primary-600 shadow-sm rounded-xl"
                                : "text-neutral-400 hover:text-neutral-600"
                        )}
                    >
                        <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary-600" : "text-neutral-400")} />
                        {tab.label}
                    </button>
                ))}
            </nav>

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                {activeTab === 'upcoming' ? (
                    <UpcomingSessions />
                ) : (
                    <SessionHistory />
                )}
            </div>
        </div>
    );
};

export default ParentSessions;
