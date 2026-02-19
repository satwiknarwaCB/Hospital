// ============================================================
// NeuroBridge™ - Complete Data Model
// Production-Ready Mock Data for all Application Entities
// ============================================================

// ============ USERS ============
export const USERS = [
    {
        id: 'p1',
        name: 'Priya Patel',
        email: 'priya.patel@parent.com',
        role: 'parent',
        childId: 'c1',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        phone: '+91 98765 43210',
        joinedAt: '2025-06-15'
    },
    {
        id: 'p2',
        name: 'Arun Sharma',
        email: 'arun.sharma@parent.com',
        role: 'parent',
        childId: 'c2',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        phone: '+91 98765 43211',
        joinedAt: '2025-08-20'
    },
    {
        id: 't1',
        name: 'Dr. Rajesh Kumar',
        email: 'dr.rajesh@therapist.com',
        role: 'therapist',
        specialization: 'Speech & Language Therapy',
        caseload: ['c1', 'c2'],
        avatar: '/therapist_professional_4.png',
        experience: '12 years',
        certifications: ['BCBA', 'SLP-CCC'],
        joinedAt: '2024-01-10'
    },
    {
        id: 't2',
        name: 'Dr. Meera Singh',
        email: 'dr.meera@therapist.com',
        role: 'therapist',
        specialization: 'Occupational Therapy',
        caseload: ['c1', 'c4', 'c5'],
        avatar: '/therapy_session_2.png',
        experience: '8 years',
        certifications: ['OTR/L', 'SIPT'],
        joinedAt: '2024-03-15'
    },
    {
        id: 'cl1',
        name: 'Dr. Ananya Verma',
        email: 'dr.ananya@neurobridge.com',
        role: 'clinical_lead',
        avatar: '/family_clinic_3.png',
        joinedAt: '2023-06-01'
    },
    {
        id: 'a1',
        name: 'Director Anjali Sharma',
        email: 'anjali.sharma@neurobridge.com',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
        joinedAt: '2023-01-01'
    }
];

// ============ CHILDREN ============
export const CHILDREN = [
    {
        id: 'c1',
        name: 'Aarav Patel',
        age: 5,
        dateOfBirth: '2020-03-15',
        diagnosis: 'ASD Level 2',
        diagnosisDate: '2023-01-20',
        photoUrl: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&q=80&w=200',
        parentId: 'p1',
        therapistId: 't1',
        program: ['Speech Therapy'],
        currentMood: '😊 Happy',
        moodContext: 'Engaged well with new sensory toys.',
        streak: 12,
        schoolReadinessScore: 68,
        enrollmentDate: '2025-06-15',
        therapy_start_date: '2025-06-15',
        therapy_type: 'Speech Therapy',
        status: 'active'
    },
    {
        id: 'c2',
        name: 'Diya Sharma',
        age: 6,
        dateOfBirth: '2019-07-22',
        diagnosis: 'ASD Level 1',
        diagnosisDate: '2022-11-10',
        photoUrl: 'https://images.unsplash.com/photo-1519238263496-652d87e02df9?auto=format&fit=crop&q=80&w=200',
        parentId: 'p2',
        therapistId: 't1',
        program: ['Speech Therapy'],
        currentMood: '😐 Calm',
        moodContext: 'Focused during table work.',
        streak: 5,
        schoolReadinessScore: 75,
        enrollmentDate: '2025-08-20',
        therapy_start_date: '2025-08-20',
        therapy_type: 'Speech Therapy',
        status: 'active'
    },
    {
        id: 'c4',
        name: 'Ananya Reddy',
        age: 7,
        dateOfBirth: '2018-05-30',
        diagnosis: 'ASD Level 1',
        diagnosisDate: '2021-08-20',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        parentId: 'p4',
        therapistId: 't2',
        program: ['Occupational Therapy', 'Social Skills'],
        currentMood: '😌 Content',
        moodContext: 'Made good progress in fine motor skills.',
        streak: 15,
        schoolReadinessScore: 82,
        enrollmentDate: '2025-04-10',
        status: 'active'
    },
    {
        id: 'c5',
        name: 'Arjun Nair',
        age: 5,
        dateOfBirth: '2020-09-14',
        diagnosis: 'ASD Level 2',
        diagnosisDate: '2023-06-10',
        photoUrl: 'https://images.unsplash.com/photo-1595254771214-e32e0bc58ca2?auto=format&fit=crop&q=80&w=200',
        parentId: 'p5',
        therapistId: 't2',
        program: ['ABA Therapy', 'Occupational Therapy'],
        currentMood: '🤔 Curious',
        moodContext: 'Exploring new learning materials.',
        streak: 3,
        schoolReadinessScore: 60,
        enrollmentDate: '2025-10-15',
        status: 'active'
    }
];

