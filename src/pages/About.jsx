import React from 'react';
import { Target, Eye, Users2, ShieldCheck, Heart, Award, Search, Bookmark, Quote, Sparkles } from 'lucide-react';

const About = () => {
    return (
        <div className="pt-16 md:pt-24 pb-12">
            {/* Header Section */}
            <section className="bg-primary-50 py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-[#1e293b] mb-8 leading-tight tracking-tight">
                                Bridging the Gap in <br />
                                <span className="text-[#0284c7]">Neurodiverse Care</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                                NeuroBridge™ was founded with a single mission: to empower families and clinicians with the tools they need to achieve transformative therapy outcomes through transparency and data.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            {/* What We Are Section */}
            <section className="py-12 md:py-20 border-t border-neutral-100">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">What We Are</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Bookmark,
                                title: 'Expert Clinicians',
                                desc: 'Our team comprises highly certified specialists with deep expertise in delivering world-class autism therapy and developmental support.'
                            },
                            {
                                icon: Heart,
                                title: 'Family Centered',
                                desc: 'We honor the incredible spirit of our children and families, fostering a "Never Give Up" community where every victory is celebrated together.'
                            },
                            {
                                icon: Award,
                                title: 'Clinical Excellence',
                                desc: 'Powered by a mission of deep compassion, our professionals are dedicated to maintaining the highest clinical standards in every session.'
                            },
                            {
                                icon: Search,
                                title: 'Rapid Growth',
                                desc: 'We are expanding our impact and constantly searching for passionate talent. If you are driven by making a difference, join our growing family.'
                            },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center space-y-4">
                                <div className="h-12 w-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900">{item.title}</h3>
                                <p className="text-neutral-600 leading-relaxed text-sm">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-12 md:py-20 bg-neutral-50">
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
            {/* Our Team Section */}
            <section className="py-12 md:py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">Meet Our Team</h2>
                        <p className="text-lg text-neutral-600">
                            A dedicated multidisciplinary group of experts working together to provide the best possible care for your child.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { image: '/team_clinical_director.png', role: 'Clinical Directors', desc: 'Leading our vision with decades of clinical experience in neurodevelopmental care.' },
                            { image: '/therapist_professional_4.png', role: 'Senior Therapists', desc: 'Expert practitioners specializing in ABA, Speech, and Occupational therapy.' },
                            { image: '/family_clinic_3.png', role: 'Case Managers', desc: 'Ensuring seamless coordination between families, therapists, and schools.' },
                            { image: '/therapy_session_2.png', role: 'Psychologists', desc: 'Providing deep behavioral insights and emotional support for the entire family.' },
                            { image: '/therapy_child_1.png', role: 'Family Counselors', desc: 'Guiding parents through the journey with empathy and actionable resources.' },
                            { image: '/therapist_professional_4.png', role: 'Support Specialists', desc: 'Dedicated to making every session a positive and engaging experience for your child.' },
                        ].map((team, i) => (
                            <div key={i} className="group p-0 overflow-hidden rounded-2xl bg-neutral-50 hover:bg-white hover:shadow-xl border border-transparent hover:border-neutral-100 transition-all duration-500 text-center lg:text-left">
                                <div className="h-48 overflow-hidden">
                                    <img src={team.image} alt={team.role} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <div className="p-6 md:p-8">
                                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{team.role}</h3>
                                    <p className="text-neutral-600 leading-relaxed text-sm">
                                        {team.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Message From Founder Section */}
            <section className="py-12 md:py-24 bg-white overflow-hidden relative border-t border-neutral-100">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Founder Image */}
                        <div className="lg:w-1/2 relative group">
                            <div className="absolute -inset-4 bg-primary-100/50 rounded-3xl blur-2xl group-hover:bg-primary-200/50 transition-all duration-700"></div>
                            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                <img
                                    src="/founder_portrait.png"
                                    alt="NeuroBridge Founder"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent">
                                    <h3 className="text-2xl font-bold text-white">Dr. Sarah Thompson</h3>
                                    <p className="text-primary-200">Founder & Chief Medical Officer</p>
                                </div>
                            </div>
                        </div>

                        {/* Founder Text */}
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold border border-primary-100">
                                <Sparkles className="h-4 w-4" /> Message From Our Founder
                            </div>
                            <div className="relative">
                                <Quote className="absolute -top-10 -left-6 h-20 w-20 text-primary-500/10" />
                                <h2 className="text-3xl md:text-5xl font-bold leading-tight text-neutral-900 relative z-10">
                                    "Our mission is to ensure that no child's potential is limited by a lack of <span className="text-primary-600">coordinated care</span>."
                                </h2>
                            </div>
                            <div className="space-y-6 text-neutral-600 text-lg leading-relaxed">
                                <p>
                                    At NeuroBridge™, we believe that every child follows a unique developmental path. Our role isn't just to provide therapy, but to build a bridge between clinical expertise and the everyday environment where children grow.
                                </p>
                                <p>
                                    We started with a simple vision: to bring transparency and data to a field where families often felt lost. Today, we are proud to support thousands of families with a platform that empowers them to be active participants in their child's progress.
                                </p>
                            </div>
                            <div className="pt-4 flex items-center gap-4">
                                <div className="h-px flex-grow bg-neutral-100"></div>
                                <div className="italic text-neutral-400">Dedicated to your child's success</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
