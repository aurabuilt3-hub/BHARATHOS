import urllib.request
import json
import time

BASE_URL = 'http://localhost:8000/api/v1'
FRONTEND_URL = 'http://localhost:3000'

def test_api_endpoints():
    print("==================================================")
    print("1. TESTING FASTAPI BACKEND ENDPOINTS INTEGRATION")
    print("==================================================")

    # 1. POST /api/v1/incidents
    try:
        incident_payload = {
            "category": "Medical",
            "title": "[INTEGRATION TEST] Road Accident near MVP Colony",
            "description": "Two vehicles collided. Two citizens need immediate medical attention.",
            "latitude": 17.7289,
            "longitude": 83.3214,
            "address": "MVP Colony Sector 4, Visakhapatnam",
            "severity": "critical"
        }
        req = urllib.request.Request(
            f"{BASE_URL}/incidents",
            data=json.dumps(incident_payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        res = urllib.request.urlopen(req)
        print("POST /api/v1/incidents Status:", res.status)
        data = json.loads(res.read().decode('utf-8'))
        incident_id = data.get('id', 'N/A')
        print(" -> Created Incident ID:", incident_id)
        print(" -> Verified Status in Response:", data.get('status', 'N/A'))
    except Exception as e:
        print("POST /api/v1/incidents Failed:", e)

    # 2. GET /api/v1/incidents
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/incidents?limit=5")
        print("GET /api/v1/incidents Status:", res.status)
        data = json.loads(res.read().decode('utf-8'))
        print(" -> Returned Incidents Count:", len(data) if isinstance(data, list) else len(data.get('items', [])))
    except Exception as e:
        print("GET /api/v1/incidents Failed:", e)

    # 3. POST /api/v1/ai/triage
    try:
        triage_payload = {
            "incident_description": "There is a road accident nearby and two people are injured.",
            "session_id": "test_session_123"
        }
        req = urllib.request.Request(
            f"{BASE_URL}/ai/triage",
            data=json.dumps(triage_payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        res = urllib.request.urlopen(req)
        print("POST /api/v1/ai/triage Status:", res.status)
        data = json.loads(res.read().decode('utf-8'))
        print(" -> Summary:", data.get('summary'))
        print(" -> Recommended Departments:", data.get('recommended_departments'))
        print(" -> Priority:", data.get('priority'))
    except Exception as e:
        print("POST /api/v1/ai/triage Failed:", e)

    # 4. GET /api/v1/resources
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/resources")
        print("GET /api/v1/resources Status:", res.status)
    except Exception as e:
        print("GET /api/v1/resources Status:", e)

def test_frontend_routes():
    print("\n==================================================")
    print("2. TESTING ALL 10 CITIZEN OS FRONTEND ROUTES")
    print("==================================================")

    routes = [
        '/citizen',
        '/citizen/report',
        '/citizen/ai-assistant',
        '/citizen/sos',
        '/citizen/incidents',
        '/citizen/incidents/INC-SOS-1001',
        '/citizen/alerts',
        '/citizen/guidance',
        '/citizen/resources',
        '/citizen/profile'
    ]

    for r in routes:
        try:
            status = urllib.request.urlopen(f"{FRONTEND_URL}{r}").status
            print(f"Route {r:35s} -> HTTP {status} OK")
        except Exception as e:
            print(f"Route {r:35s} -> FAILED: {e}")

if __name__ == '__main__':
    test_api_endpoints()
    test_frontend_routes()
