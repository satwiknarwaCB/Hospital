// ============================================================
// NeuroBridge™ - Messages & Communication Module
// Parent Portal - Secure Messaging with Therapists
// ============================================================

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
    Lock,
    Trash2,
    UserX,
    Trash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';
import CommunityChat from '../../components/CommunityChat';
import { communityAPI } from '../../lib/api';

// ─── Common Emojis for Quick Reaction ────────────────────────────────────────
const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

// ─── MessageBubble ────────────────────────────────────────────────────────────
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

    // Close menus when clicking outside
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

    // Group reactions for display
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
                                {message.senderRole === 'system' ? (
                                    <Sparkles className="h-3 w-3 text-primary-600" />
                                ) : message.senderAvatar ? (
                                    <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-3 w-3 text-primary-600" />
                                )}
                            </div>
                            <span className="text-[11px] font-semibold text-neutral-500">
                                {message.senderName}
                                {message.senderRole === 'therapist' && (
                                    <span className="ml-1 text-[10px] bg-secondary-100 text-secondary-700 px-1.5 py-0.5 rounded-full">Therapist</span>
                                )}
                            </span>
                        </>
                    )}
                </div>

                {/* Bubble + context menu wrapper */}
                <div className="relative" ref={bubbleRef}>
                    {/* Message Bubble */}
                    <div
                        onContextMenu={handleContextMenu}
                        className={`rounded-2xl px-4 py-2.5 cursor-pointer select-text transition-all
                            ${isOwn
                                ? isDeletedForEveryone
                                    ? 'bg-primary-100 text-neutral-400 rounded-br-md border border-primary-200'
                                    : 'bg-primary-600 text-white rounded-br-md shadow-md hover:bg-primary-700'
                                : isDeletedForEveryone
                                    ? 'bg-neutral-50 text-neutral-400 rounded-bl-md border border-neutral-200'
                                    : message.type === 'weekly-summary'
                                        ? 'bg-gradient-to-r from-violet-100 to-purple-100 text-neutral-800 rounded-bl-md shadow-sm'
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

                    {/* Context menu (right-click / long-press) */}
                    {showMenu && !isDeletedForEveryone && (
                        <div
                            ref={menuRef}
                            className={`absolute z-50 bottom-full mb-1 ${isOwn ? 'right-0' : 'left-0'} bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden min-w-[200px] animate-in zoom-in-95 duration-150`}
                        >
                            {/* Quick Emoji Row */}
                            <div className="flex items-center gap-1 px-3 py-2 border-b border-neutral-100 bg-neutral-50">
                                {QUICK_EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => { handleReact(emoji); setShowMenu(false); }}
                                        className={`text-lg hover:scale-125 transition-transform p-0.5 rounded-full
                                            ${myReactions.includes(emoji) ? 'bg-primary-100 ring-2 ring-primary-300' : ''}`}
                                        title={emoji}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>

                            {/* Delete for Me */}
                            <button
                                onClick={() => { onDeleteForMe(message.id || message._id); setShowMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                                <UserX className="h-4 w-4 text-neutral-500" />
                                Delete for me
                            </button>

                            {/* Delete for Everyone — sender only */}
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

                {/* Reactions Display */}
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
                                            ? 'bg-primary-100 border-primary-300 text-primary-700'
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

                {/* Time + Read receipt */}
                <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-neutral-400">{time}</span>
                    {isOwn && (
                        message.read
                            ? <CheckCheck className="h-3 w-3 text-primary-500" />
                            : <Check className="h-3 w-3 text-neutral-400" />
                    )}
                </div>
            </div>

            {/* Emoji picker button — always visible on hover for non-deleted messages */}
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
                                        ${myReactions.includes(emoji) ? 'bg-primary-100 ring-2 ring-primary-300' : ''}`}
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

