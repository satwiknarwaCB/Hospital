from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from bson import ObjectId

class Milestone(BaseModel):
    id: str
    title: str
    completed: bool = False
    date: Optional[str] = None

class RoadmapBase(BaseModel):
    childId: str
    domain: str
    title: str
    description: Optional[str] = None
    targetDate: Optional[str] = None
    priority: str = "medium"
    progress: int = 0
    status: str = "in-progress"
    locked: bool = False
    milestones: List[Milestone] = []
    aiPrediction: Optional[str] = None
    therapistNotes: Optional[str] = None

class RoadmapCreate(RoadmapBase):
    pass

class RoadmapUpdate(BaseModel):
    domain: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    targetDate: Optional[str] = None
    priority: Optional[str] = None
    progress: Optional[int] = None
    status: Optional[str] = None
    locked: Optional[bool] = None
    milestones: Optional[List[Milestone]] = None
    aiPrediction: Optional[str] = None
    therapistNotes: Optional[str] = None

class RoadmapResponse(RoadmapBase):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
            ObjectId: str
        }
