#!/usr/bin/env python3
"""Fixed script to apply i18n migration with proper error handling."""

import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import django
django.setup()

from django.db import connection

SQL_FILE = os.path.join(
    os.path.dirname(__file__),
    'backend', 'api', 'migrations', '0013_add_i18n_translation_tables.sql'
)

print("=" * 60)
print("I18N Migration Tool")
print("=" * 60)
print(f"Reading SQL file: {SQL_FILE}")

with open(SQL_FILE, 'r', encoding='utf-8') as f:
    sql = f.read()

print(f"SQL file size: {len(sql)} characters")
print(f"Database: {connection.settings_dict['NAME']}")

# Parse statements more carefully
print("\nParsing SQL statements...")
statements = []
current = []
in_string = False

for line in sql.split('\n'):
    line_stripped = line.strip()
    
    # Skip empty lines and comments
    if not line_stripped or line_stripped.startswith('--'):
        continue
    
    # Check for string literals (simple handling)
    for char in line_stripped:
        if char == "'":
            in_string = not in_string
    
    current.append(line_stripped)
    
    # Statement ends with semicolon (not inside string)
    if not in_string and line_stripped.endswith(';'):
        stmt = ' '.join(current)
        if stmt:
            statements.append(stmt)
        current = []

# Add any remaining statement
if current:
    stmt = ' '.join(current)
    if stmt:
        statements.append(stmt)

print(f"Parsed {len(statements)} SQL statements")
print("=" * 60)

# Execute without atomic transaction to allow individual statement errors
success = 0
skipped = 0
errors = 0
created_tables = []

with connection.cursor() as cursor:
    for i, stmt in enumerate(statements, 1):
        # Skip CREATE TYPE statements if types already exist
        if 'CREATE TYPE' in stmt.upper():
            try:
                cursor.execute(stmt)
                success += 1
                print(f"[{i:3d}] ✓ Created type")
            except Exception as e:
                if 'already exists' in str(e).lower():
                    skipped += 1
                    print(f"[{i:3d}] - Type already exists (skipped)")
                else:
                    errors += 1
                    print(f"[{i:3d}] ✗ Error: {str(e)[:80]}")
            continue
        
        # Handle CREATE TABLE
        if 'CREATE TABLE' in stmt.upper():
            try:
                cursor.execute(stmt)
                success += 1
                # Extract table name
                parts = stmt.upper().split('CREATE TABLE')[1].split('(')[0].strip()
                created_tables.append(parts.split()[-1])
                print(f"[{i:3d}] ✓ Created table")
            except Exception as e:
                if 'already exists' in str(e).lower():
                    skipped += 1
                    print(f"[{i:3d}] - Table already exists (skipped)")
                else:
                    errors += 1
                    print(f"[{i:3d}] ✗ Error: {str(e)[:80]}")
            continue
        
        # Handle CREATE INDEX
        if 'CREATE INDEX' in stmt.upper():
            try:
                cursor.execute(stmt)
                success += 1
            except Exception as e:
                if 'already exists' in str(e).lower():
                    skipped += 1
                else:
                    print(f"[{i:3d}] ✗ Index error: {str(e)[:80]}")
            continue
        
        # Handle INSERT statements
        if 'INSERT INTO' in stmt.upper():
            try:
                cursor.execute(stmt)
                success += 1
                print(f"[{i:3d}] ✓ Inserted data")
            except Exception as e:
                if 'duplicate key' in str(e).lower():
                    skipped += 1
                else:
                    errors += 1
                    print(f"[{i:3d}] ✗ Insert error: {str(e)[:80]}")
            continue
        
        # Default handling for other statements
        try:
            cursor.execute(stmt)
            success += 1
        except Exception as e:
            if 'already exists' in str(e).lower():
                skipped += 1
            else:
                errors += 1
                print(f"[{i:3d}] ✗ Error: {str(e)[:80]}")

print("\n" + "=" * 60)
print("MIGRATION RESULTS:")
print(f"  Successful: {success}")
print(f"  Skipped (exists): {skipped}")
print(f"  Errors: {errors}")
print("=" * 60)

# Verify tables exist
print("\nVerifying translation tables...")
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%translation'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    
    if tables:
        print(f"✓ Found {len(tables)} translation tables:")
        for t in tables:
            table_name = t[0]
            # Count rows
            try:
                cursor.execute(f'SELECT COUNT(*) FROM "{table_name}"')
                count = cursor.fetchone()[0]
                print(f"  - {table_name}: {count} rows")
            except:
                print(f"  - {table_name}: ? rows")
    else:
        print("✗ No translation tables found")

if errors == 0:
    print("\n✓ Migration completed successfully!")
else:
    print(f"\n⚠ Migration completed with {errors} errors")

print("\n" + "=" * 60)
print("Next steps:")
print("  cd backend")
print("  python manage.py translation_coverage")
print("=" * 60)
