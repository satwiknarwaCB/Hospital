from pymongo import MongoClient
from config import settings
import json
from bson import json_util

def dump_db():
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    client = MongoClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print(f"Database: {settings.DATABASE_NAME}")
    print("-" * 30)
    
    collections = db.list_collection_names()
    for coll_name in collections:
        count = db[coll_name].count_documents({})
        print(f"Collection: {coll_name:15} | Documents: {count}")
        
        if coll_name == 'parents':
            print("  Data in 'parents' collection:")
            parents = list(db[coll_name].find({}))
            for p in parents:
                # Remove hashed password for security but keep name/email
                if 'hashed_password' in p:
                    p['hashed_password'] = '[HASHED]'
                print(f"    - {json.dumps(p, indent=6, default=json_util.default)}")

if __name__ == "__main__":
    try:
        dump_db()
    except Exception as e:
        print(f"Error dumping database: {e}")
