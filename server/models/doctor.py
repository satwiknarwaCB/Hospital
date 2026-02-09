"""
Doctor data models for request/response validation
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, timezone


class DoctorLogin(BaseModel):
    """Doctor login request model"""
    email: EmailStr = Field(..., description="Doctor's email address")
    password: str = Field(..., min_length=6, description="Doctor's password")


class DoctorInDB(BaseModel):
    """Doctor model as stored in database"""
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    hashed_password: str
    specialization: str
    experience_years: int
    assigned_patients: int
    phone: Optional[str] = None
    license_number: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    
    class Config:
        populate_by_name = True


class DoctorResponse(BaseModel):
    """Doctor response model (without password)"""
    id: str
    name: str
    email: str
    specialization: str
    experience_years: int
    assigned_patients: int
    phone: Optional[str] = None
    license_number: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    role: str = "therapist"
    invitation_link: Optional[str] = None
    
    class Config:
        json_encoders = {
            # Force 'Z' suffix for UTC consistency
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
            str: str
        }


class DoctorCreate(BaseModel):
    """Doctor creation model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: Optional[str] = None
    specialization: str
    experience_years: int = Field(default=0, ge=0)
    assigned_patients: int = Field(default=0, ge=0)
    phone: Optional[str] = None
    license_number: Optional[str] = None
    
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


class TokenResponse(BaseModel):
    """JWT token response model"""
    access_token: str
    token_type: str = "bearer"
    doctor: DoctorResponse
