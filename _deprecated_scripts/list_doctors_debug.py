import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'server'))
from database import db_manager

def list_doctors():
    docs = list(db_manager.doctors.find())
    print(f"Total doctors: {len(docs)}")
    for d in docs:
        print(f"- {d['name']} ({d['email']}) [ID: {d['_id']}]")

if __name__ == "__main__":
    list_doctors()
