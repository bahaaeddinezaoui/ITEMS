import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import UserAccount

def check_admin():
    try:
        user = UserAccount.objects.get(username='admin')
        for key, value in user.__dict__.items():
            if not key.startswith('_'):
                print(f"{key}: {value} (type: {type(value)})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_admin()
