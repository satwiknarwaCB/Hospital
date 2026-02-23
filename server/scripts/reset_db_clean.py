import sys
import os
from datetime import datetime

# Setup path to import from the 'server' directory
current_dir = os.path.dirname(os.path.abspath(__file__))
server_dir = os.path.dirname(current_dir) # server/scripts -> server
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

from database import db_manager
from utils.auth import hash_password

def reset_db_clean():
    print("🚀 Starting Clean Database Reset...")
    db_manager.connect()
    db = db_manager.get_database()

    # List of all collections to be cleared
    # Collections to clear (everything except important indexes/schemas)
    collections_to_clear = [
        "doctors", "parents", "patients", "sessions", "appointments",
        "communities", "community_messages", "direct_messages", "admins",
        "progress", "skill_progress", "skill_goals"
    ]

    for coll_name in collections_to_clear:
        # We use delete_many({}) instead of drop() to keep indexes if any
        result = db[coll_name].delete_many({})
        print(f"🧹 Cleared collection: {coll_name} ({result.deleted_count} documents removed)")

    # --- RECREATE ADMIN ---
    admin_email = "anjali.sharma@neurobridge.com"
    admin_password = "Admin@123"
    
    print(f"👤 Creating Admin: {admin_email}...")
    
    hashed_password = hash_password(admin_password)
    
    admin_data = {
        "name": "Director Anjali Sharma",
        "email": admin_email,
        "hashed_password": hashed_password,
        "role": "admin",
        "is_active": True,
        "is_super_admin": True,
        "created_at": datetime.utcnow()
    }
    
    db_manager.admins.insert_one(admin_data)
    
    print("\n✅ Database Reset Complete!")
    print(f"Credentials for testing:")
    print(f"  Email: {admin_email}")
    print(f"  Password: {admin_password}")
    print("\nAll other data (parents, doctors, children, etc.) has been removed.")

if __name__ == "__main__":
    reset_db_clean()
