import pymongo

def list_all_dbs_and_collections():
    client = pymongo.MongoClient("mongodb://localhost:27017")
    print("Listing all databases and collections on localhost:27017:")
    for db_name in client.list_database_names():
        print(f"\nDatabase: {db_name}")
        db = client[db_name]
        for coll_name in db.list_collection_names():
            count = db[coll_name].count_documents({})
            print(f"  - {coll_name}: {count} docs")

if __name__ == "__main__":
    list_all_dbs_and_collections()
