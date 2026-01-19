from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class AppointmentCreate(BaseModel):
    """
    Schema for creating a new appointment
    """
    name: str = Field(..., min_length=2, description="Patient Name")
    email: EmailStr = Field(..., description="Contact Email")
    mobile: str = Field(..., min_length=10, description="Mobile Number")
    department: str = Field(..., description="Selected Department/Specialty")
    date: str = Field(..., description="Appointment Date (YYYY-MM-DD)")
    mode: str = Field(..., description="Mode of consultation (Online/In-Person)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "mobile": "1234567890",
                "department": "Speech Therapy",
                "date": "2024-03-20",
                "mode": "In-Person"
            }
        }

class Appointment(AppointmentCreate):
    """
    Schema for appointment response
    """
    id: str
    status: str = "pending"
    created_at: datetime