// ============ SESSIONS ============
export const SESSIONS = [
    {
        id: 's1',
        childId: 'c1',
        date: '2025-12-23T10:00:00',
        type: 'Speech Therapy',
        therapistId: 't1',
        duration: 45,
        status: 'completed',
        engagement: 85,
        emotionalState: 'Regulated',
        activities: ['Picture Exchange', 'Sound Imitation'],
        notes: 'Aarav showed great improvement in "B" sounds today. Excellent focus.',
        aiSummary: 'We had a wonderful session with Aarav today! 🌟 He did a great job with Picture Exchange and Sound Imitation. We noticed he was feeling happy, and his engagement was strong (85%). Keep up the great work at home!',
        wins: ['Mastered "B" sounds', 'High engagement', 'Followed 2-step commands'],
        focusAreas: ['Phoneme production', 'Turn-taking'],
        behaviorTags: ['cooperative', 'attentive', 'responsive']
    },
    {
        id: 's3',
        childId: 'c1',
        date: '2025-12-20T10:00:00',
        type: 'Speech Therapy',
        therapistId: 't1',
        duration: 45,
        status: 'completed',
        engagement: 78,
        emotionalState: 'Neutral',
        activities: ['Vocabulary Building', 'Story Sequencing'],
        notes: 'Good session. Some difficulty with 3-syllable words.',
        aiSummary: 'Aarav had a productive session focusing on vocabulary and storytelling! 📚 He worked hard on building new words and showed great effort. Engagement was solid at 78%.',
        wins: ['Learned 5 new words', 'Improved story sequencing'],
        focusAreas: ['Multi-syllable words', 'Narrative skills'],
        behaviorTags: ['focused', 'needs-prompting']
    },
    {
        id: 's4',
        childId: 'c1',
        date: '2025-12-18T10:00:00',
        type: 'Speech Therapy',
        therapistId: 't1',
        duration: 45,
        status: 'completed',
        engagement: 92,
        emotionalState: 'Regulated',
        activities: ['Sound Imitation', 'Social Greetings'],
        notes: 'Outstanding session! Aarav initiated greetings independently.',
        aiSummary: 'What an amazing session! 🎉 Aarav surprised us by saying "Hello" to everyone without prompting. His sound imitation was excellent with 92% engagement!',
        wins: ['Independent greetings', 'Excellent imitation', 'Self-initiated communication'],
        focusAreas: ['Social initiation', 'Expressive language'],
        behaviorTags: ['independent', 'motivated', 'happy']
    },
    {
        id: 's5',
        childId: 'c2',
        date: '2025-12-23T11:00:00',
        type: 'Speech Therapy',
        therapistId: 't1',
        duration: 60,
        status: 'completed',
        engagement: 65,
        emotionalState: 'Dysregulated',
        activities: ['Token Economy', 'Break Requests'],
        notes: 'Diya had difficulty regulating today. Needed frequent breaks.',
        aiSummary: 'We had a challenging but productive session with Diya today. 💪 She practiced asking for breaks appropriately and earned her tokens. We\'re working on building her self-regulation skills.',
        wins: ['Used break card appropriately', 'Completed token board'],
        focusAreas: ['Self-regulation', 'Functional communication'],
        behaviorTags: ['needs-support', 'trying-hard']
    },
    // c3 session entry removed – child no longer on therapist caseload
];

// ============ SKILL SCORES ============
export const SKILL_SCORES = [
    // Aarav's skills over time
    { id: 'sk1', childId: 'c1', domain: 'Language - Receptive', score: 72, maxScore: 100, date: '2025-12-23', trend: 'improving' },
    { id: 'sk2', childId: 'c1', domain: 'Language - Expressive', score: 65, maxScore: 100, date: '2025-12-23', trend: 'improving' },
    { id: 'sk3', childId: 'c1', domain: 'Sensory Integration', score: 58, maxScore: 100, date: '2025-12-23', trend: 'stable' },
    { id: 'sk4', childId: 'c1', domain: 'Social Interaction', score: 55, maxScore: 100, date: '2025-12-23', trend: 'improving' },
    { id: 'sk5', childId: 'c1', domain: 'Attention Span', score: 70, maxScore: 100, date: '2025-12-23', trend: 'improving' },
    { id: 'sk6', childId: 'c1', domain: 'Emotional Regulation', score: 62, maxScore: 100, date: '2025-12-23', trend: 'stable' },
    { id: 'sk7', childId: 'c1', domain: 'Motor Skills', score: 75, maxScore: 100, date: '2025-12-23', trend: 'improving' },
    { id: 'sk8', childId: 'c1', domain: 'Behavioral Adaptability', score: 60, maxScore: 100, date: '2025-12-23', trend: 'attention' },

    // Historical data for Aarav (last 4 weeks)
    { id: 'sk1h1', childId: 'c1', domain: 'Language - Receptive', score: 68, maxScore: 100, date: '2025-12-16', trend: 'improving' },
    { id: 'sk1h2', childId: 'c1', domain: 'Language - Receptive', score: 64, maxScore: 100, date: '2025-12-09', trend: 'improving' },
    { id: 'sk1h3', childId: 'c1', domain: 'Language - Receptive', score: 60, maxScore: 100, date: '2025-12-02', trend: 'stable' },
    { id: 'sk1h4', childId: 'c1', domain: 'Language - Receptive', score: 58, maxScore: 100, date: '2025-11-25', trend: 'stable' },

    { id: 'sk2h1', childId: 'c1', domain: 'Language - Expressive', score: 60, maxScore: 100, date: '2025-12-16', trend: 'improving' },
    { id: 'sk2h2', childId: 'c1', domain: 'Language - Expressive', score: 55, maxScore: 100, date: '2025-12-09', trend: 'stable' },
    { id: 'sk2h3', childId: 'c1', domain: 'Language - Expressive', score: 52, maxScore: 100, date: '2025-12-02', trend: 'stable' },
    { id: 'sk2h4', childId: 'c1', domain: 'Language - Expressive', score: 50, maxScore: 100, date: '2025-11-25', trend: 'stable' },

    // Diya's skills
    { id: 'sk9', childId: 'c2', domain: 'Language - Receptive', score: 78, maxScore: 100, date: '2025-12-23', trend: 'stable' },
    { id: 'sk10', childId: 'c2', domain: 'Language - Expressive', score: 72, maxScore: 100, date: '2025-12-23', trend: 'improving' },
    { id: 'sk11', childId: 'c2', domain: 'Social Interaction', score: 65, maxScore: 100, date: '2025-12-23', trend: 'attention' },
    { id: 'sk12', childId: 'c2', domain: 'Emotional Regulation', score: 45, maxScore: 100, date: '2025-12-23', trend: 'attention' }
];

