import React from 'react';
import { Target, Eye, Users2, ShieldCheck, Heart, Award } from 'lucide-react';

const About = () => {
    return (
        <div className="pt-24 pb-16">
            {/* Header Section */}
            <section className="bg-primary-50 py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Bridging the Gap in <span className="text-primary-600">Neurodiverse Care</span>
                        </h1>
                        <p className="text-xl text-neutral-600 leading-relaxed">
                            NeuroBridge™ was founded with a single mission: to empower families and clinicians with the tools they need to achieve transformative therapy outcomes through transparency and data.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="p-8 rounded-2xl bg-white shadow-xl border border-neutral-100 space-y-4">
                            <div className="h-12 w-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                                <Target className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900">Our Mission</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                To provide an integrated technology platform that simplifies clinical workflows and provides parents with deep, actionable insights into their child's developmental journey.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white shadow-xl border border-neutral-100 space-y-4">
                            <div className="h-12 w-12 rounded-lg bg-secondary-100 text-secondary-600 flex items-center justify-center">
                                <Eye className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-neutral-900">Our Vision</h2>
                            <p className="text-neutral-600 leading-relaxed">
                                A world where every neurodiverse child has access to coordinated, high-quality care that is measurable, transparent, and driven by passion and innovation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 bg-neutral-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-neutral-900">Our Core Values</h2>
                        <p className="text-neutral-600 mt-4">The principles that guide everything we build and every clinical decision we support.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Heart, title: 'Family First', desc: 'Every feature is designed to ease the journey for parents and caregivers.' },
                            { icon: ShieldCheck, title: 'Integrity & Privacy', desc: 'We maintain the highest standards of data security and clinical ethics.' },
                            { icon: Award, title: 'Clinical Excellence', desc: 'Our tools are built on evidence-based practices and clinical rigor.' },
                            { icon: Users2, title: 'Radical Collaboration', desc: 'Bridging the communication gap between all stakeholders in a child’s care.' },
                            { icon: Award, title: 'Data Driven', desc: 'Objective metrics guide progress, ensuring no milestone goes unnoticed.' },
                            { icon: Heart, title: 'Empathy Always', desc: 'Understanding the unique challenges and triumphs of neurodiverse families.' },
                        ].map((value, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                                <value.icon className="h-8 w-8 text-primary-600 mb-4" />
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">{value.title}</h3>
                                <p className="text-neutral-600">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
