import React, { useState, useEffect } from 'react';
import { X, Lock, Check, RefreshCw, Volume2, Mic } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

// Gajju Character Component
export const Gajju = ({ mood = 'happy', className = '' }) => {
    return (
        <div className={`relative w-48 h-48 mx-auto filter drop-shadow-md transition-all duration-700 ${className}`}>
            {/* 
        In a real app, this would be an SVG or an Rive/Lottie animation.
        For now, we'll use a friendly stylized representation.
      */}
            <div className="absolute inset-0 bg-neutral-200 rounded-full opacity-20 animate-pulse"></div>
            <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=Elephant&backgroundColor=b6e3f4"
                alt="Gajju the Elephant"
                className="w-full h-full object-contain"
            />
            {mood === 'talk' && (
                <div className="absolute top-1/2 -right-4 bg-white p-2 rounded-2xl rounded-bl-none shadow-sm border border-neutral-100 animate-bounce">
                    <Volume2 className="h-4 w-4 text-primary-500" />
                </div>
            )}
        </div>
    );
};

// Hidden Parent Layer Wrapper
export const ParentGate = ({ children, onConfirm, onNeedsPractice }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPressing, setIsPressing] = useState(false);
    const pressTimer = React.useRef(null);

    const startPress = () => {
        setIsPressing(true);
        pressTimer.current = setTimeout(() => {
            setIsOpen(true);
            setIsPressing(false);
        }, 2000); // 2 second long press
    };

    const endPress = () => {
        setIsPressing(false);
        clearTimeout(pressTimer.current);
    };

    if (!isOpen) {
        return (
            <div className="absolute top-4 right-4 z-50">
                <button
                    onMouseDown={startPress}
                    onMouseUp={endPress}
                    onMouseLeave={endPress}
                    onTouchStart={startPress}
                    onTouchEnd={endPress}
                    className={`p-3 rounded-full transition-all duration-300 ${isPressing ? 'bg-primary-500 scale-110' : 'bg-white/50 hover:bg-white/80'
                        }`}
                >
                    <Lock className={`h-5 w-5 ${isPressing ? 'text-white' : 'text-neutral-400'}`} />
                    {isPressing && (
                        <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card className="max-w-sm w-full animate-in zoom-in duration-300">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Parent Confirmation</h3>
                        <button onClick={() => setIsOpen(false)} className="text-neutral-400">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <p className="text-neutral-600 mb-6 text-sm">
                        How did your child perform in this task? Your input helps the therapist track progress.
                    </p>

                    <div className="space-y-3">
                        <Button
                            className="w-full bg-green-500 hover:bg-green-600 border-none"
                            onClick={() => {
                                onConfirm();
                                setIsOpen(false);
                            }}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Correct / Independent
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                            onClick={() => {
                                onNeedsPractice();
                                setIsOpen(false);
                            }}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Needs Practice / Prompted
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-neutral-500"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Main Game Engine Container
export const GameEngine = ({ title, children, onExit }) => {
    const [lang, setLang] = useState('en'); // 'en', 'hi', 'te'

    const languages = [
        { code: 'en', label: 'English', voice: 'en-IN' },
        { code: 'hi', label: 'हिन्दी', voice: 'hi-IN' },
        { code: 'te', label: 'తెలుగు', voice: 'te-IN' }
    ];

    const [availableVoices, setAvailableVoices] = useState([]);

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const speak = React.useCallback((text, languageCode) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedLang = languages.find(l => l.code === (languageCode || lang));

        // Find the "best" voice for the language - prefer Google or Premium voices
        const voices = window.speechSynthesis.getVoices();
        const langVoices = voices.filter(v =>
            v.lang.startsWith(selectedLang.voice.split('-')[0])
        );

        // Strategy: 1. Google Voices, 2. Premium/Enhanced, 3. Any Female voice, 4. Any voice
        const bestVoice =
            langVoices.find(v => v.name.includes('Google') || v.name.includes('Premium')) ||
            langVoices.find(v => v.name.toLowerCase().includes('female')) ||
            langVoices[0];

        if (bestVoice) utterance.voice = bestVoice;

        // Kid-friendly settings
        utterance.pitch = 1.25; // Slightly higher pitch for a "younger/friendlier" character feel
        utterance.rate = 0.85;  // Slightly slower for better comprehension in therapy
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
    }, [lang, languages]);

    return (
        <div className="fixed inset-0 bg-[#f8fafc] z-[60] flex flex-col overflow-hidden">
            {/* Game Header */}
            <div className="p-4 flex items-center justify-between bg-white/50 backdrop-blur-sm border-b border-neutral-100">
                <button
                    onClick={onExit}
                    className="p-2 rounded-full bg-white shadow-sm text-neutral-400 hover:text-neutral-600"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="flex bg-neutral-100 p-1 rounded-full gap-1">
                    {languages.map(l => (
                        <button
                            key={l.code}
                            onClick={() => setLang(l.code)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === l.code ? 'bg-primary-500 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-200'
                                }`}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>

                <h2 className="text-sm font-bold text-neutral-400 tracking-tight uppercase hidden md:block">{title}</h2>
            </div>

            {/* Game Stage */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                {/* Pass language and speak function down to children via cloneElement or provide context */}
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, { lang, speak });
                    }
                    return child;
                })}
            </div>

            {/* Footer / Branding */}
            <div className="p-4 text-center">
                <p className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase">
                    NeuroBridge™ Play Therapy • Multi-Language Support
                </p>
            </div>
        </div>
    );
};
