from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017")
db = client.therapy_portal

print("--- PARENTS with IDs ---")
for parent in db.parents.find():
    print(f"ID: {parent.get('_id')}, Name: {parent.get('name')}, Email: {parent.get('email')}")

client.close()
