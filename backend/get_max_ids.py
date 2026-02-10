import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import Role, Person, UserAccount

def get_max_ids():
    try:
        max_role = Role.objects.all().order_by("-role_id").first()
        print(f"Max Role ID: {max_role.role_id if max_role else 0}")
        
        max_person = Person.objects.all().order_by("-person_id").first()
        print(f"Max Person ID: {max_person.person_id if max_person else 0}")
        
        max_user = UserAccount.objects.all().order_by("-user_id").first()
        print(f"Max User ID: {max_user.user_id if max_user else 0}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_max_ids()
