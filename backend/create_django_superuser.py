import os
import django
import sys

# Setup Django environment
project_path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from django.contrib.auth.models import User

# Create Django superuser
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Django superuser 'admin' created with password 'admin123'")
else:
    print("Django superuser 'admin' already exists")
    # Update password if needed
    user = User.objects.get(username='admin')
    user.set_password('admin123')
    user.save()
    print("Updated password for 'admin' to 'admin123'")

# Verify
users = User.objects.all().values('username', 'is_staff', 'is_superuser')
print("Current users:", list(users))
