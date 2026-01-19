"""
Admin data models for request/response validation
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone


class AdminLogin(BaseModel):
    """Admin login request model"""
    email: EmailStr = Field(..., description="Admin's email address")
    password: str = Field(..., min_length=6, description="Admin's password")


class AdminResponse(BaseModel):
    """Admin response model (without password)"""
    id: str
    name: str
    email: str
    role: str = "admin"
    is_active: bool = True
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v.tzinfo else v.isoformat() + "Z",
            str: str
        }


class AdminTokenResponse(BaseModel):
    """JWT token response model for Admin"""
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse
