import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import Room, RoomType
from api.serializers import RoomSerializer

print("=== Testing Complete Room Solution ===\n")

# Test 1: Check Room table structure
try:
    rooms = Room.objects.all()
    print(f"✓ Room table accessible: {len(rooms)} rooms in database")
except Exception as e:
    print(f"✗ Error accessing Room table: {e}")

# Test 2: Check Room model fields
try:
    room_fields = [f.name for f in Room._meta.get_fields()]
    print(f"✓ Room model fields: {', '.join(room_fields)}")
except Exception as e:
    print(f"✗ Error checking Room fields: {e}")

# Test 3: Test serialization
try:
    rooms = Room.objects.all()[:1]
    if rooms:
        room = rooms[0]
        serializer = RoomSerializer(room)
        print(f"✓ Room serialization successful: {serializer.data}")
    else:
        print("✓ No rooms to serialize (database is empty)")
except Exception as e:
    print(f"✗ Error serializing room: {e}")

# Test 4: Verify RoomType table still works
try:
    room_types = RoomType.objects.all()
    print(f"✓ RoomType table accessible: {len(room_types)} room types in database")
except Exception as e:
    print(f"✗ Error accessing RoomType table: {e}")

print("\n=== All Tests Complete ===")
