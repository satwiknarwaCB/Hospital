import React, { useState, useEffect } from 'react';
import { Mic, Volume2, CheckCircle2 } from 'lucide-react';
import { Gajju, ParentGate } from './GameEngine';
import { Button } from '../ui/Button';

const ITEMS = [
    {
        name: { en: 'Apple', hi: 'सेब', te: 'ఆపిల్' },
        image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500&h=500&fit=crop',
        sound: 'apple'
    },
    {
        name: { en: 'Dog', hi: 'कुत्ता', te: 'కుక్క' },
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop',
        sound: 'dog'
    },
    {
        name: { en: 'Car', hi: 'गाड़ी', te: 'కారు' },
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&h=500&fit=crop',
        sound: 'car'
    },
    {
        name: { en: 'Banana', hi: 'केला', te: 'అరటి' },
        image: 'https://images.unsplash.com/photo-1571771894821-ad9902d73647?w=500&h=500&fit=crop',
        sound: 'banana'
    },
];

const PROMPTS = {
    en: 'Can you say',
    hi: 'क्या आप कह सकते हैं',
    te: 'మీరు చెప్పగలరా'
};

const SUCCESS_PHRASES = {
    en: ['Great job!', 'Amazing!', 'You did it!'],
    hi: ['बहुत बढ़िया!', 'लाजवाब!', 'आपने कर दिखाया!'],
    te: ['చాలా బాగుంది!', 'అద్భుతం!', 'మీరు సాధించారు!']
};

const MagicPictureTalk = ({ onComplete, onExit, lang = 'en', speak }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [results, setResults] = useState([]);
    const [mood, setMood] = useState('happy');
    const [volume, setVolume] = useState(0);

    const currentItem = ITEMS[currentIndex];

    // Speech Recognition setup
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) return;

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';

        recognition.onstart = () => {
            setIsRecording(true);
            setMood('talk');
            setupAudioVisualizer();
        };

        recognition.onresult = (event) => {
            const current = event.results[0][0].transcript.toLowerCase();
            setTranscript(current);

            // Check if it matches the item name
            const targetName = currentItem.name[lang].toLowerCase();
            if (current.includes(targetName)) {
                // We found a match! 
                setTimeout(() => handleParentConfirm(true), 1500);
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
            setMood('happy');
            setVolume(0);
        };

        window._recognition = recognition;
    }, [currentIndex, lang]);

    const setupAudioVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 32;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!window._recognition) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                setVolume(sum / bufferLength);
                if (window._recognition) requestAnimationFrame(updateVolume);
            };
            updateVolume();
        } catch (err) {
            console.error('Mic error:', err);
        }
    };

    useEffect(() => {
        const text = `${PROMPTS[lang]} ${currentItem.name[lang]}`;
        speak(text);
    }, [currentIndex, lang, currentItem.name, speak]);

    const handleRecord = () => {
        if (window._recognition) {
            try {
                window._recognition.start();
            } catch (e) {
                window._recognition.stop();
            }
        }
    };

    const handleParentConfirm = (success) => {
        const newResults = [...results, { id: currentItem.name.en, success }];
        setResults(newResults);

        if (success) {
            const phrases = SUCCESS_PHRASES[lang];
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            speak && speak(randomPhrase);
        }

        if (currentIndex < ITEMS.length - 1) {
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setTranscript('');
            }, 1000);
        } else {
            onComplete(newResults);
        }
    };

    return (
        <div className="w-full max-w-sm flex flex-col items-center gap-6 pt-4">
            <ParentGate
                onConfirm={() => handleParentConfirm(true)}
                onNeedsPractice={() => handleParentConfirm(false)}
            />

            <div className="relative">
                <Gajju mood={mood} />
                {isRecording && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className="w-1 bg-primary-500 rounded-full transition-all duration-75"
                                style={{ height: `${Math.max(4, volume * (i % 2 === 0 ? 0.5 : 1))}px` }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary-100 to-violet-100 rounded-[2rem] blur-xl opacity-50 transition duration-1000"></div>
                <div className="relative bg-white p-3 rounded-[2rem] shadow-xl border border-white overflow-hidden w-44 h-44 md:w-60 md:h-60 flex items-center justify-center">
                    <img
                        src={currentItem.image}
                        alt={currentItem.name.en}
                        className="w-full h-full object-cover rounded-[1.5rem]"
                    />
                </div>
            </div>

            <div className="text-center space-y-2">
                <p className="text-neutral-500 text-sm font-medium tracking-wide uppercase">
                    {isRecording ? (lang === 'hi' ? 'गज्जू सुन रहा है...' : lang === 'te' ? 'గజ్జు వింటున్నారు...' : 'Gajju is listening...') : PROMPTS[lang]}
                </p>
                <h3 className="text-3xl font-black text-neutral-800 tracking-tight">
                    "{currentItem.name[lang]}"
                </h3>
                {transcript && (
                    <p className="text-primary-500 font-bold animate-pulse">"{transcript}"</p>
                )}
            </div>

            <div className="flex gap-4 w-full px-4">
                <button
                    onClick={() => speak && speak(currentItem.name[lang])}
                    className="flex-1 h-16 bg-violet-100 hover:bg-violet-200 rounded-3xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
                >
                    <Volume2 className="h-7 w-7 text-violet-600" />
                </button>

                <button
                    onClick={handleRecord}
                    className={`flex-[2] h-20 rounded-3xl flex items-center justify-center transition-all active:scale-95 shadow-md ${isRecording
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-green-500 hover:bg-green-600'
                        }`}
                >
                    <Mic className={`h-8 w-8 text-white ${isRecording ? 'animate-bounce' : ''}`} />
                </button>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
                {ITEMS.map((_, i) => (
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

export default MagicPictureTalk;
