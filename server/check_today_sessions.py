from server.database import db_manager
from datetime import datetime

def check_all_sessions():
    db_manager.connect()
    
    sessions = list(db_manager.sessions.find({}))
    
    print(f"Total sessions in database: {len(sessions)}")
    for s in sessions:
        child_id = s.get('childId')
        # Try finding in 'patients' collection using both '_id' and 'id'
        child = db_manager.get_database()["patients"].find_one({"_id": child_id})
        if not child:
            child = db_manager.get_database()["patients"].find_one({"id": child_id})
            
        child_name = child.get('name') if child else "Unknown"
        print(f"- {s.get('status')} | {s.get('date')} | Child: {child_name} ({child_id})")

if __name__ == "__main__":
    check_all_sessions()
