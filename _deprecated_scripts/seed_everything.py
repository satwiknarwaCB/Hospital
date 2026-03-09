import pymongo
from datetime import datetime, timezone, timedelta
from bson import ObjectId

def seed_everything():
    client = pymongo.MongoClient('mongodb://localhost:27017')
    db = client['therapy_portal']
    
    # Clear existing messages and sessions to avoid duplicates
    db['direct_messages'].delete_many({})
    db['sessions'].delete_many({})
    db['community_messages'].delete_many({})
    
    parents = list(db['parents'].find())
    doctors = list(db['doctors'].find())
    
    if not doctors:
        print("No doctors found. Please run restore_test_users.py first.")
        return

    therapist = next((d for d in doctors if d['email'] == 'dr.rajesh@neurobridge.com'), doctors[0])
    therapist_id = str(therapist['_id'])
    
    community = db['communities'].find_one({"name": "Parent Support Community"})
    if not community:
        community_id = str(ObjectId())
        db['communities'].insert_one({
            "_id": community_id,
            "name": "Parent Support Community",
            "description": "A safe space for parents to connect, share experiences, and support each other.",
            "created_by": "system",
            "member_ids": [str(p['_id']) for p in parents],
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
    else:
        community_id = str(community['_id'])
        db['communities'].update_one(
            {"_id": community["_id"]},
            {"$set": {"member_ids": [str(p['_id']) for p in parents]}}
        )

    # 1. Seed Community Message
    db['community_messages'].insert_one({
        "community_id": community_id,
        "sender_id": therapist_id,
        "sender_name": therapist.get('name', 'Dr. Rajesh'),
        "sender_role": "therapist",
        "content": "Welcome everyone! I'm your lead therapist. Feel free to ask general questions here. For private matters, please use direct messages. 😊",
        "timestamp": datetime.now(timezone.utc) - timedelta(days=2),
        "reactions": {}
    })

    # 2. Seed for each parent
    for parent in parents:
        p_id = str(parent['_id'])
        p_name = parent.get('name', 'Parent')
        child_id = parent.get('child_id') or (parent.get('children_ids')[0] if parent.get('children_ids') else "c1")
        
        # Direct Messages
        dms = [
            {
                "sender_id": therapist_id,
                "sender_name": therapist.get('name'),
                "sender_role": "therapist",
                "recipient_id": p_id,
                "recipient_name": p_name,
                "recipient_role": "parent",
                "child_id": child_id,
                "thread_id": child_id,
                "content": f"Hello {p_name}, I've uploaded the progress report for this week. Let me know if you have any questions.",
                "timestamp": datetime.now(timezone.utc) - timedelta(days=1),
                "read": True,
                "is_deleted": False,
                "deleted_for": [],
                "reactions": {}
            },
            {
                "sender_id": p_id,
                "sender_name": p_name,
                "sender_role": "parent",
                "recipient_id": therapist_id,
                "recipient_name": therapist.get('name'),
                "recipient_role": "therapist",
                "child_id": child_id,
                "thread_id": child_id,
                "content": "Thank you! We will review it tonight.",
                "timestamp": datetime.now(timezone.utc) - timedelta(hours=12),
                "read": False,
                "is_deleted": False,
                "deleted_for": [],
                "reactions": {"🙏": [therapist_id]}
            }
        ]
        db['direct_messages'].insert_many(dms)
        
        # Sessions (Appointments)
        sessions = [
            {
                "childId": child_id,
                "therapistId": therapist_id,
                "date": (datetime.now(timezone.utc) + timedelta(days=1, hours=2)).isoformat(),
                "type": "Speech Therapy",
                "status": "scheduled",
                "duration": 45,
                "location": "Main Clinic, Room 4",
                "notes": "Focus on articulation and vowel sounds.",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "childId": child_id,
                "therapistId": therapist_id,
                "date": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
                "type": "Initial Assessment",
                "status": "completed",
                "duration": 60,
                "location": "Virtual Session",
                "notes": "Assessment completed successfully.",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        db['sessions'].insert_many(sessions)
        print(f"Seeded data for parent: {parent['email']}")

    client.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_everything()
