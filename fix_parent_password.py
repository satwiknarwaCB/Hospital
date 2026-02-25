"""
Fix Parent Password Script
Resets the hashed_password for parents so they can login successfully.
Run from the Hospital root directory: python fix_parent_password.py
"""
import sys
import os

# Add server directory to path so we can import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))

from database import db_manager
from utils.auth import hash_password, verify_password

def fix_parent_passwords():
    db_manager.connect()

    # Map of email -> new password to reset
    parents_to_fix = [
        {"email": "virat18@gmail.com",  "new_password": "Parent@123"},
        {"email": "rohith45@gmail.com", "new_password": "Parent@123"},
    ]

    print("\n=== Fixing Parent Passwords ===\n")

    for item in parents_to_fix:
        email = item["email"]
        new_password = item["new_password"]

        parent = db_manager.parents.find_one({"email": email})
        if not parent:
            print(f"[NOT FOUND] No parent with email: {email}")
            continue

        # Check if current password is already correct
        current_hash = parent.get("hashed_password", "")
        if current_hash and verify_password(new_password, current_hash):
            print(f"[OK] Password already correct for: {email}")
            continue

        # Reset the password
        new_hash = hash_password(new_password)
        result = db_manager.parents.update_one(
            {"_id": parent["_id"]},
            {"$set": {"hashed_password": new_hash, "is_active": True}}
        )

        if result.modified_count > 0:
            print(f"[FIXED] Password reset for: {email}")
            print(f"        Use password: {new_password}")
        else:
            print(f"[ERROR] Failed to update password for: {email}")

    print("\n=== Done ===")
    db_manager.disconnect()


if __name__ == "__main__":
    fix_parent_passwords()
