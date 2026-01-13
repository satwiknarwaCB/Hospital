"""
JWT Authentication Middleware
Protects routes by validating JWT tokens
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import db_manager
from utils.auth import decode_access_token
from models.doctor import DoctorResponse


# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_doctor(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> DoctorResponse:
    """
    Dependency to get the current authenticated doctor
    
    Args:
        credentials: HTTP Authorization header with Bearer token
        
    Returns:
        DoctorResponse object
        
    Raises:
        HTTPException: If token is invalid or doctor not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Extract token
    token = credentials.credentials
    
    # Decode token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    # Extract doctor ID from token
    doctor_id: str = payload.get("sub")
    if doctor_id is None:
        raise credentials_exception
    
    # Get doctor from database
    doctor_data = db_manager.doctors.find_one({"_id": doctor_id})
    if doctor_data is None:
        raise credentials_exception
    
    # Check if doctor is active
    if not doctor_data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor account is deactivated"
        )
    
    # Return doctor response (without password)
    return DoctorResponse(
        id=doctor_data["_id"],
        name=doctor_data["name"],
        email=doctor_data["email"],
        specialization=doctor_data["specialization"],
        experience_years=doctor_data["experience_years"],
        assigned_patients=doctor_data["assigned_patients"],
        phone=doctor_data.get("phone"),
        license_number=doctor_data.get("license_number"),
        is_active=doctor_data.get("is_active", True)
    )


async def get_current_active_doctor(
    current_doctor: DoctorResponse = Depends(get_current_doctor)
) -> DoctorResponse:
    """
    Dependency to get current active doctor (additional layer)
    
    Args:
        current_doctor: Doctor from get_current_doctor dependency
        
    Returns:
        DoctorResponse object
        
    Raises:
        HTTPException: If doctor is not active
    """
    if not current_doctor.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive doctor account"
        )
    return current_doctor
