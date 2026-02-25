import sys
sys.path.insert(0, '.')
from database import db_manager

db_manager.connect()

m = db_manager.parents.find_one({"email": {"$regex": "manjula", "$options": "i"}})
print("=== Parent Record ===")
print(f"Name: {m['name']}")
print(f"Email: {m['email']}")
print(f"Active: {m.get('is_active', True)}")
print(f"Has password: {bool(m.get('hashed_password'))}")
print(f"ID: {m['_id']}")

d = db_manager.doctors.find_one({"email": {"$regex": "manjula", "$options": "i"}})
print(f"In doctors collection: {bool(d)}")

db_manager.disconnect()
