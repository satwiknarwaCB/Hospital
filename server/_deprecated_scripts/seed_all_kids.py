import pymongo
from datetime import datetime, timezone

# Connection details
MONGODB_URL = "mongodb://localhost:27017/"
DATABASE_NAME = "therapy_portal"

def seed_standardized_progress():
    client = pymongo.MongoClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db["skill_progress"]

    child_ids = ["c1", "c2", "c4", "c5"] # Aarav, Diya, Ananya, Arjun
    now = datetime.now(timezone.utc)
    
    # Clear existing progress for THESE children to remove "Two-word Phrases", "sam", "alam" etc.
    print("🧹 Cleaning up existing progress records for standardized children...")
    collection.delete_many({"childId": {"$in": child_ids}})

    # Standard Skills Data provided by User
    skills_data = [
        {
            "skillId": "sp_spoon_hold",
            "skillName": "Holding a Spoon",
            "category": "Adaptive / OT",
            "icon": "spoon",
            "progress": 65,
            "status": "In Progress",
            "therapistNotes": "Aarav is showing better grip stability. Still needs slight physical prompting for 3-finger grip.",
            "lastUpdated": "2025-12-23"
        },
        {
            "skillId": "sp_spoon_eat",
            "skillName": "Eating with a Spoon",
            "category": "Adaptive / OT",
            "icon": "utensils",
            "progress": 40,
            "status": "In Progress",
            "therapistNotes": "Coordination between scooping and bringing to mouth is improving.",
            "lastUpdated": "2025-12-23"
        },
        {
            "skillId": "sp_glass_drink",
            "skillName": "Drinking Water from a Glass",
            "category": "Adaptive / OT",
            "icon": "cup",
            "progress": 75,
            "status": "In Progress",
            "therapistNotes": "Controls the tilt well. Occasionally bites the rim.",
            "lastUpdated": "2025-12-22"
        },
        {
            "skillId": "sp_buttoning",
            "skillName": "Buttoning Clothes",
            "category": "Adaptive / OT",
            "icon": "shirt",
            "progress": 15,
            "status": "Not Started",
            "therapistNotes": "Fine motor strength is building up. Will focus on larger buttons first next week.",
            "lastUpdated": "2025-12-21"
        },
        {
            "skillId": "sp_eye_contact",
            "skillName": "Maintaining Eye Contact",
            "category": "Social / Behavioral",
            "icon": "eye",
            "progress": 90,
            "status": "Achieved",
            "therapistNotes": "Consistency in eye contact during greetings is excellent.",
            "lastUpdated": "2025-12-23"
        },
        {
            "skillId": "sp_onestep",
            "skillName": "Following One-step Instructions",
            "category": "Cognitive / Speech",
            "icon": "list",
            "progress": 100,
            "status": "Achieved",
            "therapistNotes": "Follows \"Sit down\", \"Give me\", \"Look\" commands perfectly.",
            "lastUpdated": "2025-12-22"
        },
        {
            "skillId": "sp_twostep",
            "skillName": "Following Two-step Instructions",
            "category": "Cognitive / Speech",
            "icon": "list",
            "progress": 55,
            "status": "In Progress",
            "therapistNotes": "Working on processing the second part of the instruction. Visual cues help.",
            "lastUpdated": "2025-12-23"
        },
        {
            "skillId": "sp_imitation",
            "skillName": "Sound / Word Imitation",
            "category": "Communication / Speech",
            "icon": "mic",
            "progress": 80,
            "status": "In Progress",
            "therapistNotes": "Imitating \"B\", \"P\", \"M\" sounds consistently. Moving to 2-word phrases.",
            "lastUpdated": "2025-12-23"
        },
        {
            "skillId": "sp_sitting",
            "skillName": "Sitting Tolerance",
            "category": "Behavioral",
            "icon": "clock",
            "progress": 60,
            "status": "In Progress",
            "therapistNotes": "Currently sitting for 12-15 minutes. Goal is 25 minutes of table time.",
            "lastUpdated": "2025-12-23"
        },
        {
            "skillId": "sp_social",
            "skillName": "Social Interaction",
            "category": "Social / Behavioral",
            "icon": "users",
            "progress": 35,
            "status": "In Progress",
            "therapistNotes": "Starting parallel play. Needs encouragement for turn-taking.",
            "lastUpdated": "2025-12-23"
        }
    ]

    for child_id in child_ids:
        print(f"🚀 Seeding for child: {child_id}")
        for idx, skill in enumerate(skills_data):
            # Sort order by index if needed
            skill_record = {
                "childId": child_id,
                **skill,
                "weeklyActuals": [0, 0, 0, 0],
                "history": [
                    {
                        "date": skill["lastUpdated"],
                        "progress": skill["progress"],
                        "status": skill["status"],
                        "remarks": "Record initialized"
                    }
                ],
                "created_at": now,
                "updated_at": now,
                "order": idx # Keep user order
            }
            collection.insert_one(skill_record)
            print(f"  ✅ Added: {skill['skillName']}")

    print(f"\n✨ Successfully seeded {len(skills_data)} standardized skills for {len(child_ids)} children.")

if __name__ == "__main__":
    seed_standardized_progress()
