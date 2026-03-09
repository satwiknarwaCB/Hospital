
import requests
import json

def test_sessions():
    base_url = "http://127.0.0.1:8000/api"
    
    # Login as parent
    login_url = f"{base_url}/parent/login"
    login_data = {
        "email": "priya.patel@parent.com",
        "password": "Parent@123"
    }
    
    print(f"Logging in as {login_data['email']}...")
    response = requests.post(login_url, json=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    
    auth_data = response.json()
    token = auth_data["access_token"]
    child_id = auth_data["parent"]["childId"]
    print(f"Login successful. Child ID: {child_id}")
    
    # Fetch sessions
    sessions_url = f"{base_url}/sessions/child/{child_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"Fetching sessions from {sessions_url}...")
    response = requests.get(sessions_url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch sessions: {response.text}")
        return
    
    sessions = response.json()
    print(f"Found {len(sessions)} sessions.")
    for s in sessions:
        print(f"- {s['date']} | {s['type']} | {s['status']}")

if __name__ == "__main__":
    test_sessions()
