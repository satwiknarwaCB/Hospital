import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_login(role, email, password, url):
    print(f"🔄 Testing {role} Login for {email}...")
    try:
        response = requests.post(url, json={"email": email, "password": password})
        
        if response.status_code == 200:
            print(f"✅ {role} Login SUCCESS!")
            print(f"✅ {role} Login SUCCESS!")
            print(f"Response Body: {response.json()}")
            return True
            return True
        else:
            print(f"❌ {role} Login FAILED with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

def verify_api():
    # Test Parent
    parent_url = f"{BASE_URL}/api/parent/login"
    test_login("Parent", "priya.patel@parent.com", "Parent@123", parent_url)

    # Test Admin
    admin_url = f"{BASE_URL}/api/admin/login"
    test_login("Admin", "anjali.sharma@neurobridge.com", "Admin@123", admin_url)

if __name__ == "__main__":
    verify_api()
