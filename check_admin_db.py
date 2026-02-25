import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'server'))
from database import db_manager

def check_admin():
    admin = db_manager.admins.find_one({"email": "anjali.sharma@neurobridge.com"})
    if admin:
        print(f"Admin found: {admin['email']}")
        print(f"Hashed password: {admin['hashed_password']}")
    else:
        print("Admin not found!")

if __name__ == "__main__":
    check_admin()