// ============ ROADMAP ============
export const ROADMAP = [
    {
        id: 'r1',
        childId: 'c1',
        domain: 'Communication',
        title: 'Uses 2-word phrases consistently',
        description: 'Child will use 2-word phrases (noun + verb or adjective + noun) in 80% of opportunities.',
        targetDate: '2026-02-01',
        status: 'in-progress',
        progress: 65,
        confidence: 85,
        milestones: [
            { id: 'm1', title: 'Combines noun + verb', completed: true, date: '2025-11-15' },
            { id: 'm2', title: 'Uses 10 different combinations', completed: true, date: '2025-12-10' },
            { id: 'm3', title: 'Generalizes to home', completed: false, date: null },
            { id: 'm4', title: '80% accuracy in clinic', completed: false, date: null }
        ],
        therapistNotes: 'Aarav is making excellent progress. Expect to meet goal ahead of schedule.',
        aiPrediction: 'Based on current trajectory, goal likely to be achieved by mid-January.',
        priority: 'high'
    },
    {
        id: 'r2',
        childId: 'c1',
        domain: 'Motor Skills',
        title: 'Buttons large buttons independently',
        targetDate: '2026-01-15',
        description: 'Child will button and unbutton large buttons on clothing without assistance.',
        status: 'completed',
        progress: 100,
        confidence: 100,
        milestones: [
            { id: 'm5', title: 'Grasps button with pincer grip', completed: true, date: '2025-10-20' },
            { id: 'm6', title: 'Pushes button through hole', completed: true, date: '2025-11-05' },
            { id: 'm7', title: 'Independent buttoning', completed: true, date: '2025-12-18' }
        ],
        therapistNotes: 'Goal achieved! Moving to small buttons next.',
        completedDate: '2025-12-18',
        priority: 'medium'
    },
    {
        id: 'r3',
        childId: 'c1',
        domain: 'Social Interaction',
        title: 'Initiates greetings with peers',
        targetDate: '2026-03-15',
        description: 'Child will independently greet familiar peers in 70% of opportunities.',
        status: 'in-progress',
        progress: 40,
        confidence: 70,
        milestones: [
            { id: 'm8', title: 'Waves when prompted', completed: true, date: '2025-11-01' },
            { id: 'm9', title: 'Says "Hi" with model', completed: true, date: '2025-12-15' },
            { id: 'm10', title: 'Independent greetings to adults', completed: false, date: null },
            { id: 'm11', title: 'Independent greetings to peers', completed: false, date: null }
        ],
        therapistNotes: 'Recent breakthrough with independent greetings to therapists!',
        priority: 'high'
    },
    {
        id: 'r4',
        childId: 'c1',
        domain: 'Emotional Regulation',
        title: 'Uses calm-down strategies',
        targetDate: '2026-04-01',
        description: 'Child will use taught calm-down strategies when dysregulated with minimal prompting.',
        status: 'in-progress',
        progress: 30,
        confidence: 60,
        milestones: [
            { id: 'm12', title: 'Identifies emotions', completed: true, date: '2025-12-01' },
            { id: 'm13', title: 'Uses breathing with full prompt', completed: false, date: null },
            { id: 'm14', title: 'Requests break appropriately', completed: false, date: null },
            { id: 'm15', title: 'Self-regulates with minimal support', completed: false, date: null }
        ],
        priority: 'medium'
    },
    {
        id: 'r5',
        childId: 'c2',
        domain: 'Self-Regulation',
        title: 'Tolerates transitions without meltdowns',
        targetDate: '2026-02-28',
        description: 'Child will transition between activities with less than 2 protests per session.',
        status: 'at-risk',
        progress: 25,
        confidence: 45,
        milestones: [
            { id: 'm16', title: 'Responds to transition warning', completed: true, date: '2025-11-20' },
            { id: 'm17', title: 'Uses visual schedule', completed: false, date: null },
            { id: 'm18', title: 'Transitions with timer', completed: false, date: null }
        ],
        therapistNotes: 'Diya is struggling with this area. Need to adjust approach.',
        aiPrediction: 'Current trajectory suggests goal may need extension. Consider additional support.',
        priority: 'high'
    },
    // Diya's additional roadmap goals (mirroring Aarav's structure)
    {
        id: 'r6',
        childId: 'c2',
        domain: 'Communication',
        title: 'Uses 2-word phrases consistently',
        description: 'Child will use 2-word phrases (noun + verb or adjective + noun) in 80% of opportunities.',
        targetDate: '2026-02-01',
        status: 'in-progress',
        progress: 65,
        confidence: 85,
        milestones: [
            { id: 'm19', title: 'Combines noun + verb', completed: true, date: '2025-11-15' },
            { id: 'm20', title: 'Uses 10 different combinations', completed: true, date: '2025-12-10' },
            { id: 'm21', title: 'Generalizes to home', completed: false, date: null },
            { id: 'm22', title: '80% accuracy in clinic', completed: false, date: null }
        ],
        therapistNotes: 'Diya is beginning to use 2-word phrases more consistently. Continue modeling at home.',
        aiPrediction: 'Based on current trajectory, goal likely to be achieved by mid-January.',
        priority: 'high'
    },
    {
        id: 'r7',
        childId: 'c2',
        domain: 'Social Interaction',
        title: 'Initiates greetings with peers',
        targetDate: '2026-03-15',
        description: 'Child will independently greet familiar peers in 70% of opportunities.',
        status: 'in-progress',
        progress: 40,
        confidence: 70,
        milestones: [
            { id: 'm23', title: 'Waves when prompted', completed: true, date: '2025-11-01' },
            { id: 'm24', title: 'Says "Hi" with model', completed: true, date: '2025-12-15' },
            { id: 'm25', title: 'Independent greetings to adults', completed: false, date: null },
            { id: 'm26', title: 'Independent greetings to peers', completed: false, date: null }
        ],
        therapistNotes: 'Recent breakthrough with independent greetings to therapists!',
        aiPrediction: 'Based on current progress, this goal is likely to be achieved with additional focus.',
        priority: 'high'
    },
    {
        id: 'r8',
        childId: 'c2',
        domain: 'Emotional Regulation',
        title: 'Uses calm-down strategies',
        targetDate: '2026-04-01',
        description: 'Child will use taught calm-down strategies when dysregulated with minimal prompting.',
        status: 'in-progress',
        progress: 30,
        confidence: 60,
        milestones: [
            { id: 'm27', title: 'Identifies emotions', completed: true, date: '2025-12-01' },
            { id: 'm28', title: 'Uses breathing with full prompt', completed: false, date: null },
            { id: 'm29', title: 'Requests break appropriately', completed: false, date: null },
            { id: 'm30', title: 'Self-regulates with minimal support', completed: false, date: null }
        ],
        therapistNotes: 'We are introducing calm-down strategies and helping Diya use them with support.',
        aiPrediction: 'Based on current progress, this goal is likely to be achieved with additional focus.',
        priority: 'medium'
    }
];

