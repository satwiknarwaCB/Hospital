from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from bson import ObjectId

from database import db_manager
from models.roadmap import RoadmapCreate, RoadmapUpdate, RoadmapResponse
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/roadmap", tags=["Roadmap Editor"])

@router.post("", response_model=RoadmapResponse)
async def create_roadmap_goal(roadmap: RoadmapCreate, current_user: dict = Depends(get_current_user)):
    """Create a new roadmap goal with milestones"""
    db = db_manager.get_database()
    roadmap_data = roadmap.dict()
    roadmap_data["created_at"] = datetime.now(timezone.utc)
    roadmap_data["updated_at"] = datetime.now(timezone.utc)
    
    # Deduplication check: Don't create if identical goal already exists for this child
    existing = db.roadmaps.find_one({
        "childId": roadmap_data["childId"],
        "domain": roadmap_data["domain"],
        "title": roadmap_data["title"]
    })
    
    if existing:
        existing["_id"] = str(existing["_id"])
        return existing

    result = db.roadmaps.insert_one(roadmap_data)
    created = db.roadmaps.find_one({"_id": result.inserted_id})
    
    if created:
        created["_id"] = str(created["_id"])
    return created

@router.get("/child/{child_id}", response_model=List[RoadmapResponse])
async def get_child_roadmap(child_id: str, current_user: dict = Depends(get_current_user)):
    """Get the full therapy roadmap for a specific child"""
    db = db_manager.get_database()
    items = list(db.roadmaps.find({"childId": child_id}).limit(100))
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.put("/{roadmap_id}", response_model=RoadmapResponse)
async def update_roadmap_goal(roadmap_id: str, updates: RoadmapUpdate, current_user: dict = Depends(get_current_user)):
    """Update a roadmap goal or milestone"""
    db = db_manager.get_database()
    if not ObjectId.is_valid(roadmap_id):
        # Fallback for internal IDs if they are not ObjectIds (though we should use ObjectIds)
        # For demo purposes, we usually stick to ObjectIds
        raise HTTPException(status_code=400, detail="Invalid roadmap ID format")
        
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")
        
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = db.roadmaps.update_one(
        {"_id": ObjectId(roadmap_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Roadmap goal not found")
        
    updated = db.roadmaps.find_one({"_id": ObjectId(roadmap_id)})
    if updated:
        updated["_id"] = str(updated["_id"])
    return updated

@router.delete("/{roadmap_id}")
async def delete_roadmap_goal(roadmap_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a goal from the roadmap"""
    db = db_manager.get_database()
    if not ObjectId.is_valid(roadmap_id):
        raise HTTPException(status_code=400, detail="Invalid roadmap ID")
        
    result = db.roadmaps.delete_one({"_id": ObjectId(roadmap_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Roadmap goal not found")
        
    return {"message": "Goal removed successfully"}
