/**
 * Contact Page
 * Detailed clinic contact information and inquiry form
 */
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2, Globe, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });

            // Reset status after 5 seconds
            setTimeout(() => setStatus('idle'), 5000);
        }, 1500);
    };

    const contactInfo = [
        {
            icon: Phone,
            title: 'Call Us',
            details: '+1 (555) 000-0000',
            sub: 'Mon-Fri from 8am to 6pm',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            icon: Mail,
            title: 'Email Us',
            details: 'care@neurobridge.com',
            sub: 'Online support 24/7',
            color: 'text-primary-600',
            bg: 'bg-primary-50'
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            details: '123 Therapy Lane, Suite 000',
            sub: 'Medical District ABC 123456',
            color: 'text-secondary-600',
            bg: 'bg-secondary-50'
        },
        {
            icon: Clock,
            title: 'Working Hours',
            details: '08:00 AM - 08:00 PM',
            sub: 'Saturday appointments available',
            color: 'text-green-600',
            bg: 'bg-green-50'
        }
    ];

    return (
        <div className="pt-24 pb-20">
            {/* Header Section */}
            <section className="bg-primary-50 py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-100/50 skew-x-12 transform translate-x-1/2" />
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Let's Start a <span className="text-primary-600">Conversation</span>
                        </h1>
                        <p className="text-lg text-neutral-600 leading-relaxed">
                            Have questions about our therapy services or want to schedule a consultation?
                            Our team is here to support you and your family every step of the way.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Contact Info Cards */}
                        <div className="lg:col-span-4 space-y-6">
                            <h2 className="text-2xl font-bold text-neutral-800 mb-8">Contact Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                                {contactInfo.map((card, i) => (
                                    <div key={i} className="flex gap-4 p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className={`h-12 w-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                                            <card.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-neutral-800">{card.title}</h3>
                                            <p className="text-neutral-700 font-medium">{card.details}</p>
                                            <p className="text-xs text-neutral-500">{card.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Social Presence */}
                            <div className="p-8 bg-neutral-900 rounded-3xl text-white mt-12 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Globe className="h-24 w-24" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">NeuroBridge™ Global</h3>
                                <p className="text-neutral-400 text-sm mb-6">
                                    Join our community of over 5,000+ families sharing resources and success stories.
                                </p>
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    {/* Additional Social Icons */}
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-100 shadow-xl">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-neutral-900 mb-2">Send us a Message</h2>
                                    <p className="text-neutral-500">We typically respond within 2-4 business hours.</p>
                                </div>

                                {status === 'success' ? (
                                    <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-in zoom-in duration-300">
                                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-green-900 mb-2">Message Received!</h3>
                                        <p className="text-green-700">
                                            Thank you for reaching out. One of our clinical coordinators will contact you shortly.
                                        </p>
                                        <Button variant="outline" className="mt-8 border-green-200 text-green-700 hover:bg-green-100" onClick={() => setStatus('idle')}>
                                            Send Another Message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-neutral-700 ml-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-neutral-700 ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-neutral-700 ml-1">Subject</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                required
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                                placeholder="Inquiry about ABA Therapy"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-neutral-700 ml-1">Your Message</label>
                                            <textarea
                                                name="message"
                                                required
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows="5"
                                                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                                                placeholder="Tell us about your requirements..."
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={status === 'loading'}
                                            className="w-full h-14 text-lg bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-100 rounded-2xl group"
                                        >
                                            {status === 'loading' ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Sending...
                                                </>
                                            ) : (
                                                <>
                                                    Send Message <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="container mx-auto px-4 md:px-6 mb-20">
                <div className="h-[450px] w-full bg-neutral-100 rounded-3xl border border-neutral-200 overflow-hidden shadow-lg relative group">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1620304953684!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        className="grayscale group-hover:grayscale-0 transition-all duration-500"
                        title="NeuroBridge Clinic Location"
                    ></iframe>

                    {/* Overlay for better integration */}
                    <div className="absolute inset-0 pointer-events-none border-[6px] border-white/50 rounded-3xl"></div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
