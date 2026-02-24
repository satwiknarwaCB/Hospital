/**
 * NeuroBridge™ - Static Data & Constants
 * Used for initial state and lookups
 */

export const USERS = [];
export const CHILDREN = [];
export const SESSIONS = [];
export const SKILL_SCORES = [];
export const ROADMAP = [];
export const HOME_ACTIVITIES = [];
export const MESSAGES = [];
export const CONSENT_RECORDS = [];
export const AUDIT_LOGS = [];
export const CDC_METRICS = {
    activeChildren: 0,
    waitlistSize: 0,
    therapistCount: 0,
    monthlyRevenue: 0,
    revenueTarget: 0,
    totalHours: 0
};
export const SKILL_PROGRESS = [];
export const SKILL_GOALS = [];
export const DOCUMENTS = [];
export const PERIODIC_REVIEWS = [];

export const THERAPY_TYPES = [
    { id: 'st', name: 'Speech Therapy', icon: '🗣️', color: 'bg-blue-500' },
    { id: 'ot', name: 'Occupational Therapy', icon: '👐', color: 'bg-green-500' },
    { id: 'bt', name: 'Behavioral Therapy', icon: '🧠', color: 'bg-purple-500' },
    { id: 'pt', name: 'Physical Therapy', icon: '🏃', color: 'bg-orange-500' },
    { id: 'se', name: 'Special Education', icon: '📚', color: 'bg-indigo-500' }
];
