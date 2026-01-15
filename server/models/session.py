from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime, timezone
from bson import ObjectId

class SessionBase(BaseModel):
    """Base session model with strict validation and production documentation"""
    childId: str = Field(..., description="Unique ID of the child patient")
    therapistId: str = Field(..., description="Unique ID of the therapist logging the session")
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Session timestamp")
    type: str = Field(..., min_length=2, description="Type of therapy sessions (e.g., Speech Therapy)")
    duration: int = Field(45, ge=15, le=180, description="Session duration in minutes (15-180)")
    status: str = Field("completed", pattern="^(scheduled|completed|canceled)$")
    
    # Clinical Data
    engagement: Optional[int] = Field(None, ge=0, le=100, description="Engagement level (0-100%)")
    emotionalState: Optional[str] = Field(None, description="Clinical observation of emotional regulation")
    activities: Optional[List[str]] = Field(default_factory=list, description="Activities performed during session")
    notes: Optional[str] = Field(None, max_length=5000, description="Detailed clinical notes")
    aiSummary: Optional[str] = Field(None, description="AI-generated summary optimized for parents")
    wins: Optional[List[str]] = Field(default_factory=list, description="Key developmental wins identified")
    location: Optional[str] = Field(None, description="Physical or virtual location")

class SessionCreate(SessionBase):
    """Model for creating a new session record (therapistId can be provided or inferred from token)"""
    therapistId: Optional[str] = Field(None, description="Inferred from token if not provided")

    @validator('date', pre=True)
    def parse_datetime(cls, v):
        if isinstance(v, str):
            try:
                # Handle 'Z' from frontend and ensure it's offset-aware
                if v.endswith('Z'):
                    v = v.replace('Z', '+00:00')
                return datetime.fromisoformat(v)
            except ValueError:
                return datetime.now(timezone.utc)
        return v

class SessionUpdate(BaseModel):
    """Model for partial session updates"""
    type: Optional[str] = None
    duration: Optional[int] = None
    status: Optional[str] = None
    engagement: Optional[int] = None
    emotionalState: Optional[str] = None
    activities: Optional[List[str]] = None
    notes: Optional[str] = None
    aiSummary: Optional[str] = None
    wins: Optional[List[str]] = None

class SessionResponse(SessionBase):
    """Production response model with serialized ID"""
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {
            # Force 'Z' suffix for UTC consistency if offset is missing
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
            ObjectId: str
        }
