#!/usr/bin/env python3
"""Simple script to apply i18n migration."""

import os
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import django
django.setup()

from django.db import connection, transaction

SQL_FILE = os.path.join(
    os.path.dirname(__file__),
    'backend', 'api', 'migrations', '0013_add_i18n_translation_tables.sql'
)

print("Reading SQL file...")
with open(SQL_FILE, 'r', encoding='utf-8') as f:
    sql = f.read()

print(f"SQL file size: {len(sql)} characters")
print(f"Database: {connection.settings_dict['NAME']}")

print("\nExecuting migration...")
print("=" * 60)

success = 0
skipped = 0
errors = 0

statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]
print(f"Found {len(statements)} SQL statements")

try:
    with transaction.atomic():
        with connection.cursor() as cursor:
            for i, stmt in enumerate(statements):
                if not stmt:
                    continue
                try:
                    cursor.execute(stmt)
                    success += 1
                except Exception as e:
                    msg = str(e).lower()
                    if 'already exists' in msg or 'duplicate' in msg:
                        skipped += 1
                    else:
                        errors += 1
                        print(f"Error in statement {i}: {e}")
    
    print("\n" + "=" * 60)
    print("MIGRATION RESULTS:")
    print(f"  Successful: {success}")
    print(f"  Skipped (exists): {skipped}")
    print(f"  Errors: {errors}")
    print("=" * 60)
    
    if errors == 0:
        print("\n✓ Migration completed successfully!")
    else:
        print(f"\n⚠ Migration completed with {errors} errors")
    
except Exception as e:
    print(f"\n✗ Migration failed: {e}")
    sys.exit(1)

# Verify
print("\nVerifying tables...")
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%translation'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    print(f"Found {len(tables)} translation tables")
    for t in tables:
        print(f"  ✓ {t[0]}")
