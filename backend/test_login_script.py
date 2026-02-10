import os
import django
import hashlib
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import UserAccount
from api.views import hash_password

def test_login(username, password):
    print(f"Testing login for {username}...")
    try:
        user = UserAccount.objects.get(username=username)
        print(f"User found: {user.username}")
        print(f"Account status: {user.account_status}")
        
        provided_hash = hash_password(password)
        print(f"Provided password hash: {provided_hash[:20]}...")
        print(f"Database password hash: {user.password_hash[:20]}...")
        
        if user.password_hash == provided_hash:
            print("Password match: SUCCESS")
        else:
            print("Password match: FAILED")
            
        if user.account_status == 'active':
            print("Account status check: SUCCESS")
        else:
            print(f"Account status check: FAILED (status is '{user.account_status}')")
            
    except UserAccount.DoesNotExist:
        print("User NOT found")

if __name__ == "__main__":
    test_login('bahaaeddinezaoui', '08212001')
    print("-" * 20)
    # Check if 'admin' still works to verify hash consistency
    # (We don't know admin password but we can check if it's sha512)
