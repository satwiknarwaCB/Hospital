import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { name: 'About Us', path: '/about' },
            { name: 'Our Team', path: '/team' },
            { name: 'Careers', path: '/careers' },
            { name: 'Contact', path: '/contact' },
        ],
        services: [
            { name: 'ABA Therapy', path: '/services/aba' },
            { name: 'Speech Therapy', path: '/services/speech' },
            { name: 'Occupational Therapy', path: '/services/ot' },
            { name: 'Physiotherapy', path: '/services/physio' },
        ],
        support: [
            { name: 'Help Center', path: '/help' },
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Terms of Service', path: '/terms' },
            { name: 'HIPAA Compliance', path: '/hipaa' },
        ]
    };

    return (
        <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <Activity className="h-8 w-8 text-primary-500" />
                            <span className="text-2xl font-bold text-white">
                                NeuroBridge™
                            </span>
                        </Link>
                        <p className="text-neutral-400 leading-relaxed">
                            Empowering neurodiverse families with data-driven therapy and compassionate care. Connecting progress with purpose.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 bg-neutral-800 rounded-full hover:bg-primary-600 hover:text-white transition-colors">
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">Company</h3>
                        <ul className="space-y-4">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.path} className="hover:text-primary-400 transition-colors flex items-center group">
                                        <ArrowRight className="h-4 w-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">Services</h3>
                        <ul className="space-y-4">
                            {footerLinks.services.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.path} className="hover:text-primary-400 transition-colors flex items-center group">
                                        <ArrowRight className="h-4 w-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter / Contact */}
                    <div className="space-y-6">
                        <h3 className="text-white font-semibold text-lg mb-6">Our Newsletter</h3>
                        <p className="text-sm text-neutral-400">
                            Get the latest updates on autism research and therapy tips.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="bg-neutral-800 border-none rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                            <Button className="bg-primary-600 hover:bg-primary-700 px-4">
                                Join
                            </Button>
                        </div>
                        <div className="pt-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary-500" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary-500" />
                                <span>hello@neurobridge.com</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-primary-500" />
                                <span>123 Therapy Way, SF, CA 94103</span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-neutral-800 mb-8" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
                    <p>© {currentYear} NeuroBridge™ Clinical Services. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
