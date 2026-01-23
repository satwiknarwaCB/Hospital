from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from bson import ObjectId

from database import db_manager
from models.progress import (
    SkillGoalCreate, SkillGoalUpdate, SkillGoalResponse,
    SkillProgressCreate, SkillProgressUpdate, SkillProgressResponse
)
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Progress Tracking"])

# =======================
# Skill Goals (Planned Targets)
# =======================

@router.post("/goals", response_model=SkillGoalResponse)
async def create_goal(goal: SkillGoalCreate, current_user: dict = Depends(get_current_user)):
    """Create a new planned goal"""
    db = db_manager.get_database()
    goal_data = goal.dict()
    goal_data["created_at"] = datetime.now(timezone.utc)
    goal_data["updated_at"] = datetime.now(timezone.utc)
    
    new_goal = db.skill_goals.insert_one(goal_data)
    created_goal = db.skill_goals.find_one({"_id": new_goal.inserted_id})
    
    # Manual conversion of ObjectId to string for Pydantic validation
    if created_goal:
        created_goal["_id"] = str(created_goal["_id"])
    
    return created_goal

@router.get("/goals/child/{child_id}", response_model=List[SkillGoalResponse])
async def get_child_goals(child_id: str, current_user: dict = Depends(get_current_user)):
    """Get all goals for a specific child"""
    db = db_manager.get_database()
    goals = list(db.skill_goals.find({"childId": child_id}).limit(100))
    # Convert _id to string for all goals
    for goal in goals:
        goal["_id"] = str(goal["_id"])
    return goals

@router.put("/goals/{goal_id}", response_model=SkillGoalResponse)
async def update_goal(goal_id: str, updates: SkillGoalUpdate, current_user: dict = Depends(get_current_user)):
    """Update a goal"""
    db = db_manager.get_database()
    if not ObjectId.is_valid(goal_id):
        raise HTTPException(status_code=400, detail="Invalid goal ID")
        
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
        
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = db.skill_goals.update_one(
        {"_id": ObjectId(goal_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    updated_goal = db.skill_goals.find_one({"_id": ObjectId(goal_id)})
    if updated_goal:
        updated_goal["_id"] = str(updated_goal["_id"])
    return updated_goal

@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a goal"""
    db = db_manager.get_database()
    if not ObjectId.is_valid(goal_id):
        raise HTTPException(status_code=400, detail="Invalid goal ID")
        
    result = db.skill_goals.delete_one({"_id": ObjectId(goal_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    return {"message": "Goal deleted successfully"}

# =======================
# Skill Progress (Actual Achievement)
# =======================

@router.post("/actual", response_model=SkillProgressResponse)
async def create_progress(progress: SkillProgressCreate, current_user: dict = Depends(get_current_user)):
    """Create or initialize actual progress record"""
    db = db_manager.get_database()
    # Check if exists first to avoid duplicates for same skill
    existing = db.skill_progress.find_one({
        "childId": progress.childId, 
        "skillId": progress.skillId
    })
    
    if existing:
        # Ensure both _id and id are present
        existing["id"] = str(existing["_id"])
        return SkillProgressResponse(**existing)
        
    prog_data = progress.dict()
    prog_data["created_at"] = datetime.now(timezone.utc)
    prog_data["updated_at"] = datetime.now(timezone.utc)
    
    new_prog = db.skill_progress.insert_one(prog_data)
    created_prog = db.skill_progress.find_one({"_id": new_prog.inserted_id})
    
    if created_prog:
        created_prog["_id"] = str(created_prog["_id"])
    
    return created_prog

@router.get("/actual/child/{child_id}", response_model=List[SkillProgressResponse])
async def get_child_progress(child_id: str, current_user: dict = Depends(get_current_user)):
    """Get all progress records for a child"""
    db = db_manager.get_database()
    progress = list(db.skill_progress.find({"childId": child_id}).limit(100))
    # Convert _id to string for all progress records
    for p in progress:
        p["_id"] = str(p["_id"])
    return progress

@router.put("/actual/{progress_id}", response_model=SkillProgressResponse)
async def update_progress(progress_id: str, updates: SkillProgressUpdate, current_user: dict = Depends(get_current_user)):
    """Update actual progress"""
    db = db_manager.get_database()
    if not ObjectId.is_valid(progress_id):
        raise HTTPException(status_code=400, detail="Invalid progress ID")
        
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
        
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = db.skill_progress.update_one(
        {"_id": ObjectId(progress_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Progress record not found")
        
    updated_prog = db.skill_progress.find_one({"_id": ObjectId(progress_id)})
    if updated_prog:
        updated_prog["_id"] = str(updated_prog["_id"])
    return updated_prog

@router.delete("/actual/{progress_id}")
async def delete_progress(progress_id: str, current_user: dict = Depends(get_current_user)):
    """Delete actual progress record"""
    db = db_manager.get_database()
    if not ObjectId.is_valid(progress_id):
        raise HTTPException(status_code=400, detail="Invalid progress ID")
        
    result = db.skill_progress.delete_one({"_id": ObjectId(progress_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Progress record not found")
        
    return {"message": "Progress record deleted successfully"}
