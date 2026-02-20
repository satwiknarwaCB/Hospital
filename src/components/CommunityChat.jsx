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
    MessageSquare,
    Smile,
    ShieldCheck,
    Trash2
} from 'lucide-react';
import { Button } from './ui/Button';
import { communityAPI } from '../lib/api';
import { useApp } from '../lib/context';

// Message Bubble Component
const CommunityMessageBubble = ({ message, currentUserId, currentUserRole, members = [], onReact, onDelete }) => {
    const { currentUser, users } = useApp();

    // Identify all IDs associated with the current user
    const myIds = React.useMemo(() => {
        const ids = [currentUserId];
        if (currentUser?.id) ids.push(currentUser.id);
        const me = users?.find(u => u.email?.toLowerCase() === currentUser?.email?.toLowerCase());
        if (me?.id) ids.push(me.id);
        if (me?.mockId) ids.push(me.mockId);
        return [...new Set(ids)];
    }, [currentUserId, currentUser, users]);

    const isOwn = myIds.includes(message.sender_id);
    const isSystem = message.sender_role === 'system';
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeReactionPopover, setActiveReactionPopover] = useState(null); // emoji string or null
    const popoverRef = React.useRef(null);

    // Close popover when clicking outside
    React.useEffect(() => {
        if (!activeReactionPopover) return;
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setActiveReactionPopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeReactionPopover]);

    const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const commonEmojis = ['👍', '❤️', '👏', '🙏', '😊', '💡'];

    if (isSystem) {
        return (
            <div className="flex justify-center mb-4">
                <div className="bg-neutral-100 text-neutral-600 text-sm px-4 py-2 rounded-full">
                    {message.content}
                </div>
            </div>
        );
    }

    // Check delete permissions
    const isTherapist = currentUserRole?.toLowerCase() === 'therapist';
    // Anyone can delete a message "for me" (except system messages)
    const canDelete = !isSystem;

    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    const deleteMenuRef = useRef(null);

    // Close delete menu when clicking outside
    useEffect(() => {
        if (!showDeleteMenu) return;
        const handleClickOutside = (e) => {
            if (deleteMenuRef.current && !deleteMenuRef.current.contains(e.target)) {
                setShowDeleteMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDeleteMenu]);

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6 group`}>
            <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'} relative`}>
                {/* Sender Info - Always visible in community */}
                <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {!isOwn && (
                        <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {(() => {
                                const sender = members.find(m => m.id === message.sender_id) || (Array.isArray(users) ? users : []).find(u => u.id === message.sender_id || u.mockId === message.sender_id);
                                return sender?.avatar ? (
                                    <img src={sender.avatar} alt={message.sender_name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-3 w-3 text-primary-600" />
                                );
                            })()}
                        </div>
                    )}
                    <span className="text-xs font-medium text-neutral-600">
                        {message.sender_name} {message.sender_role === 'therapist' ? <span className="text-[10px] bg-secondary-100 text-secondary-700 px-1.5 py-0.5 rounded-full font-bold ml-1">Therapist</span> : '(Parent)'}
                    </span>
                    {isOwn && (
                        <div className="h-6 w-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt={message.sender_name} className="w-full h-full object-cover" />
                            ) : (() => {
                                const sender = members.find(m => m.id === message.sender_id) || (Array.isArray(users) ? users : []).find(u => u.id === message.sender_id || u.mockId === message.sender_id);
                                return sender?.avatar ? (
                                    <img src={sender.avatar} alt={message.sender_name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-3 w-3 text-secondary-600" />
                                );
                            })()}
                        </div>
                    )}
                </div>

                {/* Message Content */}
                <div className="relative group/bubble">
                    <div className={`rounded-2xl px-4 py-3 ${isOwn
                        ? 'bg-secondary-600 text-white rounded-br-md shadow-md'
                        : 'bg-white text-neutral-800 rounded-bl-md shadow-sm border border-neutral-100'
                        }`}>
                        <p className={`text-sm whitespace-pre-wrap ${isOwn ? 'text-white' : 'text-neutral-700'}`}>
                            {message.content}
                        </p>
                    </div>

                    {/* Quick Reactions Overlay */}
                    {!isSystem && (
                        <div className={`absolute top-0 ${isOwn ? '-left-10' : '-right-10'} opacity-100 transition-opacity flex flex-col gap-2`}>
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`p-1.5 bg-white rounded-full shadow-lg border animate-in zoom-in-50 duration-300 ${showEmojiPicker ? 'border-secondary-500 ring-2 ring-secondary-100 scale-110' : 'border-neutral-200 hover:bg-neutral-50 hover:scale-110'}`}
                                title="Add Reaction"
                            >
                                <Smile className="h-4 w-4 text-secondary-500 font-bold" />
                            </button>

                            {/* Delete Button */}
                            {canDelete && onDelete && (
                                <div className="relative" ref={deleteMenuRef}>
                                    <button
                                        onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                                        className={`p-1.5 bg-white rounded-full shadow-lg border animate-in zoom-in-50 duration-300 ${showDeleteMenu ? 'border-red-500 ring-2 ring-red-100 scale-110' : 'border-neutral-200 hover:bg-red-50 hover:border-red-200 text-neutral-400 hover:text-red-500'}`}
                                        title="Delete message"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    {/* Delete Options Menu */}
                                    {showDeleteMenu && (
                                        <div className={`absolute z-10 top-0 ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} w-40 bg-white shadow-xl border border-neutral-100 rounded-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col`}>
                                            <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-100">
                                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Delete Message</p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    onDelete(message.id, 'for_me');
                                                    setShowDeleteMenu(false);
                                                }}
                                                className="px-3 py-2.5 text-left text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors border-b border-neutral-50"
                                            >
                                                Delete for me
                                            </button>

                                            {isTherapist && (
                                                <button
                                                    onClick={() => {
                                                        onDelete(message.id, 'for_everyone');
                                                        setShowDeleteMenu(false);
                                                    }}
                                                    className="px-3 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    Delete for everyone
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {showEmojiPicker && (
                                <div className={`absolute z-10 top-0 ${isOwn ? 'right-full mr-12' : 'left-full ml-2'} bg-white shadow-xl border border-neutral-100 rounded-full py-1 px-2 flex gap-1 animate-in zoom-in-95 duration-200`}>
                                    {commonEmojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                onReact(message.id, emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                            className="hover:scale-125 transition-transform p-1 text-sm"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Reactions Display */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className={`mt-1.5 ${isOwn ? 'text-right' : 'text-left'}`}>
                        <div className={`flex flex-wrap gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            {Object.entries(message.reactions).map(([emoji, userIds]) => {
                                const hasReacted = userIds.includes(currentUserId);
                                const isTherapistRole = currentUserRole?.toLowerCase() === 'therapist';
                                const parentReactors = isTherapistRole
                                    ? userIds
                                        .map(uid => members.find(m => m.id === uid))
                                        .filter(m => m?.role === 'parent')
                                    : [];
                                const parentNames = parentReactors.map(m => m.name);
                                const tooltipText = isTherapistRole
                                    ? parentNames.length > 0
                                        ? `${userIds.length} total · Parents: ${parentNames.join(', ')}`
                                        : `${userIds.length} total · No parents reacted`
                                    : '';
                                const isPopoverOpen = activeReactionPopover === emoji;
                                return (
                                    <div key={emoji} className="relative">
                                        <button
                                            onClick={() => {
                                                if (isTherapistRole) {
                                                    // Therapist: toggle popover instead of reacting directly
                                                    setActiveReactionPopover(isPopoverOpen ? null : emoji);
                                                } else {
                                                    // Parent: react directly as before
                                                    onReact(message.id, emoji);
                                                }
                                            }}
                                            title={isTherapistRole ? '' : tooltipText}
                                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all ${hasReacted
                                                ? 'bg-secondary-100 text-secondary-700 border border-secondary-200'
                                                : 'bg-white text-neutral-600 border border-neutral-100 hover:bg-neutral-50'
                                                } ${isTherapistRole ? 'cursor-pointer hover:ring-2 hover:ring-primary-200' : ''}`}
                                        >
                                            <span>{emoji}</span>
                                            <span>{userIds.length}</span>
                                            {isTherapistRole && parentNames.length > 0 && (
                                                <span className="text-[10px] text-primary-500 font-bold ml-0.5">({parentNames.length}P)</span>
                                            )}
                                        </button>

                                        {/* Therapist Reaction Popover */}
                                        {isTherapistRole && isPopoverOpen && (
                                            <div
                                                ref={popoverRef}
                                                className={`absolute z-50 bottom-full mb-2 ${isOwn ? 'right-0' : 'left-0'} w-56 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden animate-in zoom-in-95 fade-in duration-150`}
                                            >
                                                {/* Popover Header */}
                                                <div className="flex items-center justify-between px-3 py-2 bg-primary-50 border-b border-primary-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg leading-none">{emoji}</span>
                                                        <div>
                                                            <p className="text-xs font-black text-primary-700 uppercase tracking-widest leading-none">Reactions</p>
                                                            <p className="text-[10px] text-primary-500 font-medium">{userIds.length} total · {parentNames.length} parent{parentNames.length !== 1 ? 's' : ''}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setActiveReactionPopover(null)}
                                                        className="text-primary-400 hover:text-primary-700 transition-colors p-1 rounded-full hover:bg-primary-100"
                                                    >
                                                        <span className="text-xs font-bold">✕</span>
                                                    </button>
                                                </div>

                                                {/* Parent Reactors List */}
                                                <div className="max-h-40 overflow-y-auto">
                                                    {parentNames.length > 0 ? (
                                                        <div className="p-2 space-y-1">
                                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1 mb-1.5">Parents who reacted</p>
                                                            {parentReactors.map((parent, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors">
                                                                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                                                        <span className="text-[9px] font-black text-primary-700">
                                                                            {parent.name?.charAt(0)?.toUpperCase() || '?'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs font-medium text-neutral-700 truncate">{parent.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="px-3 py-4 text-center">
                                                            <p className="text-xs text-neutral-400">No parents have reacted with {emoji} yet</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* React / Unreact Action */}
                                                <div className="px-3 py-2 border-t border-neutral-100 bg-neutral-50">
                                                    <button
                                                        onClick={() => {
                                                            onReact(message.id, emoji);
                                                            setActiveReactionPopover(null);
                                                        }}
                                                        className={`w-full text-xs font-bold py-1.5 rounded-lg transition-colors ${hasReacted
                                                            ? 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                                            : 'bg-primary-600 text-white hover:bg-primary-700'
                                                            }`}
                                                    >
                                                        {hasReacted ? `Remove my ${emoji}` : `React with ${emoji}`}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Therapist-only: total unique parent engagement summary */}
                        {currentUserRole?.toLowerCase() === 'therapist' && (() => {
                            const allParentReactors = new Map();
                            Object.values(message.reactions).forEach(userIds => {
                                userIds.forEach(uid => {
                                    const member = members.find(m => m.id === uid);
                                    if (member?.role === 'parent') allParentReactors.set(uid, member.name);
                                });
                            });
                            const parentNames = Array.from(allParentReactors.values());
                            return parentNames.length > 0 ? (
                                <p className={`text-[10px] font-bold text-primary-500 mt-1 flex items-center gap-1 flex-wrap ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <Users className="h-3 w-3 shrink-0" />
                                    <span>
                                        {parentNames.length === 1
                                            ? `${parentNames[0]} reacted`
                                            : parentNames.length === 2
                                                ? `${parentNames[0]} & ${parentNames[1]} reacted`
                                                : `${parentNames.slice(0, 2).join(', ')} & ${parentNames.length - 2} more reacted`
                                        }
                                    </span>
                                </p>
                            ) : null;
                        })()}
                    </div>
                )}


                {/* Time */}
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-neutral-400">{time}</span>
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

                // Update if count changed OR reactions changed on any message
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

                    // Check if reactions changed on any existing message
                    const reactionsChanged = newMessages.some((msg, idx) => {
                        if (idx >= prev.length) return false;
                        return JSON.stringify(msg.reactions || {}) !== JSON.stringify(prev[idx].reactions || {});
                    });

                    if (reactionsChanged) {
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

        // Restriction check: Parents cannot post in the Support/Community channels
        const isParentInCommunity = currentUserRole === 'parent' &&
            (community?.name?.toLowerCase().includes('parent') ||
                community?.name?.toLowerCase().includes('support') ||
                community?.id === 'default');

        if (isParentInCommunity) {
            setError('Only therapists can broadcast messages in this community. You can react to messages below.');
            return;
        }

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

    const handleReact = async (messageId, emoji) => {
        try {
            const updatedMessage = await communityAPI.reactToMessage(communityId, messageId, emoji);
            setMessages(prev => prev.map(m => m.id === messageId ? updatedMessage : m));

            // Refresh members list since reacting may auto-join a parent
            try {
                const membersData = await communityAPI.getMembers(communityId);
                setMembers(membersData || []);
            } catch (_) { /* silently ignore member refresh failure */ }
        } catch (err) {
            console.error('Failed to react:', err);
        }
    };

    const handleDelete = async (messageId, mode = 'for_me') => {
        // Optimistic removal from local state IF deleting for everyone or if it's my own view
        setMessages(prev => prev.filter(m => m.id !== messageId));
        try {
            await communityAPI.deleteMessage(communityId, messageId, mode);
        } catch (err) {
            console.error('Failed to delete community message:', err);
            // Revert on error? Skipping for now for simplicity, but could reload
            loadCommunityData();
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
                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-4 w-4 text-primary-600" />
                                        )}
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
                                currentUserRole={currentUserRole}
                                members={members}
                                onReact={handleReact}
                                onDelete={handleDelete}
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

            {/* Input - Restricted for non-therapists in Community (Broadcast Only Mode) */}
            {currentUserRole?.toLowerCase() !== 'therapist' ? (
                <div className="p-8 border-t border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-neutral-100 animate-in slide-in-from-bottom-2 duration-500">
                        <div className="p-2 bg-secondary-100 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-secondary-600" />
                        </div>
                        <div>
                            <p className="text-base font-black text-neutral-800 tracking-tight">
                                Broadcast Update Channel
                            </p>
                            <p className="text-xs text-neutral-500 font-medium">
                                This channel is read-only for parents.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400 bg-neutral-100/50 px-4 py-2 rounded-full border border-neutral-200 shadow-sm">
                        <Smile className="h-4 w-4 text-secondary-500" />
                        <p className="text-[11px] font-bold uppercase tracking-wider">
                            You can interact by reacting to announcements!
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-4 border-t border-neutral-200 bg-white">
                    <div className="flex items-end gap-2 text-neutral-400">
                        <textarea
                            placeholder="Type a message..."
                            className="flex-1 p-3 bg-neutral-50 rounded-xl border-0 text-neutral-800 focus:ring-2 focus:ring-secondary-200 focus:outline-none resize-none"
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
            )}
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
