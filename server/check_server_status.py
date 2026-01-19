import socket
import sys

def check_server(host, port):
    print(f"🔍 Checking connection to {host}:{port}...")
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2)
    try:
        s.connect((host, port))
        print(f"✅ Connection successful! Server is RUNNING on port {port}.")
        s.close()
        return True
    except ConnectionRefusedError:
        print(f"❌ Connection REFUSED. Server is NOT running on port {port}.")
        return False
    except Exception as e:
        print(f"❌ Connection FAILED: {e}")
        return False

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    if check_server(host, port):
        sys.exit(0)
    else:
        sys.exit(1)
