import React, { useState } from 'react';
import { Calendar, User, Mail, Phone, Stethoscope, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import { appointmentAPI } from '../lib/api';

const BookAppointmentModal = ({ isOpen, onClose }) => {
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
                onClose();
                setStatus('idle');
                setFormData({
                    name: '',
                    email: '',
                    mobile: '',
                    department: '',
                    date: '',
                    mode: 'Online'
                });
            }, 2000);
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
            <Modal isOpen={isOpen} onClose={onClose} title="Appointment Booked">
                <div className="text-center py-8">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-neutral-900 mb-2">Thank You!</h4>
                    <p className="text-neutral-500 mb-6">Your appointment request has been received. We will confirm with you shortly.</p>
                    <Button onClick={onClose} className="bg-primary-600 w-full">Close</Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Book an Appointment">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="Enter your name"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-neutral-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-neutral-700">Mobile Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                            <input
                                type="tel"
                                name="mobile"
                                required
                                value={formData.mobile}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Enter mobile"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700">Liver Screening</label>
                    <div className="relative">
                        <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                        <select
                            name="department"
                            required
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                        <input
                            type="date"
                            name="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700">Mode</label>
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
                                <div className="text-center py-2.5 rounded-xl border border-neutral-200 peer-checked:bg-primary-50 peer-checked:border-primary-500 peer-checked:text-primary-700 transition-all font-medium">
                                    {mode}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={status === 'loading'} className="flex-1 bg-primary-600 hover:bg-primary-700">
                        {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default BookAppointmentModal;
