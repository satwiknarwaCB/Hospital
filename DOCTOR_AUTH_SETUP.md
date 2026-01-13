# Quick Start Guide - Doctor Authentication System

## 🚀 Quick Setup (5 Minutes)

### Step 1: Backend Setup

```bash
# Navigate to server directory
cd server

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env and set your MongoDB connection
# MONGODB_URL=mongodb://localhost:27017  (or your MongoDB Atlas URL)

# Seed database with sample doctor
python scripts/seed_doctor.py

# Start backend server
uvicorn main:app --reload
```

**Backend will be running on**: http://localhost:8000  
**API Docs**: http://localhost:8000/docs

### Step 2: Frontend (Already Set Up!)

Frontend is already running with `npm run dev` ✅

### Step 3: Test the System

1. **Open browser**: http://localhost:5173/doctor/login

2. **Login with demo credentials**:
   - Email: `dr.rajesh@hospital.com`
   - Password: `Doctor@123`

3. **View dashboard**: Should automatically redirect to `/doctor/dashboard`

4. **Test logout**: Click "Sign Out" in sidebar

---

## 📁 What Was Built

### Backend (server/)
- ✅ FastAPI REST API
- ✅ MongoDB database integration
- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ Login/Logout/Profile endpoints
- ✅ Protected route middleware

### Frontend (src/)
- ✅ Modern login page
- ✅ Doctor dashboard with profile
- ✅ Protected routes
- ✅ Authentication hook
- ✅ API client with axios

---

## 🔑 Demo Credentials

**Doctor Account**:
- Email: `dr.rajesh@hospital.com`
- Password: `Doctor@123`
- Name: Dr. Rajesh Kumar
- Specialization: Speech & Language Therapy
- Experience: 12 years
- Patients: 2

---

## 🧪 Testing Checklist

- [ ] Backend server running on port 8000
- [ ] MongoDB connected successfully
- [ ] Sample doctor created in database
- [ ] Can access login page
- [ ] Login with demo credentials works
- [ ] Redirects to dashboard after login
- [ ] Profile information displays correctly
- [ ] Logout button works
- [ ] Cannot access dashboard without login
- [ ] Protected routes redirect to login

---

## 📞 Troubleshooting

**Backend won't start?**
- Check MongoDB is running
- Verify `.env` file exists and has correct MongoDB URL
- Install dependencies: `pip install -r requirements.txt`

**Frontend errors?**
- Ensure axios is installed: `npm install axios`
- Check `.env` has VITE_API_URL (or let it use default)

**Login fails?**
- Verify backend is running on port 8000
- Check browser console for errors
- Run seed script: `python scripts/seed_doctor.py`

**CORS errors?**
- Update `CORS_ORIGINS` in backend `.env`
- Add your frontend URL (e.g., `http://localhost:5173`)

---

## 📚 Documentation

- **Full Walkthrough**: [walkthrough.md](file:///C:/Users/Admin/.gemini/antigravity/brain/86ec3097-e760-47b3-aef9-9cfee0669f4d/walkthrough.md)
- **Implementation Plan**: [implementation_plan.md](file:///C:/Users/Admin/.gemini/antigravity/brain/86ec3097-e760-47b3-aef9-9cfee0669f4d/implementation_plan.md)
- **Backend README**: [server/README.md](file:///c:/Users/Admin/Desktop/website@cognitbotz/Hospital/server/README.md)
- **Task Checklist**: [task.md](file:///C:/Users/Admin/.gemini/antigravity/brain/86ec3097-e760-47b3-aef9-9cfee0669f4d/task.md)

---

## 🎯 Next Steps

1. **Test the system** using the checklist above
2. **Customize** the doctor data in `scripts/seed_doctor.py`
3. **Configure** MongoDB connection in `.env`
4. **Deploy** when ready (update SECRET_KEY!)
5. **Extend** with additional features (password reset, profile updates, etc.)

---

## ✅ You're All Set!

The Doctor Authentication System is ready to use. Start the backend server and log in to test! 🎉
