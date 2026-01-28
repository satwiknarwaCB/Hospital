import React, { useState, useEffect } from 'react';
import { Gajju, ParentGate } from './GameEngine';
import { Volume2, Sparkles } from 'lucide-react';

const CHALLENGES = [
    { sound: 'Ba', options: ['B', 'D', 'M'], correct: 'B' },
    { sound: 'Da', options: ['P', 'D', 'T'], correct: 'D' },
    { sound: 'Ma', options: ['N', 'M', 'L'], correct: 'M' },
];

const SoundPop = ({ onComplete, onExit, lang = 'en', speak }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mood, setMood] = useState('happy');
    const [showSuccess, setShowSuccess] = useState(false);

    const currentTask = CHALLENGES[currentIndex];

    const playSound = () => {
        setMood('talk');
        speak && speak(currentTask.sound);
        setTimeout(() => setMood('happy'), 1500);
    };

    useEffect(() => {
        playSound();
    }, [currentIndex]);

    const handleSelect = (option) => {
        if (option === currentTask.correct) {
            setShowSuccess(true);
            setMood('happy');
            speak && speak('Correct!');
            setTimeout(() => {
                setShowSuccess(false);
                if (currentIndex < CHALLENGES.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                } else {
                    onComplete({ type: 'sound-pop', status: 'completed' });
                }
            }, 1500);
        } else {
            speak && speak('Try again');
        }
    };

    return (
        <div className="w-full max-w-sm flex flex-col items-center gap-12 pt-4">
            <ParentGate
                onConfirm={() => onComplete({ success: true })}
                onNeedsPractice={() => onComplete({ success: false })}
            />

            <div className="relative">
                <Gajju mood={mood} />
                <button
                    onClick={playSound}
                    className="absolute -bottom-2 -right-2 bg-white p-4 rounded-full shadow-lg border border-primary-100 text-primary-600 active:scale-90 transition-transform"
                >
                    <Volume2 className="h-6 w-6" />
                </button>
            </div>

            <div className="text-center px-4">
                <h3 className="text-xl font-bold text-neutral-800">
                    {lang === 'hi' ? 'कौन सा अक्षर वह ध्वनि बनाता है?' : lang === 'te' ? 'ఆ శబ్దం ఏ అక్షరం చేస్తుంది?' : 'Which letter makes that sound?'}
                </h3>
            </div>

            <div className="flex gap-4 justify-center w-full px-4">
                {currentTask.options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        className="w-20 h-20 rounded-full bg-white shadow-md border-4 border-primary-50 text-2xl font-bold text-primary-600 hover:border-primary-200 transition-all active:scale-90 flex items-center justify-center relative overflow-hidden"
                    >
                        {opt}
                        {showSuccess && opt === currentTask.correct && (
                            <div className="absolute inset-0 bg-green-500 flex items-center justify-center text-white animate-in zoom-in">
                                <Sparkles className="h-8 w-8 text-white fill-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Progress Tracker */}
            <div className="flex gap-2">
                {CHALLENGES.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-primary-500' :
                            i < currentIndex ? 'w-2 bg-green-500' : 'w-2 bg-neutral-200'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default SoundPop;
