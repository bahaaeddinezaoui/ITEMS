import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import RoomType, Room

try:
    room_types = RoomType.objects.all()
    print(f"Successfully fetched {len(room_types)} room types")
    for rt in room_types:
        print(f"  - {rt.room_type_label} ({rt.room_type_code})")
except Exception as e:
    print(f"Error fetching room types: {e}")
    import traceback
    traceback.print_exc()
