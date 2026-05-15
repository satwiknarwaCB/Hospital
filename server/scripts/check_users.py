import sys
import os
from pymongo import MongoClient

def check_users():
    client = MongoClient("mongodb://localhost:27017")
    db = client["therapy_portal"]
    
    print("--- DOCTORS ---")
    for d in db.doctors.find():
        print(f"Name: {d.get('name')}, Email: {d.get('email')}")
        
    print("\n--- PARENTS ---")
    for p in db.parents.find():
        print(f"Name: {p.get('name')}, Email: {p.get('email')}")
        
    print("\n--- ADMINS ---")
    for a in db.admins.find():
        print(f"Name: {a.get('name')}, Email: {a.get('email')}")

if __name__ == "__main__":
    check_users()
