import sys
import os

# Setup path
sys.path.append(os.getcwd())

from database import db_manager
from utils.auth import verify_password

def verify_fix():
    print("🚀 Verifying Login Fix...")
    db_manager.connect()

    # Test Parent Login
    parent_email = "priya.patel@parent.com"
    parent_password = "Parent@123"
    
    parent = db_manager.parents.find_one({"email": parent_email})
    
    if parent:
        if verify_password(parent_password, parent["hashed_password"]):
            print(f"✅ Parent Login Success for {parent_email}")
        else:
            print(f"❌ Parent Login FAILED for {parent_email}")
    else:
        print(f"❌ Parent {parent_email} not found")

    # Test Admin Login
    admin_email = "anjali.sharma@neurobridge.com"
    admin_password = "Admin@123"
    
    admin = db_manager.admins.find_one({"email": admin_email})
    
    if admin:
        if verify_password(admin_password, admin["hashed_password"]):
            print(f"✅ Admin Login Success for {admin_email}")
        else:
            print(f"❌ Admin Login FAILED for {admin_email}")
    else:
        print(f"❌ Admin {admin_email} not found")

if __name__ == "__main__":
    verify_fix()
