import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'server'))
from database import db_manager

def check_user():
    user = db_manager.doctors.find_one({"email": "supriyareddyandra@gmail.com"})
    if user:
        print(f"Doctor found: {user['name']} ({user['email']})")
        print(f"Role: {user.get('role', 'doctor')}")
    else:
        print("Doctor not found")
        
    parent = db_manager.parents.find_one({"email": "supriyareddyandra@gmail.com"})
    if parent:
        print(f"Parent found: {parent['name']} ({parent['email']})")
    else:
        print("Parent not found")

if __name__ == "__main__":
    check_user()
