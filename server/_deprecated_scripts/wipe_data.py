import sys
import os

# Setup path to import database manager
sys.path.append(os.path.join(os.getcwd(), 'server'))

from database import db_manager

def cleanup_data():
    print("Starting permanent deletion of parent and child related data...")
    db_manager.connect()
    db = db_manager.get_database()

    # List of collections to clear completely (related to parents and children)
    collections_to_clear = [
        "parents",           # Parent login credentials and profiles
        "patients",          # Children data
        "sessions",          # Therapy sessions
        "appointments",      # Booked appointments
        "direct_messages",   # Private chats (usually parent-therapist)
        "skill_goals",       # Progress goals
        "skill_progress",    # Achievement tracking
        "periodic_reviews",  # Clinical reviews
        "community_messages" # Public chat messages
    ]

    for collection_name in collections_to_clear:
        try:
            result = db[collection_name].delete_many({})
            print(f"Cleared collection '{collection_name}': {result.deleted_count} documents removed.")
        except Exception as e:
            print(f"Error clearing collection '{collection_name}': {str(e)}")

    # Specific cleanup for communities (remove parent IDs from member lists)
    try:
        # We don't delete communities, but we clear members since they were parents
        result = db.communities.update_many({}, {"$set": {"member_ids": []}})
        print(f"Cleared member lists in communities: {result.modified_count} updated.")
    except Exception as e:
        print(f"Error updating communities: {str(e)}")

    print("\nDeletion Complete. All parent credentials and child data have been permanently removed.")
    db_manager.disconnect()

if __name__ == "__main__":
    confirm = input("Are you absolutely sure you want to PERMANENTLY delete all parent and child data? (yes/no): ")
    if confirm.lower() == 'yes':
        cleanup_data()
    else:
        print("Operation cancelled.")
