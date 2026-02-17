
import os
import sys
from pymongo import MongoClient
from datetime import datetime
import re

# Add current directory to path so we can import config if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from config import settings
except ImportError:
    # Faillback for direct execution without package context
    class Settings:
        MONGODB_URL = "mongodb://localhost:27017"
        DATABASE_NAME = "therapy_portal"
    settings = Settings()

client = MongoClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

def get_next_id(collection, prefix):
    """Find the next available ID for a given prefix"""
    # Regex to find IDs starting with PREFIX-
    pattern = f"^{prefix}-\d+$"
    docs = list(collection.find({"_id": {"$regex": pattern}}))
    
    max_num = 1000
    for doc in docs:
        try:
            num = int(doc["_id"].split("-")[1])
            if num > max_num:
                max_num = num
        except (ValueError, IndexError):
            continue
            
    return max_num + 1

def migrate_ids():
    print("🚀 Starting ID Migration...")
    
    # Mappings for old_id -> new_id
    doctor_map = {}
    parent_map = {}
    child_map = {}

    # 1. Migrate Doctors (TH-XXXX)
    print("Migrating Doctors...")
    doctors = list(db.doctors.find())
    # Sort by created_at if available to preserve order, otherwise arbitrary (stable sort)
    doctors.sort(key=lambda x: x.get("created_at", datetime.min) or datetime.min)
    
    next_doc_id = get_next_id(db.doctors, "TH")
    
    for doc in doctors:
        old_id = doc["_id"]
        # Skip if already migrated
        if str(old_id).startswith("TH-"):
            continue
            
        new_id = f"TH-{next_doc_id}"
        next_doc_id += 1
        
        # Create new document with new ID
        new_doc = doc.copy()
        new_doc["_id"] = new_id
        
        # Insert new, delete old
        db.doctors.insert_one(new_doc)
        db.doctors.delete_one({"_id": old_id})
        
        doctor_map[old_id] = new_id
        print(f"  Mapped Doctor: {old_id} -> {new_id}")

    # 2. Migrate Parents (PA-XXXX)
    print("Migrating Parents...")
    parents = list(db.parents.find())
    parents.sort(key=lambda x: x.get("created_at", datetime.min) or datetime.min)
    
    next_parent_id = get_next_id(db.parents, "PA")
    
    for parent in parents:
        old_id = parent["_id"]
        if str(old_id).startswith("PA-"):
            continue
            
        new_id = f"PA-{next_parent_id}"
        next_parent_id += 1
        
        new_parent = parent.copy()
        new_parent["_id"] = new_id
        
        db.parents.insert_one(new_parent)
        db.parents.delete_one({"_id": old_id})
        
        parent_map[old_id] = new_id
        print(f"  Mapped Parent: {old_id} -> {new_id}")

    # 3. Migrate Children (CH-XXXX)
    print("Migrating Children...")
    # NOTE: db.patients stores children
    children = list(db.patients.find())
    children.sort(key=lambda x: x.get("created_at", datetime.min) or datetime.min)
    
    next_child_id = get_next_id(db.patients, "CH")
    
    for child in children:
        old_id = child["_id"]
        if str(old_id).startswith("CH-"):
            continue
            
        new_id = f"CH-{next_child_id}"
        next_child_id += 1
        
        new_child = child.copy()
        new_child["_id"] = new_id
        
        db.patients.insert_one(new_child)
        db.patients.delete_one({"_id": old_id})
        
        child_map[old_id] = new_id
        print(f"  Mapped Child: {old_id} -> {new_id}")

    # 4. Update References
    print("Updating References...")
    
    # Update Patients (therapistId, parent_id)
    for old_did, new_did in doctor_map.items():
        db.patients.update_many({"therapistId": old_did}, {"$set": {"therapistId": new_did}})
        
    for old_pid, new_pid in parent_map.items():
        db.patients.update_many({"parent_id": old_pid}, {"$set": {"parent_id": new_pid}})
        
    # Update Parents (children_ids)
    for old_cid, new_cid in child_map.items():
        # Using $set with positional operator is hard without knowing index
        # Easier to pull old and push new? No, that changes order or duplicates?
        # Best way: Find parents with old_cid in array, update the array.
        parents_with_child = db.parents.find({"children_ids": old_cid})
        for p in parents_with_child:
            new_ids = [new_cid if x == old_cid else x for x in p.get("children_ids", [])]
            db.parents.update_one({"_id": p["_id"]}, {"$set": {"children_ids": new_ids}})

    # Update Sessions (therapistId, childId)
    for old_did, new_did in doctor_map.items():
        db.sessions.update_many({"therapistId": old_did}, {"$set": {"therapistId": new_did}})
        
    for old_cid, new_cid in child_map.items():
        db.sessions.update_many({"childId": old_cid}, {"$set": {"childId": new_cid}})

    # Update Skill Goals (childId)
    for old_cid, new_cid in child_map.items():
        db.skill_goals.update_many({"childId": old_cid}, {"$set": {"childId": new_cid}})

    # Update Skill Progress (childId)
    for old_cid, new_cid in child_map.items():
        db.skill_progress.update_many({"childId": old_cid}, {"$set": {"childId": new_cid}})

    # Update Direct Messages (sender_id, recipient_id, child_id)
    for old_did, new_did in doctor_map.items():
        db.direct_messages.update_many({"sender_id": old_did}, {"$set": {"sender_id": new_did}})
        db.direct_messages.update_many({"recipient_id": old_did}, {"$set": {"recipient_id": new_did}})
        
    for old_pid, new_pid in parent_map.items():
        db.direct_messages.update_many({"sender_id": old_pid}, {"$set": {"sender_id": new_pid}})
        db.direct_messages.update_many({"recipient_id": old_pid}, {"$set": {"recipient_id": new_pid}})
        
    for old_cid, new_cid in child_map.items():
        db.direct_messages.update_many({"child_id": old_cid}, {"$set": {"child_id": new_cid}})
        
    print("✅ Migration Completed Successfully!")

if __name__ == "__main__":
    migrate_ids()
