"""
Community data models for request/response validation
"""
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class CommunityBase(BaseModel):
    """Base community model"""
    name: str = Field(..., min_length=3, max_length=100, description="Community name")
    description: Optional[str] = Field(None, max_length=500, description="Community description")
    is_active: bool = Field(default=True, description="Whether community is active")


class CommunityCreate(CommunityBase):
    """Community creation model"""
    created_by: str = Field(..., description="ID of creator (therapist/admin)")


class CommunityInDB(CommunityBase):
    """Community model as stored in database"""
    id: str = Field(..., alias="_id")
    created_by: str
    member_ids: List[str] = Field(default_factory=list, description="List of parent IDs")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        populate_by_name = True


class CommunityResponse(BaseModel):
    """Community response model"""
    id: str
    name: str
    description: Optional[str] = None
    member_count: int = 0
    is_active: bool = True
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
        }


class CommunityMessageCreate(BaseModel):
    """Community message creation model"""
    content: str = Field(..., min_length=1, max_length=2000, description="Message content")
    attachments: Optional[List[str]] = Field(default_factory=list, description="Attachment URLs")


class CommunityMessageInDB(BaseModel):
    """Community message as stored in database"""
    id: str = Field(..., alias="_id")
    community_id: str
    sender_id: str
    sender_name: str
    sender_role: str  # "parent", "therapist", "admin"
    content: str
    attachments: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reactions: Dict[str, List[str]] = Field(default_factory=dict) # emoji -> list of user_ids
    deleted_for: List[str] = Field(default_factory=list) # users who deleted this message for themselves
    is_deleted: bool = False
    
    class Config:
        populate_by_name = True


class CommunityMessageResponse(BaseModel):
    """Community message response model"""
    id: str
    community_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    content: str
    attachments: List[str] = []
    timestamp: datetime
    reactions: Dict[str, List[str]] = {} # emoji -> list of user_ids
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
        }


class CommunityMemberResponse(BaseModel):
    """Community member response model"""
    id: str
    name: str
    email: str
    joined_at: datetime
    role: str = "parent"
    avatar: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
        }


class JoinCommunityRequest(BaseModel):
    """Request to join a community"""
    parent_id: str = Field(..., description="ID of parent joining")


class MessagesListResponse(BaseModel):
    """Paginated messages list response"""
    messages: List[CommunityMessageResponse]
    total: int
    limit: int
    offset: int
    has_more: bool
