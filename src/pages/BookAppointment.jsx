import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Mail, Phone, Stethoscope, CheckCircle2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { appointmentAPI } from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BookAppointmentPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        department: '',
        date: '',
        mode: 'Online'
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState('');

    const departments = [
        'Speech Therapy',
        'Occupational Therapy',
        'Behavioral Therapy',
        'Physical Therapy',
        'Psychological Counseling'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError('');

        try {
            await appointmentAPI.create(formData);
            setStatus('success');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.detail
                ? (typeof err.response.data.detail === 'string'
                    ? err.response.data.detail
                    : JSON.stringify(err.response.data.detail))
                : 'Failed to book appointment. Please try again.';
            setError(errorMessage);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center p-4 pt-24 md:pt-32">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-neutral-100 animate-in fade-in zoom-in duration-500">
                        <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Success!</h1>
                        <p className="text-neutral-600 mb-8 text-lg">Your appointment request has been received. We will contact you shortly to confirm.</p>
                        <p className="text-sm text-neutral-400">Redirecting you to home page...</p>
                        <Button onClick={() => navigate('/')} className="mt-8 bg-[#0284c7] hover:bg-sky-700 w-full py-4 text-white font-bold rounded-2xl">
                            Return to Home
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-grow pt-24 md:pt-32 pb-16">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-neutral-500 hover:text-[#0284c7] transition-colors mb-8 group"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back
                        </button>

                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-neutral-100">
                            <div className="bg-[#0284c7] p-8 md:p-10 text-white text-center">
                                <h1 className="text-3xl md:text-4xl font-bold mb-4">Book an Appointment</h1>
                                <p className="text-sky-100 max-w-md mx-auto">Schedule a consultation with our expert clinical team to start your child's journey.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" /> {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-[#0284c7] transition-colors" />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all placeholder:text-neutral-400"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-[#0284c7] transition-colors" />
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all placeholder:text-neutral-400"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider ml-1">Mobile Number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-[#0284c7] transition-colors" />
                                            <input
                                                type="tel"
                                                name="mobile"
                                                required
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all placeholder:text-neutral-400"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider ml-1">Selecting Service</label>
                                        <div className="relative group">
                                            <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-[#0284c7] transition-colors" />
                                            <select
                                                name="department"
                                                required
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Service</option>
                                                {departments.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider ml-1">Appointment Date</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-[#0284c7] transition-colors" />
                                            <input
                                                type="date"
                                                name="date"
                                                required
                                                value={formData.date}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] outline-none transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider ml-1">Consultation Mode</label>
                                    <div className="flex gap-4">
                                        {['Online', 'In-Person'].map(mode => (
                                            <label key={mode} className="flex-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="mode"
                                                    value={mode}
                                                    checked={formData.mode === mode}
                                                    onChange={handleChange}
                                                    className="peer sr-only"
                                                />
                                                <div className="text-center py-4 rounded-2xl border-2 border-neutral-100 peer-checked:bg-sky-50 peer-checked:border-[#0284c7] peer-checked:text-[#0284c7] transition-all font-bold text-neutral-600">
                                                    {mode}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-4 bg-[#0284c7] hover:bg-sky-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-sky-100 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Processing Request...
                                            </>
                                        ) : (
                                            'Confirm Appointment Request'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BookAppointmentPage;
