import sys
import os
from datetime import datetime

# Setup path
sys.path.append(os.getcwd())

from database import db_manager
from utils.auth import hash_password

def ensure_demo_users():
    print("🚀 Checking Demo Users...")
    db_manager.connect()

    # --- 1. ENSURE PARENTS ---
    parents = [
        {"name": "Priya Patel", "email": "priya.patel@parent.com", "password": "Parent@123", "child_id": "c1"},
        {"name": "Arun Sharma", "email": "arun.sharma@parent.com", "password": "Parent@123", "child_id": "c2"}
    ]

    for p in parents:
        existing = db_manager.parents.find_one({"email": p["email"]})
        if not existing:
            print(f"⚠️ Parent {p['email']} missing. Creating...")
            hashed = hash_password(p["password"])
            db_manager.parents.insert_one({
                "name": p["name"],
                "email": p["email"],
                "hashed_password": hashed,
                "created_at": datetime.utcnow(),
                "role": "parent",
                "child_id": p.get("child_id")
            })
            print(f"✅ Created Parent: {p['name']}")
        else:
            # Update password to ensure it matches demo credentials
            hashed = hash_password(p["password"])
            db_manager.parents.update_one(
                {"email": p["email"]},
                {"$set": {"hashed_password": hashed, "child_id": p.get("child_id")}}
            )
            print(f"✅ Parent {p['name']} exists. Password and Child ID updated.")

    # --- 2. ENSURE ADMIN ---
    admins = [
        {"name": "Director Anjali Sharma", "email": "anjali.sharma@neurobridge.com", "password": "Admin@123"}
    ]

    for a in admins:
        existing = db_manager.admins.find_one({"email": a["email"]})
        if not existing:
            print(f"⚠️ Admin {a['email']} missing. Creating...")
            hashed = hash_password(a["password"])
            db_manager.admins.insert_one({
                "name": a["name"],
                "email": a["email"],
                "hashed_password": hashed,
                "created_at": datetime.utcnow(),
                "role": "admin",
                "is_super_admin": True
            })
            print(f"✅ Created Admin: {a['name']}")
        else:
            # Update password to ensure it matches demo credentials
            hashed = hash_password(a["password"])
            db_manager.admins.update_one(
                {"email": a["email"]},
                {"$set": {"hashed_password": hashed}}
            )
            print(f"✅ Admin {a['name']} exists. Password updated.")
            
    print("🏁 Demo User Check Complete.")

if __name__ == "__main__":
    ensure_demo_users()
