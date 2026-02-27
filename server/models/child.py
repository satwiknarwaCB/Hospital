from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class ChildCreate(BaseModel):
    name: str = Field(..., min_length=2)
    age: int = Field(..., gt=0, lt=18)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    condition: str
    school_name: Optional[str] = None
    parent_id: str = Field(..., description="ID of the parent to link to")
    therapy_start_date: Optional[str] = None
    therapy_type: Optional[str] = None

class ChildResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    condition: str
    school_name: Optional[str] = None
    parent_id: str
    therapistId: Optional[str] = None  # Primary therapist (for backward compatibility)
    therapistIds: List[str] = []  # List of all assigned therapists
    photoUrl: Optional[str] = None
    program: List[str] = []
    currentMood: Optional[str] = None
    moodContext: Optional[str] = None
    streak: int = 0
    schoolReadinessScore: int = 0
    status: str = "active"
    is_active: bool = True
    gamesUnlocked: bool = False
    documents: List[dict] = []
    therapy_start_date: Optional[str] = None
    therapy_type: Optional[str] = None
    therapy_start_dates: Optional[dict] = None
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
