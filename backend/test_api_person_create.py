import urllib.request
import json

url = 'http://localhost:8000/api/persons/'
data = {
    'first_name': 'John',
    'last_name': 'Doe',
    'sex': 'Male',
    'birth_date': '1995-05-20',
    'is_approved': True
}

request = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(request) as response:
        print(f"Status Code: {response.status}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"Status Code: {e.code}")
    print(f"Response: {e.read().decode('utf-8')}")
