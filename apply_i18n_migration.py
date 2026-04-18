#!/usr/bin/env python3
"""
Script to apply i18n translation tables migration directly to PostgreSQL.

This script reads the SQL migration file and executes it against the database.
It uses the Django database configuration for connection details.

Usage:
    python apply_i18n_migration.py
    python apply_i18n_migration.py --check  # Only verify connection
"""

import os
import sys
import argparse

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import django
django.setup()

from django.db import connection, transaction
from django.conf import settings


def apply_migration(check_only=False):
    """Apply the i18n migration SQL."""
    
    sql_file = os.path.join(
        os.path.dirname(__file__),
        'backend', 'api', 'migrations', '0013_add_i18n_translation_tables.sql'
    )
    
    if not os.path.exists(sql_file):
        print(f"ERROR: SQL file not found: {sql_file}")
        return False
    
    print(f"Found SQL file: {sql_file}")
    print(f"File size: {os.path.getsize(sql_file)} bytes")
    
    if check_only:
        print("\n✓ Connection check only - no changes made")
        return True
    
    # Read SQL
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    print(f"\nApplying migration to database: {settings.DATABASES['default']['NAME']}")
    print("=" * 60)
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    # Split into statements
    statements = []
    current_statement = []
    
    for line in sql_content.split('\n'):
        line = line.strip()
        
        # Skip comments and empty lines
        if not line or line.startswith('--'):
            continue
        
        current_statement.append(line)
        
        if line.endswith(';'):
            statements.append(' '.join(current_statement))
            current_statement = []
    
    print(f"Parsed {len(statements)} SQL statements")
    print("=" * 60)
    
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                for i, statement in enumerate(statements, 1):
                    try:
                        cursor.execute(statement)
                        success_count += 1
                        
                        if i % 10 == 0:
                            print(f"  Progress: {i}/{len(statements)} statements executed...")
                            
                    except Exception as e:
                        error_msg = str(e)
                        # Ignore "already exists" errors
                        if 'already exists' in error_msg.lower() or 'duplicate' in error_msg.lower():
                            skip_count += 1
                            print(f"  [SKIP] Statement {i}: Object already exists")
                        else:
                            error_count += 1
                            print(f"  [ERROR] Statement {i}: {error_msg[:100]}")
                            # Continue with other statements
        
        print("\n" + "=" * 60)
        print("MIGRATION COMPLETE!")
        print("=" * 60)
        print(f"  Successful: {success_count}")
        print(f"  Skipped (already exists): {skip_count}")
        print(f"  Errors: {error_count}")
        
        return error_count == 0
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        return False


def verify_tables():
    """Verify that translation tables were created."""
    print("\nVerifying translation tables...")
    print("=" * 60)
    
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
            for table in tables:
                # Check if table has data
                cursor.execute(f'SELECT COUNT(*) FROM {table[0]}')
                count = cursor.fetchone()[0]
                print(f"  - {table[0]}: {count} rows")
            return True
        else:
            print("✗ No translation tables found!")
            return False


def main():
    parser = argparse.ArgumentParser(description='Apply i18n migration to PostgreSQL')
    parser.add_argument('--check', action='store_true', help='Check connection only')
    parser.add_argument('--verify', action='store_true', help='Verify tables after migration')
    args = parser.parse_args()
    
    print("=" * 60)
    print("I18N Translation Tables Migration Tool")
    print("=" * 60)
    print(f"Database: {settings.DATABASES['default']['NAME']}")
    print(f"Host: {settings.DATABASES['default'].get('HOST', 'localhost')}")
    print(f"User: {settings.DATABASES['default'].get('USER', 'N/A')}")
    print("=" * 60)
    
    # Test connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✓ Database connection successful")
            print(f"  PostgreSQL version: {version.split()[1]}")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return 1
    
    if args.check:
        return 0
    
    # Apply migration
    if not apply_migration():
        return 1
    
    # Verify tables if requested
    if args.verify:
        verify_tables()
    
    print("\n" + "=" * 60)
    print("Next steps:")
    print("  1. Run: python manage.py translation_coverage")
    print("  2. Export template: python manage.py export_translation_template --all")
    print("  3. Add Arabic translations and import")
    print("=" * 60)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
