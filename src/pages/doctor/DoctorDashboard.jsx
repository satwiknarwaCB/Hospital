/**
 * Doctor Dashboard
 * Main dashboard view for authenticated doctors
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, Calendar, Activity, Award, Loader2, AlertCircle } from 'lucide-react';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { doctor, getDoctorProfile, loading } = useAuth();
    const [profileData, setProfileData] = useState(doctor);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        // Fetch fresh profile data on mount
        if (!profileData) {
            refreshProfile();
        }
    }, []);

    const refreshProfile = async () => {
        try {
            setIsRefreshing(true);
            const data = await getDoctorProfile();
            setProfileData(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (loading || isRefreshing) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-neutral-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-neutral-500">No profile data available</p>
                    <button
                        onClick={refreshProfile}
                        className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-neutral-900 rounded-[2.5rem] p-10 text-white shadow-2xl group transition-all duration-700">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 blur-[100px] rounded-full -mr-48 -mt-48 group-hover:bg-primary-500/30 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 blur-[80px] rounded-full -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-black mb-2 tracking-tight">
                            Namaste, Dr. {profileData.name.split(' ')[1] || profileData.name}! 👋
                        </h1>
                        <p className="text-primary-300 text-lg font-bold uppercase tracking-widest text-[11px]">
                            {profileData.specialization} • Senior Consultant
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 text-center border border-white/10 shadow-xl min-w-[120px]">
                            <div className="text-4xl font-black">{profileData.experience_years}</div>
                            <div className="text-[10px] font-black text-primary-300 uppercase tracking-widest">Growth Yrs</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 text-center border border-white/10 shadow-xl min-w-[120px]">
                            <div className="text-4xl font-black text-green-400">{profileData.assigned_patients}</div>
                            <div className="text-[10px] font-black text-green-300/70 uppercase tracking-widest">Lives Impacted</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glanceable Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card border-none hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Efficiency</span>
                        </div>
                        <p className="text-3xl font-black text-neutral-800 mb-1">{profileData.experience_years}YRS</p>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-tighter">Clinical Practice</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Active</span>
                        </div>
                        <p className="text-3xl font-black text-neutral-800 mb-1">{profileData.assigned_patients}</p>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-tighter">Total Patients</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none hover:-translate-y-1 doctor-card-urgent">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Urgent</span>
                        </div>
                        <p className="text-3xl font-black text-red-600 mb-1">3</p>
                        <p className="text-xs font-bold text-red-400 uppercase tracking-tighter">Needs Review</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none hover:-translate-y-1">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Today</span>
                        </div>
                        <p className="text-3xl font-black text-neutral-800 mb-1">8</p>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-tighter">Appointments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Glanceable Patient Status Grid (The Traffic Light) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-neutral-800 tracking-tight">Patient Care Tracking 🏥</h2>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase"><span className="h-2 w-2 bg-red-500 rounded-full" /> Declining</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-500 uppercase"><span className="h-2 w-2 bg-yellow-500 rounded-full" /> Stale</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase"><span className="h-2 w-2 bg-green-500 rounded-full" /> Improving</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="glass-card border-none doctor-card-stable overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-neutral-100 rounded-full overflow-hidden" />
                                    <div>
                                        <h4 className="font-bold text-neutral-800">Aarav Sharma</h4>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase">ASD - Level 2</p>
                                    </div>
                                </div>
                                <Activity className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400">
                                    <span>Weekly Activity</span>
                                    <span className="text-green-600">85% Improved</span>
                                </div>
                                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: '85%' }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-none doctor-card-urgent overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-neutral-100 rounded-full overflow-hidden" />
                                    <div>
                                        <h4 className="font-bold text-neutral-800">Ishani Gupta</h4>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase">Sensory Processing</p>
                                    </div>
                                </div>
                                <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase text-neutral-400">
                                    <span>Weekly Activity</span>
                                    <span className="text-red-600">No Activity for 3 days</span>
                                </div>
                                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-400" style={{ width: '20%' }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Detailed Profile Information */}
            <Card className="shadow-lg">
                <CardHeader className="border-b border-neutral-100">
                    <CardTitle className="text-2xl">Doctor Profile</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="text-sm font-medium text-neutral-500 block mb-1">
                                Full Name
                            </label>
                            <p className="text-lg font-semibold text-neutral-800">
                                {profileData.name}
                            </p>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm font-medium text-neutral-500 block mb-1">
                                Email Address
                            </label>
                            <p className="text-lg font-semibold text-neutral-800">
                                {profileData.email}
                            </p>
                        </div>

                        {/* Phone */}
                        {profileData.phone && (
                            <div>
                                <label className="text-sm font-medium text-neutral-500 block mb-1">
                                    Phone Number
                                </label>
                                <p className="text-lg font-semibold text-neutral-800">
                                    {profileData.phone}
                                </p>
                            </div>
                        )}

                        {/* License Number */}
                        {profileData.license_number && (
                            <div>
                                <label className="text-sm font-medium text-neutral-500 block mb-1">
                                    License Number
                                </label>
                                <p className="text-lg font-semibold text-neutral-800">
                                    {profileData.license_number}
                                </p>
                            </div>
                        )}

                        {/* Doctor ID */}
                        <div>
                            <label className="text-sm font-medium text-neutral-500 block mb-1">
                                Doctor ID
                            </label>
                            <p className="text-lg font-semibold text-neutral-800 font-mono">
                                {profileData.id}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate('/therapist/patients')}
                    className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                    <Users className="w-8 h-8 mb-2" />
                    <h3 className="font-semibold text-lg">View Patients</h3>
                    <p className="text-sm text-primary-100 mt-1">Manage patient records</p>
                </button>

                <button
                    onClick={() => navigate('/therapist/schedule')}
                    className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white p-6 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                    <Calendar className="w-8 h-8 mb-2" />
                    <h3 className="font-semibold text-lg">Schedule</h3>
                    <p className="text-sm text-secondary-100 mt-1">View appointments</p>
                </button>

                <button
                    onClick={refreshProfile}
                    className="bg-gradient-to-br from-neutral-700 to-neutral-800 text-white p-6 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                    <Activity className="w-8 h-8 mb-2" />
                    <h3 className="font-semibold text-lg">Refresh Profile</h3>
                    <p className="text-sm text-neutral-300 mt-1">Update information</p>
                </button>
            </div>
        </div>
    );
};

export default DoctorDashboard;
