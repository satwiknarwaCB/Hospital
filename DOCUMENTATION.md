# NeuroBridge™ Platform Documentation

## 1. Overview
NeuroBridge™ is an intelligent platform designed to connect Parents, Therapists, and Clinical Directors for transparent, measurable, and AI-driven autism therapy. The platform provides real-time progress tracking, AI-powered insights, and seamless communication across all stakeholders.

## 2. System Architecture
### Frontend (Current)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Glassmorphism & Modern UI)
- **Icons**: Lucide-React
- **State Management**: React Context API (`AppProvider`)
- **Routing**: React Router DOM (Role-based nested routing)
- **Charts**: Recharts (for analytics and dashboards)

### Backend (Planned)
- **Framework**: FastAPI (Python) or Node.js
- **Database**: PostgreSQL (Structured patient & session data)
- **AI Integration**: OpenAI / Anthropic API for session summarization and predictive modeling.

## 3. Core Modules & Flow

### A. Parent Portal (`/parent`)
*The primary interface for families to stay connected with their child's therapy journey.*
1. **Dashboard**: High-level summary of latest session, mood, and upcoming appointments.
2. **Progress Analytics**: Skill-wise tracking across 7 domains (Language, Social, Motor, etc.) with trend indicators.
3. **Growth Roadmap**: Predictive milestone tracking with AI-generated confidence levels.
4. **Home Activities**: Occupational & Speech exercises to be performed at home, with streak tracking.
5. **Session History**: Detailed archive of every therapy session with AI-generated summaries and "Daily Wins".
6. **Messages**: Direct channel with the therapist featuring AI weekly summaries.

### B. Therapist Portal (`/therapist`)
*The clinical workspace for logging data and gaining insights.*
1. **Dashboard**: Daily schedule overview, pending reports, and "Needs Attention" patient list.
2. **Session Log**: Advanced form for logging behavioral data, skill scores, and clinical observations.
3. **My Patients**: Caseload management with high-level trend cards for every child.
4. **Therapy Intelligence**: AI dashboard detecting plateaus, regression risks, and activity effectiveness.
5. **Roadmap Editor**: Tool for defining long-term goals and milestones, with AI completion predictions.
6. **Schedule**: Full calendar management for scheduling and tracking appointments.

### C. Admin Portal (`/admin`)
*Operational oversight for Clinical Directors and Owners.*
1. **Dashboard**: High-level CDC metrics (Revenue, Utilization, Completion rates).
2. **Operations**: Staff allocation management, therapist utilization tracking, and room occupancy.
3. **Reports**: Clinical and operational report generation (Clinical audits, satisfaction surveys).
4. **Compliance**: HIPAA audit logs, consent tracking, and risk management (dropout prevention).

## 4. Key Logic & Data Flow
### AI Service (`lib/aiService.js`)
- **Summarization**: Converts raw session notes into readable "wins" and parent-friendly summaries.
- **Predictive Analytics**: Analyzes historical skill scores to predict milestone completion dates.
- **Anomaly Detection**: Flags sudden drops in engagement or skill scores as "Regression Risks".
- **Therapy Intelligence**: Aggregates effectiveness of specific activities across patients to suggest clinical adjustments.

### App Context (`lib/context.jsx`)
- Central source of truth for all mock data.
- Handles Auth simulation, session logging, milestone completion, and activity tracking.
- Provides utility functions like `getLatestSkillScores` and `getActivityAdherence`.

## 5. Development Roadmap
- [x] **Phase 1**: UI/UX Prototype (Complete)
- [x] **Phase 2**: Mock AI & State Management (Complete)
- [x] **Phase 3**: Parent/Therapist/Admin Portal Implementation (Complete)
- [ ] **Phase 4**: Backend API & Database Integration
- [ ] **Phase 5**: Real AI Model Integration (LLM + Time-series)
- [ ] **Phase 6**: HIPAA Compliance Certification & Security Hardening

---
*Developed by Antigravity AI for NeuroBridge™*
