/**
 * Admin Login Page
 * Secure login interface for clinical directors and admins with modern UI
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, Mail, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));
        setApiError('');
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await login(formData.email, formData.password, 'admin');
            // Redirect to admin dashboard on success
            navigate('/admin/dashboard');
        } catch (error) {
            setApiError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    // Quick fill demo credentials
    const fillDemoCredentials = () => {
        setFormData({
            email: 'anjali.sharma@neurobridge.com',
            password: 'Admin@123',
        });
        setErrors({});
        setApiError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl mb-4 shadow-lg">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-800 mb-2">Director Panel</h1>
                    <p className="text-neutral-500">Clinical oversight & operations access</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
                    {/* API Error Message */}
                    {apiError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-red-800">Access Denied</p>
                                <p className="text-sm text-red-600">{apiError}</p>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-neutral-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-neutral-300 focus:ring-slate-800'
                                        } rounded-xl focus:ring-2 focus:outline-none transition-all`}
                                    placeholder="admin@neurobridge.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                                Secure Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-neutral-400" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-neutral-300 focus:ring-slate-800'
                                        } rounded-xl focus:ring-2 focus:outline-none transition-all`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In as Admin
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs font-medium text-slate-700 mb-3">Clinical Director Access:</p>

                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-slate-800">Director Anjali Sharma</p>
                                <button
                                    type="button"
                                    onClick={fillDemoCredentials}
                                    className="text-xs text-slate-600 hover:text-slate-700 font-medium hover:underline"
                                >
                                    Quick Fill
                                </button>
                            </div>
                            <p className="text-xs text-slate-600">
                                <span className="font-medium">Email:</span> anjali.sharma@neurobridge.com
                            </p>
                            <p className="text-xs text-slate-600">
                                <span className="font-medium">Password:</span> Admin@123
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-neutral-500 mt-6 font-medium">
                    <ShieldCheck className="w-4 h-4 inline-block mr-1 mb-0.5" />
                    NeuroBridge™ Enterprise Security
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
