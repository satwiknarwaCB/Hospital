"""
Seed Admin User
Creates a default admin user in the database
"""
from database import db_manager
from utils.auth import hash_password
import sys

def seed_admin():
    print("🌱 Seeding Admin User...")
    
    # Initialize database connection
    try:
        db_manager.connect()
        db = db_manager.get_database()
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        return

    # admin user data
    admin_data = {
        "name": "Director Anjali Sharma",
        "email": "anjali.sharma@neurobridge.com",
        "hashed_password": hash_password("Admin@123"),
        "role": "admin",
        "is_active": True
    }

    # Check if admin already exists
    existing_admin = db_manager.admins.find_one({"email": admin_data["email"]})
    
    if existing_admin:
        print(f"ℹ️ Admin with email {admin_data['email']} already exists.")
        # Update password just in case
        db_manager.admins.update_one(
            {"email": admin_data["email"]},
            {"$set": {"hashed_password": admin_data["hashed_password"]}}
        )
        print("✅ Admin password updated.")
    else:
        # Insert admin
        result = db_manager.admins.insert_one(admin_data)
        print(f"✅ Admin created with ID: {result.inserted_id}")

    db_manager.disconnect()
    print("✨ Seeding complete!")

if __name__ == "__main__":
    seed_admin()