// ─── ThreadItem ───────────────────────────────────────────────────────────────
const ThreadItem = ({ thread, isActive, onClick, myIds = [] }) => {
    const latestMessage = thread.messages[thread.messages.length - 1];
    const isOwn = myIds.includes(latestMessage.senderId);
    const unreadCount = thread.messages.filter(m => myIds.includes(m.recipientId) && !m.read).length;

    return (
        <div
            className={`p-4 cursor-pointer transition-colors ${isActive
                ? 'bg-primary-50 border-l-4 border-l-primary-500'
                : 'hover:bg-neutral-50 border-l-4 border-l-transparent'}`}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${thread.type === 'weekly-summary' ? 'bg-violet-100' : 'bg-primary-100'}`}>
                    {thread.type === 'weekly-summary' ? (
                        <Sparkles className="h-5 w-5 text-violet-600" />
                    ) : thread.participantAvatar ? (
                        <img src={thread.participantAvatar} alt={thread.participantName} className="w-full h-full object-cover" />
                    ) : (
                        <User className="h-5 w-5 text-primary-600" />
                    )}
                </div>
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
                        {latestMessage.is_deleted || latestMessage.is_deleted_for_everyone
                            ? '🚫 Message deleted'
                            : `${isOwn ? 'You: ' : ''}${latestMessage.content.substring(0, 50)}...`}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <div className="h-5 w-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                        {unreadCount}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Messages Page ─────────────────────────────────────────────────────────
const Messages = () => {
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
    const [activeTab, setActiveTab] = useState('private'); // 'private' or 'community'
    const [defaultCommunity, setDefaultCommunity] = useState(null);
    const messagesEndRef = useRef(null);

    // Get current child
    const child = kids.find(k => k.id === currentUser?.childId);
    const childId = child?.id || 'c1';
    const userId = currentUser?.id || 'p1';

    // Identify all IDs associated with the current user (real and mock)
    const myIds = useMemo(() => {
        const ids = [userId];
        const me = users?.find(u => u.email?.toLowerCase() === currentUser?.email?.toLowerCase());
        if (me?.id) ids.push(me.id);
        if (me?.mockId) ids.push(me.mockId);
        return [...new Set(ids)];
    }, [userId, users, currentUser]);

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
            .filter(m => m.childId === childId && (myIds.includes(m.senderId) || myIds.includes(m.recipientId)))
            .forEach(message => {
                const groupKey = message.childId || 'c1';
                if (!threadMap[groupKey]) {
                    const isMessageFromMe = myIds.includes(message.senderId);
                    const otherUserId = isMessageFromMe ? message.recipientId : message.senderId;

                    // Priority Lookup: 
                    // 1. Try to find the user in the merged global list (includes mock & real data)
                    // 2. If it's a therapist and we're in the parent portal, cross-check with the child's assigned therapist
                    let otherUser = users?.find(u => u.id === otherUserId || u.mockId === otherUserId);

                    // Fallback search by name if ID search fails (common for mock data consistency)
                    if (!otherUser && message.senderName && !isMessageFromMe) {
                        otherUser = users?.find(u => u.name?.toLowerCase() === message.senderName.toLowerCase());
                    }

                    // Special resolution for assigned therapists to ensure their real portal photo is used
                    const assignedTherapistId = child?.therapistId || child?.therapist_id;
                    const isAssignedTherapist = otherUserId === assignedTherapistId ||
                        (assignedTherapistId && otherUser && (otherUser.id === assignedTherapistId || otherUser.mockId === assignedTherapistId));

                    const participantAvatar = otherUser?.avatar ||
                        (assignedTherapistId ? users?.find(u => u.id === assignedTherapistId || u.mockId === assignedTherapistId)?.avatar : null) ||
                        message.senderAvatar ||
                        (message.type === 'weekly-summary' ? null : `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName || 'User'}`);

                    threadMap[groupKey] = {
                        id: groupKey,
                        messages: [],
                        type: message.type,
                        participantName: otherUser ? otherUser.name :
                            (message.type === 'weekly-summary' ? 'NeuroBridge AI' : (message.senderName || 'Therapist')),
                        participantAvatar,
                        participantRole: otherUser ? otherUser.role : (isMessageFromMe ? message.recipientRole : message.senderRole)
                    };
                }
                threadMap[groupKey].messages.push(message);
            });

        Object.values(threadMap).forEach(thread => {
            thread.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });

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
                                        myIds={myIds}
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
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden ${currentThread.type === 'weekly-summary' ? 'bg-violet-100' : 'bg-primary-100'}`}>
                                        {currentThread.type === 'weekly-summary' ? (
                                            <Sparkles className="h-5 w-5 text-violet-600" />
                                        ) : currentThread.participantAvatar ? (
                                            <img src={currentThread.participantAvatar} alt={currentThread.participantName} className="w-full h-full object-cover" />
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
                                    <div className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                        <Lock className="h-3 w-3" />
                                        <span>End-to-end encrypted</span>
                                    </div>
                                </div>

                                {/* Tip bar */}
                                <div className="px-4 py-1.5 bg-neutral-50 border-b border-neutral-100">
                                    <p className="text-[10px] text-neutral-400 text-center">
                                        💡 Right-click or long-press any message to react or delete &nbsp;·&nbsp; Hover a message for the emoji button
                                    </p>
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
                                                ((message.senderId === (child?.therapistId || child?.therapist_id) ||
                                                    (sender && (sender.id === (child?.therapistId || child?.therapist_id) || sender.mockId === (child?.therapistId || child?.therapist_id))))
                                                    ? users?.find(u => u.id === (child?.therapistId || child?.therapist_id) || u.mockId === (child?.therapistId || child?.therapist_id))?.avatar : null) ||
                                                message.senderAvatar ||
                                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName || 'User'}`
                                        };
                                        return (
                                            <MessageBubble
                                                key={messageWithAvatar.id}
                                                message={messageWithAvatar}
                                                isOwn={isOwn}
                                                currentUserId={userId}
                                                onDeleteForMe={deleteMessageForMe}
                                                onDeleteForEveryone={deleteMessageForEveryone}
                                                onReact={reactToPrivateMessage}
                                            />
                                        );
                                    })}
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
