import requests

def test_admin_login():
    url = "http://127.0.0.1:8000/api/admin/login"
    payload = {
        "email": "anjali.sharma@twinkles.com",
        "password": "Admin@123"
    }
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    test_admin_login()
