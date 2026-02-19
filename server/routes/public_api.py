from fastapi import APIRouter
from database import db_manager
from typing import List
from datetime import datetime, timezone
from models.parent import ParentCreate, ParentResponse
import uuid

router = APIRouter(prefix="/api/public", tags=["Public"])

@router.get("/demo-users")
async def get_demo_users():
    """
    Get a list of users for demo purposes on the login page.
    This is public but only returns names and emails.
    """
    # Fetch some therapists and parents
    therapists = list(db_manager.doctors.find({}, {"name": 1, "email": 1, "_id": 1}).limit(6))
    parents = list(db_manager.parents.find({}, {"name": 1, "email": 1, "_id": 1}).limit(6))
    
    # We'll use a standard demo password for these in the UI
    # Since we can't show actual passwords here
    
    return {
        "therapists": [
            {
                "id": str(t["_id"]),
                "name": t["name"],
                "email": t["email"]
            } for t in therapists
        ],
        "parents": [
            {
                "id": str(p["_id"]),
                "name": p["name"],
                "email": p["email"]
            } for p in parents
        ]
    }

from pydantic import BaseModel, Field
from fastapi import HTTPException, status
from utils.auth import hash_password

class ActivationRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8)
    role: str # 'therapist' or 'parent'

@router.post("/activate")
async def activate_account(data: ActivationRequest):
    """
    Activate account by setting password via invitation token
    """
    collection = None
    if data.role == 'therapist':
        collection = db_manager.doctors
    elif data.role == 'parent':
        collection = db_manager.parents
    else:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user = collection.find_one({"activation_token": data.token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired activation token")
        
    # Set password and activate
    new_hash = hash_password(data.password)
    collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "hashed_password": new_hash,
                "is_active": True,
                "activation_token": None # Clear token
            }
        }
    )
    
    return {"message": "Account activated successfully. You can now login."}

@router.post("/signup", response_model=ParentResponse, status_code=status.HTTP_201_CREATED)
async def signup(parent: ParentCreate):
    """
    Public signup for parents
    """
    print(f"[PUBLIC-SIGNUP] New registration attempt: {parent.email}")
    
    # Check if user already exists
    if db_manager.parents.find_one({"email": parent.email}):
        print(f"[PUBLIC-SIGNUP FAIL] Email already exists: {parent.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists"
        )
    
    # Ensure password is provided for public signup
    if not parent.password:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required for registration"
        )

    # Generate unique ID
    parent_id = str(uuid.uuid4())
    
    # Hash password
    hashed_password = hash_password(parent.password)
    
    # Prepare parent data
    parent_data = {
        "_id": parent_id,
        "name": str(parent.name),
        "email": str(parent.email),
        "hashed_password": hashed_password,
        "phone": str(parent.phone) if parent.phone else None,
        "address": str(parent.address) if parent.address else None,
        "children_ids": [], # New account has no children yet
        "relationship": str(parent.relationship) if parent.relationship else None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_active": True,
        "activation_token": None
    }
    
    # Save to database
    db_manager.parents.insert_one(parent_data)
    print(f"[PUBLIC-SIGNUP SUCCESS] Created parent: {parent.email} (ID: {parent_id})")
    
    return ParentResponse(
        id=parent_id,
        name=parent_data["name"],
        email=parent_data["email"],
        phone=parent_data["phone"],
        address=parent_data["address"],
        children_ids=[],
        childId=None,
        relationship=parent_data["relationship"],
        is_active=True,
        created_at=parent_data["created_at"],
        role="parent"
    )
