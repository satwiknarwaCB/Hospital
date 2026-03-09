import pymongo

def thorough_cleanup():
    client = pymongo.MongoClient("mongodb://localhost:27017")
    
    # List of databases to clean
    dbs_to_clean = ["therapy_portal", "hospital_db"]
    
    for db_name in dbs_to_clean:
        print(f"\n--- Cleaning Database: {db_name} ---")
        db = client[db_name]
        
        for coll_name in db.list_collection_names():
            if coll_name == "admins":
                print(f"Skipping 'admins' collection in {db_name}")
                continue
                
            count = db[coll_name].count_documents({})
            if count > 0:
                result = db[coll_name].delete_many({})
                print(f"Deleted {result.deleted_count} docs from {coll_name}")
            else:
                print(f"Collection {coll_name} is already empty")

if __name__ == "__main__":
    thorough_cleanup()
