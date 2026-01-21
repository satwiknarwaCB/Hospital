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
from middleware.auth_middleware import get_current_parent, get_current_doctor, security
from fastapi.security import HTTPAuthorizationCredentials
from utils.auth import decode_access_token
from models.parent import ParentResponse
from models.doctor import DoctorResponse
from datetime import datetime, timezone
from bson import ObjectId


router = APIRouter(prefix="/api/communities", tags=["Communities"])





async def get_current_community_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Dependency that allows either a parent or a doctor/therapist"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Check if doctor/therapist
    doctor = db_manager.doctors.find_one({"_id": user_id})
    if doctor:
        return {"id": str(doctor["_id"]), "name": doctor["name"], "role": "therapist"}
        
    # Check if parent
    parent = db_manager.parents.find_one({"_id": user_id})
    if parent:
        return {"id": str(parent["_id"]), "name": parent["name"], "role": "parent"}
        
    raise credentials_exception


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
        "is_deleted": False
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
            timestamp=msg["timestamp"]
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
        # Add welcome message
        welcome_msg = {
            "_id": str(ObjectId()),
            "community_id": community_id,
            "sender_id": "system",
            "sender_name": "Community",
            "sender_role": "system",
            "content": f"Welcome {current_user['name']} to the community! 👋",
            "attachments": [],
            "timestamp": datetime.now(timezone.utc),
            "is_deleted": False
        }
        db_manager.community_messages.insert_one(welcome_msg)
    
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
        timestamp=new_message["timestamp"]
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
        if parent:
            members.append(CommunityMemberResponse(
                id=str(parent["_id"]),
                name=parent["name"],
                email=parent["email"],
                joined_at=parent.get("created_at", datetime.now(timezone.utc)),
                role="parent"
            ))
    
    return members
