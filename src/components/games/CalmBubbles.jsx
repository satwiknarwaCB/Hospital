import React, { useState, useEffect } from 'react';
import { Gajju } from './GameEngine';
import { Wind } from 'lucide-react';

const CalmBubbles = ({ onExit, lang = 'en', speak }) => {
    const [bubbles, setBubbles] = useState([]);
    const [breathingStep, setBreathingStep] = useState('plus'); // internal step

    const getLabel = (step) => {
        if (step === 'Inhale') {
            return lang === 'hi' ? 'साँस लें' : lang === 'te' ? 'శ్వాస తీసుకోండి' : 'Inhale';
        }
        return lang === 'hi' ? 'साँस छोड़ें' : lang === 'te' ? 'శ్వాస వదలండి' : 'Exhale';
    }

    useEffect(() => {
        let currentStep = 'Inhale';
        setBreathingStep(currentStep);
        speak && speak(getLabel(currentStep));

        const interval = setInterval(() => {
            currentStep = currentStep === 'Inhale' ? 'Exhale' : 'Inhale';
            setBreathingStep(currentStep);
            speak && speak(getLabel(currentStep));
        }, 4000);

        const bubbleInterval = setInterval(() => {
            const newBubble = {
                id: Date.now(),
                x: Math.random() * 80 + 10,
                y: 110,
                size: Math.random() * 40 + 20,
                speed: Math.random() * 2 + 1,
                color: ['bg-blue-200', 'bg-purple-200', 'bg-pink-200', 'bg-teal-200'][Math.floor(Math.random() * 4)]
            };
            setBubbles(prev => [...prev.slice(-15), newBubble]);
        }, 1500);

        return () => {
            clearInterval(interval);
            clearInterval(bubbleInterval);
        };
    }, [lang]);

    return (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-indigo-50 overflow-hidden pt-4">
            {/* Bubbles */}
            {bubbles.map(b => (
                <div
                    key={b.id}
                    className={`absolute rounded-full opacity-40 blur-[1px] ${b.color} transition-all duration-1000 ease-linear`}
                    style={{
                        left: `${b.x}%`,
                        bottom: `${(100 - (Date.now() - b.id) / 50 * b.speed) % 120}%`,
                        width: `${b.size}px`,
                        height: `${b.size}px`,
                    }}
                />
            ))}

            {/* Breathing Guide */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-8 z-10">
                    <div className="relative">
                        <div className={`w-48 h-48 rounded-full border-4 border-white/50 flex items-center justify-center transition-all duration-[4000ms] ${breathingStep === 'Inhale' ? 'scale-150 bg-white/20' : 'scale-100 bg-white/5'
                            }`}>
                            <Wind className="h-12 w-12 text-white/60" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-3xl font-light text-indigo-900 tracking-widest uppercase">
                            {getLabel(breathingStep)}
                        </h3>
                        <p className="text-indigo-400 text-sm">{lang === 'hi' ? 'घेरे के साथ सांस लें...' : lang === 'te' ? 'వృత్తంతో శ్వాస తీసుకోండి...' : 'Breathe with the circle...'}</p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center opacity-40">
                <Gajju className="scale-75 translate-y-8" />
            </div>
        </div>
    );
};

export default CalmBubbles;
