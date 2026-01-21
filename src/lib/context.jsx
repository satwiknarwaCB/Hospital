// ============================================================
// NeuroBridge™ - Application Context & State Management
// Production-Ready Global State Provider
// ============================================================

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    USERS,
    CHILDREN,
    SESSIONS,
    SKILL_SCORES,
    ROADMAP,
    HOME_ACTIVITIES,
    MESSAGES,
    CONSENT_RECORDS,
    AUDIT_LOGS,
    CDC_METRICS,
    SKILL_PROGRESS
} from '../data/mockData';
import { sessionAPI, communityAPI, messagesAPI } from './api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // ============ Core State ============
    const [users] = useState(USERS);
    const [kids, setKids] = useState(CHILDREN);
    const [sessions, setSessions] = useState(SESSIONS);
    const [skillScores, setSkillScores] = useState(SKILL_SCORES);
    const [roadmap, setRoadmap] = useState(ROADMAP);
    const [homeActivities, setHomeActivities] = useState(HOME_ACTIVITIES);
    const [messages, setMessages] = useState(MESSAGES);
    const [consentRecords] = useState(CONSENT_RECORDS);
    const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);
    const [cdcMetrics] = useState(CDC_METRICS);
    const [skillProgress, setSkillProgress] = useState(() => {
        const saved = localStorage.getItem('neurobridge_skill_progress');
        return saved ? JSON.parse(saved) : SKILL_PROGRESS;
    });
    const [communityUnreadCount, setCommunityUnreadCount] = useState(0);
    const [privateUnreadCount, setPrivateUnreadCount] = useState(0);
    const notifiedMessageIds = useRef(new Set());

    // Sync skill progress to localStorage and across tabs
    useEffect(() => {
        localStorage.setItem('neurobridge_skill_progress', JSON.stringify(skillProgress));
    }, [skillProgress]);

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'neurobridge_skill_progress' && e.newValue) {
                try {
                    setSkillProgress(JSON.parse(e.newValue));
                } catch (err) {
                    console.error('Error syncing skill progress across tabs:', err);
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // ============ Auth State ============
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Sync with localStorage on mount and when authentication changes
    useEffect(() => {
        const syncAuth = () => {
            const doctorData = localStorage.getItem('doctor_data');
            const parentData = localStorage.getItem('parent_data');
            const adminData = localStorage.getItem('admin_data');

            if (parentData) {
                try {
                    const parent = JSON.parse(parentData);
                    const mockUser = users.find(u => u.email === parent.email) || {};
                    // Prioritize cloud data (Real ID) over mock data
                    const user = { ...mockUser, ...parent };

                    if (!user.role) user.role = 'parent';

                    setCurrentUser(user);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Error syncing parent auth:', err);
                }
            } else if (doctorData) {
                try {
                    const doctor = JSON.parse(doctorData);
                    const mockUser = users.find(u => u.email === doctor.email) || {};
                    // Prioritize cloud data (Real ID) over mock data
                    const user = { ...mockUser, ...doctor };

                    if (!user.role) user.role = 'therapist';

                    setCurrentUser(user);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Error syncing doctor auth:', err);
                }
            } else if (adminData) {
                try {
                    const admin = JSON.parse(adminData);
                    const user = users.find(u => u.email === admin.email) || admin;

                    if (!user.role) user.role = 'admin';

                    setCurrentUser(user);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Error syncing admin auth:', err);
                }
            } else {
                setCurrentUser(null);
                setIsAuthenticated(false);
            }
        };

        syncAuth();

        // Listen for storage changes (for multiple tabs)
        window.addEventListener('storage', syncAuth);

        // Also listen for a custom event we can trigger on login
        window.addEventListener('auth-change', syncAuth);

        return () => {
            window.removeEventListener('storage', syncAuth);
            window.removeEventListener('auth-change', syncAuth);
        };
    }, [users]);

    // Production-Level Message Synchronization
    useEffect(() => {
        const syncMessagesFromCloud = async () => {
            if (!isAuthenticated || !currentUser) return;

            try {
                const cloudMessages = await messagesAPI.getByUser(currentUser.id);
                if (cloudMessages && cloudMessages.length > 0) {
                    // Normalize snake_case from MongoDB to camelCase for the frontend
                    const normalizedMessages = cloudMessages.map(m => ({
                        ...m,
                        id: m.id || m._id,
                        senderId: m.senderId || m.sender_id,
                        recipientId: m.recipientId || m.recipient_id,
                        childId: m.childId || m.child_id,
                        threadId: m.threadId || m.thread_id,
                        senderName: m.senderName || m.sender_name,
                        senderRole: m.senderRole || m.sender_role
                    }));

                    setMessages(prev => {
                        const cloudIds = new Set(normalizedMessages.map(m => m.id));
                        const legacyMessages = prev.filter(m => !cloudIds.has(m.id) && !cloudIds.has(m._id));
                        return [...normalizedMessages, ...legacyMessages];
                    });
                }
            } catch (err) {
                console.warn('Silent failure syncing messages:', err);
            }
        };

        syncMessagesFromCloud();
        // Poll for new messages every 15s
        const interval = setInterval(syncMessagesFromCloud, 15000);
        return () => clearInterval(interval);
    }, [isAuthenticated, currentUser]);

    // Production-Level Session Synchronization
    useEffect(() => {
        const syncSessionsFromCloud = async () => {
            if (!isAuthenticated || !currentUser) return;

            try {
                console.log(`🌐 Syncing sessions for ${currentUser.role}: ${currentUser.name}`);
                let cloudSessions = [];

                if (currentUser.role === 'parent' && currentUser.childId) {
                    cloudSessions = await sessionAPI.getByChild(currentUser.childId);
                } else if (currentUser.role === 'therapist') {
                    cloudSessions = await sessionAPI.getByTherapist(currentUser.id);
                }

                if (cloudSessions.length > 0) {
                    setSessions(prev => {
                        // Smart Deduplication: Prioritize Cloud Data
                        const cloudIds = new Set(cloudSessions.map(s => s.id || s._id));
                        const legacySessions = prev.filter(s => !cloudIds.has(s.id) && !cloudIds.has(s._id));
                        return [...cloudSessions, ...legacySessions];
                    });
                    console.log(`✅ Successfully synced ${cloudSessions.length} sessions from MongoDB.`);
                }
            } catch (err) {
                console.error('❌ Cloud Session Sync Failed:', err);
            }
        };

        syncSessionsFromCloud();
    }, [isAuthenticated, currentUser]);

    // Global Message & Community Polling for Notifications
    useEffect(() => {
        if (!isAuthenticated || !currentUser) return;

        const pollUnreadCounts = async () => {
            try {
                // 1. Unread count for private messages is derived from synchronized messages state
                // This is handled automatically by the syncMessagesFromCloud effect above

                // 2. Poll Community Messages separately
                const community = await communityAPI.getDefault();
                if (community) {
                    const messagesData = await communityAPI.getMessages(community.id, 20, 0);
                    const communityMessages = messagesData.messages || [];

                    const lastSeen = localStorage.getItem(`last_seen_community_${community.id}`) || 0;
                    const unreadList = communityMessages.filter(m =>
                        new Date(m.timestamp).getTime() > parseInt(lastSeen) &&
                        m.sender_id !== currentUser.id && m.senderId !== currentUser.id
                    );

                    setCommunityUnreadCount(unreadList.length);

                    // Trigger toast for new community messages
                    unreadList.forEach(m => {
                        const mId = m.id || m._id;
                        if (!notifiedMessageIds.current.has(mId)) {
                            addNotification({
                                type: 'message',
                                title: `New Community Message`,
                                message: `${m.sender_name || 'Someone'} posted: ${m.content.substring(0, 40)}...`,
                                messageId: mId
                            });
                            notifiedMessageIds.current.add(mId);
                        }
                    });
                }
            } catch (err) {
                console.warn('Silent failure polling for notifications:', err);
            }
        };

        pollUnreadCounts();
        const interval = setInterval(pollUnreadCounts, 10000); // 10s poll
        return () => clearInterval(interval);
    }, [isAuthenticated, currentUser]);

    // Update private unread count whenever messages change
    useEffect(() => {
        if (!currentUser) return;
        const count = messages.filter(m =>
            (m.recipientId === currentUser.id || m.recipient_id === currentUser.id) &&
            !m.read
        ).length;
        setPrivateUnreadCount(count);
    }, [messages, currentUser]);

    // Track newly received messages to show notifications
    useEffect(() => {
        if (!isAuthenticated || !currentUser) return;

        // 1. Private Messages Notifications (Now using normalized IDs)
        const incomingUnread = messages.filter(m =>
            (m.recipientId === currentUser.id) &&
            !m.read
        );

        incomingUnread.forEach(m => {
            const mId = m.id || m._id;
            if (!notifiedMessageIds.current.has(mId)) {
                addNotification({
                    type: 'message',
                    title: `New Message from ${m.senderName || 'Parent'}`,
                    message: m.content.substring(0, 60) + (m.content.length > 60 ? '...' : ''),
                    messageId: mId
                });
                notifiedMessageIds.current.add(mId);
            }
        });

        // 2. Clean up notified IDs if they are no longer unread or no longer in messages
        const currentUnreadIds = new Set(incomingUnread.map(m => m.id || m._id));
        notifiedMessageIds.current.forEach(id => {
            if (!currentUnreadIds.has(id) && !messages.some(m => (m.id || m._id) === id)) {
                // Keep it in the set to avoid re-notifying if it comes back, 
                // but this logic is just a simple tracker for now
            }
        });
    }, [messages, isAuthenticated, currentUser]);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ============ Auth Actions ============
    const login = useCallback((role, id) => {
        const user = users.find(u => u.role === role && (id ? u.id === id : true));
        if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);

            // Log audit event
            addAuditLog({
                action: 'USER_LOGIN',
                userId: user.id,
                userName: user.name,
                details: `User logged in as ${role}`
            });

            return true;
        }
        return false;
    }, [users]);

    const logout = useCallback(() => {
        if (currentUser) {
            addAuditLog({
                action: 'USER_LOGOUT',
                userId: currentUser.id,
                userName: currentUser.name,
                details: 'User logged out'
            });
        }
        setCurrentUser(null);
        setIsAuthenticated(false);
    }, [currentUser]);

    // ============ Session Actions ============
    const getChildSessions = useCallback((childId) => {
        return sessions
            .filter(s => s.childId === childId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [sessions]);

    const getRecentSessions = useCallback((childId, limit = 5) => {
        return getChildSessions(childId).slice(0, limit);
    }, [getChildSessions]);

    const addSession = useCallback((newSession) => {
        // Ensure all required fields are present
        const sessionWithId = {
            id: `s${Date.now()}`,
            childId: newSession.childId,
            date: newSession.date || new Date().toISOString(), // Preserve date from form
            type: newSession.type,
            therapistId: newSession.therapistId || currentUser?.id || 't1',
            duration: newSession.duration || 45,
            status: newSession.status || 'scheduled', // Use status from form (scheduled for new sessions)
            location: newSession.location || null,
            // Optional fields for completed sessions
            engagement: newSession.engagement || null,
            emotionalState: newSession.emotionalState || null,
            activities: newSession.activities || null,
            notes: newSession.notes || null,
            aiSummary: newSession.aiSummary || null,
            wins: newSession.wins || null,
            focusAreas: newSession.focusAreas || null,
            behaviorTags: newSession.behaviorTags || null
        };

        setSessions(prev => [sessionWithId, ...prev]);

        // Log audit event
        const childName = kids.find(k => k.id === newSession.childId)?.name || 'Unknown';
        addAuditLog({
            action: 'SESSION_CREATED',
            userId: currentUser?.id,
            userName: currentUser?.name,
            targetType: 'session',
            targetId: sessionWithId.id,
            details: `Created ${sessionWithId.status} session for ${childName}`
        });

        return sessionWithId;
    }, [currentUser, kids]);

    const getSessionsByTherapist = useCallback((therapistId) => {
        return sessions
            .filter(s => s.therapistId === therapistId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [sessions]);

    const getTodaysSessions = useCallback((therapistId) => {
        const today = new Date().toISOString().split('T')[0];
        return sessions.filter(s =>
            s.therapistId === therapistId &&
            s.date.startsWith(today)
        );
    }, [sessions]);

    // ============ Child Actions ============
    const getChildById = useCallback((childId) => {
        return kids.find(k => k.id === childId);
    }, [kids]);

    const getChildrenByTherapist = useCallback((therapistId) => {
        return kids.filter(k => k.therapistId === therapistId);
    }, [kids]);

    const getChildrenByParent = useCallback((parentId) => {
        return kids.filter(k => k.parentId === parentId);
    }, [kids]);

    const updateChildMood = useCallback((childId, mood, context) => {
        setKids(prev => prev.map(k =>
            k.id === childId
                ? { ...k, currentMood: mood, moodContext: context }
                : k
        ));
    }, []);

    // ============ Skill Score Actions ============
    const getChildSkillScores = useCallback((childId, limit = null) => {
        const scores = skillScores
            .filter(s => s.childId === childId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        return limit ? scores.slice(0, limit) : scores;
    }, [skillScores]);

    const getLatestSkillScores = useCallback((childId) => {
        const scores = getChildSkillScores(childId);
        const domains = [...new Set(scores.map(s => s.domain))];
        return domains.map(domain =>
            scores.find(s => s.domain === domain)
        ).filter(Boolean);
    }, [getChildSkillScores]);

    const getSkillHistory = useCallback((childId, domain) => {
        return skillScores
            .filter(s => s.childId === childId && s.domain === domain)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [skillScores]);

    // ============ Roadmap Actions ============
    const getChildRoadmap = useCallback((childId) => {
        return roadmap
            .filter(r => r.childId === childId)
            .sort((a, b) => {
                // Sort by status (in-progress first), then by target date
                if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
                if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;
                return new Date(a.targetDate) - new Date(b.targetDate);
            });
    }, [roadmap]);

    const updateRoadmapProgress = useCallback((roadmapId, updates) => {
        setRoadmap(prev => prev.map(r =>
            r.id === roadmapId ? { ...r, ...updates } : r
        ));

        addAuditLog({
            action: 'ROADMAP_UPDATED',
            userId: currentUser?.id,
            userName: currentUser?.name,
            targetType: 'roadmap',
            targetId: roadmapId,
            details: 'Updated roadmap progress'
        });
    }, [currentUser]);

    const completeMilestone = useCallback((roadmapId, milestoneId) => {
        setRoadmap(prev => prev.map(r => {
            if (r.id === roadmapId) {
                const updatedMilestones = r.milestones.map(m =>
                    m.id === milestoneId
                        ? { ...m, completed: true, date: new Date().toISOString().split('T')[0] }
                        : m
                );
                const completedCount = updatedMilestones.filter(m => m.completed).length;
                const progress = Math.round((completedCount / updatedMilestones.length) * 100);

                return { ...r, milestones: updatedMilestones, progress };
            }
            return r;
        }));
    }, []);

    // ============ Home Activity Actions ============
    const getChildHomeActivities = useCallback((childId) => {
        return homeActivities.filter(a => a.childId === childId);
    }, [homeActivities]);

    const logActivityCompletion = useCallback((activityId, completed, notes = '') => {
        setHomeActivities(prev => prev.map(a => {
            if (a.id === activityId) {
                const newCompletion = {
                    date: new Date().toISOString().split('T')[0],
                    completed,
                    parentNotes: notes
                };
                return {
                    ...a,
                    completions: [newCompletion, ...(a.completions || [])]
                };
            }
            return a;
        }));
    }, []);

    const getActivityAdherence = useCallback((childId) => {
        const activities = getChildHomeActivities(childId);
        let totalAssigned = 0;
        let totalCompleted = 0;

        activities.forEach(a => {
            const completions = a.completions || [];
            totalAssigned += 7; // Last 7 days
            totalCompleted += completions.filter(c => c.completed).length;
        });

        return totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
    }, [getChildHomeActivities]);

    // ============ Message Actions ============
    const getChildMessages = useCallback((childId, userId) => {
        return messages
            .filter(m => m.childId === childId && (m.senderId === userId || m.recipientId === userId))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [messages]);

    const getUnreadCount = useCallback((userId) => {
        return messages.filter(m => m.recipientId === userId && !m.read).length;
    }, [messages]);

    const sendMessage = useCallback(async (message) => {
        try {
            // Persist to Backend
            const backendMessage = {
                thread_id: message.threadId,
                sender_id: message.senderId,
                sender_name: message.senderName,
                sender_role: message.senderRole,
                recipient_id: message.recipientId,
                child_id: message.childId,
                content: message.content,
                type: message.type || 'message'
            };

            const savedMessage = await messagesAPI.send(backendMessage);

            // Update Local State
            const newMessage = {
                ...message,
                id: savedMessage._id || savedMessage.id || `msg${Date.now()}`,
                timestamp: savedMessage.timestamp || new Date().toISOString(),
                read: false,
                type: message.type || 'message'
            };

            setMessages(prev => [newMessage, ...prev]);
            return newMessage;
        } catch (err) {
            console.error('Failed to send message via API:', err);
            // Fallback to local state if API fails
            const fallbackMsg = {
                ...message,
                id: `msg${Date.now()}`,
                timestamp: new Date().toISOString(),
                read: false
            };
            setMessages(prev => [fallbackMsg, ...prev]);
            return fallbackMsg;
        }
    }, []);

    const markMessageRead = useCallback(async (messageId) => {
        try {
            // Try to notify backend if it's a backend message (ObjectId-like strings are usually longer)
            if (messageId.length > 20) {
                await messagesAPI.markRead(messageId);
            }
        } catch (err) {
            console.warn('Silent failure marking message as read on backend:', err);
        }

        setMessages(prev => prev.map(m =>
            m.id === messageId || m._id === messageId ? { ...m, read: true } : m
        ));
    }, []);

    // ============ Audit Log Actions ============
    const addAuditLog = useCallback((log) => {
        const newLog = {
            ...log,
            id: `audit${Date.now()}`,
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.100' // Mock IP
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, []);

    // ============ Notification Actions ============
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const addNotification = useCallback((notification) => {
        const id = `notif${Date.now()}`;
        const newNotification = {
            ...notification,
            id,
            timestamp: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [newNotification, ...prev]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    }, [removeNotification]);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // ============ Analytics Helpers ============
    const getEngagementTrend = useCallback((childId) => {
        const childSessions = getChildSessions(childId).slice(0, 10);
        return childSessions.map(s => ({
            date: s.date,
            engagement: s.engagement || 0
        })).reverse();
    }, [getChildSessions]);

    const getChildProgress = useCallback((childId) => {
        return skillProgress.filter(p => p.childId === childId);
    }, [skillProgress]);

    const updateSkillProgress = useCallback((skillId, updates) => {
        setSkillProgress(prev => prev.map(skill => {
            if (skill.id === skillId) {
                const newProgress = {
                    ...skill,
                    ...updates,
                    lastUpdated: new Date().toISOString().split('T')[0],
                    history: [
                        {
                            date: new Date().toISOString().split('T')[0],
                            status: updates.status || skill.status,
                            progress: updates.progress !== undefined ? updates.progress : skill.progress,
                            remarks: updates.therapistNotes || updates.parentNote || 'Status updated'
                        },
                        ...skill.history
                    ]
                };
                return newProgress;
            }
            return skill;
        }));
    }, []);

    const getTherapistStats = useCallback((therapistId) => {
        const therapistSessions = sessions.filter(s => s.therapistId === therapistId);
        const patients = kids.filter(k => k.therapistId === therapistId);
        const completedToday = therapistSessions.filter(s =>
            s.status === 'completed' &&
            s.date.startsWith(new Date().toISOString().split('T')[0])
        ).length;

        return {
            totalPatients: patients.length,
            totalSessions: therapistSessions.length,
            completedToday,
            avgEngagement: Math.round(
                therapistSessions.reduce((a, b) => a + (b.engagement || 0), 0) /
                (therapistSessions.filter(s => s.engagement).length || 1)
            )
        };
    }, [sessions, kids]);

    // ============ Context Value ============
    const value = useMemo(() => ({
        // State
        users,
        kids,
        sessions,
        skillScores,
        roadmap,
        homeActivities,
        messages,
        consentRecords,
        auditLogs,
        cdcMetrics,
        currentUser,
        isAuthenticated,
        notifications,
        isLoading,
        communityUnreadCount,
        privateUnreadCount,
        setCommunityUnreadCount,

        // Auth Actions
        login,
        logout,

        // Session Actions
        getChildSessions,
        getRecentSessions,
        addSession,
        getSessionsByTherapist,
        getTodaysSessions,

        // Child Actions
        getChildById,
        getChildrenByTherapist,
        getChildrenByParent,
        updateChildMood,

        // Skill Score Actions
        getChildSkillScores,
        getLatestSkillScores,
        getSkillHistory,

        // Roadmap Actions
        getChildRoadmap,
        updateRoadmapProgress,
        completeMilestone,

        // Home Activity Actions
        getChildHomeActivities,
        logActivityCompletion,
        getActivityAdherence,

        // Message Actions
        getChildMessages,
        getUnreadCount,
        sendMessage,
        markMessageRead,

        // Audit Actions
        addAuditLog,

        // Notification Actions
        addNotification,
        removeNotification,
        clearNotifications,

        // Analytics
        getEngagementTrend,
        getTherapistStats,

        // Progress Tracking
        skillProgress,
        getChildProgress,
        updateSkillProgress,

        // UI Actions
        setIsLoading
    }), [
        users, kids, sessions, skillScores, roadmap, homeActivities, messages,
        consentRecords, auditLogs, cdcMetrics, currentUser, isAuthenticated,
        notifications, isLoading, login, logout, getChildSessions, getRecentSessions,
        addSession, getSessionsByTherapist, getTodaysSessions, getChildById,
        getChildrenByTherapist, getChildrenByParent, updateChildMood, getChildSkillScores,
        getLatestSkillScores, getSkillHistory, getChildRoadmap, updateRoadmapProgress,
        completeMilestone, getChildHomeActivities, logActivityCompletion, getActivityAdherence,
        getChildMessages, getUnreadCount, sendMessage, markMessageRead, addAuditLog,
        addNotification, clearNotifications, getEngagementTrend, getTherapistStats,
        skillProgress, getChildProgress, updateSkillProgress
    ]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export default AppContext;
