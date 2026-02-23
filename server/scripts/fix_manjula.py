"""
Fix Script: Move Manjula from doctors (therapist) collection to parents collection
This fixes the issue where Manjula was accidentally added to the therapist console
instead of the parent console.
"""
import sys
from pathlib import Path

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import db_manager
from datetime import datetime, timezone
import re


def fix_manjula():
    """Move Manjula from doctors collection to parents collection"""
    
    # Connect to database
    db_manager.connect()
    
    # Find Manjula in the doctors (therapist) collection - case insensitive search
    manjula_doctor = db_manager.doctors.find_one(
        {"name": {"$regex": "manjula", "$options": "i"}}
    )
    
    if not manjula_doctor:
        print("[INFO] Manjula not found in therapist/doctors collection.")
        print("[INFO] Checking if she's already in the parents collection...")
        
        manjula_parent = db_manager.parents.find_one(
            {"name": {"$regex": "manjula", "$options": "i"}}
        )
        
        if manjula_parent:
            print(f"[OK] Manjula is already in the parents collection!")
            print(f"   Name: {manjula_parent['name']}")
            print(f"   Email: {manjula_parent['email']}")
            print(f"   ID: {manjula_parent['_id']}")
        else:
            print("[WARNING] Manjula not found in either collection.")
        
        db_manager.disconnect()
        return
    
    print(f"[FOUND] Manjula found in therapist/doctors collection:")
    print(f"   Name: {manjula_doctor['name']}")
    print(f"   Email: {manjula_doctor['email']}")
    print(f"   ID: {manjula_doctor['_id']}")
    
    # Check if she already exists in parents collection
    existing_parent = db_manager.parents.find_one({"email": manjula_doctor["email"]})
    if existing_parent:
        print(f"\n[WARNING] Manjula already exists in parents collection too!")
        print(f"   Removing duplicate from doctors collection...")
        db_manager.doctors.delete_one({"_id": manjula_doctor["_id"]})
        print(f"[OK] Removed from doctors collection. She now only exists as a parent.")
        db_manager.disconnect()
        return
    
    # Create parent record from doctor data
    parent_data = {
        "_id": manjula_doctor["_id"],  # Keep same ID
        "name": manjula_doctor["name"],
        "email": manjula_doctor["email"],
        "hashed_password": manjula_doctor["hashed_password"],  # Preserve password
        "phone": manjula_doctor.get("phone"),
        "address": manjula_doctor.get("address"),
        "children_ids": [],  # New parent has no children yet
        "relationship": None,  # To be set later
        "created_at": manjula_doctor.get("created_at", datetime.now(timezone.utc)),
        "updated_at": datetime.now(timezone.utc),
        "is_active": manjula_doctor.get("is_active", True),
        "activation_token": manjula_doctor.get("activation_token"),
        "avatar": manjula_doctor.get("avatar"),
    }
    
    # Insert into parents collection
    print(f"\n[ACTION] Moving Manjula to parents collection...")
    db_manager.parents.insert_one(parent_data)
    print(f"[OK] Inserted into parents collection")
    
    # Remove from doctors collection
    db_manager.doctors.delete_one({"_id": manjula_doctor["_id"]})
    print(f"[OK] Removed from doctors/therapist collection")
    
    # Verify
    verify_parent = db_manager.parents.find_one({"_id": parent_data["_id"]})
    verify_doctor = db_manager.doctors.find_one({"_id": manjula_doctor["_id"]})
    
    if verify_parent and not verify_doctor:
        print(f"\n{'='*60}")
        print(f"[SUCCESS] Manjula has been moved to the parent console!")
        print(f"{'='*60}")
        print(f"   Name: {verify_parent['name']}")
        print(f"   Email: {verify_parent['email']}")
        print(f"   ID: {verify_parent['_id']}")
        print(f"   Is Active: {verify_parent.get('is_active', True)}")
        print(f"\n   She can now log in at the Parent portal using her existing credentials.")
        print(f"{'='*60}")
    else:
        print(f"\n[ERROR] Verification failed!")
        if not verify_parent:
            print(f"   Not found in parents collection")
        if verify_doctor:
            print(f"   Still found in doctors collection")
    
    # Close connection
    db_manager.disconnect()


if __name__ == "__main__":
    print("=" * 60)
    print("FIX: Moving Manjula from Therapist to Parent console")
    print("=" * 60 + "\n")
    try:
        fix_manjula()
        print("\n[DONE] Fix completed!")
    except Exception as e:
        print(f"\n[ERROR] Fix failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
