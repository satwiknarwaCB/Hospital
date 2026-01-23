from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone
from database import db_manager
from models.message import DirectMessage, MessageCreate
from routes.communities import get_current_community_user
from bson import ObjectId

router = APIRouter(prefix="/api/messages", tags=["Messages"])

@router.post("/", response_model=dict)
async def send_message(
    message: MessageCreate,
    current_user: dict = Depends(get_current_community_user)
):
    """
    Send a direct message
    """
    db = db_manager.get_database()
    
    message_dict = message.dict()
    message_dict["timestamp"] = datetime.now(timezone.utc)
    message_dict["read"] = False
    
    result = await db.direct_messages.insert_one(message_dict)
    message_dict["_id"] = str(result.inserted_id)
    
    return message_dict

@router.get("/user/{user_id}", response_model=List[dict])
async def get_user_messages(
    user_id: str,
    current_user: dict = Depends(get_current_community_user)
):
    """
    Get all direct messages for a user (as sender or recipient)
    """
    if str(current_user.get("id")) != user_id and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view these messages")
        
    db = db_manager.get_database()
    
    cursor = db.direct_messages.find({
        "$or": [
            {"sender_id": user_id},
            {"recipient_id": user_id}
        ]
    }).sort("timestamp", -1)
    
    messages = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        messages.append(doc)
        
    return messages

@router.patch("/{message_id}/read", response_model=dict)
async def mark_as_read(
    message_id: str,
    current_user: dict = Depends(get_current_community_user)
):
    """
    Mark a message as read
    """
    db = db_manager.get_database()
    
    result = await db.direct_messages.update_one(
        {"_id": ObjectId(message_id), "recipient_id": str(current_user.get("id"))},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found or already read")
        
    return {"status": "success"}

@router.get("/unread/count", response_model=dict)
async def get_unread_count(
    current_user: dict = Depends(get_current_community_user)
):
    """
    Get count of unread messages for the current user
    """
    db = db_manager.get_database()
    user_id = str(current_user.get("id"))
    
    count = await db.direct_messages.count_documents({
        "recipient_id": user_id,
        "read": False
    })
    
    return {"count": count}
