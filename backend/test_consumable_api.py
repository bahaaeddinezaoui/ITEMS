import os, sys, json, traceback
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
import django
django.setup()

from django.test import RequestFactory
from api.views import ConsumableViewSet
from api.models import Consumable

# Create a fake request
factory = RequestFactory()
request = factory.post(
    '/api/consumables/',
    data=json.dumps({
        'consumable_name': 'Test Consumable',
        'consumable_model': 1,
        'consumable_status': 'in_stock',
        'translations': {
            'en': {'consumable_name': 'Test Consumable'},
            'ar': {'consumable_name': 'مستهلك تجريبي'},
        }
    }),
    content_type='application/json'
)

# Add user attribute (needed for permission checks)
from django.contrib.auth.models import User
try:
    admin_user = User.objects.filter(is_superuser=True).first()
    if admin_user:
        request.user = admin_user
        print(f'Using user: {admin_user.username}')
    else:
        print('No superuser found, creating one...')
        admin_user = User.objects.create_superuser('testadmin', 'admin@test.com', 'testpass')
        request.user = admin_user
except Exception as e:
    print(f'User setup error: {e}')

# Call the view
viewset = ConsumableViewSet()
viewset.request = request
viewset.format_kwarg = None

try:
    response = viewset.create(request)
    print(f'Status: {response.status_code}')
    print(f'Data: {response.data}')
except Exception as e:
    traceback.print_exc()