// ============ HOME ACTIVITIES ============
export const HOME_ACTIVITIES = [
    {
        id: 'ha1',
        childId: 'c1',
        title: 'Picture Naming Game',
        description: 'Show pictures of common objects and ask Aarav to name them. Celebrate each attempt!',
        duration: 10,
        frequency: 'daily',
        domain: 'Language',
        gameType: 'picture-talk',
        videoUrl: null,
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400',
        instructions: [
            'Gather 5-10 pictures of familiar objects',
            'Show one picture at a time',
            'Wait 5 seconds for response',
            'If no response, model the word clearly',
            'Celebrate all attempts with praise!'
        ],
        tips: 'Use items Aarav loves to keep him motivated.',
        assignedDate: '2025-12-23',
        completions: [
            { date: '2025-12-23', completed: true, parentNotes: 'Did great! Named 6 out of 8 pictures.' },
            { date: '2025-12-22', completed: true, parentNotes: 'Good session, a bit tired today.' },
            { date: '2025-12-21', completed: false, parentNotes: null }
        ]
    },
    {
        id: 'ha1-sound',
        childId: 'c1',
        title: 'Sound Adventure',
        description: 'Practice recognizing letter sounds with Gajju the Elephant.',
        duration: 5,
        frequency: 'daily',
        domain: 'Language',
        gameType: 'sound-pop',
        instructions: [
            'Launch the sound adventure game',
            'Encourage Aarav to listen to the sound',
            'Help him tap the matching letter'
        ],
        assignedDate: '2025-12-23',
        completions: []
    },
    {
        id: 'ha2',
        childId: 'c1',
        title: 'Sensory Bubble Time',
        description: 'Engage in a calming bubble breathing exercise to relax and regulate.',
        duration: 15,
        frequency: 'daily',
        domain: 'Sensory',
        gameType: 'calm-bubbles',
        instructions: [
            'Launch the calm bubble world',
            'Breathe in as the circle grows',
            'Breathe out as the circle shrinks'
        ],
        tips: 'Perfect for cooldown after therapy or before bedtime.',
        assignedDate: '2025-12-20',
        completions: []
    },
    {
        id: 'ha3',
        childId: 'c1',
        title: 'Joint Attention Practice',
        description: 'Practice pointing and shared looking during book reading.',
        duration: 10,
        frequency: 'daily',
        domain: 'Social',
        instructions: [
            'Choose a favorite picture book',
            'Point to pictures and wait for Aarav to look',
            'Say the name of what you point to',
            'Encourage Aarav to point to show you things',
            'Follow his lead if he points elsewhere'
        ],
        assignedDate: '2025-12-23',
        completions: []
    },
    // Diya Sharma's Home Activities
    {
        id: 'ha4',
        childId: 'c2',
        title: 'Picture Naming Game',
        description: 'Show pictures of common objects and ask Diya to name them. Celebrate each attempt!',
        duration: 10,
        frequency: 'daily',
        domain: 'Language',
        gameType: 'picture-talk',
        videoUrl: null,
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400',
        instructions: [
            'Gather 5-10 pictures of familiar objects',
            'Show one picture at a time',
            'Wait 5 seconds for response',
            'If no response, model the word clearly',
            'Celebrate all attempts with praise!'
        ],
        tips: 'Use items Diya loves to keep her motivated.',
        assignedDate: '2025-12-23',
        completions: [
            { date: '2025-12-23', completed: true, parentNotes: 'Did great! Named 5 out of 7 pictures.' },
            { date: '2025-12-22', completed: true, parentNotes: 'Good session, focused well today.' },
            { date: '2025-12-21', completed: false, parentNotes: null }
        ]
    },
    {
        id: 'ha5',
        childId: 'c2',
        title: 'Turn-Taking Practice',
        description: 'Practice taking turns during simple games or activities to build social skills.',
        duration: 15,
        frequency: 'daily',
        domain: 'Social',
        instructions: [
            'Choose a simple turn-taking game (blocks, puzzles, etc.)',
            'Model "my turn" and "your turn" clearly',
            'Use visual cues like pointing or a turn card',
            'Celebrate when Diya waits for her turn',
            'Keep sessions short and fun'
        ],
        tips: 'Start with activities Diya enjoys to maintain engagement.',
        assignedDate: '2025-12-20',
        completions: [
            { date: '2025-12-23', completed: true, parentNotes: 'Great turn-taking today!' },
            { date: '2025-12-22', completed: true, parentNotes: 'Needed some reminders but did well.' }
        ]
    },
    {
        id: 'ha6',
        childId: 'c2',
        title: 'Emotion Identification Practice',
        description: 'Help Diya identify and express emotions using pictures, books, or mirrors.',
        duration: 10,
        frequency: 'daily',
        domain: 'Social',
        instructions: [
            'Use emotion cards or pictures showing different feelings',
            'Point to each emotion and name it clearly',
            'Ask Diya to point to how she feels',
            'Model emotions with facial expressions',
            'Use mirrors to practice making different faces'
        ],
        tips: 'Keep it playful and use Diya\'s favorite characters or books.',
        assignedDate: '2025-12-23',
        completions: [
            { date: '2025-12-23', completed: true, parentNotes: 'Identified happy and sad correctly!' }
        ]
    },
    {
        id: 'ha-aba',
        childId: 'c1',
        title: 'Good Choice City',
        description: 'Practice social choices and behavior with interactive stories.',
        duration: 5,
        frequency: 'daily',
        domain: 'Behavior',
        gameType: 'aba-choice',
        instructions: ['Launch the game and help Aarav choose the thumbs-up behavior.'],
        assignedDate: '2025-12-23',
        completions: []
    },
    {
        id: 'ha-ot',
        childId: 'c1',
        title: 'Tricky Trails',
        description: 'Improve fine motor skills by tracing fun paths with Gajju.',
        duration: 7,
        frequency: 'daily',
        domain: 'Motor',
        gameType: 'ot-trace',
        instructions: ['Encourage Aarav to trace the line from start to finish.'],
        assignedDate: '2025-12-23',
        completions: []
    }
];

