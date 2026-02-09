/**
 * Unified Login Page
 * Centralized authentication for Parents, Therapists, and Admins
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Mail, Lock, AlertCircle, Loader2, ShieldCheck, User, Briefcase, Heart, Activity } from 'lucide-react';
import { publicAPI } from '../lib/api';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [demoUsers, setDemoUsers] = useState({ therapists: [], parents: [] });

    React.useEffect(() => {
        const fetchDemoUsers = async () => {
            try {
                const data = await publicAPI.getDemoUsers();
                setDemoUsers(data);
            } catch (error) {
                console.error('Failed to fetch demo users:', error);
            }
        };
        fetchDemoUsers();
    }, []);

    // Demo Credentials - Merge static with dynamic users
    const getDemoAccounts = () => {
        const staticParents = [
            { name: 'Priya Patel', email: 'priya.patel@parent.com', password: 'User@123' },
            { name: 'Arun Sharma', email: 'arun.sharma@parent.com', password: 'User@123' }
        ];

        const staticTherapists = [
            { name: 'Dr. Rajesh Kumar', email: 'dr.rajesh@therapist.com', password: 'User@123' },
            { name: 'Dr. Meera Singh', email: 'dr.meera@therapist.com', password: 'User@123' }
        ];

        // Merge dynamic users with static ones
        const allParents = [
            ...staticParents,
            ...demoUsers.parents
                .filter(p => !staticParents.find(sp => sp.email === p.email))
                .map(p => ({
                    ...p,
                    password: localStorage.getItem(`demo_pwd_${p.email}`) || 'User@123'
                }))
        ];

        const allTherapists = [
            ...staticTherapists,
            ...demoUsers.therapists
                .filter(t => !staticTherapists.find(st => st.email === t.email))
                .map(t => ({
                    ...t,
                    password: localStorage.getItem(`demo_pwd_${t.email}`) || 'User@123'
                }))
        ];

        return [
            {
                role: 'Parent',
                icon: Heart,
                color: 'text-pink-500',
                bg: 'bg-pink-50',
                users: allParents
            },
            {
                role: 'Therapist',
                icon: Briefcase,
                color: 'text-blue-500',
                bg: 'bg-blue-50',
                users: allTherapists
            },
            {
                role: 'Admin',
                icon: ShieldCheck,
                color: 'text-slate-700',
                bg: 'bg-slate-100',
                users: [
                    { name: 'Director Anjali Sharma', email: 'anjali.sharma@neurobridge.com', password: 'Admin@123' }
                ]
            }
        ];
    };

    const demoAccounts = getDemoAccounts();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setApiError('');

        try {
            const user = await login(formData.email, formData.password);

            // SUCCESS: Save password for Quick Fill (Local Persistence)
            localStorage.setItem(`demo_pwd_${formData.email}`, formData.password);

            // Redirect based on role
            if (user.role === 'parent') {
                navigate('/parent/today');
            } else if (user.role === 'admin') {
                navigate('/admin/overview');
            } else if (user.role === 'therapist' || user.role === 'doctor') {
                navigate('/therapist/command-center');
            } else {
                // Fallback based on email if role is somehow missing
                if (formData.email.includes('@parent.com')) {
                    navigate('/parent/today');
                } else if (formData.email.includes('@neurobridge.com')) {
                    navigate('/admin/overview');
                } else {
                    navigate('/therapist/command-center');
                }
            }
        } catch (error) {
            setApiError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemo = (email, password) => {
        setFormData({ email, password });
        setErrors({});
        setApiError('');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-neutral-100">

                {/* Demo Credentials Sidebar */}
                <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-neutral-100 overflow-y-auto max-h-[400px] md:max-h-none">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary-600" />
                            Demo Access
                        </h3>
                        <p className="text-sm text-neutral-500">Quickly test any role</p>
                    </div>

                    <div className="space-y-6">
                        {demoAccounts.map((section) => (
                            <div key={section.role}>
                                <div className="flex items-center gap-2 mb-3">
                                    <section.icon className={`w-4 h-4 ${section.color}`} />
                                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                                        {section.role} Accounts
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {section.users.map((u) => (
                                        <button
                                            key={u.email}
                                            onClick={() => fillDemo(u.email, u.password)}
                                            className="w-full text-left p-4 rounded-xl bg-white border border-neutral-100 hover:border-primary-300 hover:shadow-md transition-all group relative"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-bold text-neutral-700 group-hover:text-primary-600">{u.name}</p>
                                                <span className="text-[9px] text-neutral-300 bg-neutral-50 px-1 rounded uppercase">
                                                    {u.email.includes('@therapist.com') || u.email.includes('@parent.com') || u.email.includes('@neurobridge.com') ? 'System' : 'New'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-primary-500 font-bold text-[10px]">
                                                <Activity className="w-3 h-3" />
                                                Quick Fill Access
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Login Form Section */}
                <div className="flex-1 p-8 md:p-12">
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Welcome Back</h1>
                            <p className="text-neutral-500">Sign in to access your NeuroBridge™ portal</p>
                        </div>

                        {apiError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <p className="text-sm text-red-600">{apiError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-12 pr-4 py-3 bg-neutral-50 border ${errors.email ? 'border-red-300' : 'border-neutral-200'} rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all`}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-12 pr-4 py-3 bg-neutral-50 border ${errors.password ? 'border-red-300' : 'border-neutral-200'} rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-sm text-neutral-400 italic">
                                "The bridge between potential and achievement."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
