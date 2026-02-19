import urllib.request
import urllib.error
import json

def test_login(email, password, role):
    url = f"http://127.0.0.1:8000/api/{role}/login"
    data = json.dumps({"email": email, "password": password}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    print(f"Testing {role} login for {email}...")
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Status Code: {status}")
            print(f"Response: {body}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(f"Response: {e.read().decode('utf-8')}")
    except urllib.error.URLError as e:
        print(f"URL Error: {e.reason}")

if __name__ == "__main__":
    # Test Admin
    test_login("anjali.sharma@neurobridge.com", "Admin@123", "admin")
    # Test Parent
    test_login("priya.patel@parent.com", "Parent@123", "parent")
    # Test Doctor
    test_login("dr.rajesh@therapist.com", "Therapist@123", "doctor")
