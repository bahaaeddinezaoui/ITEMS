import os
import django
from django.db import transaction

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import OrganizationalStructure
from api.serializers import OrganizationalStructureRelationSerializer

def test_insert():
    # Get two structures
    structs = list(OrganizationalStructure.objects.all()[:2])
    if len(structs) < 2:
        print("Need at least 2 structures to test relations.")
        return
    
    child = structs[0]
    parent = structs[1]
    
    data = {
        'organizational_structure': child.pk,
        'parent_organizational_structure': parent.pk,
        'relation_type': 'Test Relation'
    }
    
    print(f"Testing Serializer insert: {data}")
    
    try:
        with transaction.atomic():
            serializer = OrganizationalStructureRelationSerializer(data=data)
            if serializer.is_valid():
                rel = serializer.save()
                print(f"SUCCESS: Relation created via Serializer: {rel}")
            else:
                print(f"FAILED: Serializer errors: {serializer.errors}")
            
            # Rollback
            transaction.set_rollback(True)
            
    except Exception as e:
        print(f"FAILED: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_insert()
