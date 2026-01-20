from fastapi import APIRouter, Body, HTTPException, status
from typing import List
from datetime import datetime
from database import db_manager
from models.appointment import AppointmentCreate, Appointment
import traceback

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: AppointmentCreate):
    """
    Create a new appointment booking
    """
    print(f"📝 Received appointment request for: {appointment.email}")
    try:
        print(f"📋 Appointment data: {appointment.model_dump()}")
        appointment_dict = appointment.model_dump()
        appointment_dict["status"] = "pending"
        appointment_dict["created_at"] = datetime.utcnow()
        
        print(f"💾 Inserting into database...")
        # Insert into database
        new_appointment = db_manager.appointments.insert_one(appointment_dict)
        print(f"✅ Inserted with ID: {new_appointment.inserted_id}")
        
        # Add generated ID to response
        created_appointment = db_manager.appointments.find_one(
            {"_id": new_appointment.inserted_id}
        )
        
        print(f"📤 Returning appointment: {created_appointment}")
        # Format for response - return plain dict
        response_data = {
            "id": str(created_appointment["_id"]),
            "name": created_appointment["name"],
            "email": created_appointment["email"],
            "mobile": created_appointment["mobile"],
            "department": created_appointment["department"],
            "date": created_appointment["date"],
            "mode": created_appointment["mode"],
            "status": created_appointment["status"],
            "created_at": created_appointment["created_at"].isoformat()
        }
        return response_data
    except Exception as e:
        print(f"❌ Error creating appointment: {e}")
        print(f"📜 Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to book appointment: {str(e)}"
        )

