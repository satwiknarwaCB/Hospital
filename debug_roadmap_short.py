from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client.therapy_portal

print("--- ROADMAPS CHECK ---")
count = 0
for goal in db.roadmaps.find():
    count += 1
    cid = goal.get('childId')
    cid2 = goal.get('child_id')
    print(f"Goal: {goal.get('title')}, childId: {cid}, child_id: {cid2}")

print(f"Total: {count}")
client.close()
