/**
 * NeuroBridge™ - Static Data & Constants
 * Used for initial state and lookups
 */

export const USERS = [
    {
        id: 'p1',
        name: 'Parent User',
        email: 'parent@example.com',
        role: 'parent',
        childId: 'c1'
    },
    {
        id: 't1',
        name: 'Dr. Smith',
        email: 'doctor@example.com',
        role: 'therapist'
    }
];
export const CHILDREN = [
    {
        id: 'c1',
        name: 'wfini',
        diagnosis: 'Autism Spectrum Disorder',
        age: 6,
        gender: 'Male',
        parent_id: 'p1',
        therapist_id: 't1',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wfini',
        program: ["Speech Therapy", "Occupational Therapy"],
        streak: 7,
        enrollmentDate: '2025-01-01',
        currentMood: '😊 Regulated',
        moodContext: 'Doing great today!',
        gamesUnlocked: false
    }
];
export const SESSIONS = [];
export const SKILL_SCORES = [];
export const ROADMAP = [];
export const HOME_ACTIVITIES = [
    {
        id: 'ha1',
        childId: 'c1',
        domain: 'Communication',
        title: 'Magic Picture Talk',
        description: 'Explore vibrant scenes and describe what you see to build vocabulary.',
        gameType: 'picture-talk',
        duration: 15,
        instructions: [
            'Find a quiet space with your child.',
            'Launch the Magic Picture Talk game.',
            'Encourage your child to describe the items shown on screen.',
            'Ask open-ended questions like "What is the elephant doing?"'
        ],
        tips: 'Allow your child time to process their thoughts before prompting.',
        completions: []
    },
    {
        id: 'ha2',
        childId: 'c1',
        domain: 'Sensory',
        title: 'Calm Bubble World',
        description: 'Interactive bubble popping to practice focus and emotional regulation.',
        gameType: 'calm-bubbles',
        duration: 10,
        instructions: [
            'Start the game and let your child follow the moving bubbles.',
            'Prompt them to breathe deeply as they pop each bubble.',
            'Observe if they stay engaged and calm throughout.'
        ],
        tips: 'Low lighting can help make the bubbles more soothing.',
        completions: []
    },
    {
        id: 'ha3',
        childId: 'c1',
        domain: 'Social Interaction',
        title: 'Good Choice City',
        description: 'Navigate social scenarios and practice making positive choices.',
        gameType: 'aba-choice',
        duration: 20,
        instructions: [
            'Work through the city scenarios together.',
            'Discuss why certain choices are more helpful than others.',
            'Reinforce positive selections with verbal praise.'
        ],
        tips: 'Relate the scenarios to real-life situations they might encounter.',
        completions: []
    },
    {
        id: 'ha4',
        childId: 'c1',
        domain: 'Physical / Motor',
        title: 'Sound Pop Adventure',
        description: 'A rhythmic game to improve reaction time and motor coordination.',
        gameType: 'sound-pop',
        duration: 12,
        instructions: [
            'Ensure the volume is at a comfortable level.',
            'Let your child tap the icons in time with the sounds.',
            'Cheer them on as they hit the rhythm!'
        ],
        tips: 'Use headphones if your child is sensitive to ambient noise.',
        completions: []
    }
];
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
