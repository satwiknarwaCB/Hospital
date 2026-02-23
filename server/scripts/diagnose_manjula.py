"""
Full diagnosis: check ALL records with 'manjula' in any collection
"""
import sys
sys.path.insert(0, '.')
from database import db_manager
from utils.auth import verify_password

db_manager.connect()

print("=== ALL 'manjula' records across ALL collections ===\n")

# Check parents - find ALL
print("--- PARENTS collection ---")
parents = list(db_manager.parents.find({"email": {"$regex": "manjula", "$options": "i"}}))
print(f"Found {len(parents)} records:")
for p in parents:
    print(f"  ID: {p['_id']}")
    print(f"  Name: {p['name']}")
    print(f"  Email: {p['email']}")
    print(f"  Active: {p.get('is_active')}")
    hash_val = p.get('hashed_password', '')
    print(f"  Hash: {hash_val[:40]}...")
    # Test common passwords
    for pwd in ['Parent@123', 'User@123', 'Therapist@123', 'manjula', 'Manjula@123']:
        try:
            ok = verify_password(pwd, hash_val)
            if ok:
                print(f"  >>> PASSWORD MATCH: '{pwd}' <<<")
        except:
            pass
    print()

# Check doctors
print("--- DOCTORS collection ---")
doctors = list(db_manager.doctors.find({"email": {"$regex": "manjula", "$options": "i"}}))
print(f"Found {len(doctors)} records:")
for d in doctors:
    print(f"  ID: {d['_id']}")
    print(f"  Name: {d['name']}")
    print(f"  Email: {d['email']}")
    print()

# Check by name too
print("--- PARENTS by name pattern ---")
parents_name = list(db_manager.parents.find({"name": {"$regex": "manjula", "$options": "i"}}))
print(f"Found {len(parents_name)} by name")
for p in parents_name:
    print(f"  ID: {p['_id']}, Email: {p['email']}")

print("\n--- DOCTORS by name pattern ---")
doctors_name = list(db_manager.doctors.find({"name": {"$regex": "manjula", "$options": "i"}}))
print(f"Found {len(doctors_name)} by name")
for d in doctors_name:
    print(f"  ID: {d['_id']}, Email: {d['email']}")

# Also check the exact email match that the login endpoint uses
import re
email = "manjula@gmail.com"
print(f"\n--- Exact login lookup for '{email}' ---")
exact = db_manager.parents.find_one({"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}})
if exact:
    print(f"  Found: {exact['name']} (ID: {exact['_id']})")
    ok = verify_password("Parent@123", exact["hashed_password"])
    print(f"  Parent@123 works: {ok}")
else:
    print("  NOT FOUND!")

# Check total parents for context
total_parents = db_manager.parents.count_documents({})
total_doctors = db_manager.doctors.count_documents({})
print(f"\n--- Totals ---")
print(f"Total parents: {total_parents}")
print(f"Total doctors: {total_doctors}")

db_manager.disconnect()
