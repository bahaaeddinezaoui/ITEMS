import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Get room table columns
    cursor.execute("""
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'room' 
        ORDER BY ordinal_position
    """)
    print("Columns in 'room' table:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]} (nullable: {row[2]})")
    
    print("\nChecking for room_type table...")
    cursor.execute("""
        SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'room_type')
    """)
    print(f"room_type table exists: {cursor.fetchone()[0]}")
