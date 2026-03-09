import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'server'))
from database import db_manager
from utils.auth import verify_password, hash_password

def check_vamshi_password():
    db_manager.connect()
    email = "vamshikrishna@gmail.com"
    target_pass = "Parent@123"
    
    parent = db_manager.parents.find_one({"email": email})
    if not parent:
        print(f"User {email} not found")
        return

    stored_hash = parent.get("hashed_password")
    is_valid = verify_password(target_pass, stored_hash)
    
    print(f"Testing password '{target_pass}' for {email}")
    print(f"Stored hash: {stored_hash}")
    print(f"Verification result: {is_valid}")
    
    if not is_valid:
        print("Password mismatch! Re-hashing and updating...")
        new_hash = hash_password(target_pass)
        db_manager.parents.update_one({"email": email}, {"$set": {"hashed_password": new_hash}})
        print(f"Updated hash to: {new_hash}")
        
    db_manager.disconnect()

if __name__ == "__main__":
    check_vamshi_password()
