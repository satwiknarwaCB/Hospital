import sys
import os
from pymongo import MongoClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_hardik():
    client = MongoClient("mongodb://localhost:27017")
    db = client["therapy_portal"]
    
    parent = db.parents.find_one({"email": "hardik@gmail.com"})
    if not parent:
        print("Hardik not found!")
        return
        
    print(f"User: {parent.get('email')}")
    print(f"Hash: {parent.get('hashed_password')}")
    
    # We don't know the password, but we can try common ones if it was a test
    passwords_to_try = ["hardik@123", "Hardik@123", "Admin@123", "password", "Password@123"]
    for p in passwords_to_try:
        is_valid = pwd_context.verify(p, parent["hashed_password"])
        print(f"Trying '{p}': {is_valid}")

if __name__ == "__main__":
    verify_hardik()
