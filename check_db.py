from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017")
db = client.therapy_portal

print("--- DOCTORS ---")
for doc in db.doctors.find():
    print(f"Name: {doc.get('name')}, Email: {doc.get('email')}, Role: {doc.get('role')}")

print("\n--- PARENTS ---")
for parent in db.parents.find():
    print(f"Name: {parent.get('name')}, Email: {parent.get('email')}, Role: {parent.get('role')}")

print("\n--- ADMINS ---")
for admin in db.admins.find():
    print(f"Name: {admin.get('name')}, Email: {admin.get('email')}, Role: {admin.get('role')}")

client.close()
