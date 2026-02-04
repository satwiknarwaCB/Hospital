from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional
from database import db_manager
from models.doctor import DoctorCreate, DoctorResponse
from models.parent import ParentCreate, ParentResponse
from utils.auth import hash_password
from models.admin import AdminResponse
from middleware.auth_middleware import get_current_admin
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/admin/users", tags=["Admin User Management"])

@router.post("/therapist", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_therapist(
    request: Request,
    therapist: DoctorCreate,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Create a new therapist account
    """
    print(f"[ADMIN] Admin {current_admin.email} is creating therapist: {therapist.email}")
    # Check if therapist already exists
    if db_manager.doctors.find_one({"email": therapist.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Therapist with this email already exists"
        )
    
    # Create therapist record
    hashed_password = hash_password(therapist.password)
    
    doctor_id = str(uuid.uuid4())
    doctor_data = {
        "_id": doctor_id,
        "name": therapist.name,
        "email": therapist.email,
        "hashed_password": hashed_password,
        "specialization": therapist.specialization,
        "experience_years": therapist.experience_years,
        "assigned_patients": therapist.assigned_patients,
        "phone": therapist.phone,
        "license_number": therapist.license_number,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    db_manager.doctors.insert_one(doctor_data)
    
    return DoctorResponse(
        id=doctor_id,
        name=doctor_data["name"],
        email=doctor_data["email"],
        specialization=doctor_data["specialization"],
        experience_years=doctor_data["experience_years"],
        assigned_patients=doctor_data["assigned_patients"],
        phone=doctor_data.get("phone"),
        license_number=doctor_data.get("license_number"),
        is_active=True,
        role="therapist"
    )

@router.post("/parent", response_model=ParentResponse, status_code=status.HTTP_201_CREATED)
async def create_parent(
    request: Request,
    parent: ParentCreate,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Create a new parent account
    """
    print(f"[ADMIN] Admin {current_admin.email} is creating parent: {parent.email}")
    # Check if parent already exists
    if db_manager.parents.find_one({"email": parent.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parent with this email already exists"
        )
    
    # Create parent record
    hashed_password = hash_password(parent.password)
    
    parent_id = str(uuid.uuid4())
    parent_data = {
        "_id": parent_id,
        "name": parent.name,
        "email": parent.email,
        "hashed_password": hashed_password,
        "phone": parent.phone,
        "children_ids": parent.children_ids,
        "relationship": parent.relationship,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    db_manager.parents.insert_one(parent_data)
    
    return ParentResponse(
        id=parent_id,
        name=parent_data["name"],
        email=parent_data["email"],
        phone=parent_data.get("phone"),
        children_ids=parent_data["children_ids"],
        childId=parent_data["children_ids"][0] if parent_data["children_ids"] else None,
        relationship=parent_data.get("relationship"),
        is_active=True,
        role="parent"
    )

@router.get("/therapists", response_model=List[DoctorResponse])
async def list_therapists(current_admin: AdminResponse = Depends(get_current_admin)):
    """
    List all therapist accounts
    """
    doctors = list(db_manager.doctors.find())
    return [
        DoctorResponse(
            id=str(d["_id"]),
            name=d["name"],
            email=d["email"],
            specialization=d["specialization"],
            experience_years=d.get("experience_years", 0),
            assigned_patients=d.get("assigned_patients", 0),
            phone=d.get("phone"),
            license_number=d.get("license_number"),
            is_active=d.get("is_active", True),
            role="therapist"
        ) for d in doctors
    ]

@router.get("/parents", response_model=List[ParentResponse])
async def list_parents(current_admin: AdminResponse = Depends(get_current_admin)):
    """
    List all parent accounts
    """
    parents = list(db_manager.parents.find())
    return [
        ParentResponse(
            id=str(p["_id"]),
            name=p["name"],
            email=p["email"],
            phone=p.get("phone"),
            children_ids=p.get("children_ids", []),
            childId=p.get("child_id") or (p.get("children_ids")[0] if p.get("children_ids") else None),
            relationship=p.get("relationship"),
            is_active=p.get("is_active", True),
            role="parent"
        ) for p in parents
    ]
