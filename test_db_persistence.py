import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'server'))

from database import db_manager
from models.doctor import DoctorCreate
from utils.auth import hash_password
import uuid
from datetime import datetime, timezone

def test_creation():
    print("Testing therapist creation directly in DB...")
    try:
        db = db_manager.get_database()
        doctor_id = str(uuid.uuid4())
        doctor_data = {
            "_id": doctor_id,
            "name": "Test Therapist",
            "email": "test@therapist.com",
            "hashed_password": "dummy",
            "specialization": "Speech Therapy",
            "experience_years": 5,
            "assigned_children": 0,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        result = db_manager.doctors.insert_one(doctor_data)
        print(f"Result: {result.inserted_id}")
        
        # Verify
        found = db_manager.doctors.find_one({"_id": doctor_id})
        if found:
            print(f"Success! Found therapist: {found['name']}")
        else:
            print("Failed! Therapist not found after insertion.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_creation()
