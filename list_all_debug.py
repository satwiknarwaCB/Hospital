import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'server'))
from database import db_manager

def list_all():
    parents = list(db_manager.parents.find())
    print(f"Total parents: {len(parents)}")
    for p in parents:
        print(f"- {p['name']} ({p['email']}) [ID: {p['_id']}]")
        
    children = list(db_manager.children.find())
    print(f"\nTotal children: {len(children)}")
    for c in children:
        print(f"- {c['name']} [ID: {c['_id']}] [Parent: {c.get('parent_id')}]")

if __name__ == "__main__":
    list_all()
