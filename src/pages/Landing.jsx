import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, Building2, ArrowRight, ShieldCheck, Activity, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { USERS, CHILDREN } from '../data/mockData';
import { useApp } from '../lib/context';

const Landing = () => {
    const navigate = useNavigate();
    const { login } = useApp();
    const [selectedRole, setSelectedRole] = useState(null);

    // Get users by role
    const parents = USERS.filter(u => u.role === 'parent');
    const therapists = USERS.filter(u => u.role === 'therapist');
    const admins = USERS.filter(u => u.role === 'admin');

    const handleUserLogin = (role, userId) => {
        const success = login(role, userId);
        if (success) {
            navigate(`/${role}/dashboard`);
        } else {
            alert('Login failed. Please try again.');
        }
    };

    const getChildForParent = (parentId) => {
        const parent = USERS.find(u => u.id === parentId);
        return CHILDREN.find(c => c.id === parent?.childId);
    };

    // Role Selection View
    if (!selectedRole) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col items-center justify-center p-4">
                <div className="max-w-4xl w-full space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-md mb-4">
                            <Activity className="h-8 w-8 text-primary-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                            NeuroBridge™
                        </h1>
                        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                            The intelligent platform connecting parents, therapists, and clinical directors for transparent, measurable autism therapy.
                        </p>
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        {/* Parent */}
                        <Card
                            clickable
                            className="border-t-4 border-t-primary-500 hover:-translate-y-1 transition-transform"
                            onClick={() => setSelectedRole('parent')}
                        >
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                                    <User className="h-6 w-6" />
                                </div>
                                <CardTitle>Parent Access</CardTitle>
                                <CardDescription>Track progress & daily updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm text-neutral-500 space-y-2 mb-6">
                                    <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-primary-400" /> View Therapy Session Summaries</li>
                                    <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-primary-400" /> Check Growth Milestones</li>
                                    <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-primary-400" /> Access Home Activities</li>
                                </ul>
                                <Button className="w-full">
                                    Select Parent Account <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Therapist */}
                        <Card
                            clickable
                            className="border-t-4 border-t-secondary-500 hover:-translate-y-1 transition-transform"
                            onClick={() => navigate('/therapist/login')}
                        >
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-secondary-100 text-secondary-600 flex items-center justify-center mb-4">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <CardTitle>Therapist Workspace</CardTitle>
                                <CardDescription>Log sessions & analyze data</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm text-neutral-500 space-y-2 mb-6">
                                    <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-secondary-400" /> Quick Session Logging</li>
                                    <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-secondary-400" /> Patient Analytics Dashboard</li>
                                    <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-secondary-400" /> AI-Assisted Planning</li>
                                </ul>
                                <Button variant="secondary" className="w-full">
                                    Select Therapist Account <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Admin */}
                        <Card
                            clickable
                            className="border-t-4 border-t-neutral-600 hover:-translate-y-1 transition-transform"
                            onClick={() => handleUserLogin('admin', 'a1')}
                        >
                            <CardHeader>
                                <div className="h-12 w-12 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center mb-4">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <CardTitle>CDC Admin</CardTitle>
                                <CardDescription>Clinical oversight & operations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm text-neutral-500 space-y-2 mb-6">
                                    <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-neutral-400" /> Operational Metrics</li>
                                    <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-neutral-400" /> Compliance & Audit Logs</li>
                                    <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-neutral-400" /> Staff Management</li>
                                </ul>
                                <Button variant="outline" className="w-full">Login as Admin</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 flex justify-center space-x-8 text-neutral-400 text-sm">
                        <div className="flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-2" /> HIPAA Compliant
                        </div>
                        <div className="flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-2" /> 256-bit Encryption
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // User Selection View for Parents
    if (selectedRole === 'parent') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col items-center justify-center p-4">
                <div className="max-w-3xl w-full space-y-8">
                    <div className="text-center space-y-4">
                        <button
                            onClick={() => setSelectedRole(null)}
                            className="text-primary-600 hover:text-primary-800 flex items-center justify-center mx-auto mb-4"
                        >
                            <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Back to Role Selection
                        </button>
                        <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full shadow-md mb-4">
                            <User className="h-8 w-8 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-800">Select Parent Account</h1>
                        <p className="text-neutral-500">Choose which parent account to log in as</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {parents.map(parent => {
                            const child = getChildForParent(parent.id);
                            return (
                                <Card
                                    key={parent.id}
                                    clickable
                                    className="hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-primary-200"
                                    onClick={() => handleUserLogin('parent', parent.id)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={parent.avatar}
                                                alt={parent.name}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-primary-200"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-neutral-800">{parent.name}</h3>
                                                <p className="text-sm text-neutral-500">{parent.email}</p>
                                                {child && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <img
                                                            src={child.photoUrl}
                                                            alt={child.name}
                                                            className="w-6 h-6 rounded-full"
                                                        />
                                                        <span className="text-sm text-primary-600 font-medium">
                                                            Parent of {child.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-neutral-300" />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // User Selection View for Therapists
    if (selectedRole === 'therapist') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-secondary-100 flex flex-col items-center justify-center p-4">
                <div className="max-w-3xl w-full space-y-8">
                    <div className="text-center space-y-4">
                        <button
                            onClick={() => setSelectedRole(null)}
                            className="text-secondary-600 hover:text-secondary-800 flex items-center justify-center mx-auto mb-4"
                        >
                            <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Back to Role Selection
                        </button>
                        <div className="inline-flex items-center justify-center p-3 bg-secondary-100 rounded-full shadow-md mb-4">
                            <Stethoscope className="h-8 w-8 text-secondary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-800">Select Therapist Account</h1>
                        <p className="text-neutral-500">Choose which therapist account to log in as</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {therapists.map(therapist => (
                            <Card
                                key={therapist.id}
                                clickable
                                className="hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-secondary-200"
                                onClick={() => handleUserLogin('therapist', therapist.id)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={therapist.avatar}
                                            alt={therapist.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-secondary-200"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-neutral-800">{therapist.name}</h3>
                                            <p className="text-sm text-secondary-600 font-medium">{therapist.specialization}</p>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                {therapist.experience} experience • {therapist.caseload?.length || 0} patients
                                            </p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-neutral-300" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Landing;
