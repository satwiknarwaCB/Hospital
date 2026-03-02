from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017")
db = client.therapy_portal

print("--- ROADMAPS KEYS ---")
for goal in db.roadmaps.find().limit(1):
    print(f"Keys: {list(goal.keys())}")
    for k, v in goal.items():
        print(f"  {k}: {v}")

print("\n--- ALL ROADMAPS ---")
for goal in db.roadmaps.find():
    cid = goal.get('childId') or goal.get('child_id')
    print(f"Title: {goal.get('title')}, childId: {cid}")

client.close()
