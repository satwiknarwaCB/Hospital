import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, User } from 'lucide-react';
import { Button } from './ui/Button';

import BookAppointmentModal from './BookAppointmentModal';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
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
        { name: 'Services', path: '/services' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <BookAppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
            />

            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
                    }`}
            >
                <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-primary-600 rounded-lg group-hover:scale-110 transition-transform">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                            NeuroBridge™
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
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
                    <div className="hidden md:flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="border-primary-200 hover:bg-primary-50"
                            onClick={() => navigate('/login')}
                        >
                            <User className="h-4 w-4 mr-2" />
                            Sign In
                        </Button>
                        <Button
                            className="bg-neutral-900 hover:bg-black text-white px-6"
                            onClick={() => navigate('/login', { state: { openSignup: true } })}
                        >
                            Join NeuroBridge™
                        </Button>
                        <Button
                            className="bg-primary-600 hover:bg-primary-700"
                            onClick={() => setIsAppointmentModalOpen(true)}
                        >
                            Book Appointment
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-neutral-100 shadow-xl p-4 animate-in slide-in-from-top-4 duration-200">
                        <nav className="flex flex-col gap-4">
                            {navLinks.map((link) => (
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
                                    className="w-full"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsAppointmentModalOpen(true);
                                    }}
                                >
                                    Book Appointment
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
