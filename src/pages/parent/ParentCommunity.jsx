// ============================================================
// NeuroBridge™ - Parent Community Page
// Parent Portal - Community Support & Connection
// ============================================================

import React, { useState, useEffect } from 'react';
import { Users, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CommunityChat from '../../components/CommunityChat';
import { communityAPI } from '../../lib/api';
import { Button } from '../../components/ui/Button';

const ParentCommunity = () => {
    const navigate = useNavigate();
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get current parent data from localStorage
    const parentData = JSON.parse(localStorage.getItem('parent_data') || '{}');
    const parentId = parentData.parent?.id || parentData.id;
    const parentName = parentData.parent?.name || parentData.name || 'Parent';

    useEffect(() => {
        loadCommunity();
    }, []);

    const loadCommunity = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get default community
            const defaultCommunity = await communityAPI.getDefault();
            setCommunity(defaultCommunity);
        } catch (err) {
            console.error('Failed to load community:', err);
            setError('Failed to load community. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-secondary-500 mx-auto mb-4" />
                    <p className="text-neutral-600 font-medium">Loading community...</p>
                    <p className="text-neutral-400 text-sm mt-1">Connecting you with other parents</p>
                </div>
            </div>
        );
    }

    if (error && !community) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-neutral-800 mb-2">Unable to Load Community</h2>
                    <p className="text-neutral-600 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={loadCommunity} variant="secondary">
                            Try Again
                        </Button>
                        <Button onClick={() => navigate('/parent')} variant="outline">
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/parent')}
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-neutral-600" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center shadow-md">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-800">Parent Community</h1>
                                    <p className="text-sm text-neutral-500">Connect and support each other</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Community Chat Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                    {community ? (
                        <CommunityChat
                            communityId={community.id}
                            currentUserId={parentId}
                            currentUserName={parentName}
                            currentUserRole="parent"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Users className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-500 font-medium mb-2">No community available</p>
                                <p className="text-neutral-400 text-sm">Please contact your therapist</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Community Guidelines */}
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                    <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                        <Info className="h-5 w-5 text-secondary-500" />
                        Community Guidelines
                    </h3>
                    <ul className="space-y-2 text-sm text-neutral-600">
                        <li className="flex items-start gap-2">
                            <span className="text-secondary-500 mt-0.5">•</span>
                            <span>Be respectful and supportive of all community members</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-secondary-500 mt-0.5">•</span>
                            <span>Share experiences and insights that may help others</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-secondary-500 mt-0.5">•</span>
                            <span>Maintain privacy - don't share personal information about others</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-secondary-500 mt-0.5">•</span>
                            <span>Keep conversations constructive and positive</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-secondary-500 mt-0.5">•</span>
                            <span>Report any concerns to your therapist</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const Info = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default ParentCommunity;
