from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional
from database import db_manager
from models.doctor import DoctorCreate, DoctorResponse
from models.parent import ParentCreate, ParentResponse
from utils.auth import hash_password
from models.admin import AdminResponse
from middleware.auth_middleware import get_current_admin, get_current_user
from datetime import datetime, timezone
import uuid
from bson import ObjectId
from utils.email import send_invitation_email
from fastapi import BackgroundTasks
from config import settings

router = APIRouter(prefix="/api/admin/users", tags=["Admin User Management"])

@router.get("/stats")
async def get_admin_stats(current_admin: AdminResponse = Depends(get_current_admin)):
    """
    Get global statistics for the admin dashboard.
    """
    therapist_count = db_manager.doctors.count_documents({})
    parent_count = db_manager.parents.count_documents({})
    child_count = db_manager.children.count_documents({}) # Assuming children collection stores children
    
    return {
        "therapist_count": therapist_count,
        "parent_count": parent_count,
        "child_count": child_count,
        "active_children": child_count # Simplified for now
    }


@router.post("/therapist", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
async def create_therapist(
    request: Request,
    therapist: DoctorCreate,
    background_tasks: BackgroundTasks,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Create a new therapist account. If password omitted, generates invitation link.
    """
    print(f"[ADMIN] Admin {current_admin.email} is creating therapist: {therapist.email}")
    
    if db_manager.doctors.find_one({"email": therapist.email}):
        raise HTTPException(status_code=400, detail="Therapist with this email already exists")
    
    # Cross-collection check: prevent same email in parents collection
    if db_manager.parents.find_one({"email": therapist.email}):
        raise HTTPException(status_code=400, detail="This email is already registered as a Parent. Please use a different email or add from the Parents tab.")
    
    doctor_id = str(uuid.uuid4())
    activation_token = str(uuid.uuid4())
    invitation_link = f"{settings.FRONTEND_URL}/activate?token={activation_token}&role=therapist"
    
    if therapist.password:
        hashed_password = hash_password(therapist.password)
        is_active = True
    else:
        # Full invitation flow (starts inactive)
        hashed_password = hash_password(str(uuid.uuid4())) # Random placeholder
        is_active = False
    
    # Patient assignment logic removed as requested.
    assigned_child_id = None

    doctor_data = {
        "_id": doctor_id,
        "name": therapist.name,
        "email": therapist.email,
        "hashed_password": hashed_password,
        "specialization": therapist.specialization,
        "experience_years": therapist.experience_years,
        "assigned_children": 1 if assigned_child_id else 0,
        "phone": therapist.phone,
        "license_number": therapist.license_number,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_active": is_active,
        "activation_token": activation_token
    }
    
    db_manager.doctors.insert_one(doctor_data)
    
    # Send invitation email if it's an invitation flow
    if invitation_link:
        background_tasks.add_task(
            send_invitation_email,
            email=therapist.email,
            name=therapist.name,
            role="therapist",
            invitation_link=invitation_link
        )
    
    return DoctorResponse(
        id=doctor_id,
        name=doctor_data["name"],
        email=doctor_data["email"],
        specialization=doctor_data["specialization"],
        experience_years=doctor_data["experience_years"],
        assigned_children=doctor_data["assigned_children"],
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
    background_tasks: BackgroundTasks,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Create a new parent account. If password omitted, generates invitation link.
    """
    print(f"[ADMIN] Admin {current_admin.email} is creating parent: {parent.email}")
    
    if db_manager.parents.find_one({"email": parent.email}):
        raise HTTPException(status_code=400, detail="Parent with this email already exists")
    
    # Cross-collection check: prevent same email in doctors/therapist collection
    if db_manager.doctors.find_one({"email": parent.email}):
        raise HTTPException(status_code=400, detail="This email is already registered as a Therapist. Please use a different email or add from the Therapists tab.")
    
    parent_id = str(uuid.uuid4())
    activation_token = str(uuid.uuid4())
    invitation_link = f"{settings.FRONTEND_URL}/activate?token={activation_token}&role=parent"
    
    if parent.password:
        hashed_password = hash_password(parent.password)
        is_active = True
    else:
        # Full invitation flow (starts inactive)
        hashed_password = hash_password(str(uuid.uuid4()))
        is_active = False

    children_ids = parent.children_ids

    parent_data = {
        "_id": parent_id,
        "name": parent.name,
        "email": parent.email,
        "hashed_password": hashed_password,
        "phone": parent.phone,
        "address": parent.address,
        "children_ids": children_ids,
        "relationship": parent.relationship,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_active": is_active,
        "activation_token": activation_token
    }
    
    db_manager.parents.insert_one(parent_data)
    
    # Send invitation email if it's an invitation flow
    if invitation_link:
        background_tasks.add_task(
            send_invitation_email,
            email=parent.email,
            name=parent.name,
            role="parent",
            invitation_link=invitation_link
        )
    
    return ParentResponse(
        id=parent_id,
        name=parent_data["name"],
        email=parent_data["email"],
        phone=parent_data.get("phone"),
        address=parent_data.get("address"),
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
    
@router.patch("/{role}/{user_id}/status")
async def toggle_user_status(
    role: str,
    user_id: str,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Toggle a user's account status (enabled/disabled)
    """
    collection = db_manager.doctors if role == "therapist" else db_manager.parents
    
    user = collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail=f"{role.capitalize()} not found")
        
    new_status = not user.get("is_active", True)
    
    collection.update_one(
        {"_id": user_id},
        {"$set": {"is_active": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"status": "success", "is_active": new_status}

from models.child import ChildCreate, ChildResponse

# ... (other imports remain)

# ... (existing code)

@router.get("/children", response_model=List[ChildResponse])
async def list_children(current_user: dict = Depends(get_current_user)):
    """
    List all children with full details
    """
    children = list(db_manager.children.find())
    return [
        ChildResponse(
            id=str(c["_id"]),
            name=c["name"],
            age=c.get("age", 0),
            gender=c.get("gender", "Unknown"),
            condition=c.get("condition", "None"),
            school_name=c.get("school_name"),
            parent_id=c.get("parent_id", ""),
            therapistId=c.get("therapistId"),
            photoUrl=c.get("photoUrl"),
            program=c.get("program", []),
            currentMood=c.get("currentMood"),
            moodContext=c.get("moodContext"),
            streak=c.get("streak", 0),
            schoolReadinessScore=c.get("schoolReadinessScore", 0),
            status=c.get("status", "active"),
            documents=c.get("documents", []),
            created_at=c.get("created_at", datetime.now(timezone.utc))
        ) for c in children
    ]

@router.post("/child", response_model=ChildResponse, status_code=status.HTTP_201_CREATED)
async def create_child(
    child: ChildCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new child record and link to parent
    """
    
    # Check if parent exists - handle both string ID and ObjectId
    parent = db_manager.parents.find_one({"_id": child.parent_id})
    if not parent and ObjectId.is_valid(child.parent_id):
        parent = db_manager.parents.find_one({"_id": ObjectId(child.parent_id)})
        
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")

    child_id = str(uuid.uuid4())
    current_time = datetime.now(timezone.utc)
    
    child_data = {
        "_id": child_id,
        "name": child.name,
        "age": child.age,
        "gender": child.gender,
        "condition": child.condition,
        "school_name": child.school_name,
        "parent_id": child.parent_id,
        "therapistId": None,
        "status": "active",
        "created_at": current_time,
        "updated_at": current_time
    }
    
    # Insert child
    db_manager.children.insert_one(child_data)
    
    # Update parent's children_ids
    parent_filter = {"_id": child.parent_id}
    result = db_manager.parents.update_one(
        parent_filter,
        {"$push": {"children_ids": child_id}}
    )
    if result.matched_count == 0 and ObjectId.is_valid(child.parent_id):
        db_manager.parents.update_one(
            {"_id": ObjectId(child.parent_id)},
            {"$push": {"children_ids": child_id}}
        )
    
    return ChildResponse(
        id=child_id,
        name=child.name,
        age=child.age,
        gender=child.gender,
        condition=child.condition,
        school_name=child.school_name,
        parent_id=child.parent_id,
        therapistId=None,
        created_at=current_time
    )

@router.delete("/child/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_child(
    child_id: str,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Delete a child record
    """
    child_filter = {"_id": child_id}
    child = db_manager.children.find_one(child_filter)
    if not child and ObjectId.is_valid(child_id):
        child_filter = {"_id": ObjectId(child_id)}
        child = db_manager.children.find_one(child_filter)

    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
        
    parent_id = child.get("parent_id")
    
    # Remove from parent's list
    if parent_id:
        db_manager.parents.update_one(
            {"_id": parent_id},
            {"$pull": {"children_ids": child_id}}
        )
        
    # Delete child
    db_manager.children.delete_one(child_filter)
    
    return None

@router.patch("/child/{child_id}/assign/{therapist_id}")
async def assign_child_to_therapist(
    child_id: str,
    therapist_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Assign a child to a therapist. Use 'none' to unassign.
    """
    # Authorization: Admin can do anything. Therapist can only assign to themselves.
    if current_user["role"] != "admin":
        if current_user["role"] != "therapist":
             raise HTTPException(status_code=403, detail="Not authorized")
        if therapist_id.lower() != "none" and current_user["id"] != therapist_id:
             raise HTTPException(status_code=403, detail="Can only assign to yourself")
        if therapist_id.lower() == "none" and current_user["role"] == "therapist":
             # Optional: Allow therapist to unassign themselves?
             # For now, let's assume they can only UNASSIGN themselves if they are currently assigned?
             # But the frontend logic for 'addChild' calls this with 'currentUser.id', so it's an assignment.
             pass

    # Use "none" as a special value to unassign
    update_val = therapist_id if therapist_id.lower() != "none" else None
    
    child_filter = {"_id": child_id}
    result = db_manager.children.update_one(
        child_filter,
        {"$set": {"therapistId": update_val, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0 and ObjectId.is_valid(child_id):
        child_filter = {"_id": ObjectId(child_id)}
        result = db_manager.children.update_one(
            child_filter,
            {"$set": {"therapistId": update_val, "updated_at": datetime.now(timezone.utc)}}
        )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Child not found")
        
    return {"message": "Success"}


@router.get("/therapists", response_model=List[DoctorResponse])
async def list_therapists(current_user: dict = Depends(get_current_user)):
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
            assigned_children=d.get("assigned_children", 0),
            phone=d.get("phone"),
            license_number=d.get("license_number"),
            is_active=d.get("is_active", True),
            created_at=d.get("created_at"),
            role="therapist"
        ) for d in doctors
    ]

@router.get("/parents", response_model=List[ParentResponse])
async def list_parents(current_user: dict = Depends(get_current_user)):
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
            address=p.get("address"),
            avatar=p.get("avatar"),
            children_ids=p.get("children_ids", []),
            childId=p.get("child_id") or (p.get("children_ids")[0] if p.get("children_ids") else None),
            relationship=p.get("relationship"),
            is_active=p.get("is_active", True),
            created_at=p.get("created_at"),
            role="parent"
        ) for p in parents
    ]
