import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import OrganizationalStructureRelation

def verify():
    print("Attempting to query OrganizationalStructureRelation...")
    try:
        # This will trigger the SQL generation and execution
        relations = list(OrganizationalStructureRelation.objects.all())
        print(f"SUCCESS: Query executed successfully. Found {len(relations)} relations.")
        print("The 500 error (missing 'id' column) appears to be resolved.")
    except Exception as e:
        print(f"FAILED: Still getting an error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify()

if __name__ == "__main__":
    verify()
