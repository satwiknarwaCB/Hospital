// ============================================================
// NeuroBridge™ - Messages & Communication Module
// Parent Portal - Secure Messaging with Therapists
// ============================================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Search,
    Sparkles,
    User,
    Clock,
    CheckCheck,
    Check,
    ArrowLeft,
    Paperclip,
    Smile,
    Users,
    Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';
import CommunityChat from '../../components/CommunityChat';
import { communityAPI } from '../../lib/api';

// ... (MessageBubble and ThreadItem components remain the same)
const MessageBubble = ({ message, isOwn }) => {
    const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {/* Sender Info */}
                {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                            {message.senderRole === 'system' ? (
                                <Sparkles className="h-3 w-3 text-primary-600" />
                            ) : (
                                <User className="h-3 w-3 text-primary-600" />
                            )}
                        </div>
                        <span className="text-xs font-medium text-neutral-600">
                            {message.senderName} ({message.senderRole === 'therapist' ? 'Therapist' : 'Parent'})
                        </span>
                    </div>
                )}

                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${isOwn
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : message.type === 'weekly-summary'
                        ? 'bg-gradient-to-r from-violet-100 to-purple-100 text-neutral-800 rounded-bl-md'
                        : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
                    }`}>
                    {message.subject && (
                        <p className={`font-semibold mb-2 ${isOwn ? 'text-white' : 'text-neutral-800'}`}>
                            {message.subject}
                        </p>
                    )}
                    <p className={`text-sm whitespace-pre-wrap ${isOwn ? 'text-white' : 'text-neutral-700'}`}>
                        {message.content}
                    </p>
                </div>

                {/* Time & Status */}
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-neutral-400">{time}</span>
                    {isOwn && (
                        message.read
                            ? <CheckCheck className="h-3 w-3 text-primary-500" />
                            : <Check className="h-3 w-3 text-neutral-400" />
                    )}
                </div>
            </div>
        </div>
    );
};

const ThreadItem = ({ thread, isActive, onClick, currentUserId }) => {
    const latestMessage = thread.messages[0];
    const isOwn = latestMessage.senderId === currentUserId;
    const unreadCount = thread.messages.filter(m => m.recipientId === currentUserId && !m.read).length;

    return (
        <div
            className={`p-4 cursor-pointer transition-colors ${isActive ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-neutral-50 border-l-4 border-l-transparent'
                }`}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${thread.type === 'weekly-summary' ? 'bg-violet-100' : 'bg-primary-100'
                    }`}>
                    {thread.type === 'weekly-summary' ? (
                        <Sparkles className="h-5 w-5 text-violet-600" />
                    ) : (
                        <User className="h-5 w-5 text-primary-600" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-neutral-800 truncate">
                            {thread.participantName} {thread.type !== 'weekly-summary' && `(${thread.participantRole === 'therapist' ? 'Therapist' : 'Parent'})`}
                        </span>
                        <span className="text-xs text-neutral-400 flex-shrink-0">
                            {new Date(latestMessage.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-sm text-neutral-500 truncate">
                        {isOwn ? 'You: ' : ''}{latestMessage.content.substring(0, 50)}...
                    </p>
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <div className="h-5 w-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                        {unreadCount}
                    </div>
                )}
            </div>
        </div>
    );
};

