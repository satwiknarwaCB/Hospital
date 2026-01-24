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
    SKILL_PROGRESS,
    SKILL_GOALS
} from '../data/mockData';
import { sessionAPI, communityAPI, messagesAPI, progressAPI } from './api';

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
    const [skillGoals, setSkillGoals] = useState(() => {
        const saved = localStorage.getItem('neurobridge_skill_goals');
        return saved ? JSON.parse(saved) : SKILL_GOALS;
    });
    const [communityUnreadCount, setCommunityUnreadCount] = useState(0);
    const [privateUnreadCount, setPrivateUnreadCount] = useState(0);
    const notifiedMessageIds = useRef(new Set());

    // Sync skill progress to localStorage and across tabs
    useEffect(() => {
        localStorage.setItem('neurobridge_skill_progress', JSON.stringify(skillProgress));
    }, [skillProgress]);

    useEffect(() => {
        localStorage.setItem('neurobridge_skill_goals', JSON.stringify(skillGoals));
    }, [skillGoals]);

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

        const handleGoalsStorage = (e) => {
            if (e.key === 'neurobridge_skill_goals' && e.newValue) {
                try {
                    setSkillGoals(JSON.parse(e.newValue));
                } catch (err) {
                    console.error('Error syncing skill goals across tabs:', err);
                }
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('storage', handleGoalsStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('storage', handleGoalsStorage);
        };
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
                    const mockUser = users.find(u => u.email?.toLowerCase() === parent.email?.toLowerCase());
                    const user = { ...mockUser, ...parent };
                    if (mockUser) {
                        user.id = mockUser.id;
                        user.email = mockUser.email;
                    }

                    if (!user.role) user.role = 'parent';

                    setCurrentUser(user);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Error syncing parent auth:', err);
                }
            } else if (doctorData) {
                try {
                    const doctor = JSON.parse(doctorData);
                    const mockUser = users.find(u => u.email?.toLowerCase() === doctor.email?.toLowerCase());
                    const user = { ...mockUser, ...doctor };
                    if (mockUser) {
                        user.id = mockUser.id;
                        user.email = mockUser.email;
                    }

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

    // Production-Level Progress Synchronization
    useEffect(() => {
        const syncProgressFromCloud = async () => {
            if (!isAuthenticated || !currentUser) return;

            try {
                // For Parent View: Fetch their child's data
                if (currentUser.role === 'parent' && currentUser.childId) {
                    const [goals, progress] = await Promise.all([
                        progressAPI.getGoalsByChild(currentUser.childId),
                        progressAPI.getProgressByChild(currentUser.childId)
                    ]);

                    if (goals.length > 0) {
                        setSkillGoals(prev => {
                            // Normalize Goal IDs
                            const normalizedGoals = goals.map(g => ({
                                ...g,
                                id: g.id || g._id,
                                dbId: g._id
                            }));
                            const cloudIds = new Set(normalizedGoals.map(g => g.id));
                            const legacy = prev.filter(g => !cloudIds.has(g.id));
                            return [...normalizedGoals, ...legacy];
                        });
                    }

                    if (progress.length > 0) {
                        setSkillProgress(prev => {
                            // Normalize: Ensure EVERY record has a GLOBALLY UNIQUE id (childId + skillId)
                            const normalizedProgress = progress.map(p => ({
                                ...p,
                                id: `${p.childId}-${p.skillId}`, // CRITICAL: This is the source of truth for uniqueness
                                dbId: p._id // Keep reference to backend _id for API calls
                            }));

                            // Therapist-style merging for Parents: Ensure cloud data doesn't erase clinical mock data
                            const skillMap = new Map();

                            // 1. Seed with existing local/legacy records
                            prev.forEach(mock => {
                                if (mock.childId === currentUser.childId) {
                                    skillMap.set(mock.skillName, mock);
                                }
                            });

                            // 2. Merge in normalized cloud records
                            normalizedProgress.forEach(cloud => {
                                const mock = skillMap.get(cloud.skillName);
                                if (mock) {
                                    // Deep merge logic: prefer cloud data, but keep mock data if cloud is empty
                                    const isCloudEmpty = (!cloud.progress || cloud.progress === 0) && (!cloud.therapistNotes || cloud.therapistNotes.trim() === "");
                                    const isMockFull = (mock.progress > 0) || (mock.therapistNotes && mock.therapistNotes.trim() !== "");

                                    if (isCloudEmpty && isMockFull) {
                                        skillMap.set(cloud.skillName, { ...mock, dbId: cloud.dbId || cloud._id });
                                    } else {
                                        skillMap.set(cloud.skillName, { ...mock, ...cloud }); // Merge fields
                                    }
                                } else {
                                    skillMap.set(cloud.skillName, cloud);
                                }
                            });

                            const others = prev.filter(p => p.childId !== currentUser.childId);
                            return [...others, ...Array.from(skillMap.values())].sort((a, b) => (a.order || 0) - (b.order || 0));
                        });
                    }
                }

                // Therapist View: Fetch for their active caseload
                if (currentUser.role === 'therapist') {
                    const therapistKids = kids.filter(k => k.therapistId === currentUser.id);
                    for (const kid of therapistKids) {
                        try {
                            const [goals, progress] = await Promise.all([
                                progressAPI.getGoalsByChild(kid.id),
                                progressAPI.getProgressByChild(kid.id)
                            ]);

                            if (goals.length > 0) {
                                setSkillGoals(prev => {
                                    const normalizedGoals = goals.map(g => ({
                                        ...g,
                                        id: g.id || g._id,
                                        dbId: g._id
                                    }));

                                    const others = prev.filter(g => g.childId !== kid.id);
                                    const cloudIds = new Set(normalizedGoals.map(g => g.id));
                                    const legacy = prev.filter(g => g.childId === kid.id && !cloudIds.has(g.id));

                                    return [...others, ...normalizedGoals, ...legacy];
                                });
                            }

                            if (progress.length > 0) {
                                setSkillProgress(prev => {
                                    // Normalize for Therapist View: childId + skillId
                                    const normalizedProgress = progress.map(p => ({
                                        ...p,
                                        id: `${p.childId}-${p.skillId}`,
                                        dbId: p._id
                                    }));

                                    const others = prev.filter(p => p.childId !== kid.id);
                                    const kidLegacy = prev.filter(p => p.childId === kid.id);

                                    // Use a Map to guarantee uniqueness by skillName for this child
                                    const skillMap = new Map();

                                    // 1. Seed with local records (clinical mock data)
                                    kidLegacy.forEach(mock => {
                                        const existing = skillMap.get(mock.skillName);
                                        // Prefer records that actually have progress data
                                        if (!existing || (!existing.progress && mock.progress)) {
                                            skillMap.set(mock.skillName, mock);
                                        }
                                    });

                                    // For each legacy record, if it exists in cloud, merge. If not, keep.
                                    // 2. Merge in cloud records
                                    normalizedProgress.forEach(cloud => {
                                        const mock = skillMap.get(cloud.skillName);
                                        if (mock) {
                                            const isCloudEmpty = (!cloud.progress || cloud.progress === 0) && (!cloud.therapistNotes || cloud.therapistNotes.trim() === "");
                                            const isMockFull = (mock.progress > 0) || (mock.therapistNotes && mock.therapistNotes.trim() !== "");

                                            if (isCloudEmpty && isMockFull) {
                                                // Map exists but cloud is empty - preserve mock clinical data but link to cloud DB ID
                                                skillMap.set(cloud.skillName, { ...mock, dbId: cloud.dbId || cloud._id });
                                            } else {
                                                // Cloud has data or mock was also empty - prefer cloud
                                                skillMap.set(cloud.skillName, cloud);
                                            }
                                        } else {
                                            skillMap.set(cloud.skillName, cloud);
                                        }
                                    });

                                    const merged = [...others, ...Array.from(skillMap.values())];
                                    return merged.sort((a, b) => (a.order || 0) - (b.order || 0));
                                });
                            }
                        } catch (e) {
                            console.warn(`Failed to sync progress for child ${kid.id}`, e);
                        }
                    }
                }
            } catch (err) {
                console.error('❌ Cloud Progress Sync Failed:', err);
            }
        };

        syncProgressFromCloud();
        const interval = setInterval(syncProgressFromCloud, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated, currentUser, kids]);

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
        const id = `notif${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

    const updateSkillProgress = useCallback(async (skillId, updates) => {
        const updateTime = new Date().toISOString().split('T')[0];

        // Find the current record to build history and check cloud status
        const currentRecord = skillProgress.find(p => p.id === skillId);
        if (!currentRecord) {
            console.warn(`⚠️ [Sync] No record found for ID: ${skillId}`);
            return;
        }

        const newHistoryItem = {
            date: updateTime,
            status: updates.status || currentRecord.status,
            progress: updates.progress !== undefined ? updates.progress : currentRecord.progress,
            remarks: updates.therapistNotes || updates.parentNote || 'Progress updated',
            updatedBy: updates.updatedByRole || (currentUser?.role || 'system')
        };

        const fullUpdates = {
            ...updates,
            lastUpdated: updateTime,
            history: [newHistoryItem, ...(currentRecord.history || [])]
        };

        // Optimistic Update
        setSkillProgress(prev => {
            console.log(`🎯 [Sync] Local optimistic update for ${skillId}`);
            return prev.map(skill => {
                if (skill.id === skillId) {
                    return { ...skill, ...fullUpdates };
                }
                return skill;
            });
        });

        // Backend Sync
        try {
            const hasCloudRecord = currentRecord.dbId || currentRecord._id;

            if (hasCloudRecord) {
                // Already in MongoDB, just update
                const dbId = currentRecord.dbId || currentRecord._id;
                await progressAPI.updateProgress(dbId, fullUpdates);
                console.log(`✅ [MongoDB] Sync successful for ${skillId}`);
            } else {
                // This is a Mock record, "Promote" it to MongoDB
                const fullRecord = {
                    ...currentRecord,
                    ...fullUpdates,
                    skillId: currentRecord.skillId || currentRecord.id // Explicitly map 'id' to 'skillId'
                };

                const saved = await progressAPI.createProgress(fullRecord);

                // Update local state with the real MongoDB _id and ensure deduplication
                setSkillProgress(prev => {
                    const exists = prev.some(p => p.childId === currentRecord.childId && (p.skillId === fullRecord.skillId || p.skillName === currentRecord.skillName));
                    if (exists) {
                        return prev.map(p => {
                            if (p.childId === currentRecord.childId && (p.skillId === fullRecord.skillId || p.skillName === currentRecord.skillName)) {
                                return { ...p, dbId: saved._id || saved.id, _id: saved._id || saved.id, skillId: fullRecord.skillId, ...fullUpdates };
                            }
                            return p;
                        });
                    }
                    return prev.map(p =>
                        p.id === skillId ? { ...p, dbId: saved._id || saved.id, _id: saved._id || saved.id, skillId: fullRecord.skillId } : p
                    );
                });
                console.log(`🚀 [MongoDB] Record promoted and synced successfully for ${skillId}`);
            }
        } catch (err) {
            console.error("❌ [MongoDB] Sync failure:", err);
        }
    }, [skillProgress, currentUser]);

    const getChildGoals = useCallback((childId) => {
        return skillGoals.filter(g => g.childId === childId);
    }, [skillGoals]);

    const updateSkillGoal = useCallback(async (goalId, updates) => {
        // Optimistic
        setSkillGoals(prev => prev.map(goal =>
            goal.id === goalId ? { ...goal, ...updates } : goal
        ));

        try {
            await progressAPI.updateGoal(goalId, updates);
        } catch (err) {
            console.error("Failed to persist goal update:", err);
        }
    }, []);

    const addSkillGoal = useCallback(async (newGoal) => {
        try {
            console.log('📝 Creating new goal:', newGoal);
            const savedGoal = await progressAPI.createGoal(newGoal);
            console.log('✅ Goal created:', savedGoal);

            setSkillGoals(prev => [...prev, savedGoal]);

            // Also ensure a corresponding progress record exists
            try {
                const progressData = {
                    childId: newGoal.childId,
                    skillId: newGoal.skillId,
                    skillName: newGoal.skillName,
                    status: 'In Progress',
                    progress: 0,
                    weeklyActuals: [],
                    history: [],
                    isGoalOnly: true // Hide from Child Progress Tracking cards
                };
                console.log('📝 Creating progress record:', progressData);
                const savedProgress = await progressAPI.createProgress(progressData);
                console.log('✅ Progress record created:', savedProgress);

                // Update local state with the new progress record
                setSkillProgress(prev => {
                    const exists = prev.some(p => p.childId === savedProgress.childId && (p.skillId === savedProgress.skillId || p.skillName === savedProgress.skillName));
                    if (exists) {
                        return prev.map(p => (p.childId === savedProgress.childId && (p.skillId === savedProgress.skillId || p.skillName === savedProgress.skillName)) ? { ...p, ...savedProgress, id: p.id } : p);
                    }
                    return [...prev, { ...savedProgress, id: `${savedProgress.childId}-${savedProgress.skillId}` }];
                });
            } catch (progressErr) {
                console.warn('Progress record creation failed (may already exist):', progressErr);
                // Create local fallback progress record
                setSkillProgress(prev => [...prev, {
                    id: `sp${Date.now()}`,
                    childId: newGoal.childId,
                    skillId: newGoal.skillId,
                    skillName: newGoal.skillName,
                    status: 'In Progress',
                    progress: 0,
                    weeklyActuals: [],
                    history: [],
                    therapistNotes: '',
                    lastUpdated: new Date().toISOString().split('T')[0],
                    isGoalOnly: true
                }]);
            }

            return savedGoal;

        } catch (err) {
            console.error("❌ Failed to create goal:", err);
            // Fallback for demo - create local goal
            const localGoal = {
                id: `sg${Date.now()}`,
                ...newGoal,
                startDate: newGoal.startDate || new Date().toISOString().split('T')[0]
            };
            setSkillGoals(prev => [...prev, localGoal]);

            // Also create local progress record
            const localRecord = {
                id: `sp${Date.now()}`,
                childId: newGoal.childId,
                skillId: newGoal.skillId,
                skillName: newGoal.skillName,
                status: 'In Progress',
                progress: 0,
                weeklyActuals: [],
                history: [],
                therapistNotes: '',
                lastUpdated: new Date().toISOString().split('T')[0]
            };

            setSkillProgress(prev => {
                const exists = prev.some(p => p.childId === newGoal.childId && (p.skillId === newGoal.skillId || p.skillName === newGoal.skillName));
                if (exists) {
                    return prev.map(p => (p.childId === newGoal.childId && (p.skillId === newGoal.skillId || p.skillName === newGoal.skillName)) ? { ...p, ...localRecord } : p);
                }
                return [...prev, localRecord];
            });

            return localGoal;
        }
    }, []);

    const deleteSkillGoal = useCallback(async (goalId) => {
        setSkillGoals(prev => prev.filter(g => g.id !== goalId));
        try {
            await progressAPI.deleteGoal(goalId);
        } catch (err) {
            console.error("Failed to delete goal:", err);
        }
    }, []);

    const deleteSkillProgress = useCallback(async (skillId) => {
        // Optimistic
        setSkillProgress(prev => prev.filter(p => p.id !== skillId));

        try {
            await progressAPI.deleteProgress(skillId);
        } catch (err) {
            console.error("Failed to delete progress record:", err);
        }
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

        // Skill Goals (Planned Targets)
        skillGoals,
        getChildGoals,
        updateSkillGoal,
        addSkillGoal,
        deleteSkillGoal,
        deleteSkillProgress,

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
        skillProgress, getChildProgress, updateSkillProgress,
        skillGoals, getChildGoals, updateSkillGoal, addSkillGoal
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
