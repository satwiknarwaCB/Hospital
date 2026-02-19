"""
Direct Messages API Routes
Handles private messaging between parents and therapists.
All messages persist permanently in MongoDB until explicitly deleted.

Deletion modes:
  - delete_for_me:       Soft-delete for the requesting user only
                         (adds user_id to deleted_for list)
  - delete_for_everyone: Hard soft-delete visible to nobody
                         (sets is_deleted=True for all)

Reactions:
  Each message stores a "reactions" dict: { "emoji": [user_id, ...] }
  PATCH /{message_id}/react?emoji=👍  toggles the reaction for the current user.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime, timezone
from database import db_manager
from models.message import DirectMessage, MessageCreate
from routes.communities import get_current_community_user
from bson import ObjectId

router = APIRouter(prefix="/api/messages", tags=["Messages"])


# ─────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────

def _build_query(message_id: str) -> dict:
    """Return a MongoDB filter for a message by its ID (supports ObjectId or string)."""
    if ObjectId.is_valid(message_id):
        return {"_id": ObjectId(message_id)}
    return {"_id": message_id}


def _serialize_message(doc: dict) -> dict:
    """Normalize a MongoDB message document for API response."""
    doc["_id"] = str(doc["_id"]) if isinstance(doc.get("_id"), ObjectId) else doc.get("_id", "")
    doc["id"] = doc["_id"]
    doc.setdefault("reactions", {})
    doc.setdefault("deleted_for", [])
    return doc


def _is_visible_for(doc: dict, user_id: str) -> bool:
    """Return True if the message should be visible for this user."""
    if doc.get("is_deleted"):
        return False
    if user_id in doc.get("deleted_for", []):
        return False
    return True


# ─────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def send_message(
    message: MessageCreate,
    current_user: dict = Depends(get_current_community_user)
):
    """
    Send a direct message.
    Persists permanently in MongoDB until explicitly deleted.
    """
    message_dict = message.dict()
    message_dict["timestamp"] = datetime.now(timezone.utc)
    message_dict["read"] = False
    message_dict["is_deleted"] = False      # deleted for everyone
    message_dict["deleted_for"] = []        # list of user_ids for "delete for me"
    message_dict["reactions"] = {}          # { "emoji": [user_id, ...] }

    result = db_manager.direct_messages.insert_one(message_dict)
    message_dict["_id"] = str(result.inserted_id)
    message_dict["id"] = message_dict["_id"]

    return message_dict


@router.get("/user/{user_id}", response_model=List[dict])
async def get_user_messages(
    user_id: str,
    current_user: dict = Depends(get_current_community_user)
):
    """
    Get all direct messages visible to the requesting user.
    Excludes messages deleted for everyone and messages the user deleted for themselves.
    """
    if str(current_user.get("id")) != user_id and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view these messages")

    cursor = db_manager.direct_messages.find({
        "$or": [
            {"sender_id": user_id},
            {"recipient_id": user_id}
        ],
        "is_deleted": {"$ne": True},
        "deleted_for": {"$nin": [user_id]}  # exclude "delete for me"
    }).sort("timestamp", -1)

    messages = [_serialize_message(doc) for doc in cursor]
    return messages


@router.patch("/{message_id}/read", response_model=dict)
async def mark_as_read(
    message_id: str,
    current_user: dict = Depends(get_current_community_user)
):
    """
    Mark a message as read.
    """
    query = {"recipient_id": str(current_user.get("id")), "is_deleted": {"$ne": True}}
    query.update(_build_query(message_id))

    result = db_manager.direct_messages.update_one(
        query,
        {"$set": {"read": True}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found or already read")

    return {"status": "success"}


@router.delete("/{message_id}", response_model=dict)
async def delete_message(
    message_id: str,
    mode: str = Query(default="for_me", description="'for_me' or 'for_everyone'"),
    current_user: dict = Depends(get_current_community_user)
):
    """
    Delete a direct message.

    mode=for_me        — Hides the message only for the requesting user.
                         The other participant can still see it.
    mode=for_everyone  — Only the sender can use this. Removes the message
                         for both participants permanently.
    """
    user_id = str(current_user.get("id"))
    base_query = _build_query(message_id)

    message = db_manager.direct_messages.find_one(base_query)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message.get("is_deleted"):
        return {"status": "already_deleted", "message_id": message_id}

    if mode == "for_everyone":
        # Only the original sender can delete for everyone
        if str(message.get("sender_id")) != user_id:
            raise HTTPException(
                status_code=403,
                detail="Only the sender can delete a message for everyone"
            )
        db_manager.direct_messages.update_one(
            base_query,
            {"$set": {
                "is_deleted": True,
                "deleted_at": datetime.now(timezone.utc),
                "content": "🚫 This message was deleted"   # WhatsApp-style placeholder
            }}
        )
        return {"status": "deleted_for_everyone", "message_id": message_id}

    else:  # for_me
        # Anyone in the conversation can delete for themselves
        if user_id not in [str(message.get("sender_id")), str(message.get("recipient_id"))]:
            raise HTTPException(status_code=403, detail="You are not part of this conversation")

        db_manager.direct_messages.update_one(
            base_query,
            {"$addToSet": {"deleted_for": user_id}}
        )
        return {"status": "deleted_for_me", "message_id": message_id}


@router.patch("/{message_id}/react", response_model=dict)
async def react_to_message(
    message_id: str,
    emoji: str = Query(..., min_length=1, description="Emoji to react with"),
    current_user: dict = Depends(get_current_community_user)
):
    """
    Toggle an emoji reaction on a private message.
    If the user already reacted with this emoji it is removed (toggle off).
    Returns the updated reactions dict.
    """
    user_id = str(current_user.get("id"))
    base_query = _build_query(message_id)

    message = db_manager.direct_messages.find_one(base_query)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if not _is_visible_for(message, user_id):
        raise HTTPException(status_code=403, detail="Message not accessible")

    reactions = message.get("reactions", {})
    if emoji not in reactions:
        reactions[emoji] = []

    if user_id in reactions[emoji]:
        reactions[emoji].remove(user_id)
        if not reactions[emoji]:
            del reactions[emoji]
    else:
        reactions[emoji].append(user_id)

    db_manager.direct_messages.update_one(
        base_query,
        {"$set": {"reactions": reactions}}
    )

    return {"reactions": reactions}


@router.get("/unread/count", response_model=dict)
async def get_unread_count(
    current_user: dict = Depends(get_current_community_user)
):
    """
    Get count of unread messages for the current user.
    """
    user_id = str(current_user.get("id"))

    count = db_manager.direct_messages.count_documents({
        "recipient_id": user_id,
        "read": False,
        "is_deleted": {"$ne": True},
        "deleted_for": {"$nin": [user_id]}
    })

    return {"count": count}
