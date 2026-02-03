// ============================================================
// NeuroBridge™ - Community Chat Component
// Shared component for community messaging
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Users,
    Info,
    Loader2,
    AlertCircle,
    User,
    MessageSquare
} from 'lucide-react';
import { Button } from './ui/Button';
import { communityAPI } from '../lib/api';

// Message Bubble Component
const CommunityMessageBubble = ({ message, currentUserId }) => {
    const isOwn = message.sender_id === currentUserId;
    const isSystem = message.sender_role === 'system';

    const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    if (isSystem) {
        return (
            <div className="flex justify-center mb-4">
                <div className="bg-neutral-100 text-neutral-600 text-sm px-4 py-2 rounded-full">
                    {message.content}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {/* Sender Info - Always visible in community */}
                <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!isOwn && (
                        <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-3 w-3 text-primary-600" />
                        </div>
                    )}
                    <span className="text-xs font-medium text-neutral-600">
                        {message.sender_name} ({message.sender_role === 'therapist' ? 'Therapist' : 'Parent'})
                    </span>
                    {isOwn && (
                        <div className="h-6 w-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-3 w-3 text-secondary-600" />
                        </div>
                    )}
                </div>

                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${isOwn
                    ? 'bg-secondary-600 text-white rounded-br-md'
                    : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
                    }`}>
                    <p className={`text-sm whitespace-pre-wrap ${isOwn ? 'text-white' : 'text-neutral-700'}`}>
                        {message.content}
                    </p>
                </div>

                {/* Time */}
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-neutral-400">{time}</span>
                </div>
            </div>
        </div>
    );
};

// Community Chat Component
const CommunityChat = ({ communityId, currentUserId, currentUserName, currentUserRole = 'parent' }) => {
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [community, setCommunity] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [notification, setNotification] = useState(null);
    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load community data
    const loadCommunityData = async () => {
        try {
            setError(null);

            // Load community info
            const communityData = await communityAPI.getById(communityId);
            setCommunity(communityData);

            // Load messages
            const messagesData = await communityAPI.getMessages(communityId, 100, 0);
            setMessages(messagesData.messages || []);

            // Load members
            const membersData = await communityAPI.getMembers(communityId);
            setMembers(membersData || []);

            setLoading(false);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error('Failed to load community data:', err);
            setError('Failed to load community. Please try again.');
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (communityId) {
            loadCommunityData();
        }
    }, [communityId]);

    // Poll for new messages every 60 seconds (Reduced to clean up logs)
    useEffect(() => {
        if (!communityId) return;

        const pollMessages = async () => {
            try {
                const messagesData = await communityAPI.getMessages(communityId, 100, 0);
                const newMessages = messagesData.messages || [];

                // Update only if count changed to avoid unnecessary re-renders
                setMessages(prev => {
                    if (newMessages.length > prev.length) {
                        const latest = newMessages[newMessages.length - 1];
                        if (latest.sender_id !== currentUserId && prev.length > 0) {
                            setNotification({
                                title: `New message from ${latest.sender_name}`,
                                content: latest.content.substring(0, 50) + (latest.content.length > 50 ? '...' : '')
                            });
                            setTimeout(() => setNotification(null), 3000);
                        }
                        return newMessages;
                    }
                    return prev;
                });
            } catch (err) {
                console.error('Failed to poll messages:', err);
            }
        };

        pollIntervalRef.current = setInterval(pollMessages, 60000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [communityId, currentUserId]);

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const sentMessage = await communityAPI.sendMessage(communityId, newMessage.trim());

            // Add message to local state immediately
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary-500 mx-auto mb-2" />
                    <p className="text-neutral-500">Loading community...</p>
                </div>
            </div>
        );
    }

    if (error && !community) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <p className="text-neutral-700 font-medium mb-2">Oops! Something went wrong</p>
                    <p className="text-neutral-500 text-sm mb-4">{error}</p>
                    <Button onClick={loadCommunityData} variant="secondary">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-800">{community?.name || 'Community'}</h3>
                        <p className="text-xs text-neutral-500">
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${showInfo
                        ? 'bg-secondary-100 text-secondary-700'
                        : 'hover:bg-neutral-100 text-neutral-500'}`}
                >
                    <Info className="h-4 w-4" />
                    <span className="text-xs font-medium">View Members</span>
                </button>
            </div>

            {/* Community Info Panel */}
            {showInfo && (
                <div className="p-4 bg-white border-b border-neutral-200 shadow-inner max-h-60 overflow-y-auto">
                    <div className="mb-4">
                        <h4 className="font-semibold text-neutral-800 mb-1">About</h4>
                        <p className="text-sm text-neutral-600">{community?.description}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Active Members ({members.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4 text-primary-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-neutral-800 truncate">{member.name}</p>
                                        <p className="text-[10px] text-neutral-500 capitalize">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
                {messages.length > 0 ? (
                    <>
                        {messages.map((message) => (
                            <CommunityMessageBubble
                                key={message.id}
                                message={message}
                                currentUserId={currentUserId}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Users className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 font-medium">No messages yet</p>
                            <p className="text-neutral-400 text-sm">Be the first to start the conversation!</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-neutral-200 bg-white">
                <div className="flex items-end gap-2">
                    <textarea
                        placeholder="Type a message..."
                        className="flex-1 p-3 bg-neutral-50 rounded-xl border-0 focus:ring-2 focus:ring-secondary-200 focus:outline-none resize-none"
                        rows={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                    />
                    <Button
                        variant="secondary"
                        className="rounded-xl px-4 py-3"
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                    >
                        {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-secondary-600 text-white p-4 rounded-xl shadow-lg border border-secondary-500 max-w-xs flex items-start gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">{notification.title}</p>
                            <p className="text-xs text-white/90 line-clamp-2">{notification.content}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="text-white/70 hover:text-white">
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityChat;
