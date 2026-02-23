import requests

print("=== Final Login Verification ===\n")

# Test Manjula with User@123
r = requests.post('http://127.0.0.1:8000/api/parent/login', json={
    'email': 'manjula@gmail.com',
    'password': 'User@123'
})
print(f"Manjula (User@123): {r.status_code} {'SUCCESS' if r.status_code == 200 else 'FAIL'}")

# Test static parents with Parent@123
r2 = requests.post('http://127.0.0.1:8000/api/parent/login', json={
    'email': 'priya.patel@parent.com',
    'password': 'Parent@123'
})
print(f"Priya (Parent@123): {r2.status_code} {'SUCCESS' if r2.status_code == 200 else 'FAIL'}")

# Test static therapist with Therapist@123
r3 = requests.post('http://127.0.0.1:8000/api/doctor/login', json={
    'email': 'dr.rajesh@therapist.com',
    'password': 'Therapist@123'
})
print(f"Dr. Rajesh (Therapist@123): {r3.status_code} {'SUCCESS' if r3.status_code == 200 else 'FAIL'}")
