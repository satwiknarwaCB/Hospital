import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_admin_flow():
    # 1. Login
    login_data = {
        "email": "anjali.sharma@neurobridge.com",
        "password": "Admin@123"
    }
    print(f"Logging in to {BASE_URL}/api/admin/login...")
    response = requests.post(f"{BASE_URL}/api/admin/login", json=login_data)
    
    if response.status_code != 200:
        print(f"Login failed: {response.status_code}")
        print(response.text)
        return

    data = response.json()
    token = data.get("access_token")
    print("Login successful!")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Therapist
    therapist_data = {
        "name": "Dr. Persistence Test",
        "email": f"test_{int(time.time())}@neurobridge.com",
        "password": "Therapist@123",
        "specialization": "Speech Therapy",
        "experience_years": 8,
        "phone": "1234567890"
    }
    
    print("\nCreating therapist...")
    response = requests.post(f"{BASE_URL}/api/admin/users/therapist", json=therapist_data, headers=headers)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_admin_flow()
