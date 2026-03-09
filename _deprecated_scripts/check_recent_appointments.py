from pymongo import MongoClient
import sys
import os

# Add server to path to import config
sys.path.append(os.path.join(os.getcwd(), "server"))
from config import settings

def check_appointments():
    client = MongoClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    appointments = list(db.appointments.find().sort("created_at", -1))
    print(f"Total appointments in DB: {len(appointments)}")
    for appt in appointments[:5]:
        print(appt)
    client.close()

if __name__ == "__main__":
    check_appointments()
