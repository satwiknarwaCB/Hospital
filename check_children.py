from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017")
db = client.therapy_portal

print("--- CHILDREN (PATIENTS) ---")
for child in db.patients.find():
    print(f"ID: {child.get('_id')}, Name: {child.get('name')}, ParentID: {child.get('parent_id')}, TherapistID: {child.get('therapistId')}")

client.close()
