import sys
import os

# Setup path
sys.path.append(os.getcwd())

from database import db_manager

def fix_schema():
    print("🔧 Starting Schema Fix...")
    db_manager.connect()

    # Fix Parents
    print("👉 Fixing Parents...")
    parents = db_manager.parents.find({"password": {"$exists": True}})
    count = 0
    for p in parents:
        db_manager.parents.update_one(
            {"_id": p["_id"]}, 
            {
                "$set": {"hashed_password": p["password"]},
                "$unset": {"password": ""}
            }
        )
        count += 1
    print(f"✅ Fixed {count} parents.")

    # Fix Admins
    print("👉 Fixing Admins...")
    admins = db_manager.admins.find({"password": {"$exists": True}})
    count = 0
    for a in admins:
        db_manager.admins.update_one(
            {"_id": a["_id"]}, 
            {
                "$set": {"hashed_password": a["password"]},
                "$unset": {"password": ""}
            }
        )
        count += 1
    print(f"✅ Fixed {count} admins.")
    
    print("🏁 Schema Fix Complete.")

if __name__ == "__main__":
    fix_schema()
