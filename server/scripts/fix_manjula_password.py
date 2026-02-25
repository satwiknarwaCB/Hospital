"""
Fix Manjula's password to match the admin panel default: User@123
The UserManagement.jsx form has default password 'User@123' (line 49).
"""
import sys
sys.path.insert(0, '.')
from database import db_manager
from utils.auth import hash_password, verify_password

db_manager.connect()

m = db_manager.parents.find_one({"email": "manjula@gmail.com"})
if not m:
    print("[ERROR] Manjula not found!")
    db_manager.disconnect()
    sys.exit(1)

# Set password to User@123 (the admin panel default)
password = "User@123"
new_hash = hash_password(password)
assert verify_password(password, new_hash)

db_manager.parents.update_one(
    {"_id": m["_id"]},
    {"$set": {"hashed_password": new_hash, "is_active": True}}
)

# Verify
updated = db_manager.parents.find_one({"_id": m["_id"]})
print(f"Password reset for: {updated['name']} ({updated['email']})")
print(f"New password: {password}")
print(f"Verified: {verify_password(password, updated['hashed_password'])}")

# Test both passwords
print(f"\nUser@123 works: {verify_password('User@123', updated['hashed_password'])}")
print(f"Parent@123 works: {verify_password('Parent@123', updated['hashed_password'])}")

db_manager.disconnect()
