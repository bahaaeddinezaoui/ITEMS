import os
import django
import hashlib
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import Person, UserAccount, Role, PersonRoleMapping

def hash_password(password):
    return hashlib.sha512(password.encode()).hexdigest()

def create_chief():
    print("Starting Maintenance Chief creation (Final Attempt)...")
    
    # Target IDs based on research
    ROLE_ID = 2
    PERSON_ID = 6
    USER_ID = 2
    
    # 1. Create Role
    role_code = 'maintenance_chief'
    role_label = 'Maintenance Chief'
    
    role = Role.objects.filter(role_code=role_code).first()
    if not role:
        role = Role.objects.create(
            role_id=ROLE_ID,
            role_code=role_code,
            role_label=role_label,
            description='Responsible for maintenance operations'
        )
        print(f"Created role: {role_label} (ID: {ROLE_ID})")
    else:
        print(f"Role {role_label} already exists")

    # 2. Create Person
    first_name = "Bahaaeddine"
    last_name = "Zaoui"
    
    person = Person.objects.filter(first_name=first_name, last_name=last_name).first()
    if not person:
        person = Person.objects.create(
            person_id=PERSON_ID,
            first_name=first_name,
            last_name=last_name,
            sex='Male',
            birth_date='2001-08-21',
            is_approved=True
        )
        print(f"Created person: {first_name} {last_name} (ID: {PERSON_ID})")
    else:
        print(f"Person {first_name} {last_name} already exists")

    # 3. Create User Account
    username = 'bahaaeddinezaoui'
    password = '08212001'
    password_hash = hash_password(password)
    
    now = timezone.now()
    user = UserAccount.objects.filter(username=username).first()
    if not user:
        user = UserAccount.objects.create(
            user_id=USER_ID,
            username=username,
            person=person,
            password_hash=password_hash,
            created_at_datetime=now,
            disabled_at_datetime=now, # Required NOT NULL field
            last_login=now,           # Required NOT NULL field
            account_status='active', # lowercase to match admin
            failed_login_attempts=0,
            password_last_changed_datetime=now,
            modified_at_datetime=now  # Required NOT NULL field
        )
        print(f"Created user account: {username} (ID: {USER_ID})")
    else:
        user.password_hash = password_hash
        user.save()
        print(f"User account {username} already exists (password updated)")

    # 4. Map Role to Person
    mapping = PersonRoleMapping.objects.filter(person=person, role=role).first()
    if not mapping:
        mapping = PersonRoleMapping.objects.create(
            person=person,
            role=role
        )
        print(f"Assigned role {role_label} to {first_name} {last_name}")
    else:
        print(f"Role {role_label} already assigned to {first_name} {last_name}")

    print("Finished successfully.")

if __name__ == "__main__":
    create_chief()
