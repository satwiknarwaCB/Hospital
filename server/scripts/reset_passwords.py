from pymongo import MongoClient
from passlib.context import CryptContext

client = MongoClient("mongodb://localhost:27017")
db = client["therapy_portal"]
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def reset_password(collection, email, new_password):
    hashed = pwd_context.hash(new_password)
    res = db[collection].update_one({"email": email}, {"$set": {"hashed_password": hashed, "is_active": True}})
    if res.modified_count > 0:
        print(f"Successfully reset password for {email} in {collection} to '{new_password}'")
    elif res.matched_count > 0:
        print(f"Password for {email} in {collection} was already set to this hash (or update failed)")
    else:
        print(f"User {email} not found in {collection}")

# Reset the specific users the user mentioned or used in logs
reset_password("parents", "hardik@gmail.com", "Password@123")
reset_password("doctors", "supriyareddyandra@gmail.com", "Password@123")
reset_password("admins", "anjali.sharma@twinkles.com", "Admin@123")
reset_password("doctors", "hardik@gmail.com", "Password@123") # Just in case he's a doctor
