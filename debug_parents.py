from pymongo import MongoClient
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017")
db = client.therapy_portal

print("--- PARENTS ---")
for parent in db.parents.find():
    print(f"Name: {parent.get('name')}, Email: {parent.get('email')}, childId: {parent.get('childId')}, child_id: {parent.get('child_id')}")

print("\n--- PATIENTS ---")
for p in db.patients.find():
    print(f"ID: {p.get('_id')}, Name: {p.get('name')}")

client.close()
