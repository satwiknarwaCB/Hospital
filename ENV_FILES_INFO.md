# 📝 Environment Files Setup

Is project mein **2 .env files** hain aur **dono zaroori hain**:

## 1️⃣ Root Folder `.env` (Frontend ke liye)
**Location**: `c:\Users\Admin\Desktop\website@cognitbotz\Hospital\.env`

**Purpose**: Frontend (React/Vite) ko batata hai ki backend kahan hai

```env
VITE_API_URL=http://localhost:8000
```

## 2️⃣ Server Folder `.env` (Backend ke liye)  
**Location**: `c:\Users\Admin\Desktop\website@cognitbotz\Hospital\server\.env`

**Purpose**: Backend (FastAPI) ke liye MongoDB connection aur JWT settings

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=therapy_portal
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:5173
HOST=0.0.0.0
PORT=8000
```

---

## ⚡ Ab Ek Hi Command Se Sab Kuch Start Hoga!

### Pehle (Purana Tarika):
```bash
# Terminal 1
npm run dev

# Terminal 2  
cd server
python -m uvicorn main:app --reload
```

### Ab (Naya Tarika) - Ek Hi Command!
```bash
npm run dev
```

Ye command automatically:
- ✅ Frontend start karega (Vite)
- ✅ Backend start karega (FastAPI)
- ✅ Dono saath mein chalenge

---

## 🎯 Quick Commands

| Command | Kya Karta Hai |
|---------|---------------|
| `npm run dev` | Frontend + Backend dono start karta hai |
| `npm run dev:frontend` | Sirf frontend start karta hai |
| `npm run dev:backend` | Sirf backend start karta hai |
| `npm run build` | Production build banata hai |

---

## 📁 .env Files Ko Delete **MAT** Karo!

**Dono files zaroori hain kyunki**:
- Frontend ko `.env` (root) chahiye API URL ke liye
- Backend ko `server/.env` chahiye database aur security ke liye

Agar koi ek file delete karoge to application kaam nahi karegi!

---

## ✅ Setup Complete!

Ab bas `npm run dev` run karo aur:
1. Frontend: http://localhost:5173/doctor/login
2. Backend: http://localhost:8000/docs
3. Login: dr.rajesh@hospital.com / Doctor@123

Dono servers ek saath start ho jayenge! 🚀
