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
    Users,
    Lock,
    Smile,
    UserX,
    Trash
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';
import CommunityChat from '../../components/CommunityChat';
import { communityAPI } from '../../lib/api';

// ─── Common Emojis ────────────────────────────────────────────────────────────
const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

// Message Bubble Component
const MessageBubble = ({ message, isOwn, currentUserId, onDeleteForMe, onDeleteForEveryone, onReact }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const menuRef = useRef(null);
    const bubbleRef = useRef(null);

    const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const isDeletedForEveryone = message.is_deleted || message.is_deleted_for_everyone;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target) &&
                bubbleRef.current && !bubbleRef.current.contains(e.target)) {
                setShowMenu(false);
                setShowEmojiPicker(false);
            }
        };
        if (showMenu || showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu, showEmojiPicker]);

    const handleContextMenu = (e) => {
        e.preventDefault();
        setShowMenu(true);
        setShowEmojiPicker(false);
    };

    const handleReact = (emoji) => {
        onReact(message.id || message._id, emoji);
        setShowEmojiPicker(false);
    };

    const reactionEntries = Object.entries(message.reactions || {}).filter(([, ids]) => ids.length > 0);
    const myReactions = reactionEntries
        .filter(([, ids]) => ids.includes(currentUserId))
        .map(([emoji]) => emoji);

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}>
            <div className={`max-w-[78%] ${isOwn ? 'order-2' : 'order-1'}`}>

                {/* Sender tag */}
                <div className={`flex items-center gap-1.5 mb-1 ${isOwn ? 'justify-end mr-1' : 'ml-1'}`}>
                    {isOwn ? (
                        <>
                            <span className="text-[11px] font-semibold text-neutral-500">You</span>
                            <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                                {message.senderAvatar ? (
                                    <img src={message.senderAvatar} alt="Me" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-3 w-3 text-primary-600" />
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                                {message.senderAvatar ? (
                                    <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-3 w-3 text-primary-600" />
                                )}
                            </div>
                            <span className="text-[11px] font-semibold text-neutral-500">
                                {message.senderName}
                                {message.senderRole === 'parent' && (
                                    <span className="ml-1 text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">Parent</span>
                                )}
                            </span>
                        </>
                    )}
                </div>

                <div className="relative" ref={bubbleRef}>
                    <div
                        onContextMenu={handleContextMenu}
                        className={`rounded-2xl px-4 py-2.5 cursor-pointer select-text transition-all
                            ${isOwn
                                ? isDeletedForEveryone
                                    ? 'bg-secondary-100 text-neutral-400 rounded-br-md border border-secondary-200'
                                    : 'bg-secondary-600 text-white rounded-br-md shadow-md hover:bg-secondary-700'
                                : isDeletedForEveryone
                                    ? 'bg-neutral-50 text-neutral-400 rounded-bl-md border border-neutral-200'
                                    : 'bg-white text-neutral-800 rounded-bl-md shadow-sm border border-neutral-100 hover:bg-neutral-50'
                            }`}
                    >
                        {message.subject && !isDeletedForEveryone && (
                            <p className={`font-semibold text-sm mb-1 ${isOwn ? 'text-white' : 'text-neutral-800'}`}>
                                {message.subject}
                            </p>
                        )}
                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isDeletedForEveryone ? 'italic' : isOwn ? 'text-white' : 'text-neutral-700'
                            }`}>
                            {isDeletedForEveryone ? '🚫 This message was deleted' : message.content}
                        </p>
                    </div>

                    {/* Context menu */}
                    {showMenu && !isDeletedForEveryone && (
                        <div
                            ref={menuRef}
                            className={`absolute z-50 bottom-full mb-1 ${isOwn ? 'right-0' : 'left-0'} bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden min-w-[200px] animate-in zoom-in-95 duration-150`}
                        >
                            <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-100 bg-neutral-50">
                                {QUICK_EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => { handleReact(emoji); setShowMenu(false); }}
                                        className={`text-lg hover:scale-125 transition-transform p-0.5 rounded-full
                                            ${myReactions.includes(emoji) ? 'bg-secondary-100 ring-2 ring-secondary-300' : ''}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => { onDeleteForMe(message.id || message._id); setShowMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                                <UserX className="h-4 w-4 text-neutral-500" />
                                Delete for me
                            </button>
                            {isOwn && (
                                <button
                                    onClick={() => { onDeleteForEveryone(message.id || message._id); setShowMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-neutral-100"
                                >
                                    <Trash className="h-4 w-4 text-red-500" />
                                    Delete for everyone
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Reactions */}
                {reactionEntries.length > 0 && !isDeletedForEveryone && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {reactionEntries.map(([emoji, userIds]) => {
                            const iMine = userIds.includes(currentUserId);
                            return (
                                <button
                                    key={emoji}
                                    onClick={() => onReact(message.id || message._id, emoji)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all
                                        ${iMine
                                            ? 'bg-secondary-100 border-secondary-300 text-secondary-700'
                                            : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                                    title={`${userIds.length} reaction${userIds.length !== 1 ? 's' : ''}`}
                                >
                                    <span>{emoji}</span>
                                    <span>{userIds.length}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Time + read */}
                <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-neutral-400">{time}</span>
                    {isOwn && (
                        message.read
                            ? <CheckCheck className="h-3 w-3 text-secondary-500" />
                            : <Check className="h-3 w-3 text-neutral-400" />
                    )}
                </div>
            </div>

            {/* Emoji picker button on hover */}
            {!isDeletedForEveryone && (
                <div className={`self-end mb-5 opacity-0 group-hover:opacity-100 transition-opacity relative
                    ${isOwn ? 'order-1 mr-1' : 'order-2 ml-1'}`}>
                    <button
                        onClick={() => { setShowEmojiPicker(p => !p); setShowMenu(false); }}
                        className="p-1.5 rounded-full bg-white border border-neutral-200 shadow-sm hover:scale-110 transition-transform"
                        title="React"
                    >
                        <Smile className="h-4 w-4 text-neutral-400" />
                    </button>
                    {showEmojiPicker && (
                        <div className={`absolute z-50 bottom-full mb-1 ${isOwn ? 'right-0' : 'left-0'}
                            bg-white border border-neutral-200 rounded-full shadow-xl px-2 py-1.5 flex gap-1 animate-in zoom-in-95 duration-150`}>
                            {QUICK_EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReact(emoji)}
                                    className={`text-lg hover:scale-125 transition-transform p-0.5 rounded-full
                                        ${myReactions.includes(emoji) ? 'bg-secondary-100 ring-2 ring-secondary-300' : ''}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Parent Thread Item
const ParentThreadItem = ({ thread, isActive, onClick, myIds = [] }) => {
    const latestMessage = thread.messages[thread.messages.length - 1];
    const isOwn = myIds.includes(latestMessage.senderId);
    const unreadCount = thread.messages.filter(m => myIds.includes(m.recipientId) && !m.read).length;

    return (
        <div
            className={`p-4 cursor-pointer transition-colors ${isActive
                ? 'bg-secondary-50 border-l-4 border-l-secondary-500'
                : 'hover:bg-neutral-50 border-l-4 border-l-transparent'
                }`}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                {/* Participant Avatar */}
                <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden bg-primary-50">
                    {thread.parentAvatar ? (
                        <img src={thread.parentAvatar} alt={thread.parentName} className="w-full h-full object-cover" />
                    ) : thread.childPhoto ? (
                        <img src={thread.childPhoto} alt={thread.childName} className="w-full h-full object-cover" />
                    ) : (
                        <User className="h-5 w-5 text-primary-400" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-neutral-800 truncate">
                            {thread.parentName} (Parent)
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
    const {
        currentUser,
        kids,
        users,
        messages: allMessages,
        sendMessage,
        markMessageRead,
        deleteMessageForMe,
        deleteMessageForEveryone,
        reactToPrivateMessage,
        communityUnreadCount,
        setCommunityUnreadCount
    } = useApp();
    const [activeThread, setActiveThread] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' or 'community'
    const [defaultCommunity, setDefaultCommunity] = useState(null);
    const [loadingCommunity, setLoadingCommunity] = useState(false);
    const messagesEndRef = useRef(null);
    const therapistId = currentUser?.id || 't1';
    // Identify all IDs associated with the current user (real and mock)
    const myIds = useMemo(() => {
        const ids = [therapistId];
        const me = users?.find(u => u.email?.toLowerCase() === currentUser?.email?.toLowerCase());
        if (me?.id) ids.push(me.id);
        if (me?.mockId) ids.push(me.mockId);
        return [...new Set(ids)];
    }, [therapistId, users, currentUser]);

    // Track community unread count
    useEffect(() => {
        if (activeTab === 'community' && defaultCommunity) {
            setCommunityUnreadCount(0);
            localStorage.setItem(`last_seen_community_${defaultCommunity.id}`, Date.now().toString());
        }
    }, [activeTab, defaultCommunity, setCommunityUnreadCount]);

    // Load default community
    useEffect(() => {
        const loadCommunity = async () => {
            try {
                setLoadingCommunity(true);
                const communities = await communityAPI.getAll();
                if (communities && communities.length > 0) {
                    setDefaultCommunity(communities[0]);
                }
            } catch (error) {
                console.error('Failed to load community:', error);
            } finally {
                setLoadingCommunity(false);
            }
        };

        if (activeTab === 'community') {
            loadCommunity();
        }
    }, [activeTab]);

    // Get all children assigned to this therapist
    const safeKids = Array.isArray(kids) ? kids : [];
    const myPatients = safeKids.filter(k => k && k.therapistId === therapistId);
    const myPatientIds = myPatients.map(p => p.id);

    // Group messages into threads by child
    const threads = useMemo(() => {
        const threadMap = {};
        const safeMessages = Array.isArray(allMessages) ? allMessages : [];

        safeMessages
            .filter(m =>
                m &&
                // Allow messages if I am a participant, regardless of patient list strictness
                (myIds.includes(m.senderId) || myIds.includes(m.recipientId) || myIds.includes(m.recipient_id)) &&
                m.type !== 'weekly-summary'
            )
            .forEach(message => {
                // Fix: Group by childId instead of threadId to prevent "double double" chat lists
                const groupKey = message.childId;
                if (groupKey && !threadMap[groupKey]) {
                    const child = safeKids.find(k => k && k.id === groupKey);
                    const parent = (Array.isArray(users) ? users : []).find(u => u && (u.id === (child?.parentId || message.senderId)));

                    threadMap[groupKey] = {
                        id: groupKey,
                        messages: [],
                        childId: groupKey,
                        childName: child?.name || 'Assigned Child',
                        childPhoto: child?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child?.name || 'Child'}`,
                        parentId: parent?.id || message.senderId,
                        parentName: parent?.name || (message.senderRole === 'parent' ? message.senderName : 'Family Member'),
                        parentAvatar: parent?.avatar || (message.senderRole === 'parent' ? message.senderAvatar : null)
                    };
                }
                if (groupKey) threadMap[groupKey].messages.push(message);
            });

        // Sort messages within each thread by timestamp
        Object.values(threadMap).forEach(thread => {
            if (Array.isArray(thread.messages)) {
                thread.messages.sort((a, b) => {
                    const timeA = a && a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b && b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return timeA - timeB;
                });
            }
        });

        // Sort threads by latest message
        return Object.values(threadMap).filter(t => t.messages.length > 0).sort((a, b) => {
            const latestA = a.messages[a.messages.length - 1];
            const latestB = b.messages[b.messages.length - 1];
            const timeA = latestA && latestA.timestamp ? new Date(latestA.timestamp).getTime() : 0;
            const timeB = latestB && latestB.timestamp ? new Date(latestB.timestamp).getTime() : 0;
            return timeB - timeA;
        });
    }, [allMessages, therapistId, safeKids, users]);

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
                if (myIds.includes(m.recipientId) && !m.read) {
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
                        {activeTab === 'conversations' ? 'Communication with parents' : 'Parent support community'}
                        {activeTab === 'conversations' && totalUnread > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium">
                                {totalUnread} unread
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('conversations')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'conversations'
                        ? 'bg-secondary-600 text-white shadow-md'
                        : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Parent Conversations</span>
                        {totalUnread > 0 && activeTab !== 'conversations' && (
                            <span className="px-1.5 py-0.5 bg-secondary-500 text-white rounded-full text-xs">
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
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Parent Community</span>
                        {communityUnreadCount > 0 && activeTab !== 'community' && (
                            <span className="px-1.5 py-0.5 bg-secondary-500 text-white rounded-full text-xs">
                                {communityUnreadCount}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {/* Main Content */}
            {activeTab === 'conversations' ? (
                <div className="flex-1 flex bg-white rounded-xl border border-neutral-200 overflow-hidden">{/* Thread List */}
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
                                        myIds={myIds}
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
                                    <div className="h-10 w-10 rounded-full border border-neutral-100 overflow-hidden bg-primary-50">
                                        {currentThread.parentAvatar ? (
                                            <img src={currentThread.parentAvatar} alt={currentThread.parentName} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={currentThread.childPhoto} alt={currentThread.childName} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-800">{currentThread.parentName} (Parent)</p>
                                        <p className="text-xs text-neutral-500">
                                            Parent of {currentThread.childName}
                                        </p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                    {currentThread.messages.map(message => {
                                        const isOwn = myIds.includes(message.senderId);

                                        // Robust Sender Lookup
                                        let sender = isOwn ? currentUser : users?.find(u => u.id === message.senderId || u.mockId === message.senderId);

                                        // Fallback by name if ID lookup fails
                                        if (!sender && !isOwn && message.senderName) {
                                            sender = users?.find(u => u.name?.toLowerCase() === message.senderName.toLowerCase());
                                        }

                                        const messageWithAvatar = {
                                            ...message,
                                            senderAvatar: sender?.avatar ||
                                                message.senderAvatar ||
                                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName || 'User'}`
                                        };
                                        return (
                                            <MessageBubble
                                                key={messageWithAvatar.id}
                                                message={messageWithAvatar}
                                                isOwn={isOwn}
                                                currentUserId={therapistId}
                                                onDeleteForMe={deleteMessageForMe}
                                                onDeleteForEveryone={deleteMessageForEveryone}
                                                onReact={reactToPrivateMessage}
                                            />
                                        );
                                    })}
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
            ) : (
                /* Community View */
                <div className="flex-1 flex bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    {defaultCommunity ? (
                        <CommunityChat
                            communityId={defaultCommunity.id}
                            currentUserId={therapistId}
                            currentUserName={currentUser?.name || 'Therapist'}
                            currentUserRole="therapist"
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
                                <p className="text-neutral-400 text-sm">Community will be created automatically</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default TherapistMessages;
