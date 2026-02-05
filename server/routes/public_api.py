from fastapi import APIRouter
from database import db_manager
from typing import List

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
