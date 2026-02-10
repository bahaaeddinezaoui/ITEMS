import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    try:
        # Get unique room types from existing room table
        cursor.execute("SELECT DISTINCT room_type FROM room WHERE room_type IS NOT NULL;")
        room_types = [row[0] for row in cursor.fetchall()]
        print(f"Found {len(room_types)} unique room types in existing data:")
        for rt in room_types:
            print(f"  - {rt}")
        
        # Create room_type table
        print("\nCreating room_type table...")
        cursor.execute("""
            CREATE TABLE room_type (
                room_type_id SERIAL PRIMARY KEY,
                room_type_label VARCHAR(60) NOT NULL,
                room_type_code VARCHAR(18) NOT NULL
            );
        """)
        
        # Insert room types with auto-generated IDs
        # We'll use the room_type value as both label and code
        for i, rt in enumerate(room_types, 1):
            label = rt
            code = rt[:18]  # Ensure code doesn't exceed max length
            cursor.execute(
                "INSERT INTO room_type (room_type_id, room_type_label, room_type_code) VALUES (%s, %s, %s);",
                (i, label, code)
            )
            print(f"  Inserted: ID={i}, Label={label}, Code={code}")
        
        # Create mapping to update room table
        print("\nMapping old room_type values to new IDs...")
        cursor.execute("SELECT room_type_id, room_type_code FROM room_type;")
        type_mapping = {row[1]: row[0] for row in cursor.fetchall()}
        print(f"Type mapping: {type_mapping}")
        
        # Add room_type_id column to room table if it doesn't exist
        cursor.execute("""
            ALTER TABLE room ADD COLUMN IF NOT EXISTS room_type_id INTEGER;
        """)
        print("Added room_type_id column to room table")
        
        # Update room_type_id based on old room_type values
        for old_type, new_id in type_mapping.items():
            cursor.execute(
                "UPDATE room SET room_type_id = %s WHERE room_type = %s;",
                (new_id, old_type)
            )
        print("Updated room.room_type_id values")
        
        # Add foreign key constraint
        print("Adding foreign key constraint...")
        cursor.execute("""
            ALTER TABLE room ADD CONSTRAINT fk_room_room_type 
            FOREIGN KEY (room_type_id) REFERENCES room_type(room_type_id);
        """)
        
        print("\nMigration complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
