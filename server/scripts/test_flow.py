import requests
import uuid

def test_signup_login():
    email = f"test_{uuid.uuid4().hex[:6]}@gmail.com"
    password = "TestPassword@123"
    
    # 1. Signup
    signup_url = "http://127.0.0.1:8000/api/public/signup"
    signup_payload = {
        "name": "Test User",
        "email": email,
        "password": password,
        "phone": "1234567890",
        "relationship": "Mother"
    }
    print(f"Signing up: {email}")
    res = requests.post(signup_url, json=signup_payload)
    print(f"Signup Status: {res.status_code}")
    
    if res.status_code != 201:
        print(f"Signup failed: {res.text}")
        return

    # 2. Login
    login_url = "http://127.0.0.1:8000/api/parent/login"
    login_payload = {
        "email": email,
        "password": password
    }
    print(f"Logging in: {email}")
    res = requests.post(login_url, json=login_payload)
    print(f"Login Status: {res.status_code}")
    print(f"Login Response: {res.json()}")

if __name__ == "__main__":
    test_signup_login()
