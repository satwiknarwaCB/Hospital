import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'server'))
from database import db_manager

def list_all():
    db = db_manager.get_database()
    print("Full collection list in database:")
    for name in db.list_collection_names():
        count = db[name].count_documents({})
        print(f"- {name}: {count} docs")

if __name__ == "__main__":
    list_all()
