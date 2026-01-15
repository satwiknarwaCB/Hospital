from pymongo import MongoClient
from config import settings

def clean_db():
    client = MongoClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    db.parents.drop()
    db.doctors.drop()
    print("🧹 Dropped 'parents' and 'doctors' collections.")
    client.close()

if __name__ == "__main__":
    clean_db()
