import urllib.request
import json

url = 'http://localhost:8000/api/persons/'
data = {
    "first_name": "Urllib",
    "last_name": "Tester",
    "sex": "Male",
    "birth_date": "1990-01-01",
    "is_approved": True
}
payload = json.dumps(data).encode('utf-8')

req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')

try:
    print(f"Sending POST to {url}...")
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response Body: {response.read().decode()}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response Body: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
