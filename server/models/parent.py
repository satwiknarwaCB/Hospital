"""
Parent data models for request/response validation
"""
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, timezone


class ParentLogin(BaseModel):
    """Parent login request model"""
    email: EmailStr = Field(..., description="Parent's email address")
    password: str = Field(..., min_length=6, description="Parent's password")


class ParentInDB(BaseModel):
    """Parent model as stored in database"""
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    hashed_password: str
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None
    children_ids: List[str] = Field(default_factory=list, description="IDs of children")
    child_id: Optional[str] = Field(None, description="Primary child ID for portal")
    relationship: Optional[str] = None  # e.g., "Mother", "Father"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    last_login: Optional[datetime] = None



class ParentResponse(BaseModel):
    """Parent response model (without password)"""
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None
    children_ids: List[str] = []
    childId: Optional[str] = None
    relationship: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    role: str = "parent"
    invitation_link: Optional[str] = None
    
    class Config:
        json_encoders = {
            # Force 'Z' suffix for UTC consistency
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
            str: str
        }


class ParentCreate(BaseModel):
    """Parent creation model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    children_ids: List[str] = Field(default_factory=list)
    relationship: Optional[str] = None
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        """Validate password strength if provided"""
        if v is None:
            return v
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class ParentUpdate(BaseModel):
    """Parent update model"""
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None
    relationship: Optional[str] = None
    document: Optional[str] = None
    documentName: Optional[str] = None


class TokenResponse(BaseModel):
    """JWT token response model"""
    access_token: str
    token_type: str = "bearer"
    parent: ParentResponse

