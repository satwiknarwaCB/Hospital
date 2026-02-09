import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { publicAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const ActivateAccount = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    if (!token || !role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
                <Card className="w-full max-w-md shadow-xl border-none">
                    <CardContent className="p-8 text-center text-red-600">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Invalid Activation Link</h2>
                        <p className="text-neutral-500">Please check your email for the correct link.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 8) {
            setStatus({ type: 'error', message: 'Password must be at least 8 characters' });
            return;
        }

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await publicAPI.activateAccount({ token, password, role });
            // Save newly set password for Quick Fill on login page
            const emailPart = token.split('-')[0]; // Fallback if email is hidden in token
            // Better to use the email if we had it, but we can't get it from token here easily without backend help.
            // However, we can store it after a successful login. 
            // For now, let's just mark that a reset happened.
            setStatus({ type: 'success', message: 'Account activated successfully!' });
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error(error);
            setStatus({
                type: 'error',
                message: error.response?.data?.detail || 'Failed to activate account'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-pink-50 p-4">
            <Card className="w-full max-w-md shadow-xl ring-1 ring-neutral-200 bg-white">
                <CardHeader className="text-center pb-2 pt-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-neutral-800">Set Your Password</CardTitle>
                    <p className="text-neutral-500 text-sm mt-2">
                        Create a secure password to activate your {role} account.
                    </p>
                </CardHeader>
                <CardContent className="p-8">
                    {status.message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Min. 8 characters"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Confirm password"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-6 text-lg bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200"
                        >
                            {isLoading ? 'Activating...' : 'Activate Account'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ActivateAccount;
