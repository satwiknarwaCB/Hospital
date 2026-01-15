# Quick Start Guide - Parent Authentication System

## 🚀 Quick Setup (5 Minutes)

### Step 1: Backend Setup

```bash
# Navigate to server directory
cd server

# Install Python dependencies (if not already done)
pip install -r requirements.txt

# Ensure .env file exists with MongoDB connection
# MONGODB_URL=mongodb://localhost:27017  (or your MongoDB Atlas URL)

# Seed database with sample parents
python scripts/seed_parent.py

# Start backend server (if not already running)
uvicorn main:app --reload
```

**Backend will be running on**: http://localhost:8000  
**API Docs**: http://localhost:8000/docs

### Step 2: Frontend (Already Set Up!)

Frontend is already running with `npm run dev` ✅

### Step 3: Test the System

1. **Open browser**: http://localhost:5173/parent/login

2. **Login with demo credentials**:
   
   **Parent 1 - Priya Patel (Mother)**
   - Email: `priya.patel@parent.com`
   - Password: `Parent@123`
   
   **Parent 2 - Arun Sharma (Father)**
   - Email: `arun.sharma@parent.com`
   - Password: `Parent@123`

3. **View dashboard**: Should automatically redirect to `/parent/dashboard`

4. **Test logout**: Click "Sign Out" in sidebar

---

## 📁 What Was Built

### Backend (server/)
- ✅ FastAPI REST API for parents
- ✅ MongoDB database integration
- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ Login/Logout/Profile endpoints
- ✅ Protected route middleware

### Frontend (src/)
- ✅ Modern parent login page
- ✅ Parent portal with dashboard
- ✅ Protected routes
- ✅ Multi-role authentication hook
- ✅ API client with axios

---

## 🔑 Demo Credentials

**Parent Account 1**:
- Email: `priya.patel@parent.com`
- Password: `Parent@123`
- Name: Priya Patel
- Relationship: Mother
- Children: 1

**Parent Account 2**:
- Email: `arun.sharma@parent.com`
- Password: `Parent@123`
- Name: Arun Sharma
- Relationship: Father
- Children: 1

---

## 🧪 Testing Checklist

- [ ] Backend server running on port 8000
- [ ] MongoDB connected successfully
- [ ] Sample parents created in database
- [ ] Can access parent login page
- [ ] Login with Priya Patel credentials works
- [ ] Login with Arun Sharma credentials works
- [ ] Redirects to dashboard after login
- [ ] Parent information displays correctly
- [ ] Logout button works
- [ ] Cannot access dashboard without login
- [ ] Protected routes redirect to login
- [ ] Quick Fill buttons work on login page

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
- Run seed script: `python scripts/seed_parent.py`

**CORS errors?**
- Update `CORS_ORIGINS` in backend `.env`
- Add your frontend URL (e.g., `http://localhost:5173`)

**Role conflicts?**
- Parent and doctor/therapist use separate tokens
- Logging in as one role automatically logs out the other
- Check localStorage for `parent_token` and `parent_data`

---

## 🎯 Next Steps

1. **Test the system** using the checklist above
2. **Customize** the parent data in `scripts/seed_parent.py`
3. **Link children** to parent accounts in the database
4. **Configure** MongoDB connection in `.env`
5. **Deploy** when ready (update SECRET_KEY!)
6. **Extend** with additional features (password reset, profile updates, etc.)

---

## ✅ You're All Set!

The Parent Authentication System is ready to use. Start the backend server and log in to test! 🎉

## 🔗 Related Documentation

- **Doctor Authentication**: [DOCTOR_AUTH_SETUP.md](file:///c:/Users/Admin/Desktop/website@cognitbotz/Hospital/DOCTOR_AUTH_SETUP.md)
- **Backend README**: [server/README.md](file:///c:/Users/Admin/Desktop/website@cognitbotz/Hospital/server/README.md)
