import requests
import json

print("Testing Parent Authentication API with Role Check...\n")

try:
    login_data = [
        {"email": "priya.patel@parent.com", "password": "Parent@123", "role": "parent"},
        {"email": "dr.rajesh@therapist.com", "password": "Therapist@123", "role": "doctor"}
    ]
    
    for creds in login_data:
        print(f"Testing login for {creds['email']}...")
        endpoint = f"http://localhost:8000/api/{creds['role']}/login"
        response = requests.post(endpoint, json=creds)
        
        if response.status_code == 200:
            data = response.json()
            user_key = 'parent' if creds['role'] == 'parent' else 'doctor'
            print(f"✅ Login successful!")
            print(f"   Name: {data[user_key]['name']}")
            print(f"   Role: {data[user_key].get('role')}")
        else:
            print(f"❌ Login failed for {creds['email']}! Status: {response.status_code}")
            print(f"Response: {response.text}")
        print("-" * 20)
except Exception as e:
    print(f"Error: {e}")
