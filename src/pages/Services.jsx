import React from 'react';
import { Brain, Speech, HandMetal, HeartPulse, Activity, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Services = () => {
    const services = [
        {
            icon: Brain,
            title: 'ABA Therapy',
            description: 'Scientific and evidence-based behavioral intervention tailored to each child’s unique needs.',
            features: ['Individualized Education Plans', 'Positive Reinforcement', 'Skill Acquisition'],
            color: 'bg-primary-100 text-primary-600'
        },
        {
            icon: Speech,
            title: 'Speech & Language',
            description: 'Enhancing communication skills through specialized techniques and innovative tools.',
            features: ['Articulation Therapy', 'Language Development', 'Social Communication'],
            color: 'bg-secondary-100 text-secondary-600'
        },
        {
            icon: HandMetal,
            title: 'Occupational Therapy',
            description: 'Helping children develop the skills needed for daily living and independence.',
            features: ['Sensory Integration', 'Fine Motor Skills', 'Self-Care Training'],
            color: 'bg-orange-100 text-orange-600'
        },
        {
            icon: HeartPulse,
            title: 'Physiotherapy',
            description: 'Improving physical function, mobility, and strength through pediatric physiotherapy.',
            features: ['Gross Motor Development', 'Balance & Coordination', 'Strength Training'],
            color: 'bg-red-100 text-red-600'
        },
        {
            icon: Activity,
            title: 'Behavioral Consulting',
            description: 'Expert guidance for families to manage challenging behaviors and foster positive growth.',
            features: ['Parent Coaching', 'Behavior Support Plans', 'School Consultations'],
            color: 'bg-emerald-100 text-emerald-600'
        },
        {
            icon: Sparkles,
            title: 'Early Intervention',
            description: 'Comprehensive support programs for toddlers and young children to maximize potential.',
            features: ['Developmental Screening', 'Play-Based Therapy', 'Holistic Support'],
            color: 'bg-purple-100 text-purple-600'
        }
    ];

    return (
        <div className="pt-24 pb-16">
            <section className="bg-neutral-900 py-24 text-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Tailored <span className="text-primary-400">Therapeutic Solutions</span>
                        </h1>
                        <p className="text-xl text-neutral-400 leading-relaxed">
                            Discover our range of multidisciplinary services designed to support neurodiverse development across all stages of life.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, i) => (
                            <Card key={i} className="group hover:shadow-2xl transition-all duration-300 border-none shadow-lg">
                                <CardHeader className="pb-4">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${service.color}`}>
                                        <service.icon className="h-7 w-7" />
                                    </div>
                                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                                    <CardDescription className="text-base mt-2">
                                        {service.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-8">
                                        {service.features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-2 text-neutral-600">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button variant="outline" className="w-full group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 mt-10">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="bg-primary-600 rounded-3xl p-12 relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-900/20 rounded-full -ml-32 -mb-32 blur-3xl" />

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Ready to Start Your Journey?</h2>
                        <p className="text-primary-100 text-lg mb-10 max-w-2xl relative z-10">
                            Our clinical directors are available for a free consultation to discuss your child’s needs and how our multidisciplinary team can help.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                            <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50 px-8">
                                Schedule Consultation
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                                Contact Admission
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Services;
