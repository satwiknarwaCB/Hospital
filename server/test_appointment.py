"""
Test script to debug appointment creation
"""
import sys
sys.path.insert(0, '.')

from database import db_manager
from models.appointment import AppointmentCreate
from datetime import datetime

# Connect to database
db_manager.connect()

# Test data
test_appointment = {
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "1234567890",
    "department": "Speech Therapy",
    "date": "2026-01-25",
    "mode": "Online"
}

print("Testing appointment creation...")
print(f"Test data: {test_appointment}")

try:
    # Validate with Pydantic
    appointment = AppointmentCreate(**test_appointment)
    print(f"✅ Pydantic validation passed: {appointment}")
    
    # Convert to dict
    appointment_dict = appointment.dict()
    appointment_dict["status"] = "pending"
    appointment_dict["created_at"] = datetime.utcnow()
    
    print(f"📋 Document to insert: {appointment_dict}")
    
    # Insert into database
    result = db_manager.appointments.insert_one(appointment_dict)
    print(f"✅ Successfully inserted with ID: {result.inserted_id}")
    
    # Retrieve it
    created = db_manager.appointments.find_one({"_id": result.inserted_id})
    print(f"📤 Retrieved document: {created}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
