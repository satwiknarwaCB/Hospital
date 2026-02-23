/**
 * Unified Login Page
 * Centralized authentication for Parents, Therapists, and Admins
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Mail, Lock, AlertCircle, Loader2, User, CheckCircle2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, signup } = useAuth();
    const [isSignup, setIsSignup] = useState(location.state?.openSignup || false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [signupSuccess, setSignupSuccess] = useState('');
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        relationship: 'Mother'
    });

    useEffect(() => {
        if (location.state?.openSignup) {
            setIsSignup(true);
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setApiError('');
    };

    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        setSignupData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSignupForm = () => {
        const newErrors = {};
        if (!signupData.name) newErrors.name = 'Full Name is required';
        if (!signupData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(signupData.email)) newErrors.email = 'Email is invalid';

        if (!signupData.password) newErrors.password = 'Password is required';
        else if (signupData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

        if (signupData.password !== signupData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!validateSignupForm()) return;

        setIsLoading(true);
        setApiError('');
        setSignupSuccess('');

        try {
            const signupPayload = {
                name: signupData.name,
                email: signupData.email,
                password: signupData.password,
                phone: signupData.phone,
                address: signupData.address,
                relationship: signupData.relationship,
                children_ids: []
            };

            await signup(signupPayload);
            setSignupSuccess('Account created successfully! You can now sign in.');
            setIsSignup(false);
            setFormData(prev => ({ ...prev, email: signupData.email }));
        } catch (error) {
            setApiError(error.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setApiError('');

        try {
            const user = await login(formData.email, formData.password);

            // Redirect based on role
            if (user.role === 'parent') {
                navigate('/parent/today');
            } else if (user.role === 'admin') {
                navigate('/admin/overview');
            } else if (user.role === 'therapist' || user.role === 'doctor') {
                navigate('/therapist/command-center');
            } else {
                // Default fallback if role is missing but login succeeded
                navigate('/');
            }
        } catch (error) {
            setApiError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex border border-neutral-100">
                <div className="flex-1 p-8 md:p-12">
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
                                {isSignup ? 'Create Account' : 'Welcome Back'}
                            </h1>
                            <p className="text-neutral-500">
                                {isSignup
                                    ? 'Join NeuroBridge™ as a parent to track progress'
                                    : 'Sign in to access your NeuroBridge™ portal'}
                            </p>
                        </div>

                        {signupSuccess && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                                <p className="text-sm text-green-600">{signupSuccess}</p>
                            </div>
                        )}

                        {apiError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <p className="text-sm text-red-600">{apiError}</p>
                            </div>
                        )}

                        {isSignup ? (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={signupData.name}
                                            onChange={handleSignupChange}
                                            className={`w-full px-4 py-3 bg-neutral-50 border ${errors.name ? 'border-red-300' : 'border-neutral-200'} rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all`}
                                            placeholder="Joy Doe"
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={signupData.email}
                                            onChange={handleSignupChange}
                                            className={`w-full px-4 py-3 bg-neutral-50 border ${errors.email ? 'border-red-300' : 'border-neutral-200'} rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all`}
                                            placeholder="joy@example.com"
                                        />
                                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={signupData.password}
                                            onChange={handleSignupChange}
                                            className={`w-full px-4 py-3 bg-neutral-50 border ${errors.password ? 'border-red-300' : 'border-neutral-200'} rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all`}
                                            placeholder="••••••••"
                                        />
                                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={signupData.confirmPassword}
                                            onChange={handleSignupChange}
                                            className={`w-full px-4 py-3 bg-neutral-50 border ${errors.confirmPassword ? 'border-red-300' : 'border-neutral-200'} rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all`}
                                            placeholder="••••••••"
                                        />
                                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={signupData.phone}
                                            onChange={handleSignupChange}
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Relationship</label>
                                        <select
                                            name="relationship"
                                            value={signupData.relationship}
                                            onChange={handleSignupChange}
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all"
                                        >
                                            <option value="Mother">Mother</option>
                                            <option value="Father">Father</option>
                                            <option value="Guardian">Guardian</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <User className="w-5 h-5" />
                                            Sign Up
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
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
                        )}

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => {
                                    setIsSignup(!isSignup);
                                    setErrors({});
                                    setApiError('');
                                    setSignupSuccess('');
                                }}
                                className="text-primary-600 font-bold hover:underline"
                            >
                                {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                            </button>
                        </div>

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
