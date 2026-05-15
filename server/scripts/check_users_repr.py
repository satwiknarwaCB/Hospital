import sys
import os
from pymongo import MongoClient

def check_users_repr():
    client = MongoClient("mongodb://localhost:27017")
    db = client["therapy_portal"]
    
    print("--- DOCTORS ---")
    for d in db.doctors.find():
        print(f"Name: {repr(d.get('name'))}, Email: {repr(d.get('email'))}")
        
    print("\n--- PARENTS ---")
    for p in db.parents.find():
        print(f"Name: {repr(p.get('name'))}, Email: {repr(p.get('email'))}")

if __name__ == "__main__":
    check_users_repr()
