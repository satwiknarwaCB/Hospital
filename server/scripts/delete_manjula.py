"""
Permanently delete ALL Manjula-related data from every collection in the database.
Searches by email, name, and user ID across all collections.
"""
import sys
sys.path.insert(0, '.')
from database import db_manager

db_manager.connect()
db = db_manager.get_database()

email = "manjula@gmail.com"
name_pattern = "manjula"
# Known IDs from previous records
known_ids = [
    "4bff4fd5-ca9a-4a8e-95e8-27df229b017b",  # parent record ID
    "18d95a65-222f-4235-8058-58c59e9a1adc",  # old doctor record ID
]

print("=" * 60)
print("PERMANENTLY DELETING ALL MANJULA-RELATED DATA")
print("=" * 60)

# Get all collection names in the database
all_collections = db.list_collection_names()
print(f"\nDatabase collections: {all_collections}\n")

total_deleted = 0

for col_name in all_collections:
    collection = db[col_name]
    deleted_in_col = 0

    # Search by email
    r = collection.delete_many({"email": {"$regex": f"^{email}$", "$options": "i"}})
    deleted_in_col += r.deleted_count

    # Search by name (exact field)
    r = collection.delete_many({"name": {"$regex": f"^{name_pattern}$", "$options": "i"}})
    deleted_in_col += r.deleted_count

    # Search by sender_name or sender_email (messages)
    r = collection.delete_many({"sender_email": {"$regex": f"^{email}$", "$options": "i"}})
    deleted_in_col += r.deleted_count
    r = collection.delete_many({"sender_name": {"$regex": f"^{name_pattern}$", "$options": "i"}})
    deleted_in_col += r.deleted_count

    # Search by known IDs in various fields
    for uid in known_ids:
        # Direct _id match
        r = collection.delete_many({"_id": uid})
        deleted_in_col += r.deleted_count

        # sender_id, parent_id, doctor_id, user_id
        for field in ["sender_id", "parent_id", "doctor_id", "user_id", "from_id", "to_id"]:
            r = collection.delete_many({field: uid})
            deleted_in_col += r.deleted_count

        # Also remove from messages where participant matches
        r = collection.delete_many({"participants": uid})
        deleted_in_col += r.deleted_count

    # Remove references inside arrays (e.g. community members, reactions)
    for uid in known_ids:
        # Remove from community members arrays
        collection.update_many(
            {"members": uid},
            {"$pull": {"members": uid}}
        )
        # Remove from participants arrays
        collection.update_many(
            {"participants": uid},
            {"$pull": {"participants": uid}}
        )
        # Remove from children_ids arrays (if a parent was linked)
        collection.update_many(
            {"children_ids": uid},
            {"$pull": {"children_ids": uid}}
        )
        # Remove reactions by this user
        collection.update_many(
            {"reactions.user_id": uid},
            {"$pull": {"reactions": {"user_id": uid}}}
        )

    if deleted_in_col > 0:
        print(f"  [{col_name}] Deleted {deleted_in_col} record(s)")
    else:
        print(f"  [{col_name}] No records found")

    total_deleted += deleted_in_col

# Final verification across all collections
print(f"\n{'=' * 60}")
print(f"VERIFICATION: Searching for any remaining Manjula data...")
remaining = 0
for col_name in all_collections:
    collection = db[col_name]
    # Check by email
    count = collection.count_documents({"email": {"$regex": "manjula", "$options": "i"}})
    if count > 0:
        print(f"  [WARNING] {col_name}: {count} records still have email match")
        remaining += count
    # Check by known IDs
    for uid in known_ids:
        count = collection.count_documents({"_id": uid})
        if count > 0:
            print(f"  [WARNING] {col_name}: {count} records still have ID {uid}")
            remaining += count
        for field in ["sender_id", "parent_id", "doctor_id", "user_id", "from_id", "to_id"]:
            count = collection.count_documents({field: uid})
            if count > 0:
                print(f"  [WARNING] {col_name}.{field}: {count} records reference {uid}")
                remaining += count

if remaining == 0:
    print("  [OK] No remaining Manjula data found in any collection!")
else:
    print(f"  [WARNING] {remaining} references remain")

print(f"\n{'=' * 60}")
print(f"Total records deleted: {total_deleted}")
print(f"All Manjula-related data has been permanently removed.")
print(f"{'=' * 60}")

db_manager.disconnect()
