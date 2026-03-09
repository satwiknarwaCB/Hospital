import requests
import json

def test_login():
    url = "http://127.0.0.1:8000/api/parent/login"
    data = {
        "email": "priya.patel@parent.com",
        "password": "Parent@123"
    }
    try:
        print(f"Attempting POST to {url}...")
        response = requests.post(url, json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
