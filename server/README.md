# Therapy Portal - Doctor Module Backend

Complete authentication API for the Doctor module using FastAPI, MongoDB, and JWT.

## 🚀 Features

- ✅ **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- ✅ **MongoDB Integration**: NoSQL database for flexible data storage
- ✅ **Protected Routes**: Middleware-based route protection
- ✅ **CORS Enabled**: Ready for frontend integration
- ✅ **FastAPI Documentation**: Auto-generated API docs at `/docs`

## 📋 Prerequisites

- Python 3.8 or higher
- MongoDB installed and running (or MongoDB Compass with connection string)
- pip (Python package manager)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection details:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
# Or use MongoDB Atlas connection string:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/

DATABASE_NAME=therapy_portal

# JWT Configuration (CHANGE SECRET_KEY in production!)
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS Configuration (add your frontend URLs)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### 3. Seed Database with Sample Doctor

```bash
cd server
python scripts/seed_doctor.py
```

This will create a sample doctor account:
- **Email**: `dr.rajesh@hospital.com`
- **Password**: `Doctor@123`
- **Name**: Dr. Rajesh Kumar
- **Specialization**: Speech & Language Therapy
- **Experience**: 12 years

### 4. Run the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload

# Or specify host and port
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Or run directly
python main.py
```

The server will start at: `http://localhost:8000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 API Endpoints

### Authentication

#### POST `/api/doctor/login`
Login with email and password

**Request Body:**
```json
{
  "email": "dr.rajesh@hospital.com",
  "password": "Doctor@123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "doctor": {
    "id": "dr_rajesh_001",
    "name": "Dr. Rajesh Kumar",
    "email": "dr.rajesh@hospital.com",
    "specialization": "Speech & Language Therapy",
    "experience_years": 12,
    "assigned_patients": 2
  }
}
```

#### POST `/api/doctor/logout`
Logout (client-side token clearing)

**Response:**
```json
{
  "message": "Logout successful",
  "detail": "Please clear the token from client storage"
}
```

### Protected Routes

#### GET `/api/doctor/profile`
Get current doctor profile (requires authentication)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "id": "dr_rajesh_001",
  "name": "Dr. Rajesh Kumar",
  "email": "dr.rajesh@hospital.com",
  "specialization": "Speech & Language Therapy",
  "experience_years": 12,
  "assigned_patients": 2
}
```

#### GET `/api/doctor/me`
Alias for `/api/doctor/profile`

### Health Check

#### GET `/`
Root endpoint - API status

#### GET `/health`
Detailed health check with database status

## 🧪 Testing with cURL

### Test Login
```bash
curl -X POST http://localhost:8000/api/doctor/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.rajesh@hospital.com","password":"Doctor@123"}'
```

### Test Protected Route
```bash
# Replace YOUR_TOKEN with the token from login response
curl http://localhost:8000/api/doctor/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔒 Security Features

1. **Password Hashing**: Bcrypt with salt rounds for secure password storage
2. **JWT Tokens**: Signed tokens with expiration (default: 24 hours)
3. **CORS Protection**: Configured allowed origins
4. **Input Validation**: Pydantic models with type checking
5. **Error Handling**: Proper HTTP status codes and error messages

## 📁 Project Structure

```
server/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration and settings
├── database.py            # MongoDB connection manager
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── models/
│   ├── __init__.py
│   └── doctor.py         # Doctor data models
├── utils/
│   ├── __init__.py
│   └── auth.py           # Authentication utilities
├── middleware/
│   ├── __init__.py
│   └── auth_middleware.py # JWT authentication middleware
├── routes/
│   ├── __init__.py
│   └── doctor_auth.py    # Authentication routes
└── scripts/
    └── seed_doctor.py    # Database seeding script
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### Import Errors
- Verify all dependencies are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.8+)

### CORS Errors
- Add your frontend URL to `CORS_ORIGINS` in `.env`
- Restart the server after changing `.env`

## 📝 Notes

- The JWT secret key should be changed in production
- Token expiration can be adjusted in `.env`
- Password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 digit
- Default token expiration: 24 hours (1440 minutes)

## 🔄 Next Steps

1. Integrate with React frontend
2. Add more doctor management endpoints (update profile, change password)
3. Implement patient management APIs
4. Add session management endpoints
5. Set up automated tests
