import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

def check_schema(table_name):
    with connection.cursor() as cursor:
        cursor.execute(f"""
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = '{table_name}'
        """)
        columns = cursor.fetchall()
        print(f"{table_name.capitalize()} table columns:")
        for col in columns:
            print(f"  {col}")

if __name__ == "__main__":
    check_schema('role')
    check_schema('person')
    check_schema('user_account')
