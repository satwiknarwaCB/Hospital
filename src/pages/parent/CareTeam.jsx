import React, { useState, useMemo } from 'react';
import {
    Users,
    Search,
    Star,
    MessageCircle,
    Calendar,
    Shield,
    Award,
    ChevronRight,
    MapPin,
    Stethoscope,
    Heart,
    CheckCircle2,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';
import { userManagementAPI } from '../../lib/api';

const CareTeam = () => {
    const {
        currentUser,
        users,
        kids,
        refreshChildren,
        addNotification
    } = useApp();

    const [searchTerm, setSearchTerm] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    // Get the logged-in parent's child
    const child = kids.find(c => c.id === currentUser?.childId);

    // Filter therapists
    const therapists = useMemo(() => {
        return (users || []).filter(u => u.role === 'therapist');
    }, [users]);

    const filteredTherapists = useMemo(() => {
        if (!searchTerm) return therapists;
        const term = searchTerm.toLowerCase();
        return therapists.filter(t =>
            t.name.toLowerCase().includes(term) ||
            (t.specialization && t.specialization.toLowerCase().includes(term))
        );
    }, [therapists, searchTerm]);

    const currentTherapist = useMemo(() => {
        if (!child?.therapistId) return null;
        return therapists.find(t => t.id === child.therapistId);
    }, [child, therapists]);

    const handleAssignTherapist = async (therapistId) => {
        if (!child) return;

        setIsAssigning(true);
        try {
            await userManagementAPI.assignTherapist(child.id, therapistId);
            await refreshChildren();
            addNotification({
                type: 'success',
                title: 'Therapist Assigned!',
                message: `You have successfully selected your therapist for ${child.name}.`
            });
        } catch (error) {
            console.error('Failed to assign therapist:', error);
            addNotification({
                type: 'error',
                title: 'Assignment Failed',
                message: error.detail || 'Could not assign therapist. Please contact support.'
            });
        } finally {
            setIsAssigning(false);
        }
    };

    if (!child) {
        return (
            <div className="p-8 text-center text-neutral-500">
                Please wait until an administrator links your child to your account.
            </div>
        );
    }

    return (
        <div className="space-y-8 pb- safe-nav animate-slide-up">
            {/* Header Section */}
            <div className="relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-neutral-800 tracking-tight mb-2">
                            Your Care Team 🛡️
                        </h1>
                        <p className="text-neutral-500 font-medium">
                            Manage the dedicated specialists supporting {child.name}'s journey.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by name or specialty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Current Primary Therapist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary-600" />
                        Primary Specialist
                    </h2>

                    {currentTherapist ? (
                        <Card className="glass-card border-none overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primary-600" />
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <img
                                            src={currentTherapist.avatar}
                                            alt={currentTherapist.name}
                                            className="w-24 h-24 rounded-3xl object-cover shadow-xl grayscale-[20%] group-hover:grayscale-0 transition-all"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-full border-4 border-white shadow-lg">
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-neutral-800 mb-1">{currentTherapist.name}</h3>
                                    <p className="text-primary-600 font-bold text-sm uppercase tracking-wider mb-4">
                                        {currentTherapist.specialization || 'Clinical Specialist'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 w-full mb-6">
                                        <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">XP</p>
                                            <p className="text-sm font-bold text-neutral-700">{currentTherapist.experience_years || 5}+ Years</p>
                                        </div>
                                        <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100">
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Rating</p>
                                            <p className="text-sm font-bold text-neutral-700">4.9/5.0</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col w-full gap-2">
                                        <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary-200">
                                            <MessageCircle className="h-5 w-5 mr-2" />
                                            Direct Message
                                        </Button>
                                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-neutral-200">
                                            <Calendar className="h-5 w-5 mr-2 text-neutral-400" />
                                            View Schedule
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-2 border-dashed border-neutral-200 bg-neutral-50/50 flex flex-col items-center justify-center p-8 text-center h-[400px]">
                            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-neutral-300" />
                            </div>
                            <p className="text-neutral-500 font-medium mb-4">No specialist assigned yet.</p>
                            <p className="text-sm text-neutral-400">Choose a recommended specialist from the directory to start your journey.</p>
                        </Card>
                    )}

                    {/* Activity Feed Snippet */}
                    <Card className="mt-8 border-none bg-indigo-50 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-black text-indigo-900 uppercase tracking-widest">Team Insight ✨</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-indigo-700 font-medium leading-relaxed">
                                Specialists with a "Star" icon nearby are highly recommended for {child.diagnosis || 'your child'}'s specific needs.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Directory */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        Available Specialists
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTherapists.map((therapist) => {
                            const isCurrent = child?.therapistId === therapist.id;

                            return (
                                <Card
                                    key={therapist.id}
                                    className={`glass-card border-none transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isCurrent ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex gap-4">
                                            <div className="shrink-0">
                                                <img
                                                    src={therapist.avatar}
                                                    alt={therapist.name}
                                                    className="w-16 h-16 rounded-2xl object-cover shadow-md"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-black text-neutral-800 truncate">{therapist.name}</h4>
                                                        <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                                                            {therapist.specialization || 'Therapist'}
                                                        </p>
                                                    </div>
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                                </div>

                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-neutral-400 uppercase tracking-tighter">
                                                        <Activity className="h-3 w-3" />
                                                        {therapist.experience_years || 0} YRS
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-neutral-400 uppercase tracking-tighter">
                                                        <MapPin className="h-3 w-3" />
                                                        Main Clinic
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                                            <button className="text-xs font-bold text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1">
                                                View Profile <ChevronRight className="h-3 w-3" />
                                            </button>

                                            {isCurrent ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="h-3 w-3" /> Assigned
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    disabled={isAssigning}
                                                    onClick={() => handleAssignTherapist(therapist.id)}
                                                    className="h-9 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-neutral-200"
                                                >
                                                    Select Expert
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareTeam;
