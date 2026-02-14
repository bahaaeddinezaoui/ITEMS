
import os
import django
import sys
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

# Add backend to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import Person, UserAccount, Role, PersonRoleMapping, Maintenance, MaintenanceStep, MaintenanceTypicalStep, Asset, AssetModel, AssetBrand, AssetType
from api.views import MaintenanceStepViewSet

def setup_test_data():
    print("Setting up test data...")
    # Create Role if not exists
    tech_role, _ = Role.objects.get_or_create(role_id=99, role_code='technician', role_label='Technician')
    chief_role, _ = Role.objects.get_or_create(role_id=98, role_code='maintenance_chief', role_label='Maintenance Chief')
    
    # Create Persons
    chief_person, _ = Person.objects.get_or_create(person_id=1001, defaults={'first_name': 'Chief', 'last_name': 'User', 'sex': 'M', 'birth_date': '1980-01-01', 'is_approved': True})
    main_tech, _ = Person.objects.get_or_create(person_id=1002, defaults={'first_name': 'Main', 'last_name': 'Tech', 'sex': 'M', 'birth_date': '1990-01-01', 'is_approved': True})
    other_tech, _ = Person.objects.get_or_create(person_id=1003, defaults={'first_name': 'Other', 'last_name': 'Tech', 'sex': 'M', 'birth_date': '1995-01-01', 'is_approved': True})
    
    # Create User Accounts
    now = timezone.now()
    chief_user, _ = UserAccount.objects.get_or_create(
        user_id=1001, 
        defaults={
            'username': 'chief_test', 
            'person': chief_person, 
            'password_hash': 'hash', 
            'created_at_datetime': now, 
            'account_status': 'active', 
            'password_last_changed_datetime': now,
            'disabled_at_datetime': now,
            'modified_at_datetime': now,
            'last_login': now,
            'failed_login_attempts': 0
        }
    )
    main_tech_user, _ = UserAccount.objects.get_or_create(
        user_id=1002, 
        defaults={
            'username': 'main_tech_test', 
            'person': main_tech, 
            'password_hash': 'hash', 
            'created_at_datetime': now, 
            'account_status': 'active', 
            'password_last_changed_datetime': now,
            'disabled_at_datetime': now,
            'modified_at_datetime': now,
            'last_login': now,
            'failed_login_attempts': 0
        }
    )
    other_tech_user, _ = UserAccount.objects.get_or_create(
        user_id=1003, 
        defaults={
            'username': 'other_tech_test', 
            'person': other_tech, 
            'password_hash': 'hash', 
            'created_at_datetime': now, 
            'account_status': 'active', 
            'password_last_changed_datetime': now,
            'disabled_at_datetime': now,
            'modified_at_datetime': now,
            'last_login': now,
            'failed_login_attempts': 0
        }
    )
    
    # Assign Roles
    PersonRoleMapping.objects.get_or_create(person=chief_person, role=chief_role)
    PersonRoleMapping.objects.get_or_create(person=main_tech, role=tech_role)
    PersonRoleMapping.objects.get_or_create(person=other_tech, role=tech_role)
    
    # Create Asset
    asset_type, _ = AssetType.objects.get_or_create(asset_type_id=99, defaults={'asset_type_label': 'Test Type', 'asset_type_code': 'TEST'})
    asset_brand, _ = AssetBrand.objects.get_or_create(asset_brand_id=99, defaults={'brand_name': 'Test Brand', 'brand_code': 'TEST', 'is_active': True})
    asset_model, _ = AssetModel.objects.get_or_create(asset_model_id=99, defaults={'asset_brand': asset_brand, 'asset_type': asset_type, 'model_name': 'Test Model'})
    asset, _ = Asset.objects.get_or_create(asset_id=99, defaults={'asset_model': asset_model, 'asset_name': 'Test Asset'})
    
    # Create Maintenance
    maintenance, _ = Maintenance.objects.get_or_create(
        maintenance_id=999, 
        defaults={
            'asset': asset, 
            'performed_by_person': main_tech, 
            'approved_by_maintenance_chief': chief_person, 
            'start_datetime': timezone.now(), 
            'end_datetime': timezone.now()
        }
    )
    
    # Create Typical Step
    typical_step, _ = MaintenanceTypicalStep.objects.get_or_create(maintenance_typical_step_id=99, defaults={'description': 'Test Step'})
    
    return chief_user, main_tech_user, other_tech_user, maintenance, typical_step, main_tech, other_tech, chief_person

def test_permissions():
    chief_user, main_tech_user, other_tech_user, maintenance, typical_step, main_tech, other_tech, chief_person = setup_test_data()
    factory = APIRequestFactory()
    view = MaintenanceStepViewSet.as_view({'post': 'create', 'put': 'update', 'patch': 'partial_update'})
    
    print("\n--- TEST CASE 1: Main Tech assigns Other Tech to Step (Should Succeed) ---")
    data = {
        'maintenance': maintenance.maintenance_id,
        'maintenance_typical_step_id': typical_step.maintenance_typical_step_id,
        'person_id': other_tech.person_id,
        'start_datetime': timezone.now(),
        'end_datetime': timezone.now()
    }
    request = factory.post('/api/maintenance-steps/', data, format='json')
    force_authenticate(request, user=main_tech_user)
    response = view(request)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        print("SUCCESS")
        step_id = response.data['maintenance_step_id']
    else:
        print(f"FAILURE: {response.data}")
        return

    print("\n--- TEST CASE 2: Other Tech (assigned) tries to re-assign Step to Chief (Should Fail) ---")
    step = MaintenanceStep.objects.get(maintenance_step_id=step_id)
    data = {'person_id': chief_person.person_id}
    request = factory.patch(f'/api/maintenance-steps/{step_id}/', data, format='json')
    force_authenticate(request, user=other_tech_user)
    response = view(request, pk=step_id)
    print(f"Status: {response.status_code}")
    if response.status_code == 403:
        print("SUCCESS (Correctly Forbidden)")
    else:
        print(f"FAILURE: Expected 403, got {response.status_code}")

    print("\n--- TEST CASE 3: Other Tech (assigned) updates status (Should Succeed) ---")
    data = {'is_successful': True}
    request = factory.patch(f'/api/maintenance-steps/{step_id}/', data, format='json')
    force_authenticate(request, user=other_tech_user)
    response = view(request, pk=step_id)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("SUCCESS")
    else:
        print(f"FAILURE: {response.data}")

    print("\n--- TEST CASE 4: Maintenance Chief re-assigns Step to Main Tech (Should Succeed) ---")
    data = {'person_id': main_tech.person_id}
    request = factory.patch(f'/api/maintenance-steps/{step_id}/', data, format='json')
    force_authenticate(request, user=chief_user)
    response = view(request, pk=step_id)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("SUCCESS")
    else:
        print(f"FAILURE: {response.data}")

def run():
    try:
        test_permissions()
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run()
