from pymongo import MongoClient
from passlib.context import CryptContext

client = MongoClient("mongodb://localhost:27017")
db = client["therapy_portal"]
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

user = db["parents"].find_one({"email": "hardik@gmail.com"})
if user:
    print(f"User: {user['email']}")
    print(f"Hash: {user.get('hashed_password')}")
    print(f"Is Active: {user.get('is_active')}")
    
    # Test common passwords
    passwords = ["hardik@123", "Hardik@123", "Password@123", "hardik123", "Twinkles@123"]
    for p in passwords:
        res = pwd_context.verify(p, user.get('hashed_password'))
        print(f"Testing '{p}': {res}")
else:
    print("User hardik@gmail.com not found in parents")

user_doctor = db["doctors"].find_one({"email": "supriyareddyandra@gmail.com"})
if user_doctor:
    print(f"Doctor User: {user_doctor['email']}")
    print(f"Hash: {user_doctor.get('hashed_password')}")
    
    for p in passwords:
        res = pwd_context.verify(p, user_doctor.get('hashed_password'))
        print(f"Testing '{p}': {res}")
else:
    print("User supriyareddyandra@gmail.com not found in doctors")
