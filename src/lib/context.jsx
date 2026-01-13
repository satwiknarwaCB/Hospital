// ============================================================
// NeuroBridge™ - Application Context & State Management
// Production-Ready Global State Provider
// ============================================================

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
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
    CDC_METRICS
} from '../data/mockData';

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

    // ============ Auth State ============
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Sync with localStorage on mount and when doctor_data changes
    useEffect(() => {
        const syncAuth = () => {
            const doctorData = localStorage.getItem('doctor_data');
            if (doctorData) {
                try {
                    const doctor = JSON.parse(doctorData);
                    const user = users.find(u => u.email === doctor.email);
                    if (user) {
                        setCurrentUser(user);
                        setIsAuthenticated(true);
                    }
                } catch (err) {
                    console.error('Error syncing auth in AppProvider:', err);
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

    // ============ UI State ============
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

    const sendMessage = useCallback((message) => {
        const newMessage = {
            ...message,
            id: `msg${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false,
            type: message.type || 'message'
        };

        setMessages(prev => [newMessage, ...prev]);
        return newMessage;
    }, []);

    const markMessageRead = useCallback((messageId) => {
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, read: true } : m
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
    const addNotification = useCallback((notification) => {
        const newNotification = {
            ...notification,
            id: `notif${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

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
        clearNotifications,

        // Analytics
        getEngagementTrend,
        getTherapistStats,

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
        addNotification, clearNotifications, getEngagementTrend, getTherapistStats
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
