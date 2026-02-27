import requests

# Test credentials
# Using Priya Patel (parent of c1)
EMAIL = "priya.patel@parent.com"
PASSWORD = "Parent@123"
BASE_URL = "http://127.0.0.1:8000"

def test_roadmap():
    # 1. Login
    print(f"Logging in as {EMAIL}...")
    resp = requests.post(f"{BASE_URL}/api/parent/login", json={"email": EMAIL, "password": PASSWORD})
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return
    
    data = resp.json()
    token = data["access_token"]
    child_id = data["parent"]["childId"]
    print(f"Logged in. childId: {child_id}")
    
    # 2. Get Roadmap
    print(f"Fetching roadmap for {child_id}...")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/api/roadmap/child/{child_id}", headers=headers)
    
    if resp.status_code == 200:
        roadmap = resp.json()
        print(f"Found {len(roadmap)} roadmap items.")
        for item in roadmap:
            print(f" - {item.get('title')} (childId: {item.get('childId')})")
    else:
        print(f"Failed to fetch roadmap: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    test_roadmap()
