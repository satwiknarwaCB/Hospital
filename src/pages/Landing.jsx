import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, Building2, ArrowRight, ShieldCheck, Activity, ChevronRight, Play, CheckCircle2, Heart, Award, Users, Sparkles, Quote } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import HeroSlider from '../components/HeroSlider';
import { useApp } from '../lib/context';

const Landing = () => {
    const navigate = useNavigate();
    const { login } = useApp();
    const [selectedRole, setSelectedRole] = useState(null);

    return (

        <div className="flex flex-col min-h-screen">
            {/* Hero Slider Section */}
            <HeroSlider />

            {/* Our Ideology Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 lg:px-12">
                    <div className="max-w-3xl mx-auto text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
                        <h2 className="text-sm font-bold tracking-[0.2em] text-[#0284c7] uppercase mb-4">OUR IDEOLOGY</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-[#1e293b] leading-tight transition-all">
                            Guided by Compassion, Driven by <span className="text-[#0284c7]">Innovation</span>
                        </h3>
                        <div className="w-20 h-1.5 bg-[#0284c7] mx-auto mt-6 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: 'Holistic Development',
                                desc: "Focusing on every facet of a child's growth—emotional, social, and cognitive.",
                                icon: Users,
                                color: 'bg-blue-50 text-blue-600'
                            },
                            {
                                title: 'Evidence-Based Innovation',
                                desc: "Leveraging the latest clinical research and technology for measurable progress.",
                                icon: Activity,
                                color: 'bg-emerald-50 text-emerald-600'
                            },
                            {
                                title: 'Family-Centric Approach',
                                desc: "Empowering parents as active partners in their child's unique developmental journey.",
                                icon: Heart,
                                color: 'bg-rose-50 text-rose-600'
                            },
                            {
                                title: 'Unwavering Excellence',
                                desc: "A dedicated team of experts committed to the highest standards of professional care.",
                                icon: Award,
                                color: 'bg-indigo-50 text-indigo-600'
                            }
                        ].map((pillar, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-[#0284c7]/20 hover:shadow-2xl hover:shadow-[#0284c7]/5 transition-all duration-500 transform hover:-translate-y-2"
                            >
                                <div className={`h-14 w-14 rounded-2xl ${pillar.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                    <pillar.icon size={28} />
                                </div>
                                <h4 className="text-xl font-bold text-[#1e293b] mb-4 group-hover:text-[#0284c7] transition-colors">{pillar.title}</h4>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {pillar.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Speech Therapy Section */}
            <section className="py-24 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 lg:px-12">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Left Side: Heading & Text */}
                        <div className="lg:w-1/2 space-y-8 animate-in fade-in slide-in-from-left duration-700">
                            <div className="inline-block px-4 py-2 rounded-lg bg-[#0284c7]/10 text-[#0284c7] font-bold text-sm tracking-widest uppercase">
                                COMMUNICATION SKILLS
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-[#1e293b] leading-tight transition-all">
                                What Is <span className="text-[#0284c7]">Speech Therapy?</span>
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Speech-Language Pathology (SLP) or Speech Therapy focuses on helping children overcome challenges with articulation, language comprehension, and social communication. Our goal is to help every child find their voice and communicate with confidence.
                            </p>
                            <div className="space-y-4">
                                {[
                                    'Articulation & Clarity Improvement',
                                    'Receptive & Expressive Language',
                                    'Social Communication & Pragmatics',
                                    'Cognitive Communication Skills'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="text-[#0284c7]" size={20} />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={() => navigate('/services/speech-therapy')}
                                className="bg-[#0284c7] hover:bg-sky-700 text-white px-8 py-4 rounded-xl font-bold mt-4 shadow-lg shadow-sky-100 transition-all flex items-center gap-2 group/btn"
                            >
                                Learn More <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </div>
                        {/* Right Side: Image */}
                        <div className="lg:w-1/2 relative group animate-in fade-in zoom-in duration-700">
                            <div className="absolute -inset-4 bg-[#0284c7]/5 rounded-[3rem] blur-2xl group-hover:bg-[#0284c7]/10 transition-colors duration-500"></div>
                            <img
                                src="/therapist_professional_4.png"
                                alt="Speech Therapy Session"
                                className="relative rounded-[2.5rem] shadow-2xl w-full h-[450px] object-cover transform transition-transform duration-700 hover:scale-[1.02]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ABA Therapy Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 lg:px-12">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        {/* Right Side: Heading & Text */}
                        <div className="lg:w-1/2 space-y-8 animate-in fade-in slide-in-from-right duration-700">
                            <div className="inline-block px-4 py-2 rounded-lg bg-[#0284c7]/10 text-[#0284c7] font-bold text-sm tracking-widest uppercase">
                                SPECIALIZED CARE
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-[#1e293b] leading-tight transition-all">
                                What Is <span className="text-[#0284c7]">ABA Therapy?</span>
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Applied Behavior Analysis (ABA) is a scientifically validated therapy focused on improving specific behaviors, such as social skills, communication, and learning, while reducing problematic ones.
                            </p>
                            <div className="space-y-4">
                                {[
                                    'Positive Reinforcement Strategies',
                                    'Skill Acquisition & Generalization',
                                    'Individualized Treatment Plans',
                                    'Focus on Data-Driven Progress'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="text-[#0284c7]" size={20} />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={() => navigate('/services/aba-therapy')}
                                className="bg-[#0284c7] hover:bg-sky-700 text-white px-8 py-4 rounded-xl font-bold mt-4 shadow-lg shadow-sky-100 transition-all flex items-center gap-2 group/btn"
                            >
                                Learn More <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </div>
                        {/* Left Side: Image */}
                        <div className="lg:w-1/2 relative group animate-in fade-in zoom-in duration-700">
                            <div className="absolute -inset-4 bg-[#0284c7]/5 rounded-[3rem] blur-2xl group-hover:bg-[#0284c7]/10 transition-colors duration-500"></div>
                            <img
                                src="/therapy_session_2.png"
                                alt="ABA Therapy Session"
                                className="relative rounded-[2.5rem] shadow-2xl w-full h-[450px] object-cover transform transition-transform duration-700 hover:scale-[1.02]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Occupational Therapy Section */}
            <section className="py-24 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 lg:px-12">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Left Side: Heading & Text */}
                        <div className="lg:w-1/2 space-y-8 animate-in fade-in slide-in-from-left duration-700">
                            <div className="inline-block px-4 py-2 rounded-lg bg-[#0284c7]/10 text-[#0284c7] font-bold text-sm tracking-widest uppercase">
                                DAILY LIFE SKILLS
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-[#1e293b] leading-tight transition-all">
                                What Is <span className="text-[#0284c7]">Occupational Therapy?</span>
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Occupational Therapy (OT) helps children develop the "occupations" of childhood—meaning play, socialization, and daily tasks like dressing or handwriting. It focuses on sensory integration and fine motor independence.
                            </p>
                            <div className="space-y-4">
                                {[
                                    'Sensory Processing Integration',
                                    'Fine & Gross Motor Development',
                                    'Self-Regulation Skills',
                                    'Adaptive Equipment Training'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="text-[#0284c7]" size={20} />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={() => navigate('/services/occupational-therapy')}
                                className="bg-[#0284c7] hover:bg-sky-700 text-white px-8 py-4 rounded-xl font-bold mt-4 shadow-lg shadow-sky-100 transition-all flex items-center gap-2 group/btn"
                            >
                                Learn More <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </div>
                        {/* Right Side: Image */}
                        <div className="lg:w-1/2 relative group animate-in fade-in zoom-in duration-700">
                            <div className="absolute -inset-4 bg-[#0284c7]/5 rounded-[3rem] blur-2xl group-hover:bg-[#0284c7]/10 transition-colors duration-500"></div>
                            <img
                                src="/therapy_child_1.png"
                                alt="Occupational Therapy Session"
                                className="relative rounded-[2.5rem] shadow-2xl w-full h-[450px] object-cover transform transition-transform duration-700 hover:scale-[1.02]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Message From Our Founder */}
            <section className="py-24 bg-white overflow-hidden relative border-t border-slate-100">
                <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        {/* Founder Image */}
                        <div className="lg:w-1/2 relative group animate-in fade-in slide-in-from-left duration-700">
                            <div className="absolute -inset-4 bg-[#0284c7]/10 rounded-3xl blur-2xl group-hover:bg-[#0284c7]/20 transition-all duration-700"></div>
                            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                                <img
                                    src="/founder_portrait.png"
                                    alt="NeuroBridge Founder"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#1e293b]/80 via-[#1e293b]/40 to-transparent">
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Dr. Sarah Thompson</h3>
                                    <p className="text-[#0284c7] font-semibold">Founder & Chief Medical Officer</p>
                                </div>
                            </div>
                        </div>

                        {/* Founder Text */}
                        <div className="lg:w-1/2 space-y-8 animate-in fade-in slide-in-from-right duration-700">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0284c7]/10 text-[#0284c7] text-sm font-bold border border-[#0284c7]/20">
                                <Sparkles className="h-4 w-4" /> MESSAGE FROM OUR FOUNDER
                            </div>
                            <div className="relative">
                                <Quote className="absolute -top-10 -left-6 h-20 w-20 text-[#0284c7]/10" />
                                <h2 className="text-3xl md:text-5xl font-bold leading-tight text-[#1e293b] relative z-10">
                                    "Our mission is to ensure that no child's potential is limited by a lack of <span className="text-[#0284c7]">coordinated care</span>."
                                </h2>
                            </div>
                            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                                <p>
                                    At NeuroBridge™, we believe that every child follows a unique developmental path. Our role isn't just to provide therapy, but to build a bridge between clinical expertise and the everyday environment where children grow.
                                </p>
                                <p>
                                    We started with a simple vision: to bring transparency and data to a field where families often felt lost. Today, we are proud to support thousands of families with a platform that empowers them to be active participants in their child's progress.
                                </p>
                            </div>
                            <div className="pt-6 flex flex-col sm:flex-row items-center gap-6">
                                <Button
                                    onClick={() => navigate('/about')}
                                    className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 group/meet"
                                >
                                    Meet Our Team <ArrowRight className="h-5 w-5 transition-transform group-hover/meet:translate-x-1" />
                                </Button>
                                <div className="italic text-slate-400 font-medium border-l-2 border-slate-200 pl-4">Dedicated to your child's success</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 bg-[#0284c7] relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0369a1]/50"></div>
                <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in zoom-in duration-700">
                        <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                            Ready to Start Your Child's <br />
                            <span className="text-primary-100">Success Journey?</span>
                        </h2>
                        <p className="text-xl text-primary-50 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of families already benefiting from NeuroBridge™. Our expert clinical team is here to support you every step of the way.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                            <button
                                onClick={() => navigate('/book-appointment')}
                                className="h-16 px-10 text-xl font-bold bg-white text-[#0284c7] hover:bg-primary-50 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                Book An Appointment
                                <ArrowRight size={24} />
                            </button>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
