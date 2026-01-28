import React, { useState, useRef, useEffect } from 'react';
import { Gajju, ParentGate } from './GameEngine';
import { MousePointer2, Sparkles } from 'lucide-react';

const TracePath = ({ onComplete, onExit, lang = 'en', speak }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [mood, setMood] = useState('happy');

    const instructions = {
        en: 'Follow the dashed line!',
        hi: 'बिंदीदार रेखा का पालन करें!',
        te: 'చుక్కల రేఖను అనుసరించండి!'
    };

    const path = { x1: 50, y1: 50, x2: 250, y2: 300 };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.lineCap = 'round';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 40;
        ctx.beginPath();
        ctx.moveTo(path.x1, path.y1);
        ctx.lineTo(path.x2, path.y2);
        ctx.stroke();

        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(path.x1, path.y1);
        ctx.lineTo(path.x2, path.y2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (speak) speak(instructions[lang]);
    }, [lang, speak]);

    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    };

    const handleStart = (e) => {
        setIsDrawing(true);
        const pos = getPos(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const handleMove = (e) => {
        if (!isDrawing) return;
        const pos = getPos(e);
        const ctx = canvasRef.current.getContext('2d');

        ctx.lineCap = 'round';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 15;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        const dist = Math.sqrt(Math.pow(pos.x - path.x2, 2) + Math.pow(pos.y - path.y2, 2));
        if (dist < 40) {
            setIsDrawing(false);
            setProgress(100);
            setMood('happy');
            if (speak) speak('Amazing progress!');
            setTimeout(() => onComplete && onComplete({ type: 'ot-trace', status: 'completed' }), 2000);
        }
    };

    return (
        <div className="w-full max-w-sm flex flex-col items-center gap-8 pt-4">
            <ParentGate
                onConfirm={() => onComplete({ success: true })}
                onNeedsPractice={() => onComplete({ success: false })}
            />

            <Gajju mood={mood} />

            <div className="relative bg-white rounded-3xl p-4 shadow-inner border border-neutral-100">
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={350}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={() => setIsDrawing(false)}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={() => setIsDrawing(false)}
                    className="touch-none cursor-crosshair"
                />

                <div className="absolute top-4 left-4 p-2 bg-primary-100 rounded-full animate-pulse">
                    <MousePointer2 className="h-6 w-6 text-primary-600" />
                </div>

                {progress === 100 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-3xl animate-in fade-in">
                        <div className="bg-white p-6 rounded-full shadow-xl">
                            <Sparkles className="h-12 w-12 text-primary-500 fill-primary-100" />
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center">
                <p className="text-neutral-500 font-bold">{instructions[lang]}</p>
            </div>
        </div>
    );
};

export default TracePath;
