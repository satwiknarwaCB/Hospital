/**
 * Doctor Dashboard
 * Main dashboard view for authenticated doctors
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, Calendar, Activity, Award, Loader2 } from 'lucide-react';

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
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, Dr. {profileData.name.split(' ')[1] || profileData.name}! 👋
                        </h1>
                        <p className="text-primary-100 text-lg">
                            {profileData.specialization}
                        </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold">{profileData.experience_years}</div>
                        <div className="text-sm text-primary-100">Years</div>
                    </div>
                </div>
            </div>

            {/* Doctor Profile Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Profile Info Card */}
                <Card className="border-l-4 border-l-primary-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary-500" />
                            Specialization
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-neutral-800 mb-1">
                            {profileData.specialization}
                        </p>
                        <p className="text-sm text-neutral-500">Primary Focus</p>
                    </CardContent>
                </Card>

                {/* Experience Card */}
                <Card className="border-l-4 border-l-secondary-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Award className="w-5 h-5 text-secondary-500" />
                            Experience
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-neutral-800 mb-1">
                            {profileData.experience_years} Years
                        </p>
                        <p className="text-sm text-neutral-500">Professional Practice</p>
                    </CardContent>
                </Card>

                {/* Assigned Patients Card */}
                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-500" />
                            Patients
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-neutral-800 mb-1">
                            {profileData.assigned_patients}
                        </p>
                        <p className="text-sm text-neutral-500">Currently Assigned</p>
                    </CardContent>
                </Card>

                {/* Status Card */}
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600 mb-1">
                            {profileData.is_active ? 'Active' : 'Inactive'}
                        </p>
                        <p className="text-sm text-neutral-500">Account Status</p>
                    </CardContent>
                </Card>
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
