import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import UserAccount, PersonRoleMapping, Role
from api.serializers import UserProfileSerializer

def diagnose_user(username):
    print(f"--- Diagnosing user: {username} ---")
    try:
        user = UserAccount.objects.select_related('person').get(username=username)
        print(f"User ID: {user.user_id}")
        print(f"Username: {user.username}")
        print(f"Person ID: {user.person_id}")
        print(f"Person: {user.person.first_name} {user.person.last_name}")
        
        is_super = user.is_superuser()
        print(f"is_superuser() returns: {is_super}")
        
        roles = user.get_roles()
        print("Associated Roles:")
        for r in roles:
            print(f"  - {r.role.role_code} (ID: {r.role.role_id})")
            
        # Serializer output
        serializer = UserProfileSerializer(user)
        print("\nSerializer Output:")
        for k, v in serializer.data.items():
            print(f"  {k}: {v}")
            
    except UserAccount.DoesNotExist:
        print("User not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    diagnose_user('bahaaeddinezaoui')
