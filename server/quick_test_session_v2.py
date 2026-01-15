import requests
import json
from datetime import datetime

def test_production_session_flow():
    print("🚀 Testing Production-Ready Session Persistence Flow...\n")
    
    # 1. Login to get production token
    print("🔑 Authenticating as Dr. Rajesh Kumar...")
    login_data = {
        "email": "dr.rajesh@therapist.com",
        "password": "Therapist@123"
    }
    
    try:
        auth_response = requests.post("http://localhost:8000/api/doctor/login", json=login_data)
        auth_response.raise_for_status()
        
        token = auth_response.json()["access_token"]
        doctor_info = auth_response.json()["doctor"]
        print(f"✅ Authenticated! User: {doctor_info['name']} (ID: {doctor_info['id']})")
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return

    # 2. Log a high-quality session record
    print("\n📡 Publishing new therapeutic session to MongoDB...")
    session_payload = {
        "childId": "c1",
        "therapistId": doctor_info['id'],  # Required by schema, validated by backend
        "type": "Occupational Therapy",
        "duration": 60,
        "status": "completed",
        "engagement": 92,
        "emotionalState": "Regulated & Focused",
        "activities": ["Sensory Integration", "Fine Motor Exercises"],
        "notes": "Patient showed significant progress in fine motor control using the pegboard activities.",
        "aiSummary": "Aarav had a brilliant OT session focusing on fine motor skills.",
        "wins": ["Improved grip strength", "Sustained attention for 20 mins"],
        "date": datetime.utcnow().isoformat()
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(
            "http://localhost:8000/api/sessions", 
            json=session_payload,
            headers=headers
        )
        response.raise_for_status()
        
        saved_session = response.json()
        print(f"✅ Session stored successfully in MongoDB!")
        print(f"   Database ID: {saved_session['_id']}")
        print(f"   Verification: {saved_session['type']} - {saved_session['emotionalState']}")
    except Exception as e:
        print(f"❌ Failed to store session: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"   Detail: {e.response.text}")
        return

    # 3. Verify Reflection
    print("\n📡 Verifying data reflection for Child ID: c1...")
    try:
        get_response = requests.get("http://localhost:8000/api/sessions/child/c1")
        get_response.raise_for_status()
        
        sessions = get_response.json()
        found = any(s["_id"] == saved_session["_id"] for s in sessions)
        
        if found:
            print(f"✅ TEST PASSED: Session is correctly reflected in child history!")
            print(f"   Total Persistent Sessions for Patient: {len(sessions)}")
        else:
            print("❌ TEST FAILED: Session was stored but is not appearing in the history.")
    except Exception as e:
        print(f"❌ Reflection verification failed: {e}")

if __name__ == "__main__":
    test_production_session_flow()
