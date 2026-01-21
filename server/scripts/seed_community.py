"""
Seed Default Parent Community
Creates the default parent support community in the database
"""
import sys
import os
from datetime import datetime, timezone

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db_manager
from bson import ObjectId


def seed_community():
    """Create default parent support community"""
    try:
        # Connect to database
        db_manager.connect()
        print("[INFO] Connected to database")
        
        # Check if community already exists
        existing = db_manager.communities.find_one({"name": "Parent Support Community"})
        
        if existing:
            print("[INFO] Parent Support Community already exists")
            print(f"[INFO] Community ID: {existing['_id']}")
            print(f"[INFO] Members: {len(existing.get('member_ids', []))}")
            return
        
        # Create default community
        community_id = str(ObjectId())
        community = {
            "_id": community_id,
            "name": "Parent Support Community",
            "description": "A safe space for parents to connect, share experiences, and support each other on their journey. Here you can ask questions, share successes, and find encouragement from other parents who understand what you're going through.",
            "created_by": "system",
            "member_ids": [],
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        db_manager.communities.insert_one(community)
        print("[SUCCESS] Created Parent Support Community")
        print(f"[INFO] Community ID: {community_id}")
        
        # Add welcome message
        welcome_message_id = str(ObjectId())
        welcome_message = {
            "_id": welcome_message_id,
            "community_id": community_id,
            "sender_id": "system",
            "sender_name": "NeuroBridge Team",
            "sender_role": "system",
            "content": "Welcome to the Parent Support Community! 🎉\n\nThis is a safe and supportive space where you can:\n• Connect with other parents\n• Share your experiences and insights\n• Ask questions and get support\n• Celebrate successes together\n\nRemember to be kind, respectful, and supportive of one another. We're all on this journey together!",
            "attachments": [],
            "timestamp": datetime.now(timezone.utc),
            "is_deleted": False
        }
        
        db_manager.community_messages.insert_one(welcome_message)
        print("[SUCCESS] Added welcome message")
        
        print("\n[COMPLETE] Community setup complete!")
        print("[INFO] Parents will be automatically added to this community when they log in")
        
    except Exception as e:
        print(f"[ERROR] Failed to seed community: {str(e)}")
        raise
    finally:
        db_manager.disconnect()
        print("[INFO] Database connection closed")


if __name__ == "__main__":
    print("=" * 60)
    print("Parent Community Seeding Script")
    print("=" * 60)
    seed_community()
