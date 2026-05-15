from pymongo import MongoClient
from passlib.context import CryptContext

client = MongoClient("mongodb://localhost:27017")
db = client["therapy_portal"]
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

user = db["admins"].find_one({"email": "anjali.sharma@twinkles.com"})
if user:
    print(f"Admin User: {user['email']}")
    print(f"Hash: {user.get('hashed_password')}")
    res = pwd_context.verify("Admin@123", user.get('hashed_password'))
    print(f"Testing 'Admin@123': {res}")
else:
    print("Admin anjali.sharma@twinkles.com not found")
