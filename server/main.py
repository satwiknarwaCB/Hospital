"""
Therapy Portal - Doctor Module Backend
FastAPI application with JWT authentication and MongoDB
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import settings
from database import db_manager
from routes.doctor_auth import router as doctor_auth_router


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


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(doctor_auth_router)


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
