import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, User, Clock, CheckCircle, XCircle, Loader2, Search, Filter, Activity } from 'lucide-react';
import { appointmentAPI } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useApp } from '../../lib/context';

const IncomingAppointments = () => {
    const { currentUser } = useApp();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await appointmentAPI.listAll();
            // Filter to only show pending ones for the therapist to act on
            setAppointments(response.data || []);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            setProcessingId(id);
            await appointmentAPI.updateStatus(id, newStatus, currentUser?.name || 'Unknown');
            // Update local state
            setAppointments(prev => prev.map(appt =>
                appt.id === id ? { ...appt, status: newStatus } : appt
            ));
        } catch (error) {
            console.error(`Failed to ${newStatus} appointment`, error);
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = appointments.filter(a =>
        (a.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.department?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name or clinical need..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-xs shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2rem] border border-dashed border-neutral-200">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-500 mb-4" />
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Synchronizing Waitlist...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((appt) => (
                        <Card key={appt.id} className={cn(
                            "group hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] border-none relative overflow-hidden",
                            appt.status === 'approved' ? 'bg-emerald-50/30' :
                                appt.status === 'declined' ? 'bg-rose-50/30' : 'bg-white'
                        )}>
                            <div className={cn(
                                "absolute top-0 left-0 w-full h-1.5",
                                appt.status === 'approved' ? 'bg-emerald-500' :
                                    appt.status === 'declined' ? 'bg-rose-500' :
                                        appt.status === 'pending' ? 'bg-amber-400' : 'bg-primary-500'
                            )} />

                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xl shadow-inner border border-primary-100/50">
                                            {appt.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-neutral-900 uppercase text-sm tracking-tight">{appt.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-primary-100/50">
                                                    {appt.mode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                        appt.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            appt.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        {appt.status}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <div className="p-2 bg-neutral-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all duration-500">
                                            <Calendar className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Requested Date</p>
                                            <p className="text-sm font-bold text-neutral-800">
                                                {new Date(appt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-neutral-600">
                                        <div className="p-2 bg-neutral-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all duration-500">
                                            <Activity className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Clinical Need</p>
                                            <p className="text-sm font-bold text-neutral-800">{appt.department}</p>
                                        </div>
                                    </div>
                                </div>

                                {appt.status === 'pending' && (
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => handleStatusUpdate(appt.id, 'approved')}
                                            disabled={processingId === appt.id}
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20"
                                        >
                                            {processingId === appt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                                <span className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Approve
                                                </span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleStatusUpdate(appt.id, 'declined')}
                                            disabled={processingId === appt.id}
                                            className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Decline
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200">
                    <Calendar className="h-16 w-16 text-neutral-200 mx-auto mb-4" />
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">No appointments found</p>
                </div>
            )}
        </div>
    );
};

export default IncomingAppointments;
