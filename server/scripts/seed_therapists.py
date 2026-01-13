"""
Database seeding script for creating therapist accounts
Creates Dr. Rajesh Kumar and Dr. Meera Singh in the database
"""
import os
import sys
from pathlib import Path

# Set encoding before any imports
os.environ['PYTHONIOENCODING'] = 'utf-8'
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from database import db_manager
    from utils.auth import hash_password
    from datetime import datetime
except Exception as e:
    print(f"Import error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)


def create_therapists():
    """Create therapist accounts in database"""
    
    # Connect to database
    db_manager.connect()
    
    # Therapist data
    therapists = [
        {
            "_id": "dr_rajesh_001",
            "name": "Dr. Rajesh Kumar",
            "email": "dr.rajesh@neurobridge.com",
            "hashed_password": hash_password("therapist123"),
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
            "_id": "dr_meera_002",
            "name": "Dr. Meera Singh",
            "email": "dr.meera@neurobridge.com",
            "hashed_password": hash_password("therapist123"),
            "specialization": "Occupational Therapy",
            "experience_years": 8,
            "assigned_patients": 3,
            "phone": "+91-9876543211",
            "license_number": "OTR-2016-DL-8901",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
    ]
    
    print("[INFO] Creating therapist accounts...\n")
    
    for therapist_data in therapists:
        # Check if therapist already exists
        existing = db_manager.doctors.find_one({"email": therapist_data["email"]})
        
        if existing:
            print(f"[WARNING] Therapist already exists: {therapist_data['email']}")
            print(f"   Updating existing record...")
            # Remove _id from update data as it's immutable
            update_data = {k: v for k, v in therapist_data.items() if k != "_id"}
            db_manager.doctors.update_one(
                {"_id": existing["_id"]},
                {"$set": update_data}
            )
            print(f"[OK] Updated successfully!\n")
        else:
            # Insert new therapist
            db_manager.doctors.insert_one(therapist_data)
            print(f"[OK] Created: {therapist_data['name']}")
            print(f"   Email: {therapist_data['email']}\n")
    
    print("\n" + "="*60)
    print("THERAPIST LOGIN CREDENTIALS")
    print("="*60)
    print("\nDr. Rajesh Kumar:")
    print(f"  Email: dr.rajesh@neurobridge.com")
    print(f"  Password: therapist123")
    print(f"  Specialization: Speech & Language Therapy")
    
    print("\nDr. Meera Singh:")
    print(f"  Email: dr.meera@neurobridge.com")
    print(f"  Password: therapist123")
    print(f"  Specialization: Occupational Therapy")
    print("="*60 + "\n")
    
    # Close connection
    db_manager.disconnect()


if __name__ == "__main__":
    print("[START] Seeding database with therapists...\n")
    try:
        create_therapists()
        print("[DONE] Database seeding completed successfully!")
    except Exception as e:
        print(f"\n[ERROR] Failed to seed database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
