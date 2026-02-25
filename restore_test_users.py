import sys
import os
from datetime import datetime, timezone

# Add the server directory to the path
sys.path.append(os.path.join(os.getcwd(), 'server'))

from database import db_manager
from utils.auth import hash_password

def restore_users():
    print("Restoring test users...")
    db_manager.connect()
    
    # 1. Restore Parents
    parents_data = [
        {
            "name": "Virat Kohli",
            "email": "virat18@gmail.com",
            "hashed_password": hash_password("Parent@123"),
            "phone": "+91-9876543210",
            "children_ids": ["c1"],
            "child_id": "c1",
            "relationship": "Father",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Rohit Sharma",
            "email": "rohith45@gmail.com",
            "hashed_password": hash_password("Parent@123"),
            "phone": "+91-9876543211",
            "children_ids": ["c2"],
            "child_id": "c2",
            "relationship": "Father",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Vamshi Krishna",
            "email": "vamshikrishna@gmail.com",
            "hashed_password": hash_password("Parent@123"),
            "phone": "+91-9876543212",
            "children_ids": ["c3"],
            "child_id": "c3",
            "relationship": "Father",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Priya Patel",
            "email": "priya.patel@parent.com",
            "hashed_password": hash_password("Parent@123"),
            "phone": "+91-9876543213",
            "children_ids": ["c4"],
            "child_id": "c4",
            "relationship": "Mother",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    for p in parents_data:
        existing = db_manager.parents.find_one({"email": p["email"]})
        if not existing:
            db_manager.parents.insert_one(p)
            print(f"[RESTORED] Parent: {p['email']}")
        else:
            print(f"[INFO] Parent {p['email']} already exists")

    # 2. Restore Therapists (Dr. Rajesh and Dr. Meera)
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

    for t in therapists:
        existing = db_manager.doctors.find_one({"email": t["email"]})
        if not existing:
            db_manager.doctors.insert_one(t)
            print(f"[RESTORED] Therapist: {t['email']}")
        else:
            db_manager.doctors.update_one({"_id": existing["_id"]}, {"$set": {"hashed_password": t["hashed_password"]}})
            print(f"[UPDATED] Therapist password: {t['email']}")

    # Sync Vamshi Krishna doctor password
    vamshi_doc = db_manager.doctors.find_one({"email": "vamshikrishna@gmail.com"})
    if vamshi_doc:
        db_manager.doctors.update_one({"_id": vamshi_doc["_id"]}, {"$set": {"hashed_password": hash_password("Therapist@123")}})
        print("[UPDATED] Vamshi Krishna doctor password")


    # 3. Restore default children
    children = [
        {
            "_id": "c1",
            "name": "Aarav Virat",
            "age": 5,
            "gender": "Male",
            "diagnosis": "Autism Spectrum Disorder",
            "parent_id": "virat18@gmail.com",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "c2",
            "name": "Diya Rohith",
            "age": 4,
            "gender": "Female",
            "diagnosis": "Speech Delay",
            "parent_id": "rohith45@gmail.com",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "c3",
            "name": "Arjun Vamshi",
            "age": 6,
            "gender": "Male",
            "diagnosis": "ADHD",
            "parent_id": "vamshikrishna@gmail.com",
            "created_at": datetime.utcnow()
        },
        {
            "_id": "c4",
            "name": "Ananya Priya",
            "age": 5,
            "gender": "Female",
            "diagnosis": "Sensory Processing Disorder",
            "parent_id": "priya.patel@parent.com",
            "created_at": datetime.utcnow()
        }
    ]
    
    for c in children:
        existing = db_manager.children.find_one({"_id": c["_id"]})
        if not existing:
            db_manager.children.insert_one(c)
            print(f"[RESTORED] Child: {c['name']}")
        else:
            print(f"[INFO] Child {c['name']} already exists")



    db_manager.disconnect()
    print("Restore complete.")

if __name__ == "__main__":
    restore_users()
