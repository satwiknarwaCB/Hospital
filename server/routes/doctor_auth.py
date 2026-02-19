"""
Doctor Authentication API Routes
Handles login, logout, and profile endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from database import db_manager
from models.doctor import DoctorLogin, DoctorResponse, TokenResponse, DoctorUpdate
from utils.auth import verify_password, create_access_token
from middleware.auth_middleware import get_current_doctor
from datetime import datetime, timezone
from bson import ObjectId


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
    
    # Find doctor by email (case-insensitive)
    import re
    doctor_data = db_manager.doctors.find_one({"email": {"$regex": f"^{re.escape(credentials.email)}$", "$options": "i"}})
    
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
        name=str(doctor_data.get("name", "Unknown")),
        email=str(doctor_data.get("email", "")),
        specialization=str(doctor_data.get("specialization", "N/A")),
        experience_years=int(doctor_data.get("experience_years", 0)) if doctor_data.get("experience_years") is not None else 0,
        assigned_children=int(doctor_data.get("assigned_children", 0)) if doctor_data.get("assigned_children") is not None else int(doctor_data.get("assigned_patients", 0)) if doctor_data.get("assigned_patients") is not None else 0,
        phone=str(doctor_data.get("phone")) if doctor_data.get("phone") else None,
        license_number=str(doctor_data.get("license_number")) if doctor_data.get("license_number") else None,
        is_active=bool(doctor_data.get("is_active", True)),
        role="therapist",
        avatar=str(doctor_data.get("avatar")) if doctor_data.get("avatar") else None,
        address=str(doctor_data.get("address")) if doctor_data.get("address") else None,
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


@router.put("/profile", response_model=DoctorResponse, status_code=status.HTTP_200_OK)
async def update_profile(
    update_data: DoctorUpdate,
    current_doctor: DoctorResponse = Depends(get_current_doctor)
):
    """
    Update doctor/therapist profile

    Updates editable fields: name, phone, address, avatar
    """
    print(f"[PROFILE] Doctor/Therapist update request for: {current_doctor.email}")
    try:
        # Prepare update fields
        update_fields = {}
        if update_data.name:
            update_fields["name"] = update_data.name
        if update_data.phone:
            update_fields["phone"] = update_data.phone
        if update_data.address is not None:
            update_fields["address"] = update_data.address
        if update_data.avatar is not None:
            update_fields["avatar"] = update_data.avatar

        update_fields["updated_at"] = datetime.now(timezone.utc)

        if not update_fields or len(update_fields) == 1:  # only updated_at
            print("[PROFILE] No changes detected, skipping update")
            return current_doctor

        update_command = {"$set": update_fields}

        # Robust Update Logic: Try String ID first, then ObjectId
        doctor_id = current_doctor.id
        filter_query = {"_id": doctor_id}

        print(f"[PROFILE] Attempting update with String ID: {doctor_id}")
        result = db_manager.doctors.update_one(filter_query, update_command)

        if result.matched_count == 0:
            if ObjectId.is_valid(doctor_id):
                print(f"[PROFILE] String ID match failed. Attempting ObjectId: {doctor_id}")
                filter_query = {"_id": ObjectId(doctor_id)}
                result = db_manager.doctors.update_one(filter_query, update_command)

        if result.matched_count == 0:
            print("[ERROR] Doctor not found during update (checked both String and ObjectId)")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found"
            )

        # Fetch updated doctor using the successful filter_query
        updated_doctor_data = db_manager.doctors.find_one(filter_query)

        if not updated_doctor_data:
            print("[ERROR] Update reported success but document fetch failed")
            raise HTTPException(status_code=500, detail="Update verification failed")

        print("[PROFILE] Doctor/Therapist profile update successful")

        # Return updated profile
        return DoctorResponse(
            id=str(updated_doctor_data["_id"]),
            name=str(updated_doctor_data.get("name", "Unknown")),
            email=str(updated_doctor_data.get("email", "")),
            specialization=str(updated_doctor_data.get("specialization", "N/A")),
            experience_years=int(updated_doctor_data.get("experience_years", 0)) if updated_doctor_data.get("experience_years") is not None else 0,
            assigned_children=int(updated_doctor_data.get("assigned_children", 0)) if updated_doctor_data.get("assigned_children") is not None else int(updated_doctor_data.get("assigned_patients", 0)) if updated_doctor_data.get("assigned_patients") is not None else 0,
            phone=str(updated_doctor_data.get("phone")) if updated_doctor_data.get("phone") else None,
            license_number=str(updated_doctor_data.get("license_number")) if updated_doctor_data.get("license_number") else None,
            is_active=bool(updated_doctor_data.get("is_active", True)),
            role="therapist",
            avatar=str(updated_doctor_data.get("avatar")) if updated_doctor_data.get("avatar") else None,
            address=str(updated_doctor_data.get("address")) if updated_doctor_data.get("address") else None,
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[ERROR] Failed to update doctor profile: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile. Server error: {str(e)}"
        )
