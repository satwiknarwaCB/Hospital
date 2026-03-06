import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, User, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import TopBar from './TopBar';

import BookAppointmentModal from './BookAppointmentModal';

import { useApp } from '../lib/context';

const Header = () => {
    const { isAppointmentModalOpen, setIsAppointmentModalOpen } = useApp();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Career', path: '/careers' },
        { name: 'Contact', path: '/contact' },
    ];

    const allServices = [
        { name: 'Speech Therapy', slug: 'speech-therapy' },
        { name: 'ABA Therapy', slug: 'aba-therapy' },
        { name: 'Occupational Therapy', slug: 'occupational-therapy' },
        { name: 'Behavioural Therapy', slug: 'behavioural-therapy' },
        { name: 'Autism Therapy', slug: 'autism-therapy' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <BookAppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
            />

            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white lg:bg-transparent'
                    }`}
            >
                {!isScrolled && <TopBar />}
                <div className={`container mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3 lg:py-4'}`}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-[#0284c7] rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-sky-100">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl lg:text-2xl font-bold text-[#0284c7]">
                            NeuroBridge™
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
                        {navLinks.slice(0, 2).map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-primary-600 ${isActive(link.path) ? 'text-primary-600' : 'text-neutral-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Services Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsServicesOpen(true)}
                            onMouseLeave={() => setIsServicesOpen(false)}
                        >
                            <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary-600 ${location.pathname === '/services' ? 'text-primary-600' : 'text-neutral-600'}`}>
                                Services <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Compact Dropdown — auto height & width */}
                            <div className={`absolute top-full left-0 pt-2 z-50 transition-all duration-300 ${isServicesOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50 py-3 w-max overflow-hidden">
                                    {allServices.map((service) => (
                                        <Link
                                            key={service.slug}
                                            to={`/services/${service.slug}`}
                                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-150 whitespace-nowrap"
                                        >
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                                            {service.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {navLinks.slice(2).map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors hover:text-primary-600 ${isActive(link.path) ? 'text-primary-600' : 'text-neutral-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Header Actions */}
                    <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                        <Button
                            variant="outline"
                            className="border-slate-200 hover:bg-slate-50 text-slate-700"
                            onClick={() => navigate('/login')}
                        >
                            <User className="h-4 w-4 mr-2" />
                            Sign In
                        </Button>
                        <Button
                            className="bg-neutral-900 hover:bg-black text-white px-4 xl:px-6 shadow-xl shadow-neutral-100"
                            onClick={() => navigate('/login', { state: { openSignup: true } })}
                        >
                            Join NeuroBridge™
                        </Button>
                        <Button
                            className="bg-[#0284c7] hover:bg-sky-700 text-white px-4 xl:px-6 shadow-xl shadow-sky-100"
                            onClick={() => setIsAppointmentModalOpen(true)}
                        >
                            Book An Appointment
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-neutral-100 shadow-2xl p-4 overflow-y-auto max-h-[calc(100dvh-80px)] animate-in slide-in-from-top-4 duration-200">
                        <nav className="flex flex-col gap-4 pb-8">
                            {navLinks.slice(0, 2).map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-base font-medium p-2 rounded-lg transition-colors ${isActive(link.path) ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="flex flex-col gap-1 px-2">
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Our Therapies</span>
                                {allServices.map((service) => (
                                    <Link
                                        key={service.slug}
                                        to={`/services/${service.slug}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 py-1.5"
                                    >
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                                        {service.name}
                                    </Link>
                                ))}
                            </div>

                            {navLinks.slice(2).map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-base font-medium p-2 rounded-lg transition-colors ${isActive(link.path) ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <hr className="border-neutral-100 my-2" />
                            <div className="flex flex-col gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        navigate('/login');
                                    }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    className="w-full bg-neutral-900 text-white"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        navigate('/login', { state: { openSignup: true } });
                                    }}
                                >
                                    Join NeuroBridge™
                                </Button>
                                <Button
                                    className="w-full bg-[#0284c7] hover:bg-sky-700 text-white"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsAppointmentModalOpen(true);
                                    }}
                                >
                                    Book An Appointment
                                </Button>
                            </div>
                        </nav>
                    </div>
                )}
            </header >
        </>
    );
};

export default Header;
