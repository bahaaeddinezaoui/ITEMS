import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

def check():
    table = 'organizational_structure_relation'
    with connection.cursor() as cursor:
        print(f"\nColumns in {table}:")
        cursor.execute(f"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='{table}'")
        cols = cursor.fetchall()
        for col in cols:
            print(col)
        
        print("\nPrimary Keys:")
        cursor.execute(f"""
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_schema = 'public' AND tc.table_name = '{table}' AND tc.constraint_type = 'PRIMARY KEY'
        """)
        pks = cursor.fetchall()
        for pk in pks:
            print(pk)

if __name__ == "__main__":
    check()
