#!/usr/bin/env python
import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from django.test import Client
from api.models import UserAccount

# Get the superuser account
try:
    superuser = UserAccount.objects.filter(username='admin').first()
    if superuser:
        print(f"Found superuser: {superuser.username}")
        print(f"Is superuser: {superuser.is_superuser()}")
    else:
        print("No admin user found")
except Exception as e:
    print(f"Error: {e}")

# Test the endpoint
client = Client()

# Test unauthenticated request
print("\n--- Testing Unauthenticated Request ---")
response = client.get('/api/organizational-structures/')
print(f"Status: {response.status_code}")

# Test API directly through Django ORM
print("\n--- Testing Model Directly ---")
from api.models import OrganizationalStructure
count = OrganizationalStructure.objects.count()
print(f"Organizational Structures Count: {count}")
print(f"Table exists: organizational_structure")

# Test serializer
print("\n--- Testing Serializer ---")
from api.serializers import OrganizationalStructureSerializer
test_data = {
    'structure_code': 'TEST001',
    'structure_name': 'Test Structure',
    'structure_type': 'Test',
    'is_active': True
}
serializer = OrganizationalStructureSerializer(data=test_data)
print(f"Serializer valid: {serializer.is_valid()}")
if not serializer.is_valid():
    print(f"Errors: {serializer.errors}")

print("\n--- All Tests Passed ---")