// ============ MESSAGES ============
export const MESSAGES = [
    {
        id: 'msg1',
        threadId: 'thread1',
        senderId: 't1',
        senderName: 'Dr. Rajesh Kumar',
        senderRole: 'therapist',
        recipientId: 'p1',
        childId: 'c1',
        subject: 'Great progress this week!',
        content: 'Hi Priya! I wanted to share that Aarav had an excellent week. His speech sounds are really coming along, especially the "B" sounds we\'ve been working on. The home practice is making a difference!',
        timestamp: '2025-12-23T16:30:00',
        read: true,
        type: 'update'
    },
    {
        id: 'msg2',
        threadId: 'thread1',
        senderId: 'p1',
        senderName: 'Priya Patel',
        senderRole: 'parent',
        recipientId: 't1',
        childId: 'c1',
        content: 'Thank you so much, Dr. Rajesh! We\'ve been practicing every day. He loves the picture naming game. Is there anything else we should focus on this week?',
        timestamp: '2025-12-23T17:15:00',
        read: true,
        type: 'reply'
    },
    {
        id: 'msg3',
        threadId: 'thread1',
        senderId: 't1',
        senderName: 'Dr. Rajesh Kumar',
        senderRole: 'therapist',
        recipientId: 'p1',
        childId: 'c1',
        content: 'That\'s wonderful to hear! This week, let\'s also add some 2-word phrase practice. Try saying things like "want juice" or "more cookie" and encourage him to repeat. I\'ll send over a specific activity guide shortly.',
        timestamp: '2025-12-23T17:45:00',
        read: false,
        type: 'reply'
    },
    {
        id: 'msg4',
        threadId: 'thread2',
        senderId: 'system',
        senderName: 'NeuroBridge AI',
        senderRole: 'system',
        recipientId: 'p1',
        childId: 'c1',
        subject: 'Weekly Progress Summary',
        content: '🌟 **This Week\'s Highlights for Aarav:**\n\n✅ Completed 3 therapy sessions\n✅ Engagement average: 85%\n✅ New milestone achieved: Mastered "B" sounds\n✅ Home activity streak: 12 days! 🔥\n\n**Focus for Next Week:**\n- Continue 2-word phrase practice\n- Sensory play with new textures\n\nKeep up the amazing work! You\'re doing great! 💪',
        timestamp: '2025-12-22T09:00:00',
        read: true,
        type: 'weekly-summary'
    },
    // ============ Messages for Parent p2 (Arun Sharma) - Child c2 (Diya) ============
    {
        id: 'msg5',
        threadId: 'thread3',
        senderId: 't1',
        senderName: 'Dr. Rajesh Kumar',
        senderRole: 'therapist',
        recipientId: 'p2',
        childId: 'c2',
        subject: "Update on Diya's social skills",
        content: "Hello Arun! Diya had a good session today. We're focusing on peer interaction and turn-taking. She's showing good progress with structured play activities. I'd suggest practicing turn-taking games at home.",
        timestamp: '2025-12-23T15:00:00',
        read: true,
        type: 'update'
    },
    {
        id: 'msg6',
        threadId: 'thread3',
        senderId: 'p2',
        senderName: 'Arun Sharma',
        senderRole: 'parent',
        recipientId: 't1',
        childId: 'c2',
        content: 'Thanks for the update, Dr. Rajesh. We noticed Diya has been a bit more withdrawn lately. Is this something we should be concerned about?',
        timestamp: '2025-12-23T16:00:00',
        read: true,
        type: 'reply'
    },
    {
        id: 'msg7',
        threadId: 'thread3',
        senderId: 't1',
        senderName: 'Dr. Rajesh Kumar',
        senderRole: 'therapist',
        recipientId: 'p2',
        childId: 'c2',
        content: "That's a great observation. Some fluctuation is normal. Let's monitor it over the next week. I'll add some specific social-emotional exercises to her program.",
        timestamp: '2025-12-23T16:30:00',
        read: false,
        type: 'reply'
    },
    {
        id: 'msg8',
        threadId: 'thread4',
        senderId: 'system',
        senderName: 'NeuroBridge AI',
        senderRole: 'system',
        recipientId: 'p2',
        childId: 'c2',
        subject: 'Weekly Progress Summary',
        content: "🌟 **This Week's Highlights for Diya:**\n\n✅ Completed 2 therapy sessions\n✅ Engagement average: 72%\n✅ Focus area: Social interaction\n\n**Focus for Next Week:**\n- Turn-taking practice\n- Emotion identification games\n\nDiya is making steady progress! 💪",
        timestamp: '2025-12-22T09:00:00',
        read: true,
        type: 'weekly-summary'
    }
];

// ============ CONSENT RECORDS ============
export const CONSENT_RECORDS = [
    {
        id: 'consent1',
        childId: 'c1',
        parentId: 'p1',
        type: 'data-collection',
        description: 'Consent for therapy session data collection and storage',
        grantedAt: '2025-06-15T10:00:00',
        expiresAt: '2026-06-15T10:00:00',
        status: 'active'
    },
    {
        id: 'consent2',
        childId: 'c1',
        parentId: 'p1',
        type: 'ai-analysis',
        description: 'Consent for AI-powered progress analysis and recommendations',
        grantedAt: '2025-06-15T10:00:00',
        expiresAt: '2026-06-15T10:00:00',
        status: 'active'
    },
    {
        id: 'consent3',
        childId: 'c1',
        parentId: 'p1',
        type: 'photo-video',
        description: 'Consent for photo/video recording during sessions',
        grantedAt: '2025-06-15T10:00:00',
        expiresAt: '2026-06-15T10:00:00',
        status: 'active'
    }
];

