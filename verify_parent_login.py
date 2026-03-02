"""
Verify parent login works with fixed passwords
Run from the Hospital root directory: python verify_parent_login.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))

from database import db_manager
from utils.auth import verify_password

def verify_logins():
    db_manager.connect()

    test_cases = [
        {"email": "virat18@gmail.com",  "password": "Parent@123"},
        {"email": "rohith45@gmail.com", "password": "Parent@123"},
    ]

    print("\n=== Verifying Parent Login Credentials ===\n")

    for tc in test_cases:
        parent = db_manager.parents.find_one({"email": tc["email"]})
        if not parent:
            print(f"[FAIL] Parent not found: {tc['email']}")
            continue

        hashed = parent.get("hashed_password", "")
        is_active = parent.get("is_active", True)

        if not hashed:
            print(f"[FAIL] No hashed_password stored for: {tc['email']}")
            continue

        if verify_password(tc["password"], hashed):
            status = "ACTIVE" if is_active else "INACTIVE"
            print(f"[PASS] Login OK for {tc['email']} | Status: {status}")
        else:
            print(f"[FAIL] Password mismatch for: {tc['email']}")

    print("\n=== Verification Complete ===")
    db_manager.disconnect()

if __name__ == "__main__":
    verify_logins()
