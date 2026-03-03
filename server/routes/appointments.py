from fastapi import APIRouter, Body, HTTPException, status
from typing import List
from datetime import datetime
from database import db_manager
from models.appointment import AppointmentCreate, Appointment
import traceback
from bson import ObjectId

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_appointment(appointment: AppointmentCreate):
    """
    Create a new appointment booking
    """
    print(f"Received appointment request for: {appointment.email}")
    try:
        # Convert Pydantic model to dict
        appointment_dict = appointment.model_dump()
        
        # Add metadata
        appointment_dict["status"] = "pending"
        appointment_dict["created_at"] = datetime.utcnow()
        
        # Insert into database
        result = db_manager.appointments.insert_one(appointment_dict)
        
        # Prepare the response data manually
        response_data = {
            "id": str(result.inserted_id),
            "name": appointment_dict.get("name"),
            "email": appointment_dict.get("email"),
            "mobile": appointment_dict.get("mobile"),
            "department": appointment_dict.get("department"),
            "date": appointment_dict.get("date"),
            "mode": appointment_dict.get("mode"),
            "status": appointment_dict.get("status"),
            "created_at": appointment_dict.get("created_at").isoformat()
        }
        
        return response_data
        
    except Exception as e:
        # Fallback error handling
        print(f"Error creating appointment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to book appointment: {str(e)}"
        )

@router.get("/", response_model=List[Appointment])
async def list_appointments():
    """
    List all appointment bookings
    """
    try:
        appointments = list(db_manager.appointments.find().sort("created_at", -1))
        
        # Format the data for response
        response = []
        for appt in appointments:
            appt["id"] = str(appt["_id"])
            response.append(appt)
            
        return response
        
    except Exception as e:
        print(f"Error fetching appointments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch appointments: {str(e)}"
        )

@router.put("/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status_update: dict = Body(...)):
    """
    Update appointment status (approve/decline)
    """
    try:
        new_status = status_update.get("status")
        acted_by = status_update.get("acted_by", "")
        if new_status not in ["approved", "declined", "pending"]:
            raise HTTPException(status_code=400, detail="Invalid status")
            
        # Try to find by string ID first, then by ObjectId if that fails
        query = {"_id": appointment_id}
        if not db_manager.appointments.find_one(query):
            try:
                query = {"_id": ObjectId(appointment_id)}
            except:
                pass
                
        update_fields = {"status": new_status, "updated_at": datetime.utcnow()}
        if acted_by:
            update_fields["acted_by"] = acted_by
            
        result = db_manager.appointments.update_one(
            query,
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Appointment not found")
            
        return {"status": "success", "message": f"Appointment {new_status}"}
    except Exception as e:
        print(f"Error updating appointment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update appointment: {str(e)}"
        )