// ============ AUDIT LOGS ============
export const AUDIT_LOGS = [
    {
        id: 'audit1',
        action: 'SESSION_CREATED',
        userId: 't1',
        userName: 'Dr. Rajesh Kumar',
        targetType: 'session',
        targetId: 's1',
        details: 'Created session for Aarav Patel',
        timestamp: '2025-12-23T11:00:00',
        ipAddress: '192.168.1.100'
    },
    {
        id: 'audit2',
        action: 'ROADMAP_UPDATED',
        userId: 't1',
        userName: 'Dr. Rajesh Kumar',
        targetType: 'roadmap',
        targetId: 'r1',
        details: 'Updated milestone progress for "Uses 2-word phrases"',
        timestamp: '2025-12-23T11:30:00',
        ipAddress: '192.168.1.100'
    },
    {
        id: 'audit3',
        action: 'PARENT_VIEWED_REPORT',
        userId: 'p1',
        userName: 'Priya Patel',
        targetType: 'session',
        targetId: 's1',
        details: 'Parent viewed session report',
        timestamp: '2025-12-23T12:00:00',
        ipAddress: '192.168.1.105'
    }
];

// ============ CDC METRICS ============
export const CDC_METRICS = {
    activeChildren: 45,
    waitlistSize: 8,
    therapistCount: 12,
    monthlyRevenue: 425000,
    revenueTarget: 500000,
    parentEngagementRate: 87,
    therapyCompletionRate: 94,
    avgSessionsPerWeek: 156,
    dropoutRisk: [
        { childId: 'c2', name: 'Diya Sharma', riskLevel: 'medium', reason: 'Engagement decline' }
    ],
    upcomingRenewals: 5,
    complianceScore: 96,
    therapistUtilization: {
        't1': { name: 'Dr. Rajesh Kumar', utilization: 85, caseload: 15 },
        't2': { name: 'Dr. Meera Singh', utilization: 78, caseload: 12 }
    }
};

// ============ THERAPY TYPES ============
export const THERAPY_TYPES = [
    { id: 'speech', name: 'Speech Therapy', color: '#4F46E5', icon: '🗣️' },
    { id: 'ot', name: 'Occupational Therapy', color: '#10B981', icon: '🖐️' },
    { id: 'aba', name: 'ABA Therapy', color: '#F59E0B', icon: '🎯' },
    { id: 'sensory', name: 'Sensory Integration', color: '#EC4899', icon: '✨' },
    { id: 'social', name: 'Social Skills', color: '#8B5CF6', icon: '👥' },
    { id: 'music', name: 'Music Therapy', color: '#06B6D4', icon: '🎵' }
];

// ============ ACTIVITY LIBRARY ============
export const ACTIVITY_LIBRARY = [
    { id: 'act1', name: 'Picture Exchange', domain: 'Communication', therapyType: 'speech' },
    { id: 'act2', name: 'Sound Imitation', domain: 'Communication', therapyType: 'speech' },
    { id: 'act3', name: 'Vocabulary Building', domain: 'Communication', therapyType: 'speech' },
    { id: 'act4', name: 'Story Sequencing', domain: 'Communication', therapyType: 'speech' },
    { id: 'act5', name: 'Social Greetings', domain: 'Social', therapyType: 'social' },
    { id: 'act6', name: 'Blocks Stacking', domain: 'Motor', therapyType: 'ot' },
    { id: 'act7', name: 'Sensory Play', domain: 'Sensory', therapyType: 'sensory' },
    { id: 'act8', name: 'Social Story', domain: 'Social', therapyType: 'social' },
    { id: 'act9', name: 'Token Economy', domain: 'Behavior', therapyType: 'aba' },
    { id: 'act10', name: 'Break Requests', domain: 'Communication', therapyType: 'aba' },
    { id: 'act11', name: 'Music Therapy Integration', domain: 'Engagement', therapyType: 'music' },
    { id: 'act12', name: 'Vocal Play', domain: 'Communication', therapyType: 'speech' },
    { id: 'act13', name: 'Fine Motor Activities', domain: 'Motor', therapyType: 'ot' },
    { id: 'act14', name: 'Gross Motor Activities', domain: 'Motor', therapyType: 'ot' },
    { id: 'act15', name: 'Peer Interaction', domain: 'Social', therapyType: 'social' }
];
// ============ SKILL PROGRESS (Child Progress Tracking) ============
/**
 * Daily, Weekly, and Monthly tracking for real-life functional skills.
 * Includes status, progress, history, and therapist-parent communication notes.
 */
