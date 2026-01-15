"""
Database seeding script for creating sample doctor account
Run this script to populate the database with Dr. Rajesh Kumar
"""
import sys
from pathlib import Path

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import db_manager
from utils.auth import hash_password
from datetime import datetime


def create_sample_doctor():
    """Create sample doctor account in database"""
    
    # Connect to database
    db_manager.connect()
    
    # Doctor data
    doctors_data = [
        {
            "_id": "t1",  # Match mockData.js ID
            "name": "Dr. Rajesh Kumar",
            "email": "dr.rajesh@therapist.com",
            "hashed_password": hash_password("Therapist@123"),
            "specialization": "Speech & Language Therapy",
            "experience_years": 12,
            "assigned_patients": 2,
            "phone": "+91-9876543210",
            "license_number": "SLT-2012-MH-4567",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        },
        {
            "_id": "t2",  # Match mockData.js ID
            "name": "Dr. Meera Singh",
            "email": "dr.meera@therapist.com",
            "hashed_password": hash_password("Therapist@123"),
            "specialization": "Occupational Therapy",
            "experience_years": 8,
            "assigned_patients": 3,
            "phone": "+91-9876543215",
            "license_number": "OT-2015-MH-7890",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
    ]
    
    for doctor_data in doctors_data:
        # Check if doctor already exists
        existing_doctor = db_manager.doctors.find_one({"email": doctor_data["email"]})
        
        if existing_doctor:
            print(f"⚠️  Doctor already exists: {doctor_data['email']}")
            db_manager.doctors.update_one(
                {"_id": existing_doctor["_id"]},
                {"$set": doctor_data}
            )
            print(f"✅ Doctor updated successfully!")
        else:
            # Insert new doctor
            result = db_manager.doctors.insert_one(doctor_data)
            print(f"✅ Sample doctor created successfully!")
            print(f"   ID: {result.inserted_id}")
        
        print(f"   Name: {doctor_data['name']}")
        print(f"   Email: {doctor_data['email']}")
        print(f"   Password: Therapist@123")
        print("-" * 20)
    
    # Close connection
    db_manager.disconnect()


if __name__ == "__main__":
    print("🌱 Seeding database with sample doctor...\n")
    try:
        create_sample_doctor()
        print("\n✅ Database seeding completed!")
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        sys.exit(1)
