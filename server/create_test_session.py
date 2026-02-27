from database import db_manager
from datetime import datetime, timezone

def create_test_session():
    print("Creating test session for today in Sensory Room...")
    test_session = {
        "childId": "test_child",
        "therapistId": "t1",
        "date": datetime.now(timezone.utc),
        "type": "Speech Therapy",
        "duration": 60,
        "status": "completed",
        "location": "Sensory Room",
        "activities": ["Test Activity"],
        "engagement": 80
    }
    result = db_manager.sessions.insert_one(test_session)
    print(f"Test session created with ID: {result.inserted_id}")

if __name__ == "__main__":
    create_test_session()
