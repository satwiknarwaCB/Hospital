"""
Direct Parent Login Test - Opens browser and tests login
"""
import webbrowser
import time

print("=" * 60)
print("PARENT LOGIN TEST")
print("=" * 60)

print("\n1. Opening parent login page in browser...")
print("   URL: http://localhost:5173/parent/login")

# Open the login page
webbrowser.open('http://localhost:5173/parent/login')

print("\n2. Page should be opening in your browser now!")
print("\n" + "=" * 60)
print("INSTRUCTIONS:")
print("=" * 60)
print("\n1. Wait for page to load")
print("2. Click 'Quick Fill' button for Priya Patel")
print("3. Click 'Sign In' button")
print("\nCredentials:")
print("  Email: priya.patel@parent.com")
print("  Password: Parent@123")
print("\n" + "=" * 60)

print("\n✅ If login works, you'll be redirected to parent dashboard")
print("❌ If it doesn't work, press F12 and check console for errors")
print("\n" + "=" * 60)
