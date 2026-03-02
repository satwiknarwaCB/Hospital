from database import db_manager
from datetime import datetime

def check_sessions():
    print("Checking sessions in database...")
    sessions = list(db_manager.sessions.find().sort("date", -1).limit(5))
    for s in sessions:
        print(f"ID: {s.get('_id')}")
        print(f"Date: {s.get('date')} (Type: {type(s.get('date'))})")
        print(f"Location: {s.get('location')}")
        print(f"Status: {s.get('status')}")
        print("-" * 20)

if __name__ == "__main__":
    check_sessions()
