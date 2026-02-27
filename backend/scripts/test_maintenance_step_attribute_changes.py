import os
import sys
import django
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

# Add backend to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import (
    Person,
    UserAccount,
    Role,
    PersonRoleMapping,
    Maintenance,
    MaintenanceStep,
    MaintenanceTypicalStep,
    Asset,
    AssetModel,
    AssetBrand,
    AssetType,
    AssetAttributeDefinition,
    AssetAttributeValue,
)
from api.views import MaintenanceStepViewSet


def setup_test_data():
    tech_role, _ = Role.objects.get_or_create(role_id=199, role_code='maintenance_technician', role_label='Maintenance Technician')

    tech_person, _ = Person.objects.get_or_create(
        person_id=2001,
        defaults={'first_name': 'Attr', 'last_name': 'Tech', 'sex': 'M', 'birth_date': '1990-01-01', 'is_approved': True},
    )

    now = timezone.now()
    tech_user, _ = UserAccount.objects.get_or_create(
        user_id=2001,
        defaults={
            'username': 'attr_tech_test',
            'person': tech_person,
            'password_hash': 'hash',
            'created_at_datetime': now,
            'account_status': 'active',
            'password_last_changed_datetime': now,
            'disabled_at_datetime': now,
            'modified_at_datetime': now,
            'last_login': now,
            'failed_login_attempts': 0,
        },
    )

    PersonRoleMapping.objects.get_or_create(person=tech_person, role=tech_role)

    asset_type, _ = AssetType.objects.get_or_create(asset_type_id=199, defaults={'asset_type_label': 'Attr Test Type', 'asset_type_code': 'ATTRTEST'})
    asset_brand, _ = AssetBrand.objects.get_or_create(asset_brand_id=199, defaults={'brand_name': 'Attr Test Brand', 'brand_code': 'ATTRTEST', 'is_active': True})
    asset_model, _ = AssetModel.objects.get_or_create(asset_model_id=199, defaults={'asset_brand': asset_brand, 'asset_type': asset_type, 'model_name': 'Attr Test Model'})
    asset, _ = Asset.objects.get_or_create(asset_id=199, defaults={'asset_model': asset_model, 'asset_name': 'Attr Test Asset'})

    maintenance, _ = Maintenance.objects.get_or_create(
        maintenance_id=1999,
        defaults={
            'asset': asset,
            'performed_by_person': tech_person,
            'approved_by_maintenance_chief': tech_person,
            'start_datetime': timezone.now(),
            'end_datetime': None,
        },
    )

    typical_step, _ = MaintenanceTypicalStep.objects.get_or_create(
        maintenance_typical_step_id=199,
        defaults={'description': 'Attr Step', 'operation_type': 'inspect'},
    )

    step, _ = MaintenanceStep.objects.get_or_create(
        maintenance_step_id=2999,
        defaults={
            'maintenance': maintenance,
            'maintenance_typical_step': typical_step,
            'person': tech_person,
            'maintenance_step_status': 'pending',
            'start_datetime': None,
            'end_datetime': None,
            'is_successful': False,
        },
    )

    attr_def, _ = AssetAttributeDefinition.objects.get_or_create(
        asset_attribute_definition_id=299,
        defaults={'data_type': 'string', 'unit': None, 'description': 'Attr Test Def'},
    )

    AssetAttributeValue.objects.get_or_create(
        asset_id=asset.asset_id,
        asset_attribute_definition_id=attr_def.asset_attribute_definition_id,
        defaults={'value_string': 'OLD', 'value_bool': None, 'value_date': None, 'value_number': None},
    )

    return tech_user, step, asset, attr_def


def run():
    tech_user, step, asset, attr_def = setup_test_data()
    factory = APIRequestFactory()

    # Queue an attribute change
    view_queue = MaintenanceStepViewSet.as_view({'post': 'attribute_changes'})
    queue_payload = [
        {
            'target_type': 'asset',
            'target_id': None,
            'attribute_definition_id': attr_def.asset_attribute_definition_id,
            'value_string': 'NEW',
        }
    ]

    req = factory.post(f'/api/maintenance-steps/{step.maintenance_step_id}/attribute-changes/', queue_payload, format='json')
    force_authenticate(req, user=tech_user)
    resp = view_queue(req, pk=step.maintenance_step_id)
    print('Queue status:', resp.status_code)
    print('Queue response:', getattr(resp, 'data', None))

    # Mark step as done (should apply queued changes)
    view_patch = MaintenanceStepViewSet.as_view({'patch': 'partial_update'})
    patch_payload = {'maintenance_step_status': 'done'}
    req2 = factory.patch(f'/api/maintenance-steps/{step.maintenance_step_id}/', patch_payload, format='json')
    force_authenticate(req2, user=tech_user)
    resp2 = view_patch(req2, pk=step.maintenance_step_id)
    print('Patch status:', resp2.status_code)

    # Verify applied
    val = AssetAttributeValue.objects.filter(
        asset_id=asset.asset_id,
        asset_attribute_definition_id=attr_def.asset_attribute_definition_id,
    ).first()

    print('Asset attribute value after done:', getattr(val, 'value_string', None))


if __name__ == '__main__':
    run()
