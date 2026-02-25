import pymongo
from datetime import datetime, timezone, timedelta

def seed_messages():
    client = pymongo.MongoClient('mongodb://localhost:27017')
    db = client['therapy_portal']
    
    parent_id = "699da6a862c82232d95bd8b5"
    therapist_id = "dr_rajesh_001"
    child_id = "c3"
    
    # 1. Ensure Vamshi is in the community
    community = db['communities'].find_one({"name": "Parent Support Community"})
    if community:
        if parent_id not in community['member_ids']:
            db['communities'].update_one(
                {"_id": community["_id"]},
                {"$addToSet": {"member_ids": parent_id}}
            )
            print(f"Added Parent {parent_id} to community")

    # 2. Add some community messages from the therapist
    msg1 = {
        "community_id": str(community["_id"]) if community else "default",
        "sender_id": therapist_id,
        "sender_name": "Dr. Rajesh Kumar",
        "sender_role": "therapist",
        "content": "Hello everyone! I'll be sharing some tips on speech therapy exercises you can do at home this week. stay tuned! 📢",
        "timestamp": datetime.now(timezone.utc) - timedelta(hours=2),
        "reactions": {"👍": [parent_id]}
    }
    db['community_messages'].insert_one(msg1)
    print("Added community message")

    # 3. Add direct messages
    dm_thread = [
        {
            "sender_id": therapist_id,
            "sender_name": "Dr. Rajesh Kumar",
            "sender_role": "therapist",
            "recipient_id": parent_id,
            "recipient_name": "Vamshi Krishna",
            "recipient_role": "parent",
            "child_id": child_id,
            "thread_id": child_id,
            "content": "Hi Vamshi, how is Arjun doing with his breathing exercises?",
            "timestamp": datetime.now(timezone.utc) - timedelta(days=1),
            "read": True,
            "is_deleted": False,
            "deleted_for": [],
            "reactions": {}
        },
        {
            "sender_id": parent_id,
            "sender_name": "Vamshi Krishna",
            "sender_role": "parent",
            "recipient_id": therapist_id,
            "recipient_name": "Dr. Rajesh Kumar",
            "recipient_role": "therapist",
            "child_id": child_id,
            "thread_id": child_id,
            "content": "He is doing well, but sometimes gets frustrated. Any advice?",
            "timestamp": datetime.now(timezone.utc) - timedelta(hours=5),
            "read": False,
            "is_deleted": False,
            "deleted_for": [],
            "reactions": {}
        },
        {
            "sender_id": therapist_id,
            "sender_name": "Dr. Rajesh Kumar",
            "sender_role": "therapist",
            "recipient_id": parent_id,
            "recipient_name": "Vamshi Krishna",
            "recipient_role": "parent",
            "child_id": child_id,
            "thread_id": child_id,
            "content": "Try to make it a game or use a sticker chart! I can show you some examples in our next session.",
            "timestamp": datetime.now(timezone.utc) - timedelta(minutes=30),
            "read": False,
            "is_deleted": False,
            "deleted_for": [],
            "reactions": {}
        }
    ]
    
    db['direct_messages'].insert_many(dm_thread)
    print("Added 3 direct messages")
    
    client.close()

if __name__ == "__main__":
    seed_messages()
