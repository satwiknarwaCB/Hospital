import requests
import json

def check_date_format():
    print("📡 Fetching latest session to check date format...")
    try:
        response = requests.get("http://localhost:8000/api/sessions/child/c1")
        response.raise_for_status()
        sessions = response.json()
        if sessions:
            print(f"📊 Found {len(sessions)} persistent sessions.")
            for i, session in enumerate(sessions):
                raw_date = session.get('date')
                print(f"   [{i}] Raw Date: {raw_date}")
                if raw_date and ('+00:00' in raw_date or raw_date.endswith('Z')):
                    print("       ✨ OK: Offset detected.")
                else:
                    print("       ⚠️ MISSING: Naive string.")
        else:
            print("❌ No sessions found.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_date_format()
