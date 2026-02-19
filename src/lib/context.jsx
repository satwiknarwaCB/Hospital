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
    SKILL_GOALS,
    DOCUMENTS
} from '../data/mockData';
import { sessionAPI, communityAPI, messagesAPI, progressAPI, userManagementAPI } from './api';
import { cryptoUtils } from './crypto';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // ============ Core State ============
    const [users] = useState(USERS);
    const [realChildren, setRealChildren] = useState([]);
    const [kids, setKids] = useState(CHILDREN);
    const [sessions, setSessions] = useState(SESSIONS);
    const [skillScores, setSkillScores] = useState(SKILL_SCORES);
    const [roadmap, setRoadmap] = useState(ROADMAP);
    const [homeActivities, setHomeActivities] = useState(HOME_ACTIVITIES);
    const [messages, setMessages] = useState(MESSAGES);
    const [consentRecords] = useState(CONSENT_RECORDS);
    const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);
    const [cdcMetrics] = useState(CDC_METRICS);
    const [adminStats, setAdminStats] = useState({
        therapist_count: CDC_METRICS.therapistCount,
        parent_count: 2, // Mock baseline
        child_count: CDC_METRICS.activeChildren,
        active_children: CDC_METRICS.activeChildren,
        ongoing_therapies: 35, // Mock baseline
        pending_assignments: 10 // Mock baseline
    });
    const [skillProgress, setSkillProgress] = useState(() => {
        const saved = localStorage.getItem('neurobridge_skill_progress');
        return saved ? JSON.parse(saved) : SKILL_PROGRESS;
    });
    const [skillGoals, setSkillGoals] = useState(() => {
        const saved = localStorage.getItem('neurobridge_skill_goals');
        return saved ? JSON.parse(saved) : SKILL_GOALS;
    });
    const [childDocuments, setChildDocuments] = useState(() => {
        const saved = localStorage.getItem('neurobridge_documents');
        return saved ? JSON.parse(saved) : DOCUMENTS;
    });
    const [communityUnreadCount, setCommunityUnreadCount] = useState(0);
    const [privateUnreadCount, setPrivateUnreadCount] = useState(0);
    const notifiedMessageIds = useRef(new Set());
    const [quickTestResults, setQuickTestResults] = useState(() => {
        const saved = localStorage.getItem('neurobridge_quick_test_results');
        let results = saved ? JSON.parse(saved) : [];

        // Ensure all results have the proper structure
        results = results.filter(r => r && typeof r === 'object' && Array.isArray(r.games));

        // Add a sample result if none exists to ensure "Show Result Game" works for demo
        if (results.length === 0) {
            results = [{
                id: 'demo-result',
                childId: 'c1',
                date: new Date(Date.now() - 86400000).toISOString(),
                games: Array(6).fill(0).map((_, i) => ({
                    id: `g${i}`,
                    results: { score: 85 + i },
                    timestamp: new Date().toISOString()
                })),
                summary: {
                    score: 88,
                    interpretation: "Aarav is showing great progress in communication and sensory focus. His engagement in joint attention activities has improved by 15%."
                }
            }];
        }
        return results;
    });
    const [quickTestProgress, setQuickTestProgress] = useState(() => {
        const saved = localStorage.getItem('neurobridge_quick_test_progress');
        return saved ? JSON.parse(saved) : {};
    });

    // Sync skill progress to localStorage and across tabs
    useEffect(() => {
        localStorage.setItem('neurobridge_skill_progress', JSON.stringify(skillProgress));
    }, [skillProgress]);

    useEffect(() => {
        localStorage.setItem('neurobridge_skill_goals', JSON.stringify(skillGoals));
    }, [skillGoals]);

    useEffect(() => {
        localStorage.setItem('neurobridge_documents', JSON.stringify(childDocuments));
    }, [childDocuments]);

    useEffect(() => {
        localStorage.setItem('neurobridge_quick_test_results', JSON.stringify(quickTestResults));
    }, [quickTestResults]);

    useEffect(() => {
        localStorage.setItem('neurobridge_quick_test_progress', JSON.stringify(quickTestProgress));
    }, [quickTestProgress]);

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
    const [realTherapists, setRealTherapists] = useState([]);
    const [realParents, setRealParents] = useState([]);

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

    const refreshChildren = useCallback(async () => {
        try {
            const childrenData = await userManagementAPI.listChildren();
            console.log(`[AppProvider] Refreshed ${childrenData?.length} children from API`);
            if (childrenData?.length > 0) {
                console.log(`[AppProvider] Sample child therapistIds:`, childrenData[0].therapistIds);
            }
            setRealChildren(Array.isArray(childrenData) ? childrenData : []);
        } catch (err) {
            console.warn('Failed to refresh children:', err);
        }
    }, []);

    const refreshUsers = useCallback(async () => {
        try {
            const [tData, pData] = await Promise.all([
                userManagementAPI.listTherapists(),
                userManagementAPI.listParents()
            ]);
            setRealTherapists(Array.isArray(tData) ? tData : []);
            setRealParents(Array.isArray(pData) ? pData : []);
        } catch (err) {
            console.warn('Failed to refresh real users:', err);
        }
    }, []);

    // Initial fetch for users
    useEffect(() => {
        if (isAuthenticated && currentUser?.role === 'admin') {
            refreshUsers();
        }
    }, [isAuthenticated, currentUser, refreshUsers]);
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
                    if (!user.role) user.role = 'therapist';
                    setCurrentUser(user);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Error syncing doctor auth:', err);
                }
            } else if (adminData) {
                try {
                    const admin = JSON.parse(adminData);
                    const mockUser = users.find(u => u.email?.toLowerCase() === admin.email?.toLowerCase());
                    const user = { ...mockUser, ...admin };
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
        window.addEventListener('storage', syncAuth);
        window.addEventListener('auth-change', syncAuth);
        return () => {
            window.removeEventListener('storage', syncAuth);
            window.removeEventListener('auth-change', syncAuth);
        };
    }, [users]);

    // Derived full user list (Merge mock with real)
    const allUsers = useMemo(() => {
        const normalizedRealTherapists = realTherapists.map(t => ({
            ...t,
            id: t.id || t._id,
            avatar: t.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`,
            role: 'therapist'
        }));

        const normalizedRealParents = realParents.map(p => ({
            ...p,
            id: p.id || p._id,
            avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`,
            role: 'parent'
        }));

        const filteredMock = users.filter(mu =>
            !normalizedRealTherapists.find(rt => rt.email.toLowerCase() === mu.email.toLowerCase()) &&
            !normalizedRealParents.find(rp => rp.email.toLowerCase() === mu.email.toLowerCase())
        );

        return [...normalizedRealTherapists, ...normalizedRealParents, ...filteredMock];
    }, [users, realTherapists, realParents]);

    // Sync kids with realChildren
    useEffect(() => {
        const normalizedRealChildren = realChildren.map(c => ({
            ...c,
            id: c.id || c._id,
            avatar: c.avatar || (c.gender === 'Female'
                ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}&hair=long`
                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`),
        }));

        setKids(prev => {
            const mockChildren = CHILDREN.filter(mc =>
                !normalizedRealChildren.find(rc =>
                    rc.id === mc.id ||
                    (rc.name && mc.name && rc.name.trim().toLowerCase() === mc.name.trim().toLowerCase())
                )
            );
            return [...normalizedRealChildren, ...mockChildren];
        });
    }, [realChildren]);

    const refreshAdminStats = useCallback(async () => {
        try {
            if (currentUser?.role === 'admin') {
                const [stats] = await Promise.all([
                    userManagementAPI.getStats(),
                    refreshUsers(),
                    refreshChildren()
                ]);
                setAdminStats(stats);
            }
        } catch (err) {
            console.warn('Failed to refresh admin stats:', err);
        }
    }, [currentUser, refreshUsers]);

    // Initial fetch for admin stats
    useEffect(() => {
        if (isAuthenticated && currentUser?.role === 'admin') {
            refreshAdminStats();
        }
    }, [isAuthenticated, currentUser, refreshAdminStats]);

    // Production-Level Message Synchronization
    useEffect(() => {
        const syncMessagesFromCloud = async () => {
            if (!isAuthenticated || !currentUser) return;

            try {
                const cloudMessages = await messagesAPI.getByUser(currentUser.id);
                if (cloudMessages && cloudMessages.length > 0) {
                    // Normalize snake_case from MongoDB to camelCase for the frontend
                    const normalizedMessages = cloudMessages.map(m => {
                        const mId = m.id || m._id || (m.thread_id + m.timestamp + (m.content || '').substring(0, 10));
                        return {
                            ...m,
                            id: mId,
                            _id: mId,
                            senderId: m.senderId || m.sender_id,
                            recipientId: m.recipientId || m.recipient_id,
                            childId: m.childId || m.child_id,
                            threadId: m.threadId || m.thread_id,
                            senderName: m.senderName || m.sender_name,
                            senderRole: m.senderRole || m.sender_role,
                            content: cryptoUtils.decrypt(m.content) // DECRYPT ON LOAD
                        };
                    });

                    setMessages(prev => {
                        const messageMap = new Map();

                        // Add cloud messages first (source of truth)
                        normalizedMessages.forEach(m => {
                            const mId = m.id || m._id;
                            messageMap.set(mId, m);
                        });

                        // Add existing messages only if they are not already in the group
                        prev.forEach(m => {
                            const mId = m.id || m._id;
                            if (messageMap.has(mId)) return;

                            // Content-based deduplication as secondary check
                            const isDuplicate = Array.from(messageMap.values()).some(existing =>
                                existing.content === m.content &&
                                existing.senderId === m.senderId &&
                                existing.recipientId === m.recipientId &&
                                Math.abs(new Date(existing.timestamp) - new Date(m.timestamp)) < 10000 // Increased to 10s for slow connections
                            );

                            if (!isDuplicate) {
                                messageMap.set(mId, m);
                            }
                        });

                        return Array.from(messageMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    });
                }
            } catch (err) {
                console.warn('Silent failure syncing messages:', err);
            }
        };

        syncMessagesFromCloud();
        // Poll for new messages every 60s (Reduced for cleaner logs)
        const interval = setInterval(syncMessagesFromCloud, 60000);
        return () => clearInterval(interval);
    }, [isAuthenticated, currentUser]);

    // Production-Level Session Synchronization
    useEffect(() => {
        const syncSessionsFromCloud = async () => {
            if (!isAuthenticated || !currentUser) return;

            try {
                let cloudSessions = [];

                if (currentUser.role === 'parent' && currentUser.childId) {
                    cloudSessions = await sessionAPI.getByChild(currentUser.childId);
                } else if (currentUser.role === 'therapist') {
                    cloudSessions = await sessionAPI.getByTherapist(currentUser.id);
                }

                if (cloudSessions.length > 0) {
                    const normalizedSessions = cloudSessions.map(s => ({
                        ...s,
                        id: s.id || s._id,
                        _id: s.id || s._id,
                        childId: s.childId || s.child_id,
                        therapistId: s.therapistId || s.therapist_id
                    }));

                    setSessions(prev => {
                        const sessionMap = new Map();
                        // Add cloud sessions first (source of truth)
                        normalizedSessions.forEach(s => sessionMap.set(s.id, s));
                        // Add local sessions if they don't exist by ID or content (date + child)
                        prev.forEach(s => {
                            const sId = s.id || s._id;
                            if (!sessionMap.has(sId)) {
                                const isDuplicate = Array.from(sessionMap.values()).some(existing =>
                                    existing.childId === s.childId &&
                                    existing.date === s.date &&
                                    existing.type === s.type
                                );
                                if (!isDuplicate) sessionMap.set(sId, s);
                            }
                        });
                        return Array.from(sessionMap.values());
                    });
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
                        const normalizedGoals = goals.map(g => ({
                            ...g,
                            id: g.id || g._id,
                            _id: g.id || g._id,
                            childId: g.childId || g.child_id
                        }));

                        setSkillGoals(prev => {
                            const goalMap = new Map();
                            normalizedGoals.forEach(g => goalMap.set(g.id, g));
                            prev.forEach(g => {
                                const gId = g.id || g._id;
                                if (!goalMap.has(gId)) {
                                    const isDup = Array.from(goalMap.values()).some(ext =>
                                        ext.childId === g.childId && ext.skillName === g.skillName
                                    );
                                    if (!isDup) goalMap.set(gId, g);
                                }
                            });
                            return Array.from(goalMap.values());
                        });
                    }

                    if (progress.length > 0) {
                        const normalizedProgress = progress.map(p => ({
                            ...p,
                            id: p.id || p._id || `${p.childId}-${p.skillId}`,
                            _id: p.id || p._id,
                            childId: p.childId || p.child_id
                        }));

                        setSkillProgress(prev => {
                            const progMap = new Map();
                            // 1. Seed with other children's data
                            prev.filter(p => (p.childId || p.child_id) !== currentUser.childId).forEach(p => progMap.set(p.id, p));

                            // 2. Load current child's local state as baseline for comparison
                            const childLegacy = prev.filter(p => (p.childId || p.child_id) === currentUser.childId);
                            childLegacy.forEach(p => progMap.set(p.skillName, p));

                            // 3. Merge in Cloud data (Source of Truth)
                            normalizedProgress.forEach(cloud => {
                                const local = progMap.get(cloud.skillName);
                                if (local) {
                                    // Merge cloud data, but keep useful local bits if cloud is sparse
                                    const isCloudSparse = (!cloud.progress || cloud.progress === 0) && (!cloud.therapistNotes || cloud.therapistNotes.trim() === "");
                                    const isLocalRich = (local.progress > 0) || (local.therapistNotes && local.therapistNotes.trim() !== "");

                                    if (isCloudSparse && isLocalRich) {
                                        progMap.set(cloud.skillName, { ...local, id: cloud.id, _id: cloud._id, dbId: cloud._id });
                                    } else {
                                        progMap.set(cloud.skillName, { ...local, ...cloud });
                                    }
                                } else {
                                    progMap.set(cloud.skillName, cloud);
                                }
                            });

                            const final = Array.from(progMap.values()).map(p => ({
                                ...p,
                                id: p.id || p._id || `${p.childId}-${p.skillId}`
                            }));
                            return final.sort((a, b) => (a.order || 0) - (b.order || 0));
                        });
                    }
                }

                // Therapist View: Fetch for their active caseload
                if (currentUser.role === 'therapist') {
                    const therapistKids = kids.filter(k => (k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : [])).includes(currentUser.id));
                    for (const kid of therapistKids) {
                        try {
                            const [goals, progress] = await Promise.all([
                                progressAPI.getGoalsByChild(kid.id),
                                progressAPI.getProgressByChild(kid.id)
                            ]);

                            if (goals.length > 0) {
                                setSkillGoals(prev => {
                                    // Normalize Goal IDs and ensure uniqueness
                                    const normalizedGoals = goals.map(g => ({
                                        ...g,
                                        id: g.id || g._id,
                                        dbId: g._id
                                    }));

                                    const others = prev.filter(g => g.childId !== kid.id);
                                    const kidLegacy = prev.filter(g => g.childId === kid.id);

                                    // Use a Map to deduplicate by skillName for this child
                                    const goalMap = new Map();

                                    // 1. Seed with legacy/mock data for this child
                                    kidLegacy.forEach(g => {
                                        goalMap.set(g.skillName.toLowerCase(), g);
                                    });

                                    // 2. Overwrite with Cloud data (source of truth)
                                    normalizedGoals.forEach(g => {
                                        goalMap.set(g.skillName.toLowerCase(), g);
                                    });

                                    const merged = Array.from(goalMap.values());
                                    return [...others, ...merged];
                                });
                            }

                            if (progress.length > 0) {
                                setSkillProgress(prev => {
                                    const normalizedProgress = progress.map(p => ({
                                        ...p,
                                        id: p.id || p._id || `${p.childId}-${p.skillId}`,
                                        _id: p.id || p._id,
                                        childId: p.childId || p.child_id
                                    }));

                                    const others = prev.filter(p => (p.childId || p.child_id) !== kid.id);
                                    const kidLegacy = prev.filter(p => (p.childId || p.child_id) === kid.id);

                                    const skillMap = new Map();
                                    kidLegacy.forEach(mock => skillMap.set(mock.skillName, mock));

                                    normalizedProgress.forEach(cloud => {
                                        const local = skillMap.get(cloud.skillName);
                                        if (local) {
                                            const isCloudSparse = (!cloud.progress || cloud.progress === 0) && (!cloud.therapistNotes || cloud.therapistNotes.trim() === "");
                                            const isLocalRich = (local.progress > 0) || (local.therapistNotes && local.therapistNotes.trim() !== "");

                                            if (isCloudSparse && isLocalRich) {
                                                skillMap.set(cloud.skillName, { ...local, id: cloud.id, _id: cloud._id });
                                            } else {
                                                skillMap.set(cloud.skillName, { ...local, ...cloud });
                                            }
                                        } else {
                                            skillMap.set(cloud.skillName, cloud);
                                        }
                                    });

                                    const final = [...others, ...Array.from(skillMap.values())].map(p => ({
                                        ...p,
                                        id: p.id || p._id || `${p.childId}-${p.skillId}`
                                    }));
                                    return final.sort((a, b) => (a.order || 0) - (b.order || 0));
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
        const interval = setInterval(syncProgressFromCloud, 120000); // Poll every 2 mins
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
        const interval = setInterval(pollUnreadCounts, 60000); // 60s poll
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
            (m.recipientId === currentUser.id || m.recipient_id === currentUser.id) &&
            !m.read
        );

        incomingUnread.forEach(m => {
            const mId = m.id || m._id || (m.threadId + m.timestamp);
            const senderId = m.senderId || m.sender_id;

            // SECURITY: Never notify for self-sent messages
            if (senderId === currentUser.id) return;

            // Only notify if we haven't notified for this specific message ID
            if (!notifiedMessageIds.current.has(mId)) {
                // Also do a content-based check to prevent double notifications for synced messages
                const contentKey = `${senderId}-${m.content.substring(0, 50)}-${new Date(m.timestamp).getTime() / 1000 | 0}`;
                if (notifiedMessageIds.current.has(contentKey)) return;

                addNotification({
                    type: 'message',
                    title: `New Message from ${m.senderName || 'Parent'}`,
                    message: m.content.substring(0, 60) + (m.content.length > 60 ? '...' : ''),
                    messageId: mId
                });

                notifiedMessageIds.current.add(mId);
                notifiedMessageIds.current.add(contentKey);
            }
        });

        // 2. Clean up notified IDs periodically - DEACTIVATED
        // We stop clearing the cache because if messages aren't perfectly synced 
        // across every poll, clearing the cache causes re-notifications.
        // Memory usage is negligible (a few KB for thousands of IDs).
    }, [messages, isAuthenticated, currentUser]);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ============ Auth Actions ============
    const login = useCallback((role, id) => {
        const user = allUsers.find(u => u.role === role && (id ? u.id === id : true));
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
    }, [allUsers]);

    const logout = useCallback(() => {
        if (currentUser) {
            addAuditLog({
                action: 'USER_LOGOUT',
                userId: currentUser.id,
                userName: currentUser.name,
                details: 'User logged out'
            });
        }

        // Clear all auth data from localStorage to ensure logout is complete
        localStorage.removeItem('parent_token');
        localStorage.removeItem('parent_data');
        localStorage.removeItem('doctor_token');
        localStorage.removeItem('doctor_data');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');

        setCurrentUser(null);
        setIsAuthenticated(false);

        // Notify other hooks (like useAuth) and tabs to sync their state
        window.dispatchEvent(new Event('auth-change'));
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
            ...newSession,
            id: newSession.id || `s${Date.now()}`,
            _id: newSession.id || newSession._id || `s${Date.now()}`,
            date: newSession.date || new Date().toISOString(),
            status: newSession.status || 'scheduled'
        };

        setSessions(prev => {
            const exists = prev.some(s => s.id === sessionWithId.id || (s.date === sessionWithId.date && s.childId === sessionWithId.childId));
            if (exists) return prev;
            return [sessionWithId, ...prev];
        });

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
        return kids.filter(k => (k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : [])).includes(therapistId));
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

    const assignChildToTherapist = useCallback(async (childId, therapistId) => {
        console.log(`[AppProvider] Assigning child ${childId} to therapist ${therapistId}`);
        // 1. Optimistic Update
        setKids(prev => prev.map(k => {
            if (k.id === childId) {
                const currentIds = k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : []);
                if (!currentIds.includes(therapistId)) {
                    const currentStartDates = k.therapy_start_dates || {};
                    return {
                        ...k,
                        therapistIds: [...currentIds, therapistId],
                        therapistId: therapistId,
                        therapy_start_dates: {
                            ...currentStartDates,
                            [therapistId]: new Date().toISOString()
                        }
                    };
                }
            }
            return k;
        }));

        try {
            // 2. API Call
            const response = await userManagementAPI.assignTherapist(childId, therapistId);
            console.log(`[AppProvider] Successfully assigned therapist. API Response:`, response);

            // 3. Final State Sync (using response)
            if (response && response.therapistIds) {
                setKids(prev => prev.map(k =>
                    k.id === childId ? { ...k, therapistIds: response.therapistIds, therapistId: therapistId } : k
                ));
            }

            // 4. Background Refresh
            refreshChildren();

        } catch (err) {
            console.error("Failed to assign therapist:", err);
            // 5. Revert on error via refresh
            refreshChildren();
        }

        addAuditLog({
            action: 'ASSIGN_THERAPIST',
            userId: currentUser?.id,
            userName: currentUser?.name,
            details: `Assigned child ${childId} to therapist ${therapistId}`
        });
    }, [currentUser, refreshChildren, addAuditLog]);

    const unassignChildFromTherapist = useCallback(async (childId, therapistId) => {
        console.log(`[AppProvider] Unassigning child ${childId} from therapist ${therapistId}`);
        // 1. Optimistic Update
        setKids(prev => prev.map(k => {
            if (k.id === childId) {
                const currentIds = k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : []);
                const newIds = currentIds.filter(id => id !== therapistId);
                return {
                    ...k,
                    therapistIds: newIds,
                    therapistId: newIds[0] || null
                };
            }
            return k;
        }));

        try {
            // 2. API Call
            await userManagementAPI.unassignTherapist(childId, therapistId);
            console.log(`[AppProvider] Successfully unassigned therapist via API`);

            // 3. Background Refresh
            refreshChildren();
        } catch (err) {
            console.error("Failed to unassign therapist:", err);
            // 4. Revert on error via refresh
            refreshChildren();
        }

        addAuditLog({
            action: 'UNASSIGN_THERAPIST',
            userId: currentUser?.id,
            userName: currentUser?.name,
            details: `Unassigned child ${childId} from therapist ${therapistId}`
        });
    }, [currentUser, refreshChildren, addAuditLog]);

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

    const getActivityAdherence20Days = useCallback((childId) => {
        const activities = getChildHomeActivities(childId);
        let totalAssigned = 0;
        let totalCompleted = 0;

        activities.forEach(a => {
            const completions = a.completions || [];
            totalAssigned += 20; // 20 days
            totalCompleted += completions.filter(c => {
                const today = new Date();
                const compDate = new Date(c.date);
                const diffDays = Math.ceil((today - compDate) / (1000 * 60 * 60 * 24));
                return c.completed && diffDays <= 20;
            }).length;
        });

        return totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
    }, [getChildHomeActivities]);

    const completeQuickTestGame = useCallback((childId, gameId, gameResults) => {
        setQuickTestProgress(prev => {
            const childProgress = prev[childId] || { completedGames: [] };

            // Check if already completed in this session
            if (childProgress.completedGames.some(g => g.id === gameId)) return prev;

            const updatedGames = [...childProgress.completedGames, { id: gameId, results: gameResults, timestamp: new Date().toISOString() }];

            // If 6 games are completed, generate result
            if (updatedGames.length === 6) {
                const newResult = {
                    id: `qt-${Date.now()}`,
                    childId,
                    date: new Date().toISOString(),
                    games: updatedGames,
                    summary: {
                        score: Math.round(updatedGames.reduce((acc, g) => acc + (g.results?.score || 85), 0) / 6),
                        interpretation: "Child shows significant improvement in task persistence and sensory regulation compared to baseline."
                    }
                };
                setQuickTestResults(prevResults => [newResult, ...prevResults]);
                // Reset progress for next test
                return { ...prev, [childId]: { completedGames: [] } };
            }

            return { ...prev, [childId]: { completedGames: updatedGames } };
        });
    }, []);

    const getLatestQuickTestResult = useCallback((childId) => {
        return quickTestResults.find(r => r.childId === childId);
    }, [quickTestResults]);

    const shareQuickTestResult = useCallback((resultId) => {
        setQuickTestResults(prev => prev.map(r =>
            r.id === resultId ? { ...r, sharedWithTherapist: true } : r
        ));
    }, []);

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
            // Persist to Backend - ENCRYPT BEFORE SENDING
            const backendMessage = {
                thread_id: message.threadId,
                sender_id: message.senderId,
                sender_name: message.senderName,
                sender_role: message.senderRole,
                recipient_id: message.recipientId,
                child_id: message.childId,
                content: cryptoUtils.encrypt(message.content), // ENCRYPT HERE
                type: message.type || 'message'
            };

            const savedMessage = await messagesAPI.send(backendMessage);

            // Update Local State - Use backend ID to prevent duplicates
            const newMessage = {
                ...message,
                id: savedMessage._id || savedMessage.id, // Use backend ID only, no fallback
                _id: savedMessage._id || savedMessage.id,
                timestamp: savedMessage.timestamp || new Date().toISOString(),
                read: false,
                type: message.type || 'message'
            };

            setMessages(prev => {
                const messageId = newMessage.id || newMessage._id;

                // Prevent duplicate by ID
                if (prev.some(m => m.id === messageId || m._id === messageId)) {
                    return prev;
                }

                // Prevent duplicate by content (rapid clicking protection)
                const isDuplicate = prev.some(m =>
                    m.content === newMessage.content &&
                    m.senderId === newMessage.senderId &&
                    m.recipientId === newMessage.recipientId &&
                    Math.abs(new Date(m.timestamp) - new Date(newMessage.timestamp)) < 10000
                );

                if (isDuplicate) return prev;

                return [newMessage, ...prev];
            });
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
        const children = kids.filter(k => (k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : [])).includes(therapistId));
        const completedToday = therapistSessions.filter(s =>
            s.status === 'completed' &&
            s.date.startsWith(new Date().toISOString().split('T')[0])
        ).length;

        return {
            totalChildren: children.length,
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
        users: allUsers,
        realUsers: allUsers,
        refreshUsers,
        kids,
        refreshChildren,
        sessions,
        skillScores,
        roadmap,
        homeActivities,
        messages,
        consentRecords,
        auditLogs,
        cdcMetrics,
        adminStats,
        refreshAdminStats,
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
        assignChildToTherapist,
        unassignChildFromTherapist,

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
        getActivityAdherence20Days,
        completeQuickTestGame,
        getLatestQuickTestResult,
        shareQuickTestResult,
        quickTestProgress,
        quickTestResults,

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

        // Document Actions
        childDocuments,
        getChildDocuments: (childId) => childDocuments.filter(d => d.childId === childId).sort((a, b) => new Date(b.date) - new Date(a.date)),
        addDocument: (doc) => {
            const newDoc = { ...doc, id: `doc-${Date.now()}`, date: new Date().toISOString().split('T')[0] };
            setChildDocuments(prev => [newDoc, ...prev]);
            return newDoc;
        },

        // UI Actions
        setIsLoading
    }), [
        allUsers,
        refreshUsers,
        kids,
        refreshChildren,
        sessions, skillScores, roadmap, homeActivities, messages,
        consentRecords, auditLogs, cdcMetrics, adminStats, refreshAdminStats, currentUser, isAuthenticated,
        notifications, isLoading, login, logout, getChildSessions, getRecentSessions,
        addSession, getSessionsByTherapist, getTodaysSessions, getChildById,
        getChildrenByTherapist, getChildrenByParent, updateChildMood, assignChildToTherapist, unassignChildFromTherapist, getChildSkillScores,
        getLatestSkillScores, getSkillHistory, getChildRoadmap, updateRoadmapProgress,
        completeMilestone, getChildHomeActivities, logActivityCompletion, getActivityAdherence,
        getActivityAdherence20Days, completeQuickTestGame, getLatestQuickTestResult,
        shareQuickTestResult,
        quickTestResults, quickTestProgress,
        getChildMessages, getUnreadCount, sendMessage, markMessageRead, addAuditLog,
        addNotification, clearNotifications, getEngagementTrend, getTherapistStats,
        skillProgress, getChildProgress, updateSkillProgress,
        skillGoals, getChildGoals, updateSkillGoal, addSkillGoal, deleteSkillGoal, deleteSkillProgress,
        childDocuments
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
