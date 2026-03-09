import pymongo
from datetime import datetime, timezone
import os

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "neurobridge"

client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]

# Child ID for Aarav
CHILD_ID = "c1"

# Deleting existing progress for this child to start fresh for this request
db.skill_progress.delete_many({"childId": CHILD_ID})

detailed_progress = [
    {
        "childId": CHILD_ID,
        "skillId": "sp_spoon_hold",
        "skillName": "Holding a Spoon",
        "category": "Adaptive / OT",
        "status": "In Progress",
        "progress": 65,
        "therapistNotes": "Aarav is showing better grip stability. Still needs slight physical prompting for 3-finger grip.",
        "icon": "spoon",
        "lastUpdated": "2025-12-23",
        "history": [
            {"date": "2025-12-23", "status": "In Progress", "progress": 65, "remarks": "Updated during session"}
        ]
    },
    {
        "childId": CHILD_ID,
        "skillId": "sp_spoon_eat",
        "skillName": "Eating with a Spoon",
        "category": "Adaptive / OT",
        "status": "In Progress",
        "progress": 40,
        "therapistNotes": "Coordination between scooping and bringing to mouth is improving.",
        "icon": "utensils",
        "lastUpdated": "2025-12-23",
        "history": [
            {"date": "2025-12-23", "status": "In Progress", "progress": 40, "remarks": "Coordination improvement"}
        ]
    },
    {
        "childId": CHILD_ID,
        "skillId": "sp_glass_drink",
        "skillName": "Drinking Water from a Glass",
        "category": "Adaptive / OT",
        "status": "In Progress",
        "progress": 75,
        "therapistNotes": "Controls the tilt well. Occasionally bites the rim.",
        "icon": "cup",
        "lastUpdated": "2025-12-22",
        "history": [
            {"date": "2025-12-22", "status": "In Progress", "progress": 75, "remarks": "Better tilt control"}
        ]
    },
    {
        "childId": CHILD_ID,
        "skillId": "sp_buttoning",
        "skillName": "Buttoning Clothes",
        "category": "Adaptive / OT",
        "status": "Not Started",
        "progress": 15,
        "therapistNotes": "Fine motor strength is building up. Will focus on larger buttons first next week.",
        "icon": "shirt",
        "lastUpdated": "2025-12-21",
        "history": [
            {"date": "2025-12-21", "status": "Not Started", "progress": 15, "remarks": "Strength building phase"}
        ]
    },
    {
        "childId": CHILD_ID,
        "skillId": "sp_eye_contact",
        "skillName": "Maintaining Eye Contact",
        "category": "Social / Behavioral",
        "status": "Achieved",
        "progress": 90,
        "therapistNotes": "Consistency in eye contact during greetings is excellent.",
        "icon": "eye",
        "lastUpdated": "2025-12-23",
        "history": [
            {"date": "2025-12-23", "status": "Achieved", "progress": 90, "remarks": "Excellent consistency"}
        ]
    },
    {
        "childId": CHILD_ID,
        "skillId": "sp_onestep",
        "skillName": "Following One-step Instructions",
        "category": "Cognitive / Speech",
        "status": "Achieved",
        "progress": 100,
        "therapistNotes": "Follows \"Sit down\", \"Give me\", \"Look\" commands perfectly.",
        "icon": "list",
        "lastUpdated": "2025-12-22",
        "history": [
            {"date": "2025-12-22", "status": "Achieved", "progress": 100, "remarks": "Perfect execution"}
        ]
    },
    {
        "childId": CHILD_ID,
        "skillId": "sp_twostep",
        "skillName": "Following Two-step Instructions",
        "category": "Cognitive / Speech",
        "status": "In Progress",
        "progress": 55,
        "therapistNotes": "Working on processing the second part of the instruction. Visual cues help.",
        "icon": "list-ordered",
        "lastUpdated": "2025-12-23",
        "history": [
            {"date": "2025-12-23", "status": "In Progress", "progress": 55, "remarks": "Processing improvements"}
        ]
    },
    {
        "childId": CHILD_ID,
        "skillId": "sp_imitation",
        "skillName": "Sound / Word Imitation",
        "category": "Communication / Speech",
        "status": "In Progress",
        "progress": 80,
        "therapistNotes": "Imitating \"B\", \"P\", \"M\" sounds consistently. Moving to 2-word phrases.",
        "icon": "mic",
        "lastUpdated": "2025-12-23",
        "history": [
            {"date": "2025-12-23", "status": "In Progress", "progress": 80, "remarks": "Consonant imitation solid"}
        ]
    },
    {
        "childId": CHILD_ID,
        "skillId": "sp_sitting",
        "skillName": "Sitting Tolerance",
        "category": "Behavioral",
        "status": "In Progress",
        "progress": 60,
        "therapistNotes": "Currently sitting for 12-15 minutes. Goal is 25 minutes of table time.",
        "icon": "clock",
        "lastUpdated": "2025-12-23",
        "history": [
            {"date": "2025-12-23", "status": "In Progress", "progress": 60, "remarks": "Increased table time"}
        ]
    },
    {
        "childId": CHILD_ID,
        "skillId": "sp_social",
        "skillName": "Social Interaction",
        "category": "Social / Behavioral",
        "status": "In Progress",
        "progress": 35,
        "therapistNotes": "Starting parallel play. Needs encouragement for turn-taking.",
        "icon": "users",
        "lastUpdated": "2025-12-23",
        "history": [
            {"date": "2025-12-23", "status": "In Progress", "progress": 35, "remarks": "Parallel play observed"}
        ]
    }
]

# Add timestamps
now = datetime.now(timezone.utc)
for p in detailed_progress:
    p["created_at"] = now
    p["updated_at"] = now

result = db.skill_progress.insert_many(detailed_progress)
print(f"Successfully seeded {len(result.inserted_ids)} detailed progress records.")
