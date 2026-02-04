"""
JWT Authentication Middleware
Protects routes by validating JWT tokens
"""
from typing import Optional, Union
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import db_manager
from utils.auth import decode_access_token
from models.doctor import DoctorResponse
from models.parent import ParentResponse
from models.admin import AdminResponse


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
    print(f"[INFO] Looking up doctor in DB with ID: {doctor_id}")
    doctor_data = db_manager.doctors.find_one({"_id": doctor_id})
    if doctor_data is None and ObjectId.is_valid(doctor_id):
        print(f"[RETRY] Trying ObjectId lookup for doctor: {doctor_id}")
        doctor_data = db_manager.doctors.find_one({"_id": ObjectId(doctor_id)})
        
    if doctor_data is None:
        print(f"[ERROR] Doctor not found in DB: {doctor_id}")
        raise credentials_exception
    print(f"[OK] Doctor found: {doctor_data.get('email')}")
    
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
        is_active=doctor_data.get("is_active", True),
        role="therapist"
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


async def get_current_parent(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> ParentResponse:
    """
    Dependency to get the current authenticated parent
    
    Args:
        credentials: HTTP Authorization header with Bearer token
        
    Returns:
        ParentResponse object
        
    Raises:
        HTTPException: If token is invalid or parent not found
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
    
    # Extract parent ID from token
    parent_id: str = payload.get("sub")
    if parent_id is None:
        raise credentials_exception
    
    # Get parent from database
    print(f"[INFO] Looking up parent in DB with ID: {parent_id}")
    parent_data = db_manager.parents.find_one({"_id": parent_id})
    if parent_data is None and ObjectId.is_valid(parent_id):
        print(f"[RETRY] Trying ObjectId lookup for parent: {parent_id}")
        parent_data = db_manager.parents.find_one({"_id": ObjectId(parent_id)})
        
    if parent_data is None:
        print(f"[ERROR] Parent not found in DB: {parent_id}")
        raise credentials_exception
    print(f"[OK] Parent found: {parent_data.get('email')}")
    
    # Check if parent is active
    if not parent_data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent account is deactivated"
        )
    
    # Return parent response (without password)
    return ParentResponse(
        id=parent_data["_id"],
        name=parent_data["name"],
        email=parent_data["email"],
        phone=parent_data.get("phone"),
        children_ids=parent_data.get("children_ids", []),
        childId=parent_data.get("child_id") or (parent_data.get("children_ids")[0] if parent_data.get("children_ids") else None),
        relationship=parent_data.get("relationship"),
        is_active=parent_data.get("is_active", True)
    )


async def get_current_active_parent(
    current_parent: ParentResponse = Depends(get_current_parent)
) -> ParentResponse:
    """
    Dependency to get current active parent (additional layer)
    
    Args:
        current_parent: Parent from get_current_parent dependency
        
    Returns:
        ParentResponse object
        
    Raises:
        HTTPException: If parent is not active
    """
    if not current_parent.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive parent account"
        )
    return current_parent


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AdminResponse:
    """
    Dependency to get the current authenticated admin
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    admin_id: str = payload.get("sub")
    if admin_id is None:
        raise credentials_exception
    
    print(f"[INFO] Looking up admin in DB with ID: {admin_id}")
    admin_data = db_manager.admins.find_one({"_id": admin_id})
    if admin_data is None and ObjectId.is_valid(admin_id):
        print(f"[RETRY] Trying ObjectId lookup for admin: {admin_id}")
        admin_data = db_manager.admins.find_one({"_id": ObjectId(admin_id)})
        
    if admin_data is None:
        print(f"[ERROR] Admin not found in DB: {admin_id}")
        raise credentials_exception
    print(f"[OK] Admin found: {admin_data.get('email')}")
    
    if not admin_data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is deactivated"
        )
    
    return AdminResponse(
        id=str(admin_data["_id"]),
        name=admin_data["name"],
        email=admin_data["email"],
        role="admin",
        is_active=admin_data.get("is_active", True)
    )
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Generic dependency that allows any authenticated user (Parent, Doctor, or Admin)
    Returns a unified user dict for easier access in routes
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Check if doctor/therapist
    doctor = db_manager.doctors.find_one({"_id": user_id})
    if not doctor and ObjectId.is_valid(user_id):
        doctor = db_manager.doctors.find_one({"_id": ObjectId(user_id)})
    if doctor:
        if not doctor.get("is_active", True):
            raise HTTPException(status_code=403, detail="Doctor account is deactivated")
        return {"id": str(doctor["_id"]), "name": doctor["name"], "role": "therapist", "email": doctor["email"]}
        
    # Check if parent
    parent = db_manager.parents.find_one({"_id": user_id})
    if not parent and ObjectId.is_valid(user_id):
        parent = db_manager.parents.find_one({"_id": ObjectId(user_id)})
    if parent:
        if not parent.get("is_active", True):
            raise HTTPException(status_code=403, detail="Parent account is deactivated")
        return {"id": str(parent["_id"]), "name": parent["name"], "role": "parent", "email": parent["email"]}
        
    # Check if admin
    admin = db_manager.admins.find_one({"_id": user_id})
    if not admin and ObjectId.is_valid(user_id):
        admin = db_manager.admins.find_one({"_id": ObjectId(user_id)})
    if admin:
        if not admin.get("is_active", True):
            raise HTTPException(status_code=403, detail="Admin account is deactivated")
        return {"id": str(admin["_id"]), "name": admin["name"], "role": "admin", "email": admin["email"]}
        
    raise credentials_exception