export const SKILL_PROGRESS = [
    // Aarav Patel (c1) - 10 Core Functional Skills
    {
        id: 'c1-holding-spoon',
        childId: 'c1',
        skillId: 'holding-spoon',
        skillName: 'Holding a Spoon',
        category: 'Adaptive / OT',
        icon: 'spoon',
        status: 'In Progress',
        progress: 65,
        order: 1,
        therapistNotes: 'Aarav is showing better grip stability. Still needs slight physical prompting for 3-finger grip.',
        successNote: 'Held spoon independently for 2 minutes during lunch! 🥣',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'In Progress', progress: 65, remarks: 'Improved grip' },
            { date: '2025-12-16', status: 'In Progress', progress: 50, remarks: 'Starting to hold' },
            { date: '2025-12-01', status: 'Not Started', progress: 10, remarks: 'Initial assessment' }
        ]
    },
    {
        id: 'c1-eating-spoon',
        childId: 'c1',
        skillId: 'eating-spoon',
        skillName: 'Eating with a Spoon',
        category: 'Adaptive / OT',
        icon: 'utensils',
        status: 'In Progress',
        progress: 40,
        order: 2,
        therapistNotes: 'Coordination between scooping and bringing to mouth is improving.',
        successNote: 'Successfully scooped 3 bites without spilling!',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'In Progress', progress: 40, remarks: 'Better scooping' },
            { date: '2025-12-16', status: 'In Progress', progress: 30, remarks: 'Frequent spilling' }
        ]
    },
    {
        id: 'c1-drinking-glass',
        childId: 'c1',
        skillId: 'drinking-glass',
        skillName: 'Drinking Water from a Glass',
        category: 'Adaptive / OT',
        icon: 'cup',
        status: 'In Progress',
        progress: 75,
        order: 3,
        therapistNotes: 'Controls the tilt well. Occasionally bites the rim.',
        successNote: 'Drank half a glass without any water spilling on shirt.',
        lastUpdated: '2025-12-22',
        history: [
            { date: '2025-12-22', status: 'In Progress', progress: 75 },
            { date: '2025-12-15', status: 'In Progress', progress: 60 }
        ]
    },
    {
        id: 'c1-buttoning-clothes',
        childId: 'c1',
        skillId: 'buttoning-clothes',
        skillName: 'Buttoning Clothes',
        category: 'Adaptive / OT',
        icon: 'shirt',
        status: 'Not Started',
        progress: 15,
        order: 4,
        therapistNotes: 'Fine motor strength is building up. Will focus on larger buttons first next week.',
        successNote: 'Attempted to push a large button through the hole with assist.',
        lastUpdated: '2025-12-21',
        history: [
            { date: '2025-12-21', status: 'Not Started', progress: 15 }
        ]
    },
    {
        id: 'c1-eye-contact',
        childId: 'c1',
        skillId: 'eye-contact',
        skillName: 'Maintaining Eye Contact',
        category: 'Social / Behavioral',
        icon: 'eye',
        status: 'Achieved',
        progress: 90,
        order: 5,
        therapistNotes: 'Consistency in eye contact during greetings is excellent.',
        successNote: 'Maintained 5s eye contact independently during session.',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'Achieved', progress: 90 },
            { date: '2025-12-16', status: 'In Progress', progress: 70 },
            { date: '2025-12-01', status: 'In Progress', progress: 45 }
        ]
    },
    {
        id: 'c1-one-step-instructions',
        childId: 'c1',
        skillId: 'one-step-instructions',
        skillName: 'Following One-step Instructions',
        category: 'Cognitive / Speech',
        icon: 'list',
        status: 'Achieved',
        progress: 100,
        order: 6,
        therapistNotes: 'Follows "Sit down", "Give me", "Look" commands perfectly.',
        successNote: 'Instantly sat down when I said "Sit on the chair".',
        lastUpdated: '2025-12-22',
        history: [
            { date: '2025-12-22', status: 'Achieved', progress: 100 },
            { date: '2025-12-05', status: 'In Progress', progress: 80 }
        ]
    },
    {
        id: 'c1-two-step-instructions',
        childId: 'c1',
        skillId: 'two-step-instructions',
        skillName: 'Following Two-step Instructions',
        category: 'Cognitive / Speech',
        icon: 'list-ordered',
        status: 'In Progress',
        progress: 55,
        order: 7,
        therapistNotes: 'Working on processing the second part of the instruction. Visual cues help.',
        successNote: 'Successfully "Picked up block and put in box" with one prompt.',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'In Progress', progress: 55 },
            { date: '2025-12-16', status: 'In Progress', progress: 40 }
        ]
    },
    {
        id: 'c1-sound-imitation',
        childId: 'c1',
        skillId: 'sound-imitation',
        skillName: 'Sound / Word Imitation',
        category: 'Communication / Speech',
        icon: 'mic',
        status: 'In Progress',
        progress: 80,
        order: 8,
        therapistNotes: 'Imitating "B", "P", "M" sounds consistently. Moving to 2-word phrases.',
        successNote: 'Clearly repeated "Ba-ba" and "Ma-ma" today! 🗣️',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'In Progress', progress: 80 },
            { date: '2025-12-16', status: 'In Progress', progress: 65 }
        ]
    },
    {
        id: 'c1-sitting-tolerance',
        childId: 'c1',
        skillId: 'sitting-tolerance',
        skillName: 'Sitting Tolerance',
        category: 'Behavioral',
        icon: 'clock',
        status: 'In Progress',
        progress: 60,
        order: 9,
        therapistNotes: 'Currently sitting for 12-15 minutes. Goal is 25 minutes of table time.',
        successNote: 'Sat for 15 minutes straight during sensory play!',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'In Progress', progress: 60 },
            { date: '2025-12-16', status: 'In Progress', progress: 45 },
            { date: '2025-12-02', status: 'In Progress', progress: 30 }
        ]
    },

    // Diya Sharma (c2) - 10 Core Functional Skills
    {
        id: 'sp11',
        childId: 'c2',
        skillName: 'Holding a Spoon',
        category: 'Adaptive / OT',
        icon: 'spoon',
        status: 'Achieved',
        progress: 95,
        therapistNotes: 'Diya has excellent spoon control. Transitioning to smaller utensils.',
        successNote: 'Used a small tea spoon independently today!',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'Achieved', progress: 95 },
            { date: '2025-12-10', status: 'In Progress', progress: 80 }
        ]
    },
    {
        id: 'sp12',
        childId: 'c2',
        skillName: 'Eating with a Spoon',
        category: 'Adaptive / OT',
        icon: 'utensils',
        status: 'In Progress',
        progress: 70,
        therapistNotes: 'Self-feeding is becoming much cleaner. Working on speed.',
        successNote: 'Completed entire bowl of cereal without any help.',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'In Progress', progress: 70 },
            { date: '2025-12-12', status: 'In Progress', progress: 55 }
        ]
    },
    {
        id: 'sp13',
        childId: 'c2',
        skillName: 'Drinking Water from a Glass',
        category: 'Adaptive / OT',
        icon: 'cup',
        status: 'Achieved',
        progress: 100,
        therapistNotes: 'Mastered. No biting or spilling observed in multiple sessions.',
        successNote: 'Drank from an open glass with one hand!',
        lastUpdated: '2025-12-22',
        history: [
            { date: '2025-12-22', status: 'Achieved', progress: 100 },
            { date: '2025-12-05', status: 'In Progress', progress: 85 }
        ]
    },
    {
        id: 'sp14',
        childId: 'c2',
        skillName: 'Buttoning Clothes',
        category: 'Adaptive / OT',
        icon: 'shirt',
        status: 'In Progress',
        progress: 45,
        therapistNotes: 'Can do large coat buttons. Working on shirt buttons now.',
        successNote: 'Successfully unbuttoned three shirt buttons independently.',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'In Progress', progress: 45 },
            { date: '2025-12-15', status: 'Not Started', progress: 20 }
        ]
    },
    {
        id: 'sp15',
        childId: 'c2',
        skillName: 'Maintaining Eye Contact',
        category: 'Social / Behavioral',
        icon: 'eye',
        status: 'In Progress',
        progress: 65,
        therapistNotes: 'Good focus when interested. Working on eye contact during listening.',
        successNote: 'Maintained eye contact for 4s during the story-telling.',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'In Progress', progress: 65 },
            { date: '2025-12-14', status: 'In Progress', progress: 50 }
        ]
    },
    {
        id: 'sp16',
        childId: 'c2',
        skillName: 'Following One-step Instructions',
        category: 'Cognitive / Speech',
        icon: 'list',
        status: 'Achieved',
        progress: 100,
        therapistNotes: 'Consistent mastery across different environments.',
        successNote: 'Followed "Throw this in the bin" from across the room.',
        lastUpdated: '2025-12-20',
        history: [
            { date: '2025-12-20', status: 'Achieved', progress: 100 }
        ]
    },
    {
        id: 'sp17',
        childId: 'c2',
        skillName: 'Following Two-step Instructions',
        category: 'Cognitive / Speech',
        icon: 'list-ordered',
        status: 'In Progress',
        progress: 75,
        therapistNotes: 'Processes complex commands well. Occasionally skips the second step if distracted.',
        successNote: 'Followed "Wash your hands and sit at the table" perfectly!',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'In Progress', progress: 75 },
            { date: '2025-12-10', status: 'In Progress', progress: 60 }
        ]
    },
    {
        id: 'sp18',
        childId: 'c2',
        skillName: 'Sound / Word Imitation',
        category: 'Communication / Speech',
        icon: 'mic',
        status: 'Achieved',
        progress: 95,
        therapistNotes: 'Excellent phonetic imitation. Starting sentence formation.',
        successNote: 'Correctly imitated complex 3-syllable words today.',
        lastUpdated: '2025-12-22',
        history: [
            { date: '2025-12-22', status: 'Achieved', progress: 95 },
            { date: '2025-12-08', status: 'In Progress', progress: 80 }
        ]
    },
    {
        id: 'sp19',
        childId: 'c2',
        skillName: 'Sitting Tolerance',
        category: 'Behavioral',
        icon: 'clock',
        status: 'Achieved',
        progress: 90,
        therapistNotes: 'Can sit for 20-25 minutes now. Focus is sustained.',
        successNote: 'Sat through the entire 20-minute coloring activity!',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'Achieved', progress: 90 },
            { date: '2025-12-11', status: 'In Progress', progress: 75 }
        ]
    },
    {
        id: 'sp20',
        childId: 'c2',
        skillName: 'Social Interaction',
        category: 'Social / Behavioral',
        icon: 'users',
        status: 'In Progress',
        progress: 55,
        therapistNotes: 'Engaging in reciprocal play. Learning to share toys.',
        successNote: 'Handed a toy to a peer spontaneously during play time! ✨',
        lastUpdated: '2025-12-23',
        history: [
            { date: '2025-12-23', status: 'In Progress', progress: 55 },
            { date: '2025-12-13', status: 'In Progress', progress: 40 }
        ]
    }
];

