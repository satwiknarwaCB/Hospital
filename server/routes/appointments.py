from fastapi import APIRouter, Body, HTTPException, status
from typing import List
from datetime import datetime
from database import db_manager
from models.appointment import AppointmentCreate, Appointment

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@router.post("/", response_model=Appointment, status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: AppointmentCreate):
    """
    Create a new appointment booking
    """
    print(f"📝 Received appointment request for: {appointment.email}")
    try:
        appointment_dict = appointment.dict()
        appointment_dict["status"] = "pending"
        appointment_dict["created_at"] = datetime.utcnow()
        
        # Insert into database
        new_appointment = db_manager.appointments.insert_one(appointment_dict)
        
        # Add generated ID to response
        created_appointment = db_manager.appointments.find_one(
            {"_id": new_appointment.inserted_id}
        )
        
        # Format for response
        return Appointment(
            id=str(created_appointment["_id"]),
            **{k: v for k, v in created_appointment.items() if k != "_id"}
        )
    except Exception as e:
        print(f"Error creating appointment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to book appointment"
        )
