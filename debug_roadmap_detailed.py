from pymongo import MongoClient
import json
from datetime import datetime

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

client = MongoClient("mongodb://localhost:27017")
db = client.therapy_portal

print("--- DETAILED ROADMAPS ---")
for goal in db.roadmaps.find():
    # Convert _id to string for serialization
    goal['_id'] = str(goal['_id'])
    print(json.dumps(goal, indent=2, cls=DateTimeEncoder))

client.close()
