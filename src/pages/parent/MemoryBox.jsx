// ============================================================
// NeuroBridge™ - Memory Box (Child Portfolio)
// A digital scrapbook for capturing "Small Wins"
// ============================================================

import React, { useState } from 'react';
import { Camera, Plus, Heart, MessageCircle, Play, Image as ImageIcon, Video, Trash2, X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const MOCK_MEMORIES = [
    {
        id: 1,
        type: 'video',
        title: 'First full sentence!',
        description: 'Aarav asked for "more juice please" today at lunch. We are so proud!',
        date: '2026-01-27',
        thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=200',
        tags: ['Speech', 'Home Win'],
        likes: 2,
        doctorComment: "This is a huge milestone! Notice how he used three words together. Let's build on this in Tuesday's session."
    },
    {
        id: 2,
        type: 'image',
        title: 'Self-feeding success',
        description: 'He managed to use the spoon for the entire dinner without help.',
        date: '2026-01-25',
        url: 'https://images.unsplash.com/photo-1544126592-807daa215a05?auto=format&fit=crop&q=80&w=400',
        tags: ['OT', 'Independence'],
        likes: 1,
        doctorComment: null
    }
];

const MemoryBox = () => {
    const [memories, setMemories] = useState(MOCK_MEMORIES);
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="space-y-8 pb-32 animate-slide-up">
            {/* Header Section */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-neutral-800 tracking-tight">Our Memory Box 💝</h2>
                    <p className="text-neutral-500 font-medium mt-1 text-sm leading-tight">Saving every small win in {memories[0]?.title.split(' ')[0]}'s journey.</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="btn-premium h-14 w-14 rounded-2xl bg-neutral-900 text-white shadow-xl p-0 flex items-center justify-center"
                >
                    <Camera className="h-6 w-6" />
                </Button>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {memories.map((memory) => (
                    <Card key={memory.id} className="group overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] glass-card">
                        <CardContent className="p-0">
                            {/* Media Preview */}
                            <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                                <img
                                    src={memory.url || memory.thumbnail}
                                    alt={memory.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 shadow-inner"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                {memory.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-20 w-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 text-white scale-90 group-hover:scale-100 transition-transform">
                                            <Play className="h-10 w-10 fill-white" />
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex gap-2 mb-2">
                                        {memory.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider text-white border border-white/20">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h4 className="text-2xl font-black text-white tracking-tight">{memory.title}</h4>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <p className="text-neutral-500 font-medium leading-relaxed mb-8">
                                    {memory.description}
                                </p>

                                {/* Doctor's Note Integration */}
                                {memory.doctorComment && (
                                    <div className="bg-primary-50/50 rounded-3xl p-6 border border-primary-100/50 mb-8 relative">
                                        <div className="absolute -top-3 left-6 px-3 py-1 bg-primary-600 rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-primary-200">
                                            Doctor's Heart
                                        </div>
                                        <p className="text-primary-900 text-sm font-bold leading-relaxed">
                                            "{memory.doctorComment}"
                                        </p>
                                    </div>
                                )}

                                {/* Interactions Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <button className="flex items-center gap-2 group/heart">
                                            <div className="h-10 w-10 bg-pink-50 rounded-full flex items-center justify-center group-active/heart:scale-125 transition-transform">
                                                <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
                                            </div>
                                            <span className="text-sm font-black text-pink-600">{memory.likes}</span>
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 bg-neutral-50 rounded-full flex items-center justify-center">
                                                <MessageCircle className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <span className="text-sm font-black text-neutral-400 uppercase tracking-tighter">Share</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{new Date(memory.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Empty State / Add New Placeholder */}
                <button
                    onClick={() => setShowAddModal(true)}
                    className="aspect-[4/3] rounded-[2.5rem] border-4 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-4 hover:border-primary-400 hover:bg-primary-50/20 transition-all group"
                >
                    <div className="p-8 bg-neutral-100 rounded-[2rem] group-hover:bg-primary-100 group-hover:rotate-12 transition-all">
                        <Plus className="h-10 w-10 text-neutral-400 group-hover:text-primary-600" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-neutral-400 group-hover:text-primary-600 uppercase tracking-[0.2em] text-xs">Add a Memory</p>
                        <p className="text-[10px] text-neutral-300 mt-1">Photo or 10s Video</p>
                    </div>
                </button>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-neutral-900/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary-100 rounded-2xl">
                                    <Sparkles className="h-6 w-6 text-primary-600" />
                                </div>
                                <h3 className="text-2xl font-black text-neutral-800 tracking-tight">Capture a Win</h3>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="h-10 w-10 hover:bg-neutral-100 rounded-full flex items-center justify-center transition-colors">
                                <X className="h-6 w-6 text-neutral-400" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <button className="h-40 rounded-[2rem] border-2 border-neutral-100 flex flex-col items-center justify-center gap-3 hover:border-primary-500 hover:bg-primary-50 transition-all active:scale-95 group">
                                    <ImageIcon className="h-10 w-10 text-primary-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-neutral-600 uppercase text-[10px] tracking-widest">Select Photo</span>
                                </button>
                                <button className="h-40 rounded-[2rem] border-2 border-neutral-100 flex flex-col items-center justify-center gap-3 hover:border-primary-500 hover:bg-primary-50 transition-all active:scale-95 group">
                                    <Video className="h-10 w-10 text-violet-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-neutral-600 uppercase text-[10px] tracking-widest">Select Video</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Give it a name (e.g. First Steps!)"
                                    className="w-full h-16 px-8 rounded-3xl bg-neutral-50 border-none font-black text-neutral-800 placeholder:text-neutral-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none"
                                />
                                <textarea
                                    placeholder="Tell your doctor what happened..."
                                    rows={4}
                                    className="w-full p-8 rounded-3xl bg-neutral-50 border-none font-bold text-neutral-800 placeholder:text-neutral-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none"
                                />
                            </div>

                            <Button
                                onClick={() => setShowAddModal(false)}
                                className="w-full btn-premium h-20 rounded-[2rem] bg-neutral-900 text-white font-black text-xl shadow-2xl hover:bg-black"
                            >
                                Post to Memory Box
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemoryBox;
