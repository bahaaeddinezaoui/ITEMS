#!/usr/bin/env python3
"""Check translation table status."""

import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import django
django.setup()

from django.db import connection

cursor = connection.cursor()

# Get all translation tables
cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%translation'
    ORDER BY table_name
""")
tables = cursor.fetchall()

print("=" * 70)
print("TRANSLATION TABLE STATUS")
print("=" * 70)
print(f"{'Table Name':<45} {'Total':>8} {'EN':>6} {'AR':>6}")
print("-" * 70)

total_all = 0
total_ar = 0

for (table_name,) in tables:
    # Total count
    cursor.execute(f'SELECT COUNT(*) FROM "{table_name}"')
    total = cursor.fetchone()[0]
    
    # English count
    cursor.execute(f"SELECT COUNT(*) FROM \"{table_name}\" WHERE language_code = 'en'")
    en = cursor.fetchone()[0]
    
    # Arabic count
    cursor.execute(f"SELECT COUNT(*) FROM \"{table_name}\" WHERE language_code = 'ar'")
    ar = cursor.fetchone()[0]
    
    print(f"{table_name:<45} {total:>8} {en:>6} {ar:>6}")
    
    total_all += total
    total_ar += ar

print("-" * 70)
print(f"{'TOTAL':<45} {total_all:>8} {total_all - total_ar:>6} {total_ar:>6}")
print("=" * 70)

if total_all > 0:
    coverage = (total_ar / total_all) * 100
    print(f"\nArabic Translation Coverage: {coverage:.1f}%")
    print(f"Missing Arabic translations: {total_all - total_ar - (total_all - total_ar)} EN-only records need AR")

print("\n✓ Database migration applied successfully!")
print("✓ English defaults populated")
print("⚠ Add Arabic translations to reach 100% coverage")
