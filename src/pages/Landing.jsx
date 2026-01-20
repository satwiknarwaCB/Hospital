import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, Building2, ArrowRight, ShieldCheck, Activity, ChevronRight, Play, CheckCircle2, Heart, Award, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { USERS, CHILDREN } from '../data/mockData';
import { useApp } from '../lib/context';

const Landing = () => {
    const navigate = useNavigate();
    const { login } = useApp();
    const [selectedRole, setSelectedRole] = useState(null);

    return (

        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-primary-50 to-white">
                <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-200 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary-200 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="flex-1 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                                <Award className="h-4 w-4" /> Leading Autism Therapy Platform
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-tight">
                                Connecting Therapy with <span className="text-primary-600">Measurable Progress</span>
                            </h1>
                            <p className="text-xl text-neutral-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                NeuroBridge™ provides a transparent, data-driven ecosystem where parents, therapists, and clinicians collaborate seamlessly for better outcomes.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Button size="lg" className="h-14 px-8 text-lg bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 group" onClick={() => navigate('/login')}>
                                    Get Started <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button variant="outline" size="lg" className="h-14 px-8 text-lg hover:bg-neutral-50">
                                    <Play className="mr-2 h-5 w-5 text-primary-600 fill-primary-600" /> Watch Demo
                                </Button>
                            </div>
                            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-neutral-500 font-medium">
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> HIPAA Compliant</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Real-time Data</div>
                                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> AI Insights</div>
                            </div>
                        </div>

                        <div className="flex-1 w-full max-w-xl lg:max-w-none animate-in fade-in slide-in-from-right-8 duration-1000">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src="/hospital_hero.png"
                                        alt="NeuroBridge Platform"
                                        className="w-full aspect-video object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8">
                                        <div className="flex items-center gap-4 text-white">
                                            <div className="flex -space-x-2">
                                                {[
                                                    '/therapy_child_1.png',
                                                    '/therapy_session_2.png',
                                                    '/family_clinic_3.png',
                                                    '/therapist_professional_4.png'
                                                ].map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img}
                                                        alt={`Therapy testimonial ${i + 1}`}
                                                        className="h-8 w-8 rounded-full border-2 border-white object-cover"
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium">Trusted by 500+ Families & Clinics</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Stats Section */}
            <section className="py-20 bg-primary-600 text-white overflow-hidden relative">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { label: 'Active Patients', val: '2,500+', icon: Users },
                            { label: 'Licensed Therapists', val: '150+', icon: Stethoscope },
                            { label: 'Success Sessions', val: '50k+', icon: Activity },
                            { label: 'Clinical Sites', val: '12', icon: Building2 },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-2">
                                <div className="mx-auto h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className="text-4xl font-bold">{stat.val}</div>
                                <div className="text-primary-100">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
