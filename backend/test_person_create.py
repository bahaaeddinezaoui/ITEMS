import os
import django
import sys

# Setup Django environment
project_path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import Person

def test_create():
    print("Testing person creation...")
    try:
        # Get the next person_id
        last_person = Person.objects.order_by('-person_id').first()
        next_id = (last_person.person_id + 1) if last_person else 1
        print(f"Calculated next_id: {next_id}")

        data = {
            'first_name': 'Test',
            'last_name': 'User',
            'sex': 'Male',
            'birth_date': '2000-01-01',
            'is_approved': True
        }
        
        person = Person.objects.create(
            person_id=next_id,
            **data
        )
        print(f"Successfully created person: {person.first_name} {person.last_name} (ID: {person.person_id})")
        
        # Verify it's in the DB
        exists = Person.objects.filter(person_id=next_id).exists()
        print(f"Verified existence in DB: {exists}")
        
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_create()
