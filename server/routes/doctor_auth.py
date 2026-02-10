"""
Doctor Authentication API Routes
Handles login, logout, and profile endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from database import db_manager
from models.doctor import DoctorLogin, DoctorResponse, TokenResponse
from utils.auth import verify_password, create_access_token
from middleware.auth_middleware import get_current_doctor


router = APIRouter(prefix="/api/doctor", tags=["Doctor Authentication"])


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(credentials: DoctorLogin):
    """
    Doctor login endpoint
    
    Validates email and password, returns JWT token on success
    
    Args:
        credentials: Doctor login credentials (email, password)
        
    Returns:
        TokenResponse with access token and doctor information
        
    Raises:
        HTTPException: If credentials are invalid
    """
    print(f"[LOGIN] Attempting login for email: {credentials.email}")
    
    # Find doctor by email
    doctor_data = db_manager.doctors.find_one({"email": credentials.email})
    
    if not doctor_data:
        print(f"[LOGIN ERROR] Doctor not found with email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[LOGIN] Doctor found: {doctor_data.get('name')} (ID: {doctor_data.get('_id')})")
    print(f"[LOGIN] Verifying password...")
    
    # Verify password
    password_valid = verify_password(credentials.password, doctor_data["hashed_password"])
    print(f"[LOGIN] Password verification result: {password_valid}")
    
    if not password_valid:
        print(f"[LOGIN ERROR] Password verification failed for {credentials.email}")
        print(f"[DEBUG] Provided password length: {len(credentials.password)}")
        print(f"[DEBUG] Stored hash starts with: {doctor_data['hashed_password'][:20]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if doctor is active
    if not doctor_data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor account is deactivated. Please contact administrator."
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(doctor_data["_id"]), "email": str(doctor_data["email"])}
    )
    
    # Prepare doctor response - ensure _id is converted to string
    doctor_id = str(doctor_data["_id"])
    doctor_response = DoctorResponse(
        id=doctor_id,
        name=str(doctor_data["name"]),
        email=str(doctor_data["email"]),
        specialization=str(doctor_data["specialization"]),
        experience_years=int(doctor_data["experience_years"]),
        assigned_children=int(doctor_data.get("assigned_children", doctor_data.get("assigned_patients", 0))),
        phone=str(doctor_data.get("phone")) if doctor_data.get("phone") else None,
        license_number=str(doctor_data.get("license_number")) if doctor_data.get("license_number") else None,
        is_active=bool(doctor_data.get("is_active", True)),
        role="therapist"
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        doctor=doctor_response
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    """
    Doctor logout endpoint
    
    Note: JWT tokens are stateless, so logout is handled on the client side
    by removing the token from storage. This endpoint is provided for
    consistency and can be extended to implement token blacklisting if needed.
    
    Returns:
        Success message
    """
    return {
        "message": "Logout successful",
        "detail": "Please clear the token from client storage"
    }


@router.get("/profile", response_model=DoctorResponse, status_code=status.HTTP_200_OK)
async def get_profile(current_doctor: DoctorResponse = Depends(get_current_doctor)):
    """
    Get current doctor profile (protected route)
    
    Requires valid JWT token in Authorization header
    
    Args:
        current_doctor: Current authenticated doctor from middleware
        
    Returns:
        DoctorResponse with doctor information
    """
    return current_doctor


@router.get("/me", response_model=DoctorResponse, status_code=status.HTTP_200_OK)
async def get_me(current_doctor: DoctorResponse = Depends(get_current_doctor)):
    """
    Get current doctor profile (alternative endpoint)
    
    Alias for /profile endpoint
    
    Returns:
        DoctorResponse with doctor information
    """
    return current_doctor
