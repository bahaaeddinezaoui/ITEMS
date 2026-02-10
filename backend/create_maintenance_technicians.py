import os
import django
import hashlib
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import Person, UserAccount, Role, PersonRoleMapping

def hash_password(password):
    return hashlib.sha512(password.encode()).hexdigest()

def create_technicians():
    print("Starting Maintenance Technicians creation...")
    
    # 1. Create Role
    ROLE_ID = 3
    role_code = 'maintenance_technician'
    role_label = 'Maintenance Technician'
    
    role = Role.objects.filter(role_code=role_code).first()
    if not role:
        role = Role.objects.create(
            role_id=ROLE_ID,
            role_code=role_code,
            role_label=role_label,
            description='Performs maintenance tasks'
        )
        print(f"Created role: {role_label} (ID: {ROLE_ID})")
    else:
        print(f"Role {role_label} already exists")

    technicians = [
        {
            "person_id": 7,
            "user_id": 3,
            "first_name": "Technician",
            "last_name": "One",
            "username": "technician1",
            "password": "technician1"
        },
        {
            "person_id": 8,
            "user_id": 4,
            "first_name": "Technician",
            "last_name": "Two",
            "username": "technician2",
            "password": "technician2"
        }
    ]

    for tech in technicians:
        # 2. Create or Update Person
        # Try to find by ID first
        person = Person.objects.filter(person_id=tech["person_id"]).first()
        if not person:
            person = Person.objects.create(
                person_id=tech["person_id"],
                first_name=tech["first_name"],
                last_name=tech["last_name"],
                sex='Male',
                birth_date='1990-01-01',
                is_approved=True
            )
            print(f"Created person: {tech['first_name']} {tech['last_name']} (ID: {tech['person_id']})")
        else:
            # Update name if changed
            if person.first_name != tech["first_name"] or person.last_name != tech["last_name"]:
                person.first_name = tech["first_name"]
                person.last_name = tech["last_name"]
                person.save()
                print(f"Updated person name: {tech['first_name']} {tech['last_name']}")
            else:
                print(f"Person {tech['first_name']} {tech['last_name']} already exists")

        # 3. Create or Update User Account
        password_hash = hash_password(tech["password"])
        now = timezone.now()
        
        # Try to find by ID first
        user = UserAccount.objects.filter(user_id=tech["user_id"]).first()
        
        if not user:
            # Check if username exists with different ID (unlikely but safe)
            if UserAccount.objects.filter(username=tech["username"]).exists():
                print(f"Error: Username {tech['username']} already taken by another ID")
                continue
                
            user = UserAccount.objects.create(
                user_id=tech["user_id"],
                username=tech["username"],
                person=person,
                password_hash=password_hash,
                created_at_datetime=now,
                disabled_at_datetime=now,
                last_login=now,
                account_status='active',
                failed_login_attempts=0,
                password_last_changed_datetime=now,
                modified_at_datetime=now
            )
            print(f"Created user account: {tech['username']} (ID: {tech['user_id']})")
        else:
            # Update credentials
            updated = False
            if user.username != tech["username"]:
                user.username = tech["username"]
                updated = True
            if user.password_hash != password_hash:
                user.password_hash = password_hash
                updated = True
            
            if updated:
                user.save()
                print(f"Updated user account credentials for: {tech['username']}")
            else:
                print(f"User account {tech['username']} up to date")

        # 4. Map Role to Person
        mapping = PersonRoleMapping.objects.filter(person=person, role=role).first()
        if not mapping:
            PersonRoleMapping.objects.create(
                person=person,
                role=role
            )
            print(f"Assigned role {role_label} to {tech['first_name']} {tech['last_name']}")
        else:
            print(f"Role {role_label} already assigned to {tech['first_name']} {tech['last_name']}")

    print("Finished successfully.")

if __name__ == "__main__":
    create_technicians()
