// ============================================================
// NeuroBridge™ - Therapist Messages Module
// Therapist Console - Communication with Parents
// ============================================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Search,
    User,
    CheckCheck,
    Check,
    ArrowLeft,
    Paperclip,
    Users
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

// Message Bubble Component
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
                            <User className="h-3 w-3 text-primary-600" />
                        </div>
                        <span className="text-xs font-medium text-neutral-600">{message.senderName}</span>
                    </div>
                )}

                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${isOwn
                    ? 'bg-secondary-600 text-white rounded-br-md'
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
                            ? <CheckCheck className="h-3 w-3 text-secondary-500" />
                            : <Check className="h-3 w-3 text-neutral-400" />
                    )}
                </div>
            </div>
        </div>
    );
};

// Parent Thread Item
const ParentThreadItem = ({ thread, isActive, onClick, currentUserId }) => {
    const latestMessage = thread.messages[thread.messages.length - 1];
    const isOwn = latestMessage.senderId === currentUserId;
    const unreadCount = thread.messages.filter(m => m.recipientId === currentUserId && !m.read).length;

    return (
        <div
            className={`p-4 cursor-pointer transition-colors ${isActive
                ? 'bg-secondary-50 border-l-4 border-l-secondary-500'
                : 'hover:bg-neutral-50 border-l-4 border-l-transparent'
                }`}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                {/* Child Avatar */}
                <img
                    src={thread.childPhoto}
                    alt={thread.childName}
                    className="h-10 w-10 rounded-full object-cover"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-neutral-800 truncate">
                            {thread.parentName}
                        </span>
                        <span className="text-xs text-neutral-400 flex-shrink-0">
                            {new Date(latestMessage.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-xs text-secondary-600 font-medium mb-1">
                        Re: {thread.childName}
                    </p>
                    <p className="text-sm text-neutral-500 truncate">
                        {isOwn ? 'You: ' : ''}{latestMessage.content.substring(0, 40)}...
                    </p>
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <div className="h-5 w-5 rounded-full bg-secondary-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                        {unreadCount}
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Therapist Messages Component
const TherapistMessages = () => {
    const { currentUser, kids, users, messages: allMessages, sendMessage, markMessageRead } = useApp();
    const [activeThread, setActiveThread] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    const therapistId = currentUser?.id || 't1';

    // Get all children assigned to this therapist
    const myPatients = kids.filter(k => k.therapistId === therapistId);
    const myPatientIds = myPatients.map(p => p.id);

    // Group messages into threads by child
    const threads = useMemo(() => {
        const threadMap = {};

        allMessages
            .filter(m =>
                myPatientIds.includes(m.childId) &&
                (m.senderId === therapistId || m.recipientId === therapistId) &&
                m.type !== 'weekly-summary' // Exclude AI summaries
            )
            .forEach(message => {
                const threadId = message.threadId;
                if (!threadMap[threadId]) {
                    const child = kids.find(k => k.id === message.childId);
                    const parent = users.find(u => u.id === child?.parentId);

                    threadMap[threadId] = {
                        id: threadId,
                        messages: [],
                        childId: message.childId,
                        childName: child?.name || 'Unknown Child',
                        childPhoto: child?.photoUrl,
                        parentId: parent?.id,
                        parentName: parent?.name || 'Unknown Parent'
                    };
                }
                threadMap[threadId].messages.push(message);
            });

        // Sort messages within each thread by timestamp
        Object.values(threadMap).forEach(thread => {
            thread.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });

        // Sort threads by latest message
        return Object.values(threadMap).sort((a, b) =>
            new Date(b.messages[b.messages.length - 1].timestamp) -
            new Date(a.messages[a.messages.length - 1].timestamp)
        );
    }, [allMessages, myPatientIds, therapistId, kids, users]);

    // Filter threads by search
    const filteredThreads = useMemo(() => {
        if (!searchQuery) return threads;
        const query = searchQuery.toLowerCase();
        return threads.filter(thread =>
            thread.parentName.toLowerCase().includes(query) ||
            thread.childName.toLowerCase().includes(query) ||
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
                if (m.recipientId === therapistId && !m.read) {
                    markMessageRead(m.id);
                }
            });
        }
    }, [currentThread, therapistId, markMessageRead]);

    const handleSend = () => {
        if (!newMessage.trim() || !currentThread) return;

        sendMessage({
            threadId: currentThread.id,
            senderId: therapistId,
            senderName: currentUser?.name || 'Therapist',
            senderRole: 'therapist',
            recipientId: currentThread.parentId,
            childId: currentThread.childId,
            content: newMessage.trim()
        });

        setNewMessage('');
    };

    const totalUnread = threads.reduce((acc, thread) =>
        acc + thread.messages.filter(m => m.recipientId === therapistId && !m.read).length, 0
    );

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Messages</h2>
                    <p className="text-neutral-500">
                        Communication with parents
                        {totalUnread > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium">
                                {totalUnread} unread
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex bg-white rounded-xl border border-neutral-200 overflow-hidden">
                {/* Thread List */}
                <div className={`w-full md:w-80 border-r border-neutral-200 flex flex-col ${activeThread ? 'hidden md:flex' : 'flex'}`}>
                    {/* Search */}
                    <div className="p-3 border-b border-neutral-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-secondary-200 focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Thread List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredThreads.length > 0 ? (
                            filteredThreads.map(thread => (
                                <ParentThreadItem
                                    key={thread.id}
                                    thread={thread}
                                    isActive={activeThread === thread.id}
                                    onClick={() => setActiveThread(thread.id)}
                                    currentUserId={therapistId}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center text-neutral-400">
                                <Users className="h-10 w-10 mx-auto mb-2" />
                                <p>No parent conversations yet</p>
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
                                <img
                                    src={currentThread.childPhoto}
                                    alt={currentThread.childName}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-medium text-neutral-800">{currentThread.parentName}</p>
                                    <p className="text-xs text-neutral-500">
                                        Parent of {currentThread.childName}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {currentThread.messages.map(message => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        isOwn={message.senderId === therapistId}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="flex-1 p-3 bg-neutral-50 rounded-full border-0 focus:ring-2 focus:ring-secondary-200 focus:outline-none"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <Button
                                        variant="secondary"
                                        className="rounded-full px-4"
                                        onClick={handleSend}
                                        disabled={!newMessage.trim()}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-neutral-400">
                            <div className="text-center">
                                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-neutral-200" />
                                <p className="text-lg font-medium text-neutral-500">Select a conversation</p>
                                <p className="text-sm">Choose a parent from the list</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TherapistMessages;
