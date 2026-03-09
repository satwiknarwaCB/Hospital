import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/context';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroSlider = () => {
    const navigate = useNavigate();



    const slides = [
        {
            image: '/therapy_child_1.png',
            position: 'justify-start',
            title: (
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-[#0284c7]">
                    FOSTERING GROWTH<br />
                    & POSITIVE BEHAVIOR
                </h1>
            ),
        },
        {
            image: '/therapy_session_2.png',
            position: 'justify-center',
            title: (
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-[#0284c7]">
                    AUTISM THERAPY<br />
                    & POTENTIAL
                </h1>
            ),
        },
        {
            image: '/family_clinic_3.png',
            position: 'justify-end',
            title: (
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-[#0284c7]">
                    EXPERT CARE<br />
                    & UNIQUE JOURNEYS
                </h1>
            ),
        },
        {
            image: '/therapist_professional_4.png',
            position: 'justify-start',
            title: (
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-[#0284c7]">
                    SUPPORTING EVERY<br />
                    FAMILY & CHILD
                </h1>
            ),
        },
        {
            image: '/hospital_hero.png',
            position: 'justify-center',
            title: (
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-[#0284c7]">
                    INNOVATIVE TOOLS<br />
                    & OUTCOMES
                </h1>
            ),
        }
    ];

    return (
        <div className="relative pt-28 md:pt-36 px-4 md:px-8 lg:px-12 animate-in fade-in duration-700">
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-primary-900/10">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay, EffectFade]}
                    effect="fade"
                    navigation={{
                        nextEl: '.swiper-button-next-custom',
                        prevEl: '.swiper-button-prev-custom',
                    }}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    loop={true}
                    className="h-full w-full"
                >
                    {slides.map((slide, index) => (
                        <SwiperSlide key={index}>
                            <div className={`relative h-full w-full flex items-center ${slide.position} p-8 md:p-16 lg:p-24`}>
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={slide.image}
                                        alt="Therapy Slide"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/5"></div>
                                </div>

                                {/* Glassmorphic Card (Standardized Width & Higher Transparency) */}
                                <div className="relative z-10 w-full max-w-[320px] md:max-w-[400px] bg-white/15 backdrop-blur-[2px] rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-center border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-1000">
                                    <div className="space-y-6">
                                        {slide.title}
                                        <div className="flex justify-center">
                                            <button
                                                className="h-10 px-6 text-base font-semibold bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg shadow-lg shadow-[#0284c7]/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
                                                onClick={() => navigate('/book-appointment')}
                                            >
                                                Book An Appointment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}

                    {/* Custom Navigation Buttons */}
                    <div className="hidden md:block">
                        <button className="swiper-button-prev-custom absolute left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all backdrop-blur-sm">
                            <ArrowRight className="h-5 w-5 rotate-180" />
                        </button>
                        <button className="swiper-button-next-custom absolute right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all backdrop-blur-sm">
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </Swiper>

                {/* Custom Pagination Style */}
                <style jsx global>{`
                .swiper-pagination-bullet {
                    background: white !important;
                    opacity: 0.5;
                    width: 10px;
                    height: 10px;
                }
                .swiper-pagination-bullet-active {
                    opacity: 1;
                    background: #0ea5e9 !important;
                    width: 30px;
                    border-radius: 5px;
                }
            `}</style>
            </div>
        </div>
    );
};

export default HeroSlider;
