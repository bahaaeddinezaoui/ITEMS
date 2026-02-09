import os
import django
import hashlib
from django.utils import timezone
import sys

# Setup Django environment
project_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import Person, UserAccount, Role, PersonRoleMapping

def hash_password(password):
    return hashlib.sha512(password.encode()).hexdigest()

def create_admin():
    print("Starting superuser creation...")
    
    # 1. Ensure superuser role exists
    role = Role.objects.filter(role_code='superuser').first()
    if not role:
        last_role = Role.objects.order_by('-role_id').first()
        next_role_id = (last_role.role_id + 1) if last_role else 1
        role = Role.objects.create(
            role_id=next_role_id,
            role_code='superuser',
            role_label='Superuser',
            description='Full system access'
        )
        print(f"Created 'superuser' role (ID: {role.role_id}).")
    else:
        print("'superuser' role already exists.")

    # 2. Check if admin user already exists
    if UserAccount.objects.filter(username='admin').exists():
        print("User 'admin' already exists. Skipping creation.")
        return

    # 3. Create Person
    last_person = Person.objects.order_by('-person_id').first()
    next_person_id = (last_person.person_id + 1) if last_person else 1
    
    person = Person.objects.create(
        person_id=next_person_id,
        first_name='System',
        last_name='Administrator',
        sex='Male',
        birth_date='1990-01-01',
        is_approved=True
    )
    print(f"Created Person: {person.first_name} {person.last_name} (ID: {person.person_id})")

    # 4. Create UserAccount
    last_user = UserAccount.objects.order_by('-user_id').first()
    next_user_id = (last_user.user_id + 1) if last_user else 1
    
    username = 'admin'
    password = 'password123'
    now = timezone.now()
    
    user = UserAccount.objects.create(
        user_id=next_user_id,
        person=person,
        username=username,
        password_hash=hash_password(password),
        created_at_datetime=now,
        account_status='active',
        password_last_changed_datetime=now,
        failed_login_attempts=0,
        modified_at_datetime=now,
        # Mandatory fields according to integrity check
        disabled_at_datetime=now, 
        last_login=now
    )
    print(f"Created UserAccount: {username} (ID: {user.user_id}) with password '{password}'")

    # 5. Map Role
    try:
        PersonRoleMapping.objects.create(
            person=person,
            role=role
        )
        print(f"Mapped user to '{role.role_code}' role.")
    except Exception as e:
        print(f"Note on mapping: {e}")

    print("Superuser creation complete!")

if __name__ == "__main__":
    create_admin()