// ============ SKILL GOALS (Planned Targets) ============
export const SKILL_GOALS = [
    {
        id: 'sg1',
        childId: 'c1',
        skillId: 'sp1', // Holding a Spoon
        skillName: 'Holding a Spoon',
        duration: '1 Month',
        startDate: '2025-12-01',
        deadline: '2026-01-01',
        targets: [0, 45, 70, 95], // Weekly targets
        status: 'In Progress',
        notes: 'Goal is to achieve stable 3-finger grip by end of month.'
    },
    {
        id: 'sg2',
        childId: 'c1',
        skillId: 'sp8', // Sound / Word Imitation
        skillName: 'Sound / Word Imitation',
        duration: '1 Month',
        startDate: '2025-12-01',
        deadline: '2026-01-01',
        targets: [0, 45, 70, 95],
        status: 'In Progress',
        notes: 'Focus on bilabial sounds (B, P, M).'
    }
];

// ============ CLINICAL DOCUMENTS ============
export const DOCUMENTS = [
    {
        id: 'doc1',
        childId: 'c1',
        title: 'Initial Intake Report',
        type: 'intake',
        category: 'Baseline',
        format: 'pdf',
        date: '2025-06-15',
        uploadedBy: 'Dr. Rajesh Kumar',
        fileSize: '1.2 MB',
        status: 'verified',
        url: '#'
    },
    {
        id: 'doc2',
        childId: 'c1',
        title: 'Speech & Language Assessment',
        type: 'assessment',
        category: 'Assessment',
        format: 'pdf',
        date: '2025-07-02',
        uploadedBy: 'Dr. Sarah Smith',
        fileSize: '2.4 MB',
        status: 'verified',
        url: '#'
    },
    {
        id: 'doc3',
        childId: 'c2',
        title: 'Pediatric Medical History',
        type: 'medical',
        category: 'Medical',
        format: 'pdf',
        date: '2025-05-20',
        uploadedBy: 'Dr. Anita Desai',
        fileSize: '0.8 MB',
        status: 'verified',
        url: '#'
    }
];