const Messages = () => {
    const {
        currentUser,
        kids,
        users,
        messages: allMessages,
        sendMessage,
        markMessageRead,
        communityUnreadCount,
        setCommunityUnreadCount
    } = useApp();
    const [activeThread, setActiveThread] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('private'); // 'private' or 'community'
    const [defaultCommunity, setDefaultCommunity] = useState(null);
    const messagesEndRef = useRef(null);

    // Get current child
    const child = kids.find(k => k.id === currentUser?.childId);
    const childId = child?.id || 'c1';
    const userId = currentUser?.id || 'p1';

    const [loadingCommunity, setLoadingCommunity] = useState(false);

    // Track community unread count
    useEffect(() => {
        if (activeTab === 'community' && defaultCommunity) {
            setCommunityUnreadCount(0);
            localStorage.setItem(`last_seen_community_${defaultCommunity.id}`, Date.now().toString());
        }
    }, [activeTab, defaultCommunity]);

    // Load default community
    useEffect(() => {
        const loadCommunity = async () => {
            try {
                setLoadingCommunity(true);
                const community = await communityAPI.getDefault();
                setDefaultCommunity(community);
            } catch (error) {
                console.error('Failed to load community:', error);
            } finally {
                setLoadingCommunity(false);
            }
        };

        if (activeTab === 'community' && !defaultCommunity) {
            loadCommunity();
        }
    }, [activeTab, defaultCommunity]);

    // Group messages into threads
    const threads = useMemo(() => {
        const threadMap = {};

        allMessages
            .filter(m => m.childId === childId && (m.senderId === userId || m.recipientId === userId))
            .forEach(message => {
                // Group by childId to prevent "double double" conversations for the same context
                const groupKey = message.childId || 'c1';
                if (!threadMap[groupKey]) {
                    // Determine the other participant
                    const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
                    const otherUser = users?.find(u => u.id === otherUserId);

                    threadMap[groupKey] = {
                        id: groupKey,
                        messages: [],
                        type: message.type,
                        participantName: otherUser ? otherUser.name :
                            (message.type === 'weekly-summary' ? 'NeuroBridge AI' : 'Dr. Rajesh Kumar'),
                        participantRole: otherUser ? otherUser.role : (message.senderId === userId ? message.recipientRole : message.senderRole)
                    };
                }
                threadMap[groupKey].messages.push(message);
            });

        // Sort messages within each thread
        Object.values(threadMap).forEach(thread => {
            thread.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });

        // Sort threads by latest message
        return Object.values(threadMap).sort((a, b) =>
            new Date(b.messages[b.messages.length - 1].timestamp) -
            new Date(a.messages[a.messages.length - 1].timestamp)
        );
    }, [allMessages, childId, userId, users]);

    // Filter threads by search
    const filteredThreads = useMemo(() => {
        if (!searchQuery) return threads;
        const query = searchQuery.toLowerCase();
        return threads.filter(thread =>
            thread.participantName.toLowerCase().includes(query) ||
            thread.messages.some(m => m.content.toLowerCase().includes(query))
        );
    }, [threads, searchQuery]);

    // Get current thread
    const currentThread = threads.find(t => t.id === activeThread);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentThread?.messages]);

    // Mark messages as read when viewing thread
    useEffect(() => {
        if (currentThread) {
            currentThread.messages.forEach(m => {
                if (m.recipientId === userId && !m.read) {
                    markMessageRead(m.id);
                }
            });
        }
    }, [currentThread, userId, markMessageRead]);

    const handleSend = () => {
        if (!newMessage.trim() || !currentThread) return;

        const recipientId = currentThread.messages.find(m => m.senderId !== userId)?.senderId;

        sendMessage({
            threadId: currentThread.id,
            senderId: userId,
            senderName: currentUser?.name || 'Parent',
            senderRole: 'parent',
            recipientId: recipientId || 't1',
            childId: childId,
            content: newMessage.trim()
        });

        setNewMessage('');
    };

    const totalUnread = threads.reduce((acc, thread) =>
        acc + thread.messages.filter(m => m.recipientId === userId && !m.read).length, 0
    );

    if (!child) {
        return <div className="p-8 text-center text-neutral-500">No child profile found.</div>;
    }

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-neutral-800">Messages</h2>
                    <p className="text-neutral-500 text-sm">
                        Communicate with {child.name}'s therapy team and community
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('private')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'private'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                            }`}
                    >
                        <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="h-4 w-4" />
                            <span>Private Messages</span>
                            {totalUnread > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'private' ? 'bg-white text-primary-600' : 'bg-primary-500 text-white'}`}>
                                    {totalUnread}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('community')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'community'
                            ? 'bg-secondary-600 text-white shadow-md'
                            : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                            }`}
                    >
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4" />
                            <span>Parent Community</span>
                            {communityUnreadCount > 0 && activeTab !== 'community' && (
                                <span className="bg-secondary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {communityUnreadCount}
                                </span>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {activeTab === 'private' ? (
                <div className="flex-1 flex bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    {/* Thread List */}
                    <div className={`w-full md:w-80 border-r border-neutral-200 flex flex-col ${activeThread ? 'hidden md:flex' : 'flex'}`}>
                        {/* Search */}
                        <div className="p-3 border-b border-neutral-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Thread List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredThreads.length > 0 ? (
                                filteredThreads.map(thread => (
                                    <ThreadItem
                                        key={thread.id}
                                        thread={thread}
                                        isActive={activeThread === thread.id}
                                        onClick={() => setActiveThread(thread.id)}
                                        currentUserId={userId}
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center text-neutral-400">
                                    <MessageSquare className="h-10 w-10 mx-auto mb-2" />
                                    <p>No conversations yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat View */}
                    <div className={`flex-1 flex flex-col ${activeThread ? 'flex' : 'hidden md:flex'}`}>
                        {currentThread ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
                                    <button
                                        className="md:hidden text-neutral-400 hover:text-neutral-600"
                                        onClick={() => setActiveThread(null)}
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentThread.type === 'weekly-summary' ? 'bg-violet-100' : 'bg-primary-100'
                                        }`}>
                                        {currentThread.type === 'weekly-summary' ? (
                                            <Sparkles className="h-5 w-5 text-violet-600" />
                                        ) : (
                                            <User className="h-5 w-5 text-primary-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-800">{currentThread.participantName}</p>
                                        <p className="text-xs text-neutral-500">
                                            {currentThread.type === 'weekly-summary' ? 'Automated Updates' : 'Therapist'}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    {currentThread.messages.map(message => (
                                        <MessageBubble
                                            key={message.id}
                                            message={message}
                                            isOwn={message.senderId === userId}
                                        />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                {currentThread.type !== 'weekly-summary' && (
                                    <div className="p-4 border-t border-neutral-200">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                                                <Paperclip className="h-5 w-5" />
                                            </button>
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="flex-1 p-3 bg-neutral-50 rounded-full border-0 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            />
                                            <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                                                <Smile className="h-5 w-5" />
                                            </button>
                                            <Button
                                                className="rounded-full px-4"
                                                onClick={handleSend}
                                                disabled={!newMessage.trim()}
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-neutral-400">
                                <div className="text-center">
                                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-neutral-200" />
                                    <p className="text-lg font-medium text-neutral-500">Select a conversation</p>
                                    <p className="text-sm">Choose from your messages on the left</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Community View */
                <div className="flex-1 flex bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    {defaultCommunity ? (
                        <CommunityChat
                            communityId={defaultCommunity.id}
                            currentUserId={userId}
                            currentUserName={currentUser?.name || 'Parent'}
                            currentUserRole="parent"
                        />
                    ) : loadingCommunity ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Users className="h-12 w-12 text-neutral-300 mx-auto mb-3 animate-pulse" />
                                <p className="text-neutral-500">Loading community...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Users className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                                <p className="text-neutral-500 font-medium mb-2">No community available</p>
                                <p className="text-neutral-400 text-sm">Please contact support or your therapist</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default Messages;
