import os
import django
import hashlib
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import UserAccount
from api.serializers import UserProfileSerializer

def test_serializer(username):
    print(f"Testing serializer for {username}...")
    try:
        user = UserAccount.objects.select_related('person').get(username=username)
        serializer = UserProfileSerializer(user)
        data = serializer.data
        print("Serializer Data:")
        for key, value in data.items():
            print(f"  {key}: {value}")
            
    except UserAccount.DoesNotExist:
        print("User NOT found")
    except Exception as e:
        print(f"Error during serialization: {e}")

if __name__ == "__main__":
    test_serializer('bahaaeddinezaoui')
