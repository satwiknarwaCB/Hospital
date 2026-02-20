from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from bson import ObjectId

class SkillGoalBase(BaseModel):
    """Base model for Skill Goals (Planned Targets)"""
    childId: str = Field(..., description="ID of the child")
    skillId: str = Field(..., description="Unique ID for the skill (e.g., 'sp1')")
    skillName: str = Field(..., description="Name of the skill")
    duration: str = Field("1 Month", description="Duration of the goal")
    startDate: str = Field(..., description="Start date (YYYY-MM-DD)")
    deadline: str = Field(..., description="Target deadline (YYYY-MM-DD)")
    targets: List[int] = Field(..., description="Weekly target percentages")
    status: str = Field("In Progress", description="Current status of the goal")
    notes: Optional[str] = Field(None, description="Therapist notes")

class SkillGoalCreate(SkillGoalBase):
    pass

class SkillGoalUpdate(BaseModel):
    duration: Optional[str] = None
    deadline: Optional[str] = None
    targets: Optional[List[int]] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class SkillGoalResponse(SkillGoalBase):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
            ObjectId: str
        }

class SkillProgressBase(BaseModel):
    """Base model for Actual Skill Progress"""
    childId: str = Field(..., description="ID of the child")
    skillId: str = Field(..., description="Link to the skill ID")
    skillName: str = Field(..., description="Name of the skill")
    category: str = Field("General", description="Skill category")
    icon: str = Field("activity", description="Icon identifier")
    status: str = Field("In Progress", description="Status of the progress")
    progress: int = Field(0, description="Overall progress percentage")
    weeklyActuals: List[int] = Field(default_factory=list, description="Weekly actual achievement percentages")
    therapistNotes: Optional[str] = Field(None, description="Clinical observations")
    parentNote: Optional[str] = Field(None, description="Home observations")
    successNote: Optional[str] = Field(None, description="Recent success highlight")
    lastUpdated: Optional[str] = Field(None, description="Last update timestamp string")
    updatedByRole: Optional[str] = Field(None, description="Role of the person who last updated")
    order: Optional[int] = Field(0, description="Display order")
    isGoalOnly: Optional[bool] = Field(False, description="Whether this is a goal-only record")
    history: List[Dict[str, Any]] = Field(default_factory=list, description="History of updates")

class SkillProgressCreate(SkillProgressBase):
    pass

class SkillProgressUpdate(BaseModel):
    category: Optional[str] = None
    icon: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    weeklyActuals: Optional[List[int]] = None
    therapistNotes: Optional[str] = None
    parentNote: Optional[str] = None
    successNote: Optional[str] = None
    lastUpdated: Optional[str] = None
    updatedByRole: Optional[str] = None
    order: Optional[int] = None
    isGoalOnly: Optional[bool] = None
    history: Optional[List[Dict[str, Any]]] = None

class SkillProgressResponse(SkillProgressBase):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
            ObjectId: str
        }

class PeriodicReviewBase(BaseModel):
    """Base model for Periodic Clinical Reviews"""
    childId: str = Field(..., description="ID of the child")
    type: str = Field("General", description="Type of review (e.g. Speech Therapy)")
    title: str = Field(..., description="Title of the review")
    date: str = Field(..., description="Date of the review (YYYY-MM-DD)")
    period: str = Field(..., description="Period covered by the review")
    summary: str = Field(..., description="The clinical summary text")
    milestone: Optional[str] = Field(None, description="Key milestone reached")
    isNew: bool = Field(True, description="Whether the review is unread")

class PeriodicReviewCreate(PeriodicReviewBase):
    pass

class PeriodicReviewResponse(PeriodicReviewBase):
    id: str = Field(..., alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
            ObjectId: str
        }
