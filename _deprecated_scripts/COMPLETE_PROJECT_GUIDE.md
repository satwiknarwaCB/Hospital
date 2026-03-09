# 🏥 Therapy Portal - Complete Project Guide for Beginners

> **A Comprehensive Guide to Understanding Every Aspect of This Project**
> 
> This document explains the entire project from scratch - what it does, how it works, why each component exists, and what happens if you remove critical parts.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [What Problem Does This Solve?](#-what-problem-does-this-solve)
3. [Technology Stack & Why We Chose Each](#-technology-stack--why-we-chose-each)
4. [Project Architecture](#-project-architecture)
5. [Folder Structure Explained](#-folder-structure-explained)
6. [How the Application Works (Flow Diagram)](#-how-the-application-works-flow-diagram)
7. [Database Schema & Collections](#-database-schema--collections)
8. [Authentication System Explained](#-authentication-system-explained)
9. [Frontend Architecture](#-frontend-architecture)
10. [Backend Architecture](#-backend-architecture)
11. [Key Features & Implementation](#-key-features--implementation)
12. [Critical Components (Don't Delete!)](#-critical-components-dont-delete)
13. [API Endpoints Reference](#-api-endpoints-reference)
14. [State Management Flow](#-state-management-flow)
15. [Setup & Installation](#-setup--installation)
16. [Common Issues & Solutions](#-common-issues--solutions)

---

## 🎯 Project Overview

**Project Name:** Therapy Portal (Hospital Management System)

**Purpose:** A modern web application designed for therapy clinics to manage therapist-parent collaboration, track child development progress, schedule sessions, and facilitate communication.

**Who Uses It:**
- **Therapists/Doctors:** Manage patients, schedule sessions, track progress, log therapy notes
- **Parents:** View their child's progress, communicate with therapists, book appointments
- **Admins:** Oversee the entire system, manage users, view analytics

---

## 💡 What Problem Does This Solve?

### **The Problem:**
Traditional therapy clinics face these challenges:
1. **Poor Communication:** Parents don't know what happens in therapy sessions
2. **Manual Tracking:** Progress tracking is done on paper, making it hard to analyze
3. **Scheduling Chaos:** Phone calls and emails for appointment booking
4. **No Visibility:** Parents can't see their child's developmental progress over time
5. **Fragmented Data:** Session notes, progress reports, and schedules are in different places

### **Our Solution:**
A unified digital platform where:
- ✅ Therapists log session notes instantly
- ✅ Parents see real-time progress updates
- ✅ Automated scheduling and reminders
- ✅ Visual charts showing child development
- ✅ Secure messaging between therapists and parents
- ✅ Community support groups for parents

---

## 🛠️ Technology Stack & Why We Chose Each

### **Frontend Technologies**

| Technology | Version | Why We Chose It | What Happens If Removed? |
|-----------|---------|-----------------|---------------------------|
| **React** | 19.2.0 | Component-based architecture, virtual DOM for fast updates, huge ecosystem | ❌ **CRITICAL** - The entire UI would break. React is the foundation. |
| **Vite** | 7.2.4 | Lightning-fast development server, instant hot module replacement (HMR) | ⚠️ Could use Webpack, but dev experience would be slower |
| **React Router** | 7.11.0 | Client-side routing for single-page application (SPA) navigation | ❌ **CRITICAL** - No navigation between pages would work |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS, rapid styling, consistent design system | ⚠️ Could use vanilla CSS, but development would be much slower |
| **Axios** | 1.13.2 | Promise-based HTTP client, better error handling than fetch | ⚠️ Could use fetch API, but would need more boilerplate code |
| **Recharts** | 3.6.0 | React-based charting library for progress visualization | ⚠️ Could remove if you don't need charts, but loses visual insights |
| **Lucide React** | 0.562.0 | Modern icon library, tree-shakeable, consistent design | ⚠️ Could use other icon libraries or SVGs |

### **Backend Technologies**

| Technology | Version | Why We Chose It | What Happens If Removed? |
|-----------|---------|-----------------|---------------------------|
| **Python** | 3.x | Easy to learn, great for rapid development, excellent libraries | ❌ **CRITICAL** - Entire backend would need rewrite |
| **FastAPI** | 0.109.0+ | Modern, fast, automatic API documentation, type validation | ❌ **CRITICAL** - No API endpoints would work |
| **MongoDB** | 4.6.0+ | NoSQL flexibility, handles complex nested data (sessions, progress), easy to scale | ❌ **CRITICAL** - No data storage, app would be useless |
| **PyMongo** | 4.6.0+ | Official MongoDB driver for Python | ❌ **CRITICAL** - Can't connect to database |
| **Pydantic** | 2.0.0+ | Data validation, type checking, automatic error messages | ⚠️ Could remove but would lose data validation security |
| **python-jose** | 3.3.0+ | JWT token creation and verification | ❌ **CRITICAL** - Authentication would break |
| **passlib** | 1.7.4+ | Password hashing (bcrypt), secure password storage | ❌ **CRITICAL** - Passwords would be stored in plain text (SECURITY RISK!) |
| **Uvicorn** | 0.27.0+ | ASGI server to run FastAPI | ❌ **CRITICAL** - Backend server won't start |

### **Why This Stack?**

**Frontend (React + Vite + Tailwind):**
- **Fast Development:** Vite's HMR means changes appear instantly
- **Modern UI:** Tailwind enables beautiful, responsive designs quickly
- **Type Safety:** React with proper patterns prevents bugs

**Backend (FastAPI + MongoDB):**
- **Auto Documentation:** FastAPI generates interactive API docs at `/docs`
- **Type Safety:** Pydantic validates all incoming data automatically
- **Flexible Data:** MongoDB handles complex therapy session data easily
- **Performance:** FastAPI is one of the fastest Python frameworks

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Parent     │  │  Therapist   │  │    Admin     │      │
│  │   Portal     │  │   Portal     │  │   Portal     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │  React Frontend │
                    │  (Port 5173)    │
                    │                 │
                    │  - React Router │
                    │  - State Mgmt   │
                    │  - API Calls    │
                    └────────┬────────┘
                             │
                             │ HTTP/HTTPS
                             │ (Axios)
                             │
                    ┌────────▼────────┐
                    │ FastAPI Backend │
                    │  (Port 8000)    │
                    │                 │
                    │  - Auth Routes  │
                    │  - API Routes   │
                    │  - Middleware   │
                    └────────┬────────┘
                             │
                             │ PyMongo
                             │
                    ┌────────▼────────┐
                    │  MongoDB        │
                    │  Database       │
                    │                 │
                    │  - doctors      │
                    │  - parents      │
                    │  - sessions     │
                    │  - progress     │
                    │  - messages     │
                    └─────────────────┘
```

---

## 📁 Folder Structure Explained

```
Hospital/
│
├── 📁 src/                          # Frontend Source Code
│   ├── 📁 components/               # Reusable UI Components
│   │   ├── Header.jsx              # Top navigation bar
│   │   ├── Footer.jsx              # Bottom footer
│   │   ├── ProtectedRoute.jsx     # Route guard for authentication
│   │   ├── ActualProgress.jsx     # Complex progress tracking component
│   │   ├── BookAppointmentModal.jsx # Appointment booking popup
│   │   ├── CommunityChat.jsx      # Chat interface
│   │   └── 📁 ui/                  # Basic UI components (buttons, cards)
│   │
│   ├── 📁 pages/                    # Page Components (Routes)
│   │   ├── Landing.jsx             # Home page
│   │   ├── Login.jsx               # Universal login page
│   │   ├── About.jsx               # About page
│   │   ├── Services.jsx            # Services page
│   │   ├── Contact.jsx             # Contact page
│   │   │
│   │   ├── 📁 therapist/           # Therapist Portal Pages
│   │   │   ├── TherapistPortal.jsx # Main therapist dashboard
│   │   │   ├── TherapistLogin.jsx  # Therapist login
│   │   │   ├── TherapistDashboard.jsx
│   │   │   ├── MyPatients.jsx      # Patient list
│   │   │   ├── SessionLog.jsx      # Log therapy sessions
│   │   │   ├── ScheduleManagement.jsx
│   │   │   └── ...
│   │   │
│   │   ├── 📁 parent/              # Parent Portal Pages
│   │   │   ├── ParentPortal.jsx    # Main parent dashboard
│   │   │   ├── ParentLogin.jsx     # Parent login
│   │   │   ├── ParentDashboard.jsx
│   │   │   ├── ChildProgress.jsx   # View child's progress
│   │   │   ├── SessionHistory.jsx  # View past sessions
│   │   │   └── ...
│   │   │
│   │   └── 📁 admin/               # Admin Portal Pages
│   │       ├── AdminPortal.jsx
│   │       └── AdminLogin.jsx
│   │
│   ├── 📁 lib/                      # Core Libraries & Utilities
│   │   ├── context.jsx             # ⭐ CRITICAL: Global state management
│   │   ├── api.js                  # API service functions
│   │   └── utils.js                # Helper functions
│   │
│   ├── 📁 data/                     # Mock/Demo Data
│   │   └── mockData.js             # Sample data for development
│   │
│   ├── App.jsx                      # ⭐ CRITICAL: Main app component
│   ├── main.jsx                     # ⭐ CRITICAL: App entry point
│   └── index.css                    # Global styles
│
├── 📁 server/                       # Backend Source Code
│   ├── main.py                      # ⭐ CRITICAL: FastAPI app entry
│   ├── config.py                    # Configuration settings
│   ├── database.py                  # ⭐ CRITICAL: MongoDB connection
│   │
│   ├── 📁 models/                   # Data Models (Pydantic)
│   │   ├── doctor.py               # Doctor/Therapist data models
│   │   ├── parent.py               # Parent data models
│   │   ├── admin.py                # Admin data models
│   │   ├── session.py              # Therapy session models
│   │   ├── progress.py             # Progress tracking models
│   │   ├── appointment.py          # Appointment models
│   │   ├── message.py              # Message models
│   │   └── community.py            # Community/chat models
│   │
│   ├── 📁 routes/                   # API Endpoints
│   │   ├── doctor_auth.py          # Therapist login/logout
│   │   ├── parent_auth.py          # Parent login/logout
│   │   ├── admin_auth.py           # Admin login/logout
│   │   ├── sessions.py             # Session CRUD operations
│   │   ├── progress.py             # Progress tracking endpoints
│   │   ├── appointments.py         # Appointment booking
│   │   ├── messages.py             # Private messaging
│   │   └── communities.py          # Community chat
│   │
│   ├── 📁 middleware/               # Request Processing
│   │   └── auth_middleware.py      # ⭐ CRITICAL: JWT verification
│   │
│   ├── 📁 utils/                    # Utility Functions
│   │   └── auth.py                 # ⭐ CRITICAL: Password hashing, JWT
│   │
│   ├── 📁 scripts/                  # Database Seeding Scripts
│   │   ├── seed_doctor.py          # Create demo therapists
│   │   ├── seed_parent.py          # Create demo parents
│   │   └── seed_community.py       # Create demo communities
│   │
│   └── requirements.txt             # Python dependencies
│
├── 📁 public/                       # Static Assets
│   └── manifest.json               # PWA manifest
│
├── package.json                     # ⭐ CRITICAL: Node dependencies & scripts
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── index.html                       # HTML entry point
└── README.md                        # Project documentation
```

### **Why This Structure?**

1. **Separation of Concerns:** Frontend (`src/`) and backend (`server/`) are separate
2. **Modularity:** Components, pages, and routes are organized by feature
3. **Scalability:** Easy to add new features without breaking existing code
4. **Maintainability:** Clear naming makes it easy to find files

---

## 🔄 How the Application Works (Flow Diagram)

### **1. User Login Flow**

```
User Opens App
    ↓
Lands on Landing Page (/)
    ↓
Clicks "Login" → Redirects to /login
    ↓
Selects Role (Parent/Therapist/Admin)
    ↓
Enters Email & Password
    ↓
Frontend sends POST to /api/{role}/login
    ↓
Backend validates credentials
    ↓
If Valid:
    ├─ Hash password matches stored hash
    ├─ Generate JWT token
    ├─ Return token + user data
    └─ Frontend stores token in localStorage
    ↓
Frontend redirects to /{role}/dashboard
    ↓
User sees their personalized dashboard
```

### **2. Data Flow Example: Viewing Child Progress**

```
Parent clicks "Child Progress"
    ↓
Frontend: GET /api/progress?childId=123
    ↓
Backend: auth_middleware checks JWT token
    ↓
If valid:
    ├─ Extract user ID from token
    ├─ Query MongoDB progress collection
    ├─ Filter by childId
    └─ Return progress data as JSON
    ↓
Frontend receives data
    ↓
React component renders:
    ├─ Progress charts (Recharts)
    ├─ Skill mastery percentages
    └─ Weekly targets
    ↓
Parent sees visual progress dashboard
```

### **3. Real-Time Messaging Flow**

```
Therapist sends message to parent
    ↓
Frontend: POST /api/messages
Body: { recipientId, content, senderId }
    ↓
Backend validates JWT
    ↓
Saves message to MongoDB
    ↓
Returns success response
    ↓
Frontend polls: GET /api/messages/unread
    ↓
Parent's dashboard shows notification badge
    ↓
Parent clicks messages
    ↓
Frontend: GET /api/messages?conversationId=456
    ↓
Backend returns all messages in conversation
    ↓
Frontend displays chat interface
```

---

## 🗄️ Database Schema & Collections

### **MongoDB Collections**

#### **1. `doctors` Collection**
Stores therapist/doctor information.

```javascript
{
  _id: ObjectId("..."),
  name: "Dr. Rajesh Kumar",
  email: "rajesh@example.com",
  hashed_password: "$2b$12$...",  // Bcrypt hash
  specialization: "Speech Therapy",
  experience_years: 8,
  assigned_patients: 12,
  phone: "+91-9876543210",
  license_number: "ST-2016-MH-1234",
  created_at: ISODate("2024-01-15T10:30:00Z"),
  updated_at: ISODate("2024-01-15T10:30:00Z"),
  is_active: true
}
```

**Why this structure?**
- `hashed_password`: Never store plain passwords (security!)
- `specialization`: Different therapists have different expertise
- `assigned_patients`: Track workload for admin dashboard
- `is_active`: Soft delete - deactivate without losing data

**What if we remove `hashed_password`?**
❌ **CRITICAL** - No authentication, anyone could log in as any doctor!

---

#### **2. `parents` Collection**
Stores parent/guardian information.

```javascript
{
  _id: ObjectId("..."),
  name: "Priya Sharma",
  email: "priya@example.com",
  hashed_password: "$2b$12$...",
  phone: "+91-9876543211",
  children_ids: ["child_001", "child_002"],  // Can have multiple children
  child_id: "child_001",  // Primary child for portal
  relationship: "Mother",
  created_at: ISODate("2024-01-15T10:30:00Z"),
  updated_at: ISODate("2024-01-15T10:30:00Z"),
  is_active: true
}
```

**Why `children_ids` array?**
- Parents can have multiple children in therapy
- Each child might have different therapists

**What if we remove `child_id`?**
⚠️ Portal wouldn't know which child's data to show by default

---

#### **3. `sessions` Collection**
Stores therapy session records.

```javascript
{
  _id: ObjectId("..."),
  child_id: "child_001",
  therapist_id: "doctor_001",
  date: ISODate("2024-01-20T14:00:00Z"),
  duration: 60,  // minutes
  session_type: "Speech Therapy",
  status: "completed",  // scheduled, completed, cancelled
  notes: "Great progress on articulation exercises...",
  activities: [
    "Tongue placement exercises",
    "Sound repetition drills"
  ],
  goals_addressed: ["goal_001", "goal_002"],
  next_session: ISODate("2024-01-27T14:00:00Z"),
  created_at: ISODate("2024-01-20T15:00:00Z")
}
```

**Why this structure?**
- `therapist_id`: Links session to who conducted it
- `child_id`: Links to which child
- `notes`: Critical for continuity of care
- `goals_addressed`: Track which goals were worked on

**What if we remove `notes`?**
⚠️ Therapists would lose session history, parents wouldn't know what happened

---

#### **4. `progress` Collection**
Stores child development progress tracking.

```javascript
{
  _id: ObjectId("..."),
  child_id: "child_001",
  skill_name: "Holding a Spoon",
  category: "Fine Motor Skills",
  baseline: 20,  // Starting percentage
  current_mastery: 65,  // Current percentage
  target: 80,  // Goal percentage
  status: "in_progress",  // in_progress, achieved, backlog
  weekly_targets: {
    week1: 30,
    week2: 45,
    week3: 60,
    week4: 75
  },
  weekly_actual: {
    week1: 35,
    week2: 50,
    week3: 65,
    week4: null  // Not yet completed
  },
  therapist_id: "doctor_001",
  last_updated: ISODate("2024-01-20T15:00:00Z"),
  notes: "Consistent improvement with adaptive utensils"
}
```

**Why this structure?**
- `weekly_targets` vs `weekly_actual`: Compare planned vs achieved
- `current_mastery`: Show real-time progress
- `status`: Filter skills by completion state

**What if we remove `weekly_targets`?**
⚠️ Can't track if therapy is on schedule, lose accountability

---

#### **5. `appointments` Collection**
Stores appointment bookings.

```javascript
{
  _id: ObjectId("..."),
  parent_id: "parent_001",
  child_id: "child_001",
  therapist_id: "doctor_001",
  appointment_date: ISODate("2024-01-25T10:00:00Z"),
  duration: 60,
  type: "Initial Consultation",
  status: "confirmed",  // pending, confirmed, cancelled, completed
  notes: "First visit for speech assessment",
  created_at: ISODate("2024-01-15T12:00:00Z")
}
```

---

#### **6. `communities` Collection**
Stores community/support group information.

```javascript
{
  _id: ObjectId("..."),
  name: "Speech Therapy Parents",
  description: "Support group for parents of children in speech therapy",
  category: "Speech Therapy",
  member_ids: ["parent_001", "parent_002", "parent_003"],
  moderator_ids: ["doctor_001"],
  created_at: ISODate("2024-01-10T10:00:00Z"),
  is_active: true
}
```

---

#### **7. `community_messages` Collection**
Stores community chat messages.

```javascript
{
  _id: ObjectId("..."),
  community_id: "community_001",
  sender_id: "parent_001",
  sender_name: "Priya Sharma",
  sender_role: "parent",
  content: "Has anyone tried music therapy alongside speech therapy?",
  timestamp: ISODate("2024-01-20T16:30:00Z"),
  edited: false,
  edited_at: null
}
```

**Why separate `communities` and `community_messages`?**
- **Performance:** Messages grow rapidly, separating keeps queries fast
- **Scalability:** Can archive old messages without affecting community data

---

## 🔐 Authentication System Explained

### **How JWT Authentication Works**

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. USER REGISTRATION (One-time)
   ─────────────────────────────
   User enters: email + password
        ↓
   Backend receives plain password
        ↓
   passlib.hash() creates bcrypt hash
        ↓
   Store in database: { email, hashed_password }
   
   Example:
   Plain: "MyPassword123"
   Hash:  "$2b$12$KIXxKj5Nh8vM9QZ..."  ← Irreversible!

2. USER LOGIN
   ───────────
   User enters: email + password
        ↓
   Backend finds user by email
        ↓
   passlib.verify(plain_password, hashed_password)
        ↓
   If match:
      ├─ Create JWT token
      │  Token contains: { user_id, email, exp: 24h }
      │  Signed with SECRET_KEY
      └─ Return token to frontend
        ↓
   Frontend stores token in localStorage

3. ACCESSING PROTECTED ROUTES
   ───────────────────────────
   User requests: GET /api/progress
        ↓
   Frontend adds header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        ↓
   Backend middleware (auth_middleware.py):
      ├─ Extract token from header
      ├─ Verify signature with SECRET_KEY
      ├─ Check expiration
      └─ Extract user_id
        ↓
   If valid: Process request
   If invalid: Return 401 Unauthorized
```

### **Key Files in Authentication**

#### **1. `server/utils/auth.py`**
```python
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Convert plain password to hash"""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """Check if password matches hash"""
    return pwd_context.verify(plain, hashed)

# JWT token creation
def create_access_token(data: dict) -> str:
    """Create JWT token valid for 24 hours"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
```

**Why bcrypt?**
- **Slow by design:** Makes brute-force attacks impractical
- **Salt included:** Each hash is unique even for same password
- **Industry standard:** Proven secure over decades

**What if we remove password hashing?**
❌ **CRITICAL SECURITY RISK** - Passwords stored in plain text, database breach exposes all passwords!

---

#### **2. `server/middleware/auth_middleware.py`**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

security = HTTPBearer()

async def get_current_doctor(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Verify JWT token and return current doctor"""
    token = credentials.credentials
    
    try:
        # Decode and verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Fetch doctor from database
        doctor = db_manager.doctors.find_one({"_id": ObjectId(user_id)})
        
        if not doctor:
            raise HTTPException(status_code=401, detail="User not found")
        
        return DoctorResponse(**doctor)
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Why middleware?**
- **DRY Principle:** Don't repeat authentication code in every route
- **Security:** Centralized security logic is easier to audit
- **Flexibility:** Easy to add features like token blacklisting

**What if we remove middleware?**
❌ **CRITICAL** - All protected routes become public, anyone can access any data!

---

## 🎨 Frontend Architecture

### **State Management with Context API**

**File:** `src/lib/context.jsx`

```javascript
// Global state structure
const AppContext = createContext();

export function AppProvider({ children }) {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Data state
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Sync authentication from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, []);
  
  // Provide state to all components
  return (
    <AppContext.Provider value={{
      currentUser,
      isAuthenticated,
      sessions,
      progress,
      messages,
      // ... methods to update state
    }}>
      {children}
    </AppContext.Provider>
  );
}
```

**Why Context API?**
- **Avoid Prop Drilling:** Don't pass props through 10 levels
- **Global State:** User data available everywhere
- **React Native:** Built-in, no extra library needed

**What if we remove Context?**
⚠️ Would need to pass user data as props through every component (messy!)

---

### **Routing with React Router**

**File:** `src/App.jsx`

```javascript
function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/therapist/*" element={
            <ProtectedRoute redirectTo="/therapist/login">
              <TherapistPortal />
            </ProtectedRoute>
          } />
          
          <Route path="/parent/*" element={
            <ProtectedRoute redirectTo="/parent/login">
              <ParentPortal />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AppProvider>
  );
}
```

**Why nested routes (`/therapist/*`)?**
- **Organization:** All therapist pages under `/therapist/`
- **Protection:** One `ProtectedRoute` guards all sub-routes
- **Clean URLs:** `/therapist/dashboard`, `/therapist/patients`

**What if we remove `ProtectedRoute`?**
❌ **CRITICAL** - Unauthenticated users could access dashboards!

---

### **API Service Layer**

**File:** `src/lib/api.js`

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Session API
export const sessionAPI = {
  getAll: () => api.get('/api/sessions'),
  getById: (id) => api.get(`/api/sessions/${id}`),
  create: (data) => api.post('/api/sessions', data),
  update: (id, data) => api.put(`/api/sessions/${id}`, data),
  delete: (id) => api.delete(`/api/sessions/${id}`)
};

// Progress API
export const progressAPI = {
  getByChild: (childId) => api.get(`/api/progress?childId=${childId}`),
  update: (id, data) => api.put(`/api/progress/${id}`, data)
};
```

**Why separate API layer?**
- **Reusability:** Use `sessionAPI.create()` anywhere
- **Consistency:** All API calls have auth token automatically
- **Easy Updates:** Change API URL in one place

**What if we remove interceptors?**
⚠️ Would need to manually add `Authorization` header to every API call

---

## ⚙️ Backend Architecture

### **FastAPI Application Structure**

**File:** `server/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Therapy Portal API",
    description="Backend API for therapy management",
    version="1.0.0"
)

# CORS middleware - Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Register route modules
app.include_router(doctor_auth_router)
app.include_router(parent_auth_router)
app.include_router(sessions_router)
app.include_router(progress_router)
# ... more routers
```

**Why CORS middleware?**
- **Security:** Browsers block cross-origin requests by default
- **Development:** Frontend (5173) needs to call backend (8000)
- **Production:** Update `allow_origins` to production domain

**What if we remove CORS middleware?**
❌ **CRITICAL** - Frontend API calls will be blocked by browser!

---

### **Database Connection**

**File:** `server/database.py`

```python
from pymongo import MongoClient

class DatabaseManager:
    _instance = None  # Singleton pattern
    _client = None
    _db = None
    
    def connect(self):
        """Connect to MongoDB"""
        self._client = MongoClient("mongodb://localhost:27017/")
        self._db = self._client["therapy_portal"]
    
    @property
    def doctors(self):
        """Get doctors collection"""
        return self._db["doctors"]
    
    @property
    def sessions(self):
        """Get sessions collection"""
        return self._db["sessions"]

# Global instance
db_manager = DatabaseManager()
```

**Why Singleton pattern?**
- **One Connection:** Don't create multiple database connections
- **Performance:** Reuse connection pool
- **Resource Management:** Properly close connection on shutdown

**What if we create new connection in every route?**
⚠️ **Performance Issue** - Too many connections, database will slow down or crash!

---

### **Pydantic Models for Validation**

**File:** `server/models/doctor.py`

```python
from pydantic import BaseModel, EmailStr, Field, validator

class DoctorLogin(BaseModel):
    """Validates login request"""
    email: EmailStr  # Must be valid email format
    password: str = Field(..., min_length=6)

class DoctorCreate(BaseModel):
    """Validates doctor creation"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    specialization: str
    experience_years: int = Field(..., ge=0)  # >= 0
    
    @validator('password')
    def validate_password(cls, v):
        """Ensure strong password"""
        if not any(c.isupper() for c in v):
            raise ValueError('Must contain uppercase')
        if not any(c.isdigit() for c in v):
            raise ValueError('Must contain digit')
        return v
```

**Why Pydantic?**
- **Auto Validation:** FastAPI validates automatically
- **Type Safety:** Catches bugs before they reach database
- **Auto Docs:** API documentation shows required fields

**What if we remove Pydantic models?**
⚠️ **Security Risk** - Invalid data could crash app or corrupt database!

---

## 🎯 Key Features & Implementation

### **Feature 1: Child Progress Tracking**

**How It Works:**

1. **Therapist logs progress:**
   ```javascript
   // Frontend: TherapistPortal → SessionLog.jsx
   const logProgress = async (skillData) => {
     await progressAPI.update(skillData.id, {
       current_mastery: 65,
       weekly_actual: { week3: 65 },
       status: "in_progress"
     });
   };
   ```

2. **Backend saves to database:**
   ```python
   # server/routes/progress.py
   @router.put("/api/progress/{progress_id}")
   async def update_progress(progress_id: str, data: ProgressUpdate):
       db_manager.get_database()["progress"].update_one(
           {"_id": ObjectId(progress_id)},
           {"$set": data.dict()}
       )
   ```

3. **Parent views progress:**
   ```javascript
   // Frontend: ParentPortal → ChildProgress.jsx
   const { progress } = useApp();
   
   return (
     <LineChart data={progress}>
       <Line dataKey="current_mastery" stroke="#10b981" />
       <Line dataKey="target" stroke="#6366f1" />
     </LineChart>
   );
   ```

**Why this implementation?**
- **Real-time:** Parents see updates immediately
- **Visual:** Charts make progress easy to understand
- **Accountability:** Weekly targets keep therapy on track

---

### **Feature 2: Secure Messaging**

**How It Works:**

1. **Send message:**
   ```javascript
   // Frontend: CommunityChat.jsx
   const sendMessage = async (content) => {
     await messagesAPI.send({
       recipient_id: therapistId,
       content: content,
       sender_id: currentUser.id
     });
   };
   ```

2. **Backend stores message:**
   ```python
   # server/routes/messages.py
   @router.post("/api/messages")
   async def send_message(message: MessageCreate, user = Depends(get_current_user)):
       message_doc = {
           "sender_id": user.id,
           "recipient_id": message.recipient_id,
           "content": message.content,
           "timestamp": datetime.utcnow(),
           "read": False
       }
       db_manager.get_database()["messages"].insert_one(message_doc)
   ```

3. **Recipient sees notification:**
   ```javascript
   // Frontend: Header.jsx
   useEffect(() => {
     const interval = setInterval(async () => {
       const { data } = await messagesAPI.getUnreadCount();
       setUnreadCount(data.count);
     }, 5000);  // Poll every 5 seconds
   }, []);
   ```

**Why polling instead of WebSockets?**
- **Simplicity:** Easier to implement and debug
- **Good enough:** 5-second delay is acceptable for this use case
- **Scalability:** Can upgrade to WebSockets later if needed

---

### **Feature 3: Appointment Booking**

**How It Works:**

1. **Parent selects slot:**
   ```javascript
   // Frontend: BookAppointmentModal.jsx
   const bookAppointment = async () => {
     await appointmentAPI.create({
       therapist_id: selectedTherapist,
       child_id: currentUser.childId,
       date: selectedDate,
       type: "Follow-up Session"
     });
   };
   ```

2. **Backend checks availability:**
   ```python
   # server/routes/appointments.py
   @router.post("/api/appointments")
   async def create_appointment(appointment: AppointmentCreate):
       # Check if slot is available
       existing = db_manager.appointments.find_one({
           "therapist_id": appointment.therapist_id,
           "appointment_date": appointment.date,
           "status": {"$ne": "cancelled"}
       })
       
       if existing:
           raise HTTPException(400, "Slot already booked")
       
       # Create appointment
       db_manager.appointments.insert_one(appointment.dict())
   ```

**Why check availability?**
- **Prevent double-booking:** Two parents can't book same slot
- **User experience:** Show only available slots

---

## ⚠️ Critical Components (Don't Delete!)

### **1. Authentication System**

**Files:**
- `server/utils/auth.py`
- `server/middleware/auth_middleware.py`
- `src/components/ProtectedRoute.jsx`

**What happens if deleted?**
❌ **CATASTROPHIC** - No security, anyone can access any data!

---

### **2. Database Connection**

**Files:**
- `server/database.py`
- `server/config.py`

**What happens if deleted?**
❌ **CATASTROPHIC** - App can't read/write data, completely broken!

---

### **3. Context Provider**

**Files:**
- `src/lib/context.jsx`

**What happens if deleted?**
❌ **CRITICAL** - Components can't access user data, app won't work!

---

### **4. CORS Middleware**

**Code:** `app.add_middleware(CORSMiddleware, ...)`

**What happens if deleted?**
❌ **CRITICAL** - Frontend can't call backend APIs, all features break!

---

### **5. Password Hashing**

**Code:** `passlib.hash()` and `passlib.verify()`

**What happens if deleted?**
❌ **SECURITY DISASTER** - Passwords stored in plain text, massive data breach risk!

---

## 📡 API Endpoints Reference

### **Authentication Endpoints**

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/doctor/login` | Therapist login | ❌ No |
| POST | `/api/parent/login` | Parent login | ❌ No |
| POST | `/api/admin/login` | Admin login | ❌ No |
| GET | `/api/doctor/profile` | Get therapist profile | ✅ Yes |
| GET | `/api/parent/profile` | Get parent profile | ✅ Yes |
| POST | `/api/doctor/logout` | Therapist logout | ❌ No (client-side) |

### **Session Endpoints**

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/sessions` | Get all sessions | ✅ Yes |
| GET | `/api/sessions/{id}` | Get specific session | ✅ Yes |
| POST | `/api/sessions` | Create new session | ✅ Yes (Therapist) |
| PUT | `/api/sessions/{id}` | Update session | ✅ Yes (Therapist) |
| DELETE | `/api/sessions/{id}` | Delete session | ✅ Yes (Therapist) |

### **Progress Endpoints**

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/progress?childId={id}` | Get child's progress | ✅ Yes |
| PUT | `/api/progress/{id}` | Update progress | ✅ Yes (Therapist) |
| POST | `/api/progress` | Create progress record | ✅ Yes (Therapist) |

### **Messaging Endpoints**

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/messages` | Get messages | ✅ Yes |
| POST | `/api/messages` | Send message | ✅ Yes |
| GET | `/api/messages/unread` | Get unread count | ✅ Yes |
| PUT | `/api/messages/{id}/read` | Mark as read | ✅ Yes |

### **Community Endpoints**

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/communities` | Get all communities | ✅ Yes |
| GET | `/api/communities/{id}/messages` | Get community messages | ✅ Yes |
| POST | `/api/communities/{id}/messages` | Post to community | ✅ Yes |

---

## 🔄 State Management Flow

### **How Data Flows Through the App**

```
User Action (Click button)
    ↓
Event Handler (onClick)
    ↓
API Call (axios.post)
    ↓
Backend Processing
    ↓
Database Update
    ↓
Response to Frontend
    ↓
Update Context State (setProgress)
    ↓
React Re-renders Components
    ↓
UI Updates (User sees change)
```

### **Example: Adding a New Session**

```javascript
// 1. User fills form and clicks "Save"
const handleSaveSession = async () => {
  // 2. Call API
  const response = await sessionAPI.create({
    child_id: selectedChild,
    date: sessionDate,
    notes: sessionNotes
  });
  
  // 3. Update local state
  setSessions(prev => [...prev, response.data]);
  
  // 4. Show success message
  toast.success("Session saved!");
};

// 5. React automatically re-renders SessionList component
// 6. New session appears in the list
```

---

## 🚀 Setup & Installation

### **Prerequisites**

1. **Node.js** (v18+): [Download](https://nodejs.org/)
2. **Python** (v3.9+): [Download](https://www.python.org/)
3. **MongoDB** (v4.6+): [Download](https://www.mongodb.com/try/download/community)

### **Step-by-Step Setup**

#### **1. Clone Repository**
```bash
git clone https://github.com/satwiknarwaCB/Hospital.git
cd Hospital
```

#### **2. Install Frontend Dependencies**
```bash
npm install
```

This installs:
- React, React Router, Axios
- Vite, Tailwind CSS
- Recharts, Lucide Icons

#### **3. Install Backend Dependencies**
```bash
cd server
pip install -r requirements.txt
```

This installs:
- FastAPI, Uvicorn
- PyMongo, Pydantic
- python-jose, passlib

#### **4. Setup Environment Variables**

Create `.env` file in root:
```env
# Backend
MONGODB_URL=mongodb://localhost:27017/
DATABASE_NAME=therapy_portal
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend
VITE_API_URL=http://localhost:8000
```

**Why `.env` file?**
- **Security:** Don't commit secrets to Git
- **Flexibility:** Different settings for dev/production
- **Convenience:** Change config without editing code

#### **5. Start MongoDB**

**Windows:**
```bash
mongod --dbpath C:\data\db
```

**Mac/Linux:**
```bash
mongod --dbpath /data/db
```

#### **6. Seed Database (Optional)**

Create demo users and data:
```bash
cd server
python scripts/seed_doctor.py
python scripts/seed_parent.py
python scripts/seed_community.py
```

#### **7. Start Development Servers**

**Option A: Start Both (Recommended)**
```bash
npm run dev
```

This runs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

**Option B: Start Separately**

Terminal 1 (Frontend):
```bash
npm run dev:frontend
```

Terminal 2 (Backend):
```bash
npm run dev:backend
```

#### **8. Access Application**

- **Frontend:** http://localhost:5173
- **Backend API Docs:** http://localhost:8000/docs
- **Backend Health:** http://localhost:8000/health

### **Demo Credentials**

**Therapist:**
- Email: `rajesh@example.com`
- Password: `Doctor@123`

**Parent:**
- Email: `priya@example.com`
- Password: `Parent@123`

**Admin:**
- Email: `admin@example.com`
- Password: `Admin@123`

---

## 🐛 Common Issues & Solutions

### **Issue 1: CORS Error**

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Check `server/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Must match frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

---

### **Issue 2: MongoDB Connection Failed**

**Error:**
```
[ERROR] MongoDB connection error: ServerSelectionTimeoutError
```

**Solution:**
1. Check if MongoDB is running: `mongod --version`
2. Start MongoDB: `mongod --dbpath /data/db`
3. Verify connection string in `.env`

---

### **Issue 3: JWT Token Invalid**

**Error:**
```
401 Unauthorized: Invalid token
```

**Solution:**
1. Check if token is stored: `localStorage.getItem('token')`
2. Verify `SECRET_KEY` matches in backend
3. Token might be expired (24h default) - login again

---

### **Issue 4: Port Already in Use**

**Error:**
```
EADDRINUSE: address already in use :::5173
```

**Solution:**

**Windows:**
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:5173 | xargs kill -9
```

---

### **Issue 5: Module Not Found**

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```bash
cd server
pip install -r requirements.txt
```

Make sure you're in the `server/` directory!

---

## 📚 Learning Resources

### **For Beginners**

1. **React:** [Official Tutorial](https://react.dev/learn)
2. **FastAPI:** [Official Docs](https://fastapi.tiangolo.com/)
3. **MongoDB:** [University](https://university.mongodb.com/)
4. **JWT:** [jwt.io Introduction](https://jwt.io/introduction)

### **Advanced Topics**

1. **React Context:** [Context API Guide](https://react.dev/reference/react/useContext)
2. **Pydantic:** [Data Validation](https://docs.pydantic.dev/)
3. **MongoDB Aggregation:** [Pipeline Tutorial](https://www.mongodb.com/docs/manual/aggregation/)

---

## 🎓 Key Takeaways

### **Why Each Technology Matters**

1. **React:** Makes UI interactive and fast
2. **FastAPI:** Auto-validates data, generates docs
3. **MongoDB:** Flexible schema for complex therapy data
4. **JWT:** Secure, stateless authentication
5. **Tailwind:** Rapid UI development
6. **Pydantic:** Type safety prevents bugs

### **Critical Concepts**

1. **Never store plain passwords** - Always hash with bcrypt
2. **Always validate input** - Use Pydantic models
3. **Protect routes** - Use middleware for authentication
4. **Separate concerns** - Frontend, backend, database
5. **Use environment variables** - Never commit secrets

---

## 📞 Support

If you have questions:
1. Check this guide first
2. Review API docs: `http://localhost:8000/docs`
3. Check browser console for frontend errors
4. Check terminal for backend errors

---

**Built with ❤️ for Therapy Clinics**

*Last Updated: January 2026*
