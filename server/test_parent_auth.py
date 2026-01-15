"""
Test script to verify parent authentication API
"""
import requests
import json

API_URL = "http://localhost:8000"

def test_parent_login():
    """Test parent login endpoint"""
    print("Testing Parent Login API...")
    print("=" * 60)
    
    # Test credentials
    credentials = {
        "email": "priya.patel@parent.com",
        "password": "Parent@123"
    }
    
    try:
        # Make login request
        response = requests.post(
            f"{API_URL}/api/parent/login",
            json=credentials,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Login Successful!")
            print(f"\nAccess Token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"Token Type: {data.get('token_type', 'N/A')}")
            print(f"\nParent Data:")
            parent = data.get('parent', {})
            print(f"  - ID: {parent.get('id')}")
            print(f"  - Name: {parent.get('name')}")
            print(f"  - Email: {parent.get('email')}")
            print(f"  - Relationship: {parent.get('relationship')}")
            print(f"  - Children IDs: {parent.get('children_ids')}")
        else:
            print(f"\n❌ Login Failed!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to backend server")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    print("\n" + "=" * 60)

def test_arun_login():
    """Test Arun Sharma login"""
    print("\nTesting Arun Sharma Login...")
    print("=" * 60)
    
    credentials = {
        "email": "arun.sharma@parent.com",
        "password": "Parent@123"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/api/parent/login",
            json=credentials,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Arun Sharma Login Successful!")
            parent = data.get('parent', {})
            print(f"  - Name: {parent.get('name')}")
            print(f"  - Email: {parent.get('email')}")
        else:
            print(f"❌ Login Failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("=" * 60)

if __name__ == "__main__":
    test_parent_login()
    test_arun_login()
