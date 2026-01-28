import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle } from 'lucide-react';
import { Gajju, ParentGate } from './GameEngine';

const SCENARIOS = [
    {
        id: 1,
        title: { en: 'Sharing Toys', hi: 'खिलौने बांटना', te: 'బొమ్మలను పంచుకోవడం' },
        question: {
            en: 'A friend wants to play with your blocks. What do you do?',
            hi: 'एक दोस्त आपके ब्लॉक्स के साथ खेलना चाहता है। आप क्या करोगे?',
            te: 'ఒక స్నేహితుడు మీ బ్లాక్స్‌తో ఆడుకోవాలనుకుంటున్నాడు. మీరు ఏమి చేస్తారు?'
        },
        image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600&h=400&fit=crop',
        options: [
            {
                id: 'good',
                icon: ThumbsUp,
                label: { en: 'Share', hi: 'बाँटो', te: 'పంచుకోండి' },
                correct: true,
                feedback: {
                    en: 'Great job! Sharing makes everyone happy.',
                    hi: 'बहुत बढ़िया! बाँटने से सब खुश होते हैं।',
                    te: 'చాలా మంచి పని! పంచుకోవడం అందరినీ సంతోషపరుస్తుంది.'
                }
            },
            {
                id: 'bad',
                icon: ThumbsDown,
                label: { en: 'Hide', hi: 'छुपाओ', te: 'దాచు' },
                correct: false,
                feedback: {
                    en: 'We should try to share with friends.',
                    hi: 'हमें दोस्तों के साथ बाँटने की कोशिश करनी चाहिए।',
                    te: 'మనం స్నేహితులతో పంచుకోవడానికి ప్రయత్నించాలి.'
                }
            }
        ]
    },
    {
        id: 2,
        title: { en: 'Greeting Elders', hi: 'बड़ों का अभिवादन', te: 'పెద్దలను పలకరించడం' },
        question: {
            en: 'Grandpa just came home. What do you do?',
            hi: 'दादाजी अभी घर आए हैं। आप क्या करेंगे?',
            te: 'తాతయ్య ఇప్పుడే ఇంటికి వచ్చారు. మీరు ఏమి చేస్తారు?'
        },
        image: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=600&h=400&fit=crop',
        options: [
            {
                id: 'good',
                icon: ThumbsUp,
                label: { en: 'Namaste', hi: 'नमस्ते', te: 'నమస్కారం' },
                correct: true,
                feedback: {
                    en: 'Wonderful! Being polite is very kind.',
                    hi: 'अद्भुत! विनम्र होना बहुत दयालुता है।',
                    te: 'అద్భుతం! మర్యాదగా ఉండటం చాలా మంచి విషయం.'
                }
            },
            {
                id: 'bad',
                icon: ThumbsDown,
                label: { en: 'Ignore', hi: 'नजरअंदाज', te: 'పట్టించుకోవద్దు' },
                correct: false,
                feedback: {
                    en: 'It is nice to say hello when someone arrives.',
                    hi: 'जब कोई आता है तो नमस्ते कहना अच्छा होता है।',
                    te: 'ఎవరైనా వచ్చినప్పుడు హలో చెప్పడం మంచిది.'
                }
            }
        ]
    }
];

const GoodChoiceCity = ({ onComplete, onExit, lang = 'en', speak }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [mood, setMood] = useState('happy');

    const currentScenario = SCENARIOS[currentIndex];

    useEffect(() => {
        if (currentScenario && speak) {
            speak(currentScenario.question[lang]);
        }
    }, [currentIndex, lang, currentScenario, speak]);

    const handleSelect = (option) => {
        setFeedback(option);
        if (speak && option?.feedback?.[lang]) {
            speak(option.feedback[lang]);
        }
        if (option.correct) {
            setMood('happy');
        } else {
            setMood('neutral');
        }

        setTimeout(() => {
            setFeedback(null);
            if (currentIndex < SCENARIOS.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                onComplete && onComplete({ type: 'aba-choice', status: 'completed' });
            }
        }, 4000);
    };

    return (
        <div className="w-full max-w-sm flex flex-col items-center gap-6 pt-4">
            <ParentGate
                onConfirm={() => onComplete({ success: true })}
                onNeedsPractice={() => onComplete({ success: false })}
            />

            <Gajju mood={mood} />

            <div className="w-full px-4">
                <img
                    src={currentScenario.image}
                    alt={currentScenario.title[lang]}
                    className="w-full h-44 object-cover rounded-3xl shadow-md border border-white"
                />
            </div>

            <div className="text-center space-y-3 px-4">
                <h3 className="text-xl font-black text-neutral-800">{currentScenario.title[lang]}</h3>
                <p className="text-neutral-600 font-medium leading-relaxed">{currentScenario.question[lang]}</p>
            </div>

            {feedback ? (
                <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-primary-50 text-center animate-in zoom-in h-44 flex flex-col justify-center items-center mx-4">
                    {feedback.correct ? (
                        <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    ) : (
                        <XCircle className="h-12 w-12 text-amber-500 mb-2" />
                    )}
                    <p className="font-bold text-neutral-800">{feedback.feedback[lang]}</p>
                </div>
            ) : (
                <div className="flex gap-4 w-full px-4">
                    {currentScenario.options.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelect(opt)}
                            className="flex-1 py-6 bg-white rounded-3xl shadow-md flex flex-col items-center justify-center gap-2 border-b-4 border-neutral-100 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            <opt.icon className={`h-10 w-10 ${opt.id === 'good' ? 'text-green-500' : 'text-amber-500'}`} />
                            <span className="font-black text-neutral-700 uppercase text-xs tracking-widest">{opt.label[lang]}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            <div className="w-full px-4 mt-4">
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-500 transition-all duration-500"
                        style={{ width: `${((currentIndex + 1) / SCENARIOS.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default GoodChoiceCity;
