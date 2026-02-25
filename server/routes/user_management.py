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
import re
from utils.email import send_invitation_email
from fastapi import BackgroundTasks
from config import settings

router = APIRouter(prefix="/api/admin/users", tags=["Admin User Management"])

def get_next_id(collection, prefix: str) -> str:
    """
    Find the next available ID for a given prefix (e.g., TH-1001)
    """
    # Regex to find IDs starting with PREFIX-
    pattern = f"^{prefix}-\d+$"
    docs = list(collection.find({"_id": {"$regex": pattern}}))
    
    max_num = 1000
    for doc in docs:
        try:
            num = int(doc["_id"].split("-")[1])
            if num > max_num:
                max_num = num
        except (ValueError, IndexError):
            continue
            
    return f"{prefix}-{max_num + 1}"

@router.get("/stats")
async def get_admin_stats(current_admin: AdminResponse = Depends(get_current_admin)):
    """
    Get global statistics for the admin dashboard.
    """
    therapist_count = db_manager.doctors.count_documents({})
    parent_count = db_manager.parents.count_documents({})
    child_count = db_manager.children.count_documents({})
    
    # Ongoing therapies: Children who have at least one therapist assigned
    ongoing_therapies = db_manager.children.count_documents({
        "$or": [
            {"therapistId": {"$ne": None, "$exists": True}},
            {"therapistIds": {"$exists": True, "$not": {"$size": 0}}}
        ]
    })
    
    # Pending assignments: Children with no therapist assigned
    pending_assignments = db_manager.children.count_documents({
        "$and": [
            {"$or": [{"therapistId": None}, {"therapistId": {"$exists": False}}]},
            {"$or": [{"therapistIds": None}, {"therapistIds": {"$exists": False}}, {"therapistIds": {"$size": 0}}]}
        ]
    })
    
    return {
        "therapist_count": therapist_count,
        "parent_count": parent_count,
        "child_count": child_count,
        "active_children": child_count, # Keeping for backward compatibility
        "ongoing_therapies": ongoing_therapies,
        "pending_assignments": pending_assignments
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
    
    doctor_id = get_next_id(db_manager.doctors, "TH")
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
        "qualification": therapist.qualification,
        "experience_years": therapist.experience_years,
        "assigned_children": 1 if assigned_child_id else 0,
        "phone": therapist.phone,
        "profile_photo": therapist.profile_photo,
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
        qualification=doctor_data.get("qualification"),
        experience_years=doctor_data["experience_years"],
        assigned_children=doctor_data["assigned_children"],
        phone=doctor_data.get("phone"),
        profile_photo=doctor_data.get("profile_photo"),
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
    
    parent_id = get_next_id(db_manager.parents, "PA")
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
    if role == "child":
        collection = db_manager.children
    else:
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

@router.put("/therapist/{user_id}")
async def update_therapist(
    user_id: str,
    therapist_update: dict,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Update therapist details (name, email, specialization, experience, phone, license)
    """
    therapist = db_manager.doctors.find_one({"_id": user_id})
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")
    
    # Prepare update fields
    update_fields = {}
    allowed_fields = ["name", "email", "specialization", "qualification", "experience_years", "phone", "profile_photo", "license_number"]
    
    for field in allowed_fields:
        if field in therapist_update and therapist_update[field] is not None:
            update_fields[field] = therapist_update[field]
    
    # Check if email is being changed and if it's already taken
    if "email" in update_fields and update_fields["email"] != therapist["email"]:
        existing = db_manager.doctors.find_one({"email": update_fields["email"]})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use by another therapist")
    
    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc)
        db_manager.doctors.update_one(
            {"_id": user_id},
            {"$set": update_fields}
        )
    
    return {"status": "success", "message": "Therapist updated successfully"}

@router.put("/parent/{user_id}")
async def update_parent(
    user_id: str,
    parent_update: dict,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Update parent details (name, email, phone, address, relationship)
    """
    parent = db_manager.parents.find_one({"_id": user_id})
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    
    # Prepare update fields
    update_fields = {}
    allowed_fields = ["name", "email", "phone", "address", "relationship"]
    
    for field in allowed_fields:
        if field in parent_update and parent_update[field] is not None:
            update_fields[field] = parent_update[field]
    
    # Check if email is being changed and if it's already taken
    if "email" in update_fields and update_fields["email"] != parent["email"]:
        existing = db_manager.parents.find_one({"email": update_fields["email"]})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use by another parent")
    
    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc)
        db_manager.parents.update_one(
            {"_id": user_id},
            {"$set": update_fields}
        )
    
    return {"status": "success", "message": "Parent updated successfully"}

@router.post("/reset-password")
async def reset_password(
    request_data: dict,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Reset password for a user (therapist or parent)
    Admin can set a new password when user can't login
    """
    role = request_data.get("role")  # 'therapist' or 'parent'
    user_id = request_data.get("user_id")
    new_password = request_data.get("new_password")
    
    if not all([role, user_id, new_password]):
        raise HTTPException(status_code=400, detail="Missing required fields: role, user_id, new_password")
    
    # Validate password strength (minimum 8 characters)
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    collection = db_manager.doctors if role == "therapist" else db_manager.parents
    
    user = collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail=f"{role.capitalize()} not found")
    
    # Hash the new password
    hashed_password = hash_password(new_password)
    
    # Update password and set account as active
    collection.update_one(
        {"_id": user_id},
        {
            "$set": {
                "hashed_password": hashed_password,
                "is_active": True,  # Ensure account is active after password reset
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {
        "status": "success", 
        "message": f"Password reset successfully for {user['name']}"
    }

from models.child import ChildCreate, ChildResponse

@router.get("/children", response_model=List[ChildResponse])
async def list_children(current_user: dict = Depends(get_current_user)):
    """
    List all children with full details
    """
    children_docs = list(db_manager.children.find())
    print(f"[DEBUG] Fetched {len(children_docs)} children from database")
    
    response_list = []
    for c in children_docs:
        # Reconcile therapistId and therapistIds
        t_id = c.get("therapistId")
        t_ids = c.get("therapistIds", [])
        if not isinstance(t_ids, list): t_ids = []
        
        # Backward compatibility: ensure primary is in the list
        if t_id and t_id not in t_ids:
            t_ids.append(t_id)
            
        response_list.append(ChildResponse(
            id=str(c["_id"]),
            name=c["name"],
            age=c.get("age", 0),
            gender=c.get("gender", "Unknown"),
            condition=c.get("condition", "None"),
            school_name=c.get("school_name"),
            parent_id=c.get("parent_id", ""),
            therapistId=t_id,
            therapistIds=t_ids,
            photoUrl=c.get("photoUrl"),
            program=c.get("program", []),
            currentMood=c.get("currentMood"),
            moodContext=c.get("moodContext"),
            streak=c.get("streak", 0),
            schoolReadinessScore=c.get("schoolReadinessScore", 0),
            status=c.get("status", "active"),
            documents=c.get("documents", []),
            is_active=c.get("is_active", True),
            therapy_start_date=c.get("therapy_start_date") or c.get("enrollmentDate") or (c.get("created_at").isoformat() if hasattr(c.get("created_at"), 'isoformat') else str(c.get("created_at")) if c.get("created_at") else None),
            therapy_type=c.get("therapy_type") or (c.get("program")[0] if c.get("program") and isinstance(c.get("program"), list) else "Speech Therapy"),
            therapy_start_dates=c.get("therapy_start_dates", {}),
            created_at=c.get("created_at", datetime.now(timezone.utc))
        ))
    
    return response_list

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

    child_id = get_next_id(db_manager.children, "CH")
    current_time = datetime.now(timezone.utc)
    
    child_data = {
        "_id": child_id,
        "name": child.name,
        "age": child.age,
        "gender": child.gender,
        "condition": child.condition,
        "school_name": child.school_name,
        "parent_id": child.parent_id,
        "therapy_start_date": child.therapy_start_date,
        "therapy_type": child.therapy_type,
        "therapistId": None,
        "therapistIds": [],
        "is_active": True,
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
        therapistIds=[],
        is_active=True,
        therapy_start_date=child.therapy_start_date,
        therapy_type=child.therapy_type,
        created_at=current_time
    )

@router.put("/child/{child_id}")
async def update_child(
    child_id: str,
    child_update: dict,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Update child details (name, age, gender, condition, school_name)
    """
    child = db_manager.children.find_one({"_id": child_id})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    # Prepare update fields
    update_fields = {}
    allowed_fields = ["name", "age", "gender", "condition", "school_name", "therapy_start_date", "therapy_type"]
    
    for field in allowed_fields:
        if field in child_update and child_update[field] is not None:
            update_fields[field] = child_update[field]
    
    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc)
        db_manager.children.update_one(
            {"_id": child_id},
            {"$set": update_fields}
        )
    
    return {"status": "success", "message": "Child updated successfully"}

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
    Assign a child to a therapist (adds to therapistIds list)
    Supports multiple therapists per child
    """
    # Authorization: Admin can do anything. Therapist can only assign to themselves.
    if current_user["role"] != "admin":
        if current_user["role"] != "therapist":
             raise HTTPException(status_code=403, detail="Not authorized")
        if therapist_id.lower() != "none" and current_user["id"] != therapist_id:
             raise HTTPException(status_code=403, detail="Can only assign to yourself")

    print(f"[ASSIGN] Assigning {child_id} to {therapist_id}")
    
    # Use "none" as a special value to unassign
    update_val = therapist_id if therapist_id.lower() != "none" else None
    
    # 1. Get current state to ensure we don't lose the existing primary therapist
    child = db_manager.children.find_one({"_id": child_id})
    if not child and ObjectId.is_valid(child_id):
        child = db_manager.children.find_one({"_id": ObjectId(child_id)})
        
    if not child:
        print(f"[ASSIGN] ERROR: Child {child_id} not found")
        raise HTTPException(status_code=404, detail="Child not found")
        
    current_primary = child.get("therapistId")
    current_ids = child.get("therapistIds", [])
    if not isinstance(current_ids, list):
        current_ids = []
    
    # Ensure current primary is in the list
    if current_primary and current_primary not in current_ids:
        current_ids.append(current_primary)
    
    # Add the new therapist
    current_start_dates = child.get("therapy_start_dates", {})
    if not isinstance(current_start_dates, dict):
        current_start_dates = {}

    if update_val and update_val not in current_ids:
        current_ids.append(update_val)
        # Set start date for THIS therapist assignment
        current_start_dates[update_val] = datetime.now(timezone.utc).isoformat()
        
    # 2. Update with the full list and set the new one as primary
    db_manager.children.update_one(
        {"_id": child["_id"]},
        {
            "$set": {
                "therapistIds": current_ids,
                "therapistId": update_val if update_val else current_primary,
                "therapy_start_dates": current_start_dates,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    print(f"[ASSIGN] SUCCESS: Child {child_id} now has therapists: {current_ids}")
    return {"message": "Therapist assigned successfully", "therapistIds": current_ids}

@router.delete("/child/{child_id}/assign/{therapist_id}")
async def unassign_child_from_therapist(
    child_id: str,
    therapist_id: str,
    current_admin: AdminResponse = Depends(get_current_admin)
):
    """
    Unassign a child from a specific therapist (removes from therapistIds list)
    """
    # 1. Find the child
    child = db_manager.children.find_one({"_id": child_id})
    if not child and ObjectId.is_valid(child_id):
        child = db_manager.children.find_one({"_id": ObjectId(child_id)})
        
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    # 2. Remove from therapistIds list
    result = db_manager.children.update_one(
        {"_id": child["_id"]},
        {
            "$pull": {"therapistIds": therapist_id},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    # 3. If the removed therapist was the primary, update to another one or None
    if child.get("therapistId") == therapist_id:
        remaining_therapists = [tid for tid in child.get("therapistIds", []) if tid != therapist_id]
        new_primary = remaining_therapists[0] if remaining_therapists else None
        
        db_manager.children.update_one(
            {"_id": child["_id"]},
            {"$set": {"therapistId": new_primary}}
        )
        
    return {"message": "Therapist unassigned successfully"}


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
            qualification=d.get("qualification"),
            experience_years=d.get("experience_years", 0),
            assigned_children=d.get("assigned_children", 0),
            phone=d.get("phone"),
            profile_photo=d.get("profile_photo"),
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
            last_login=p.get("last_login"),
            role="parent"
        ) for p in parents
    ]
