"""
Database seeding script for creating sample parent accounts
Run this script to populate the database with Priya Patel and Arun Sharma
"""
import sys
from pathlib import Path

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import db_manager
from utils.auth import hash_password
from datetime import datetime


def create_sample_parents():
    """Create sample parent accounts in database"""
    
    # Connect to database
    db_manager.connect()
    
    # Parent data for Priya Patel and Arun Sharma
    parents_data = [
        {
            "_id": "p1",  # Match mockData.js ID
            "name": "Priya Patel",
            "email": "priya.patel@parent.com",
            "hashed_password": hash_password("Parent@123"),
            "phone": "+91-9876543211",
            "children_ids": ["c1"],  # Match mockData.js child ID
            "child_id": "c1",
            "relationship": "Mother",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        },
        {
            "_id": "p2",  # Match mockData.js ID
            "name": "Arun Sharma",
            "email": "arun.sharma@parent.com",
            "hashed_password": hash_password("Parent@123"),
            "phone": "+91-9876543212",
            "children_ids": ["c2"],  # Match mockData.js child ID
            "child_id": "c2",
            "relationship": "Father",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
    ]
    
    created_count = 0
    updated_count = 0
    
    for parent_data in parents_data:
        # Check if parent already exists
        existing_parent = db_manager.parents.find_one({"email": parent_data["email"]})
        
        if existing_parent:
            print(f"⚠️  Parent already exists: {parent_data['email']}")
            print(f"   ID: {existing_parent['_id']}")
            
            # Ask if user wants to update
            response = input("   Do you want to update this parent? (y/n): ")
            if response.lower() == 'y':
                db_manager.parents.update_one(
                    {"_id": existing_parent["_id"]},
                    {"$set": parent_data}
                )
                print(f"✅ Parent updated successfully!")
                updated_count += 1
            else:
                print(f"   Skipped updating parent.")
        else:
            # Insert new parent
            result = db_manager.parents.insert_one(parent_data)
            print(f"✅ Parent created successfully!")
            print(f"   ID: {result.inserted_id}")
            created_count += 1
        
        print(f"\n📋 Parent Details:")
        print(f"   Name: {parent_data['name']}")
        print(f"   Email: {parent_data['email']}")
        print(f"   Password: Parent@123")
        print(f"   Relationship: {parent_data['relationship']}")
        print(f"   Phone: {parent_data['phone']}")
        print(f"   Children IDs: {', '.join(parent_data['children_ids'])}")
        print()
    
    # Summary
    print(f"\n{'='*60}")
    print(f"📊 Summary:")
    print(f"   Parents created: {created_count}")
    print(f"   Parents updated: {updated_count}")
    print(f"   Total parents: {created_count + updated_count}")
    print(f"{'='*60}")
    
    # Close connection
    db_manager.disconnect()


if __name__ == "__main__":
    print("🌱 Seeding database with sample parents...\n")
    try:
        create_sample_parents()
        print("\n✅ Database seeding completed!")
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        sys.exit(1)
