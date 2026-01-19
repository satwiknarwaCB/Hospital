"""
Admin Authentication API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from database import db_manager
from models.admin import AdminLogin, AdminResponse, AdminTokenResponse
from utils.auth import verify_password, create_access_token
from middleware.auth_middleware import get_current_admin


router = APIRouter(prefix="/api/admin", tags=["Admin Authentication"])


@router.post("/login", response_model=AdminTokenResponse, status_code=status.HTTP_200_OK)
async def login(credentials: AdminLogin):
    """
    Admin login endpoint
    """
    # Find admin by email
    admin_data = db_manager.admins.find_one({"email": credentials.email})
    
    if not admin_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(credentials.password, admin_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if admin is active
    if not admin_data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is deactivated."
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(admin_data["_id"]), "email": str(admin_data["email"]), "role": "admin"}
    )
    
    # Prepare admin response
    admin_response = AdminResponse(
        id=str(admin_data["_id"]),
        name=str(admin_data["name"]),
        email=str(admin_data["email"]),
        role="admin",
        is_active=bool(admin_data.get("is_active", True))
    )
    
    return AdminTokenResponse(
        access_token=access_token,
        token_type="bearer",
        admin=admin_response
    )


@router.get("/profile", response_model=AdminResponse, status_code=status.HTTP_200_OK)
async def get_profile(current_admin: AdminResponse = Depends(get_current_admin)):
    """
    Get current admin profile (protected route)
    """
    return current_admin
