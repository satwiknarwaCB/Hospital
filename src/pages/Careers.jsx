import React, { useState } from 'react';
import {
    Briefcase,
    MapPin,
    Clock,
    ChevronRight,
    Search,
    ArrowRight,
    CheckCircle2,
    Upload,
    Send,
    Users,
    Heart,
    Star,
    Sparkles,
    X
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Careers = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [fileName, setFileName] = useState('');
    const fileInputRef = React.useRef(null);

    const categories = ['All', 'Clinical', 'Administrative', 'Educational', 'Therapy'];

    const jobs = [
        {
            id: 1,
            title: 'Senior Speech Therapist',
            category: 'Clinical',
            location: 'Remote / On-site',
            type: 'Full-time',
            salary: '₹80k - ₹1.2L / mo',
            description: 'We are looking for an experienced Speech Therapist to lead our clinical sessions and mentor junior therapists.',
            tags: ['Speech Pathology', 'Leadership', 'Pediatric']
        },
        {
            id: 2,
            title: 'ABA Clinical Supervisor',
            category: 'Clinical',
            location: 'Gurugram, HR',
            type: 'Full-time',
            salary: '₹1.0L - ₹1.5L / mo',
            description: 'Oversee behavior intervention plans and provide guidance to RBTs in our ABA program.',
            tags: ['BCBA', 'Supervision', 'Autism Support']
        },
        {
            id: 3,
            title: 'Occupational Therapy Lead',
            category: 'Therapy',
            location: 'New Delhi, DL',
            type: 'Full-time',
            salary: '₹90k - ₹1.3L / mo',
            description: 'Lead our OT department in developing innovative sensory integration strategies for children.',
            tags: ['OTR', 'Sensory', 'Child Development']
        },
        {
            id: 4,
            title: 'Patient Care Coordinator',
            category: 'Administrative',
            location: 'Noida, UP',
            type: 'Full-time',
            salary: '₹40k - ₹65k / mo',
            description: 'Help families navigate their therapeutic journeys with professional care and scheduling support.',
            tags: ['Communication', 'Scheduling', 'Healthcare']
        },
        {
            id: 5,
            title: 'Special Education Teacher',
            category: 'Educational',
            location: 'Mumbai, MH',
            type: 'Part-time',
            salary: '₹35k - ₹50k / mo',
            description: 'Design and implement IEPs for students with diverse learning needs in our educational wing.',
            tags: ['IEP', 'Education', 'Instruction']
        }
    ];

    const filteredJobs = jobs.filter(job => {
        const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleApply = (job) => {
        setSelectedJob(job);
        setIsSubmitted(false);
        setIsApplyModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setTimeout(() => {
                setIsApplyModalOpen(false);
                setIsSubmitted(false);
            }, 3000);
        }, 1500);
    };

    return (
        <div className="pt-24 lg:pt-32 min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-[#0284c7] py-24 md:py-32 relative overflow-hidden text-white">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <Sparkles size={16} />
                        Join Our Mission
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Build a Career That <br />
                        <span className="text-sky-200">Changes Lives</span>
                    </h1>
                    <p className="text-xl text-sky-50 max-w-2xl mx-auto mb-10 leading-relaxed">
                        At NeuroBridge™, we're more than a clinic. We're a family of dedicated professionals
                        committed to empowering children and families.
                    </p>
                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-[#0284c7] transition-colors">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search roles (e.g. Speech Therapist)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white text-slate-800 shadow-2xl focus:ring-4 focus:ring-white/20 outline-none transition-all text-lg"
                        />
                    </div>
                </div>
            </section>

            {/* Why Join Us */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Why NeuroBridge™?</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">We provide the environment and support you need to do your best work.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Heart, title: 'Impactful Work', desc: 'Every day you make a tangible difference in the developmental journey of a child.' },
                            { icon: Users, title: 'Expert Community', desc: 'Work alongside world-class clinical directors and multidisciplinary experts.' },
                            { icon: Star, title: 'Growth & Support', desc: 'Continuing education, certifications, and mentorship programs for all staff.' }
                        ].map((benefit, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-transparent hover:border-sky-100 hover:shadow-xl transition-all duration-300">
                                <div className="h-14 w-14 rounded-2xl bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7] mb-6">
                                    <benefit.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{benefit.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job Openings */}
            <section className="py-20" id="openings">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800">Current Openings</h2>
                            <p className="text-slate-500 mt-2">Find the role that matches your expertise.</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${selectedCategory === cat
                                        ? 'bg-[#0284c7] text-white shadow-lg shadow-sky-200'
                                        : 'bg-white text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {filteredJobs.length > 0 ? filteredJobs.map(job => (
                            <div key={job.id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-[#0284c7]/30 hover:shadow-2xl transition-all duration-500 shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 top-0 h-full w-1.5 bg-[#0284c7] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 bg-sky-50 text-[#0284c7] text-[10px] font-black uppercase tracking-widest rounded-lg">{job.category}</span>
                                            <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium"><Clock size={14} /> {job.type}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-[#0284c7] transition-colors">{job.title}</h3>
                                        <p className="text-slate-500 mb-6 max-w-2xl leading-relaxed">{job.description}</p>
                                        <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                                            <div className="flex items-center gap-2"><MapPin size={16} className="text-[#0284c7]" /> {job.location}</div>
                                            <div className="flex items-center gap-2 font-bold text-slate-800"><Briefcase size={16} className="text-[#0284c7]" /> {job.salary}</div>
                                        </div>
                                    </div>

                                    <div className="flex lg:flex-col gap-4 shrink-0 lg:text-right">
                                        <Button
                                            onClick={() => handleApply(job)}
                                            className="bg-[#0284c7] hover:bg-sky-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-sky-100 transition-all active:scale-95"
                                        >
                                            Apply Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                    <Search size={48} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">No roles found</h3>
                                <p className="text-slate-500 mt-2">Adjust your search or category filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Application Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsApplyModalOpen(false)}></div>
                    <div className="bg-white rounded-[2rem] w-full max-w-lg relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden my-auto">
                        {isSubmitted ? (
                            <div className="p-12 text-center space-y-6">
                                <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto scale-110 animate-bounce">
                                    <CheckCircle2 size={48} strokeWidth={3} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-800">Application Received!</h3>
                                    <p className="text-slate-500">Thank you for applying. Our HR team will review your profile and get back to you shortly.</p>
                                </div>
                                <p className="text-xs text-slate-400">Closing window in 3 seconds...</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-[#0284c7] p-10 text-white relative">
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => setIsApplyModalOpen(false)}
                                        className="absolute top-8 right-8 h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                                    >
                                        <X size={20} />
                                    </button>
                                    <div className="space-y-1">
                                        <span className="text-sky-200 text-xs font-black uppercase tracking-widest">Job Application</span>
                                        <h3 className="text-3xl font-bold">{selectedJob?.title}</h3>
                                        <div className="flex items-center gap-3 text-sky-100 text-sm opacity-80 pt-2">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {selectedJob?.location}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> {selectedJob?.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <form className="p-10 space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
                                            <input required type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#0284c7] focus:ring-4 focus:ring-sky-50 transition-all font-medium" placeholder="Amrita" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
                                            <input required type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#0284c7] focus:ring-4 focus:ring-sky-50 transition-all font-medium" placeholder="Singh" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Contact Email</label>
                                        <input required type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#0284c7] focus:ring-4 focus:ring-sky-50 transition-all font-medium" placeholder="amrita@example.com" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Resume / CV</label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => setFileName(e.target.files[0]?.name || '')}
                                        />
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`group border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer bg-slate-50/50 ${fileName ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50 hover:border-[#0284c7]/30'}`}
                                        >
                                            <div className={`h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${fileName ? 'text-emerald-500' : 'text-slate-300 group-hover:text-[#0284c7]'}`}>
                                                {fileName ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                                            </div>
                                            <p className="text-sm text-slate-700 font-bold">
                                                {fileName || 'Select PDF or DOC'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {fileName ? 'Click to change file' : 'Maximum file size: 5 MB'}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        disabled={isSubmitting}
                                        className="w-full bg-[#0284c7] hover:bg-sky-700 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-sky-100 disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} /> Submit Application
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Culture/Last CTA */}
            <section className="py-20 bg-[#0284c7]/5">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">Can't Find a Suitable Role?</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                We're always on the lookout for talented individuals. Send us your resume anyway and we'll keep you
                                in mind for future clinical or administrative openings.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-700 font-medium">
                                    <CheckCircle2 className="text-[#0284c7]" size={24} />
                                    <span>Direct access to leadership</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-700 font-medium">
                                    <CheckCircle2 className="text-[#0284c7]" size={24} />
                                    <span>Continuous professional mentorship</span>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleApply({ title: 'General Application' })}
                                className="bg-[#0284c7] hover:bg-sky-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg mt-4"
                            >
                                Drop Your Resume
                            </Button>
                        </div>
                        <div className="lg:w-1/2 relative group">
                            <div className="aspect-square bg-[#0284c7] rounded-[3rem] rotate-3 absolute inset-0 opacity-10 group-hover:rotate-6 transition-transform duration-500"></div>
                            <img
                                src="/team_clinical_director.png"
                                alt="Our Team"
                                className="relative rounded-[3rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Careers;
