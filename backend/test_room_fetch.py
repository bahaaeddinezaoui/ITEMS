import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import RoomType, Room

print("=== Testing Room Fetch ===\n")

# Test fetching room types
try:
    room_types = RoomType.objects.all()
    print(f"✓ Successfully fetched {len(room_types)} room types")
    for rt in room_types:
        print(f"  - ID: {rt.room_type_id}, Label: {rt.room_type_label}, Code: {rt.room_type_code}")
except Exception as e:
    print(f"✗ Error fetching room types: {e}")
    import traceback
    traceback.print_exc()

print("\n---\n")

# Test fetching rooms without select_related
try:
    rooms = Room.objects.all().order_by('room_id')
    print(f"✓ Successfully fetched {len(rooms)} rooms (without select_related)")
    for room in rooms:
        print(f"  - ID: {room.room_id}, Name: {room.room_name}, RoomType: {room.room_type_id}")
except Exception as e:
    print(f"✗ Error fetching rooms (without select_related): {e}")
    import traceback
    traceback.print_exc()

print("\n---\n")

# Test fetching rooms with select_related
try:
    rooms = Room.objects.select_related('room_type').order_by('room_id')
    print(f"✓ Successfully fetched {len(rooms)} rooms (with select_related)")
    for room in rooms:
        print(f"  - ID: {room.room_id}, Name: {room.room_name}, RoomType: {room.room_type.room_type_label if room.room_type else 'None'}")
except Exception as e:
    print(f"✗ Error fetching rooms (with select_related): {e}")
    import traceback
    traceback.print_exc()

print("\n---\n")

# Test accessing room_type properties
try:
    rooms = Room.objects.select_related('room_type').order_by('room_id')[:1]
    if rooms:
        room = rooms[0]
        print(f"✓ Successfully accessed room properties:")
        print(f"  - room.room_id: {room.room_id}")
        print(f"  - room.room_name: {room.room_name}")
        print(f"  - room.room_type: {room.room_type}")
        print(f"  - room.room_type_id: {room.room_type_id}")
        print(f"  - room.room_type.room_type_label: {room.room_type.room_type_label}")
    else:
        print("✓ No rooms found in database")
except Exception as e:
    print(f"✗ Error accessing room properties: {e}")
    import traceback
    traceback.print_exc()
