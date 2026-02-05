"""
Therapy Portal - Doctor Module Backend
FastAPI application with JWT authentication and MongoDB
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import settings
from database import db_manager
from routes.doctor_auth import router as doctor_auth_router
from routes.parent_auth import router as parent_auth_router
from routes.admin_auth import router as admin_auth_router
from routes.appointments import router as appointments_router
from routes.sessions import router as sessions_router
from routes.communities import router as communities_router
from routes.messages import router as messages_router
from routes.progress import router as progress_router
from routes.user_management import router as user_management_router
from routes.public_api import router as public_api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Handles startup and shutdown events
    """
    # Startup: Connect to database
    print("[START] Starting Therapy Portal Backend...")
    db_manager.connect()
    yield
    # Shutdown: Close database connection
    print("[STOP] Shutting down Therapy Portal Backend...")
    db_manager.disconnect()


# Create FastAPI application
app = FastAPI(
    title="Therapy Portal - Doctor Module API",
    description="Authentication and management API for doctors in the Therapy Portal",
    version="1.0.0",
    lifespan=lifespan
)

# 1. ADD CORS FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(doctor_auth_router)
app.include_router(parent_auth_router)
app.include_router(admin_auth_router)
app.include_router(appointments_router)
app.include_router(sessions_router)
app.include_router(communities_router)
app.include_router(messages_router)
app.include_router(progress_router)
app.include_router(user_management_router)
app.include_router(public_api_router)


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check"""
    return {
        "status": "online",
        "message": "Therapy Portal Backend API",
        "version": "1.0.0",
        "documentation": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check endpoint"""
    try:
        # Test database connection
        db_manager.get_database().command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "api_version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
