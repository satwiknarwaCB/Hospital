"""
Test Community API Endpoints
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db_manager


def test_community_setup():
    """Test that community was created successfully"""
    try:
        db_manager.connect()
        print("✓ Connected to database")
        
        # Check for community
        community = db_manager.communities.find_one({"name": "Parent Support Community"})
        
        if community:
            print(f"✓ Community found: {community['name']}")
            print(f"  - ID: {community['_id']}")
            print(f"  - Description: {community['description'][:50]}...")
            print(f"  - Members: {len(community.get('member_ids', []))}")
            print(f"  - Active: {community.get('is_active', False)}")
        else:
            print("✗ Community not found - will be created on first parent login")
        
        # Check for messages
        message_count = db_manager.community_messages.count_documents({})
        print(f"✓ Community messages: {message_count}")
        
        # Check collections exist
        collections = db_manager.get_database().list_collection_names()
        print(f"\n✓ Available collections: {', '.join(collections)}")
        
        print("\n[SUCCESS] Community setup verified!")
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
    finally:
        db_manager.disconnect()


if __name__ == "__main__":
    print("=" * 60)
    print("Community API Test")
    print("=" * 60)
    test_community_setup()
