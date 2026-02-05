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
    Create a new therapist account. If password omitted, generates invitation link.
    """
    print(f"[ADMIN] Admin {current_admin.email} is creating therapist: {therapist.email}")
    
    if db_manager.doctors.find_one({"email": therapist.email}):
        raise HTTPException(status_code=400, detail="Therapist with this email already exists")
    
    doctor_id = str(uuid.uuid4())
    activation_token = None
    invitation_link = None
    
    if therapist.password:
        hashed_password = hash_password(therapist.password)
        is_active = True
    else:
        # Invitation flow
        activation_token = str(uuid.uuid4())
        hashed_password = hash_password(str(uuid.uuid4())) # Random placeholder
        invitation_link = f"http://localhost:5173/activate?token={activation_token}&role=therapist"
        is_active = False # Inactive until password set
    
    # Check for assigned child ID (Seeding Logic)
    assigned_child_id = request.query_params.get("assigned_child")
    
    if not assigned_child_id:
        # Create Demo Patient
        demo_patient_id = str(uuid.uuid4())
        demo_patient = {
            "_id": demo_patient_id,
            "name": f"Demo Patient for {therapist.name.split()[0]}",
            "age": 6,
            "diagnosis": "Autism Spectrum Disorder",
            "therapist_ids": [doctor_id],
            "created_at": datetime.now(timezone.utc)
        }
        try:
            db_manager.patients.insert_one(demo_patient)
            assigned_child_id = demo_patient_id
        except Exception as e:
            print(f"Failed to create demo patient: {e}")
    else:
        db_manager.patients.update_one(
            {"_id": assigned_child_id},
            {"$addToSet": {"therapist_ids": doctor_id}}
        )

    doctor_data = {
        "_id": doctor_id,
        "name": therapist.name,
        "email": therapist.email,
        "hashed_password": hashed_password,
        "specialization": therapist.specialization,
        "experience_years": therapist.experience_years,
        "assigned_patients": 1 if assigned_child_id else 0,
        "phone": therapist.phone,
        "license_number": therapist.license_number,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_active": is_active,
        "activation_token": activation_token
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
        is_active=doctor_data["is_active"],
        role="therapist",
        invitation_link=invitation_link
    )

@router.post("/parent", response_model=ParentResponse, status_code=status.HTTP_201_CREATED)
async def create_parent(
    request: Request,
    parent: ParentCreate,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Create a new parent account. If password omitted, generates invitation link.
    """
    print(f"[ADMIN] Admin {current_admin.email} is creating parent: {parent.email}")
    
    if db_manager.parents.find_one({"email": parent.email}):
        raise HTTPException(status_code=400, detail="Parent with this email already exists")
    
    parent_id = str(uuid.uuid4())
    activation_token = None
    invitation_link = None
    
    if parent.password:
        hashed_password = hash_password(parent.password)
        is_active = True
    else:
        # Invitation flow
        activation_token = str(uuid.uuid4())
        hashed_password = hash_password(str(uuid.uuid4()))
        invitation_link = f"http://localhost:5173/activate?token={activation_token}&role=parent"
        is_active = False

    children_ids = parent.children_ids
    
    # Auto-create demo child logic
    if not children_ids:
        child_id = str(uuid.uuid4())
        child_data = {
            "_id": child_id,
            "name": f"Child of {parent.name.split()[0]}",
            "age": 5,
            "parent_id": parent_id,
            "diagnosis": "Pending Assessment",
            "created_at": datetime.now(timezone.utc)
        }
        try:
            db_manager.patients.insert_one(child_data)
            children_ids = [child_id]
        except Exception as e:
            print(f"Failed to create demo child: {e}")

    parent_data = {
        "_id": parent_id,
        "name": parent.name,
        "email": parent.email,
        "hashed_password": hashed_password,
        "phone": parent.phone,
        "children_ids": children_ids,
        "relationship": parent.relationship,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_active": is_active,
        "activation_token": activation_token
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
        is_active=parent_data["is_active"],
        role="parent",
        invitation_link=invitation_link
    )

@router.delete("/therapist/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_therapist(
    user_id: str,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Delete a therapist account
    """
    result = db_manager.doctors.delete_one({"_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Therapist not found")
    return None

@router.delete("/parent/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_parent(
    user_id: str,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Delete a parent account
    """
    result = db_manager.parents.delete_one({"_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Parent not found")
    return None

@router.get("/children", response_model=List[dict])
async def list_children(current_admin: AdminResponse = Depends(get_current_admin)):
    """
    List all children for assignment
    """
    # Assuming 'patients' collection holds children data. 
    # If not, we might need to look at parents' children_ids, but separate collection is better.
    # checking db_manager.patients
    children = list(db_manager.patients.find({}, {"name": 1, "_id": 1}))
    return [{"id": str(c["_id"]), "name": c["name"]} for c in children]


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
