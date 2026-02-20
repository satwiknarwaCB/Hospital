"""
Community API Routes
Handles community creation, messaging, and member management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from database import db_manager
from models.community import (
    CommunityCreate,
    CommunityResponse,
    CommunityMessageCreate,
    CommunityMessageResponse,
    CommunityMemberResponse,
    MessagesListResponse,
    JoinCommunityRequest
)
from middleware.auth_middleware import get_current_parent, get_current_doctor, security, get_current_user
from fastapi.security import HTTPAuthorizationCredentials
from utils.auth import decode_access_token
from models.parent import ParentResponse
from models.doctor import DoctorResponse
from datetime import datetime, timezone
from bson import ObjectId


router = APIRouter(prefix="/api/communities", tags=["Communities"])





# Replacing get_current_community_user with the more robust get_current_user
get_current_community_user = get_current_user


@router.get("/", response_model=List[CommunityResponse])
async def get_communities(
    current_user = Depends(get_current_doctor)
):
    """
    Get all communities (Therapist only)
    """
    try:
        communities = list(db_manager.communities.find({"is_active": True}))
        response = []
        
        for community in communities:
            response.append(CommunityResponse(
                id=str(community["_id"]),
                name=community["name"],
                description=community.get("description"),
                member_count=len(community.get("member_ids", [])),
                is_active=community.get("is_active", True),
                created_at=community.get("created_at", datetime.now(timezone.utc))
            ))
            
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch communities: {str(e)}"
        )


@router.get("/default", response_model=CommunityResponse)
async def get_default_community(
    current_user = Depends(get_current_community_user)
):
    """
    Get the default parent support community (Parent and Therapist)
    """
    community = db_manager.communities.find_one({"name": "Parent Support Community"})
    
    if not community:
        # Create it if it doesn't exist
        community_id = str(ObjectId())
        community_data = {
            "_id": community_id,
            "name": "Parent Support Community",
            "description": "A safe space for parents to connect, share experiences, and support each other.",
            "created_by": "system",
            "member_ids": [],
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        db_manager.communities.insert_one(community_data)
        community = community_data
        
        # Add welcome message
        welcome_message = {
            "_id": str(ObjectId()),
            "community_id": community_id,
            "sender_id": "system",
            "sender_name": "NeuroBridge Team",
            "sender_role": "system",
            "content": "Welcome to the Parent Support Community! 🎉 This is a safe space for you to connect with other parents.",
            "attachments": [],
            "timestamp": datetime.now(timezone.utc),
            "is_deleted": False
        }
        db_manager.community_messages.insert_one(welcome_message)
    
    return CommunityResponse(
        id=str(community["_id"]),
        name=community["name"],
        description=community.get("description"),
        member_count=len(community.get("member_ids", [])),
        is_active=community.get("is_active", True),
        created_at=community.get("created_at", datetime.now(timezone.utc))
    )


@router.get("/{community_id}", response_model=CommunityResponse)
async def get_community(
    community_id: str,
    current_user = Depends(get_current_community_user)
):
    """
    Get specific community details
    """
    community = db_manager.communities.find_one({"_id": community_id})
    
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    return CommunityResponse(
        id=str(community["_id"]),
        name=community["name"],
        description=community.get("description"),
        member_count=len(community.get("member_ids", [])),
        is_active=community.get("is_active", True),
        created_at=community.get("created_at", datetime.now(timezone.utc))
    )


@router.post("/{community_id}/join", status_code=status.HTTP_200_OK)
async def join_community(
    community_id: str,
    current_parent: ParentResponse = Depends(get_current_parent)
):
    """
    Join a community
    
    Adds the current parent to the community member list
    """
    community = db_manager.communities.find_one({"_id": community_id})
    
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    parent_id = current_parent.id
    member_ids = community.get("member_ids", [])
    
    # Check if already a member
    if parent_id in member_ids:
        return {"message": "Already a member of this community", "already_member": True}
    
    # Add parent to community
    db_manager.communities.update_one(
        {"_id": community_id},
        {
            "$push": {"member_ids": parent_id},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    # Add welcome message
    welcome_message = {
        "_id": str(ObjectId()),
        "community_id": community_id,
        "sender_id": "system",
        "sender_name": "Community",
        "sender_role": "system",
        "content": f"Welcome {current_parent.name} to the {community['name']}! 👋",
        "attachments": [],
        "timestamp": datetime.now(timezone.utc),
        "is_deleted": False
    }
    db_manager.community_messages.insert_one(welcome_message)
    
    return {
        "message": "Successfully joined community",
        "community_id": community_id,
        "already_member": False
    }


@router.delete("/{community_id}/leave", status_code=status.HTTP_200_OK)
async def leave_community(
    community_id: str,
    current_parent: ParentResponse = Depends(get_current_parent)
):
    """
    Leave a community
    
    Removes the current parent from the community member list
    """
    community = db_manager.communities.find_one({"_id": community_id})
    
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    parent_id = current_parent.id
    
    # Remove parent from community
    result = db_manager.communities.update_one(
        {"_id": community_id},
        {
            "$pull": {"member_ids": parent_id},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    if result.modified_count == 0:
        return {"message": "Not a member of this community"}
    
    return {"message": "Successfully left community"}


@router.get("/{community_id}/messages", response_model=MessagesListResponse)
async def get_community_messages(
    community_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(get_current_community_user)
):
    """
    Get community messages with pagination
    
    Returns messages in reverse chronological order (newest first)
    """
    community = db_manager.communities.find_one({"_id": community_id})
    
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    # Get total count
    total = db_manager.community_messages.count_documents({
        "community_id": community_id,
        "is_deleted": False
    })
    
    # Get messages with pagination
    messages_cursor = db_manager.community_messages.find({
        "community_id": community_id,
        "is_deleted": False,
        "deleted_for": {"$ne": current_user["id"]}
    }).sort("timestamp", -1).skip(offset).limit(limit)
    
    messages = []
    for msg in messages_cursor:
        messages.append(CommunityMessageResponse(
            id=str(msg["_id"]),
            community_id=msg["community_id"],
            sender_id=msg["sender_id"],
            sender_name=msg["sender_name"],
            sender_role=msg["sender_role"],
            content=msg["content"],
            attachments=msg.get("attachments", []),
            timestamp=msg["timestamp"],
            reactions=msg.get("reactions", {})
        ))
    
    # Reverse to show oldest first in the list
    messages.reverse()
    
    return MessagesListResponse(
        messages=messages,
        total=total,
        limit=limit,
        offset=offset,
        has_more=(offset + limit) < total
    )


@router.post("/{community_id}/messages", response_model=CommunityMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_community_message(
    community_id: str,
    message_data: CommunityMessageCreate,
    current_user = Depends(get_current_community_user)
):
    """
    Send a message to the community
    
    Creates a new message in the community chat
    """
    community = db_manager.communities.find_one({"_id": community_id})
    
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    # If parent is not a member, auto-join them
    if current_user["role"] == "parent" and current_user["id"] not in community.get("member_ids", []):
        db_manager.communities.update_one(
            {"_id": community_id},
            {
                "$push": {"member_ids": current_user["id"]},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            }
        )
    
    # [RESTRICTION] Only therapists/staff can broadcast in official Support/Parent communities
    is_support_comm = "parent" in community["name"].lower() or "support" in community["name"].lower()
    if is_support_comm and current_user["role"] == "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only therapists can broadcast messages in this community. You can react to messages!"
        )
    
    # Create message
    new_message = {
        "_id": str(ObjectId()),
        "community_id": community_id,
        "sender_id": current_user["id"],
        "sender_name": current_user["name"],
        "sender_role": current_user["role"],
        "content": message_data.content.strip(),
        "attachments": message_data.attachments or [],
        "timestamp": datetime.now(timezone.utc),
        "reactions": {},
        "deleted_for": [],
        "is_deleted": False
    }
    
    db_manager.community_messages.insert_one(new_message)
    
    return CommunityMessageResponse(
        id=new_message["_id"],
        community_id=new_message["community_id"],
        sender_id=new_message["sender_id"],
        sender_name=new_message["sender_name"],
        sender_role=new_message["sender_role"],
        content=new_message["content"],
        attachments=new_message["attachments"],
        timestamp=new_message["timestamp"],
        reactions=new_message["reactions"]
    )


@router.patch("/{community_id}/messages/{message_id}/react", response_model=CommunityMessageResponse)
async def react_to_community_message(
    community_id: str,
    message_id: str,
    emoji: str = Query(..., min_length=1),
    current_user = Depends(get_current_community_user)
):
    """
    Add or remove a reaction to/from a community message
    """
    message = db_manager.community_messages.find_one({
        "_id": message_id,
        "community_id": community_id
    })
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Auto-join parent to community if they react for the first time
    if current_user["role"] == "parent":
        community = db_manager.communities.find_one({"_id": community_id})
        if community and current_user["id"] not in community.get("member_ids", []):
            db_manager.communities.update_one(
                {"_id": community_id},
                {
                    "$push": {"member_ids": current_user["id"]},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                }
            )
        
    reactions = message.get("reactions", {})
    user_id = current_user["id"]
    
    if emoji not in reactions:
        reactions[emoji] = []
        
    if user_id in reactions[emoji]:
        # Remove reaction (toggle)
        reactions[emoji].remove(user_id)
        if not reactions[emoji]:
            del reactions[emoji]
    else:
        # Add reaction
        reactions[emoji].append(user_id)
        
    db_manager.community_messages.update_one(
        {"_id": message_id},
        {"$set": {"reactions": reactions}}
    )
    
    return CommunityMessageResponse(
        id=str(message["_id"]),
        community_id=message["community_id"],
        sender_id=message["sender_id"],
        sender_name=message["sender_name"],
        sender_role=message["sender_role"],
        content=message["content"],
        attachments=message.get("attachments", []),
        timestamp=message["timestamp"],
        reactions=reactions
    )


@router.get("/{community_id}/members", response_model=List[CommunityMemberResponse])
async def get_community_members(
    community_id: str,
    current_user = Depends(get_current_community_user)
):
    """
    Get list of community members
    
    Returns all parents who are members of this community
    """
    community = db_manager.communities.find_one({"_id": community_id})
    
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community not found"
        )
    
    member_ids = community.get("member_ids", [])
    
    # Get parent details for all members
    members = []
    for parent_id in member_ids:
        parent = db_manager.parents.find_one({"_id": parent_id})
        if not parent and ObjectId.is_valid(parent_id):
            parent = db_manager.parents.find_one({"_id": ObjectId(parent_id)})
            
        if parent:
            members.append(CommunityMemberResponse(
                id=str(parent["_id"]),
                name=parent["name"],
                email=parent["email"],
                joined_at=parent.get("created_at", datetime.now(timezone.utc)),
                role="parent",
                avatar=parent.get("avatar")
            ))
    
    return members


@router.delete("/{community_id}/messages/{message_id}", response_model=dict)
async def delete_community_message(
    community_id: str,
    message_id: str,
    mode: str = Query("for_me", description="Deletion mode: 'for_me' or 'for_everyone'"),
    current_user = Depends(get_current_community_user)
):
    """
    Delete a community message.
    - 'for_me': Hides message for current user only (Parents & Therapists)
    - 'for_everyone': Soft-deletes message for all (Therapists only)
    """
    message = db_manager.community_messages.find_one({
        "_id": message_id,
        "community_id": community_id
    })

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if mode == "for_everyone":
        # Only therapists can delete for everyone, OR sender can delete their own message within a time limit (optional)
        # Requirement: "only therapists ... should be able to delete the messages" (implying global delete)
        if current_user["role"] != "therapist":
             raise HTTPException(
                status_code=403, 
                detail="Only therapists can delete messages for everyone."
            )
        
        db_manager.community_messages.update_one(
            {"_id": message_id},
            {"$set": {"is_deleted": True, "deleted_at": datetime.now(timezone.utc)}}
        )
        return {"status": "deleted_for_everyone", "message_id": message_id}

    elif mode == "for_me":
        # Anyone can delete for themselves
        db_manager.community_messages.update_one(
            {"_id": message_id},
            {"$addToSet": {"deleted_for": current_user["id"]}}
        )
        return {"status": "deleted_for_me", "message_id": message_id}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid deletion mode")

