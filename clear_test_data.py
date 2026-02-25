import sys
import os

# Add the server directory to the path so we can import models and database
sys.path.append(os.path.join(os.getcwd(), 'server'))

from database import db_manager
from pymongo import MongoClient
from config import settings

def clear_data():
    print("Starting database cleanup...")
    
    try:
        db = db_manager.get_database()
        
        # List of collections to clear completely
        collections_to_clear = [
            "parents",
            "patients",        # This is where children/kids are stored
            "doctors",         # This is where therapists/doctors are stored
            "sessions",
            "appointments",
            "communities",
            "community_messages",
            "direct_messages",
            "skill_goals",
            "skill_progress",
            "periodic_reviews"
        ]
        
        for collection_name in collections_to_clear:
            count = db[collection_name].count_documents({})
            if count > 0:
                result = db[collection_name].delete_many({})
                print(f"Cleared {result.deleted_count} documents from '{collection_name}' collection.")
            else:
                print(f"Collection '{collection_name}' is already empty.")
                
        # Double check admins
        admin_count = db["admins"].count_documents({})
        print(f"Admin accounts preserved: {admin_count}")
        
        print("\nData cleanup complete! You can now start fresh testing.")
        
    except Exception as e:
        print(f"Error during cleanup: {e}")

if __name__ == "__main__":
    clear_data()
