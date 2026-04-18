#!/usr/bin/env python
"""Check if translation tables exist in the database."""
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')

import django
django.setup()

from django.db import connection

def check_tables():
    with connection.cursor() as cursor:
        # Check for translation tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%translation%'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()
        
        print("=" * 60)
        print("TRANSLATION TABLES STATUS")
        print("=" * 60)
        
        if not tables:
            print("\nNo translation tables found in the database.")
            print("The SQL migration script needs to be run first.")
            print("\nFile to run: backend/migrations/i18n_translation_tables.sql")
            return False
        
        print(f"\nFound {len(tables)} translation tables:")
        for t in tables:
            table_name = t[0]
            try:
                cursor.execute(f'SELECT COUNT(*) FROM "{table_name}"')
                count = cursor.fetchone()[0]
                print(f"  - {table_name}: {count} records")
            except Exception as e:
                print(f"  - {table_name}: ERROR - {e}")
        
        return True

if __name__ == '__main__':
    exists = check_tables()
    sys.exit(0 if exists else 1)
