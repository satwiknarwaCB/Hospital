import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ArrowRight, Brain, Speech, HandMetal, Activity, Puzzle } from 'lucide-react';
import { useApp } from '../../lib/context';

const therapyData = {
    'speech-therapy': {
        icon: Speech,
        tag: 'COMMUNICATION SKILLS',
        title: 'Speech Therapy',
        subtitle: 'Helping Every Child Find Their Voice',
        color: 'bg-blue-50 text-blue-600',
        accent: '#0284c7',
        image: '/therapist_professional_4.png',
        overview: `Speech-Language Pathology (SLP), commonly known as Speech Therapy, is a clinical practice that addresses disorders in speech, language, communication, and swallowing. Our speech therapists work closely with children to overcome articulation challenges, improve language comprehension, and build confident social communication skills.`,
        whoIsItFor: `Speech Therapy is ideal for children who struggle with pronouncing words clearly, forming sentences, understanding spoken language, or communicating socially with peers and adults.`,
        benefits: [
            'Improved clarity of speech and pronunciation',
            'Stronger receptive and expressive language skills',
            'Enhanced social communication and pragmatics',
            'Increased confidence in daily verbal interactions',
            'Better academic performance through language skills',
        ],
        process: [
            { step: '01', title: 'Initial Assessment', desc: 'A certified speech-language pathologist evaluates your child\'s communication profile.' },
            { step: '02', title: 'Personalized Plan', desc: 'An individualized therapy plan is created based on the assessment findings.' },
            { step: '03', title: 'Therapy Sessions', desc: 'Regular one-on-one and group sessions using play-based and structured techniques.' },
            { step: '04', title: 'Progress Review', desc: 'Continuous monitoring and plan adjustments to maximize outcomes.' },
        ],
    },
    'aba-therapy': {
        icon: Brain,
        tag: 'BEHAVIORAL INTERVENTION',
        title: 'ABA Therapy',
        subtitle: 'Scientifically-Proven Behavioral Support',
        color: 'bg-emerald-50 text-emerald-600',
        accent: '#0284c7',
        image: '/therapy_session_2.png',
        overview: `Applied Behavior Analysis (ABA) is the gold-standard, scientifically validated therapy for children with autism spectrum disorder (ASD) and other developmental challenges. ABA focuses on understanding and improving socially significant behaviors through systematic teaching strategies, positive reinforcement, and data-driven decision making.`,
        whoIsItFor: `ABA Therapy is primarily designed for children diagnosed with autism spectrum disorder, though it is also effective for children with ADHD, developmental delays, and other behavioral challenges.`,
        benefits: [
            'Reduction in harmful or disruptive behaviors',
            'Development of communication and social skills',
            'Improved learning readiness and focus',
            'Greater independence in daily living activities',
            'Data-driven tracking of measurable progress',
        ],
        process: [
            { step: '01', title: 'Comprehensive Assessment', desc: 'Detailed evaluation of behavior, skills, and learning profiles by a BCBA.' },
            { step: '02', title: 'Goals & Plan Design', desc: 'A structured behavior intervention plan (BIP) is created with measurable goals.' },
            { step: '03', title: 'Intensive Sessions', desc: 'Evidence-based ABA techniques delivered in 1:1 or small group sessions.' },
            { step: '04', title: 'Family Collaboration', desc: 'Parents trained to reinforce skills at home for generalization.' },
        ],
    },
    'occupational-therapy': {
        icon: HandMetal,
        tag: 'DAILY LIFE SKILLS',
        title: 'Occupational Therapy',
        subtitle: 'Building Independence for Daily Life',
        color: 'bg-indigo-50 text-indigo-600',
        accent: '#0284c7',
        image: '/therapy_child_1.png',
        overview: `Occupational Therapy (OT) helps children develop the skills they need to participate fully in everyday life — from playing and learning to self-care and social interaction. Our OT specialists use sensory integration, fine motor training, and adaptive strategies to support children in reaching their full functional potential.`,
        whoIsItFor: `OT is beneficial for children with sensory processing disorders, fine/gross motor delays, difficulties with self-care tasks (dressing, feeding), handwriting challenges, and those needing adaptive equipment support.`,
        benefits: [
            'Improved fine and gross motor coordination',
            'Better sensory regulation and processing',
            'Enhanced self-care independence (feeding, dressing)',
            'Stronger handwriting and school readiness skills',
            'Increased participation in play and social activities',
        ],
        process: [
            { step: '01', title: 'Sensory & Motor Assessment', desc: 'Standardized assessments to identify sensory, motor, and functional skill gaps.' },
            { step: '02', title: 'Individualized Therapy Plan', desc: 'Tailored goals targeting daily functional independence and sensory needs.' },
            { step: '03', title: 'Therapeutic Activities', desc: 'Structured play, sensory integration activities, and fine motor exercises.' },
            { step: '04', title: 'Home & School Support', desc: 'Strategies shared with parents and teachers to reinforce skills across environments.' },
        ],
    },
    'behavioural-therapy': {
        icon: Activity,
        tag: 'BEHAVIOR MANAGEMENT',
        title: 'Behavioural Therapy',
        subtitle: 'Transforming Challenges into Strengths',
        color: 'bg-amber-50 text-amber-600',
        accent: '#0284c7',
        image: '/family_clinic_3.png',
        overview: `Behavioural Therapy is a broad clinical approach focused on identifying and modifying problematic thought patterns and behaviors. It is rooted in the principle that undesirable behaviors are learned and, therefore, can be unlearned or replaced with healthier, more adaptive ones. Our therapists use evidence-based techniques to help children manage emotions and develop positive behavioral patterns.`,
        whoIsItFor: `Behavioural Therapy is suitable for children experiencing anxiety, aggression, impulse control challenges, phobias, OCD, ADHD-related behavioral issues, and general emotional dysregulation.`,
        benefits: [
            'Effective management of anxiety and fears',
            'Improved emotional regulation and self-control',
            'Reduction in aggressive or disruptive behaviors',
            'Healthier peer and family relationships',
            'Development of coping strategies for life challenges',
        ],
        process: [
            { step: '01', title: 'Behavioral Evaluation', desc: 'A detailed analysis of behavioral patterns, triggers, and antecedents.' },
            { step: '02', title: 'Goal Setting', desc: 'Collaborative identification of priority behaviors and desired outcomes.' },
            { step: '03', title: 'Skill-Based Sessions', desc: 'CBT, DBT, and positive behavior support techniques delivered by experts.' },
            { step: '04', title: 'Family Integration', desc: 'Parent coaching to reinforce consistent strategies in the home environment.' },
        ],
    },
    'autism-therapy': {
        icon: Puzzle,
        tag: 'AUTISM SPECTRUM SUPPORT',
        title: 'Autism Therapy',
        subtitle: 'Empowering Every Child on the Spectrum',
        color: 'bg-rose-50 text-rose-600',
        accent: '#0284c7',
        image: '/hospital_hero.png',
        overview: `Autism Therapy at NeuroBridge™ is a comprehensive, multi-disciplinary program designed to support children across the autism spectrum. We combine evidence-based approaches including ABA, speech therapy, social skills training, and sensory integration to address the unique needs of each child and help them reach their full potential.`,
        whoIsItFor: `This program is designed for children diagnosed with Autism Spectrum Disorder (ASD) across all levels of the spectrum, from early intervention for toddlers to support for school-age children developing social and academic skills.`,
        benefits: [
            'Comprehensive, multi-disciplinary support model',
            'Improved social skills and peer connections',
            'Better communication through targeted speech therapy',
            'Sensory regulation and environmental adaptation',
            'Family-centered approach with parent involvement',
        ],
        process: [
            { step: '01', title: 'Diagnostic Assessment', desc: 'A multi-disciplinary team evaluates the child\'s autism profile and strengths.' },
            { step: '02', title: 'Individualized Program', desc: 'A fully personalized therapy plan addressing communication, behavior, and sensory needs.' },
            { step: '03', title: 'Multi-Modal Therapy', desc: 'ABA, speech, OT, and social skills therapy delivered in an integrated manner.' },
            { step: '04', title: 'School & Community Support', desc: 'Collaboration with schools and communities for seamless inclusion.' },
        ],
    },
};

const TherapyPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { setIsAppointmentModalOpen } = useApp();

    const therapy = therapyData[slug];

    if (!therapy) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <h1 className="text-3xl font-bold text-neutral-800">Therapy not found</h1>
                <Link to="/services" className="text-primary-600 hover:underline flex items-center gap-2">
                    <ArrowLeft size={18} /> Back to Services
                </Link>
            </div>
        );
    }

    const IconComponent = therapy.icon;
    const otherTherapies = Object.entries(therapyData).filter(([key]) => key !== slug);

    return (
        <div className="flex flex-col min-h-screen">

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white"></div>
                <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-8">
                            <Link to="/services" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                                <ArrowLeft size={16} />
                                Back to All Services
                            </Link>
                            <div className="inline-block px-4 py-2 rounded-lg text-sm font-bold tracking-widest uppercase" style={{ backgroundColor: `${therapy.accent}15`, color: therapy.accent }}>
                                {therapy.tag}
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-6xl font-bold text-[#1e293b] leading-tight">
                                    {therapy.title}
                                </h1>
                                <p className="text-xl mt-4 font-medium" style={{ color: therapy.accent }}>{therapy.subtitle}</p>
                            </div>
                            <p className="text-lg text-slate-600 leading-relaxed">{therapy.overview}</p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={() => setIsAppointmentModalOpen(true)}
                                    className="h-14 px-8 text-base font-bold text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: therapy.accent }}
                                >
                                    Book An Appointment
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative group">
                            <div className="absolute -inset-4 rounded-[3rem] blur-2xl transition-all duration-500" style={{ backgroundColor: `${therapy.accent}10` }}></div>
                            <img
                                src={therapy.image}
                                alt={therapy.title}
                                className="relative rounded-[2.5rem] shadow-2xl w-full h-[480px] object-cover transform transition-transform duration-700 hover:scale-[1.02]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 md:px-8 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div>
                                <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: therapy.accent }}>WHY CHOOSE THIS</p>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] leading-tight">
                                    Key Benefits of <span style={{ color: therapy.accent }}>{therapy.title}</span>
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {therapy.benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <CheckCircle2 size={22} className="shrink-0 mt-0.5" style={{ color: therapy.accent }} />
                                        <span className="text-slate-700 font-medium">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: therapy.accent }}>WHO IS IT FOR</p>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] leading-tight mb-6">Is This Right For Your Child?</h2>
                                <p className="text-lg text-slate-600 leading-relaxed">{therapy.whoIsItFor}</p>
                            </div>
                            <button
                                onClick={() => setIsAppointmentModalOpen(true)}
                                className="mt-6 h-14 px-8 text-base font-bold text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                                style={{ backgroundColor: therapy.accent }}
                            >
                                Get a Free Consultation
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Process Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-8 lg:px-12">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: therapy.accent }}>HOW WE WORK</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b]">Our Therapy Process</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {therapy.process.map((item, i) => (
                            <div key={i} className="relative group p-8 rounded-3xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-500">
                                <div className="text-5xl font-black mb-6 opacity-10 transition-opacity group-hover:opacity-20" style={{ color: therapy.accent }}>{item.step}</div>
                                <h3 className="text-lg font-bold text-[#1e293b] mb-3">{item.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                                {i < therapy.process.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                        <ArrowRight size={16} className="text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden" style={{ backgroundColor: therapy.accent }}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            Ready to Begin Your Child's<br />
                            <span className="opacity-80">{therapy.title} Journey?</span>
                        </h2>
                        <p className="text-xl text-white/80 leading-relaxed">
                            Our expert clinical team is here to guide you every step of the way. Book a consultation today.
                        </p>
                        <button
                            onClick={() => setIsAppointmentModalOpen(true)}
                            className="h-16 px-10 text-xl font-bold bg-white rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mx-auto"
                            style={{ color: therapy.accent }}
                        >
                            Book An Appointment
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Other Therapies */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 md:px-8 lg:px-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-10 text-center">Explore Other Therapies</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {otherTherapies.map(([key, t]) => {
                            const OtherIcon = t.icon;
                            return (
                                <Link
                                    key={key}
                                    to={`/services/${key}`}
                                    className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col gap-4"
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${t.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <OtherIcon size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#1e293b] group-hover:text-primary-600 transition-colors">{t.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{t.subtitle}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-primary-600 flex items-center gap-1 mt-auto">
                                        Learn More <ArrowRight size={12} />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default TherapyPage;
