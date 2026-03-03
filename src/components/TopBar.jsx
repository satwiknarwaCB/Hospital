import React from 'react';
import { Phone, Mail, Instagram, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

const TopBar = () => {
    return (
        <div className="bg-white text-slate-600 py-2.5 text-xs md:text-sm border-b border-slate-100">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2">
                <div className="flex items-center gap-4 md:gap-8">
                    <a href="tel:+919985333108" className="flex items-center gap-2.5 hover:text-[#0284c7] transition-colors group">
                        <Phone className="h-3.5 w-3.5 md:h-[18px] md:w-[18px] text-[#0284c7] transition-transform group-hover:scale-110" />
                        <span className="font-medium tracking-tight">+91 9985333108</span>
                    </a>
                    <a href="mailto:neurobridge@gmail.com" className="flex items-center gap-2.5 hover:text-[#0284c7] transition-colors group">
                        <Mail className="h-3.5 w-3.5 md:h-[18px] md:w-[18px] text-[#0284c7] transition-transform group-hover:scale-110" />
                        <span className="font-medium tracking-tight">neurobridge@gmail.com</span>
                    </a>
                </div>
                <div className="flex items-center gap-5">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0284c7] hover:-translate-y-0.5 transition-all">
                        <Instagram className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0284c7] hover:-translate-y-0.5 transition-all">
                        <Facebook className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0284c7] hover:-translate-y-0.5 transition-all">
                        <Twitter className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0284c7] hover:-translate-y-0.5 transition-all">
                        <Linkedin className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0284c7] hover:-translate-y-0.5 transition-all">
                        <Youtube className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
