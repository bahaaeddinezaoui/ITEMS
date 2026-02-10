import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

def check_constraints():
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT conname, pg_get_constraintdef(oid) 
            FROM pg_constraint 
            WHERE conrelid = 'user_account'::regclass
        """)
        constraints = cursor.fetchall()
        print("UserAccount table constraints:")
        for con in constraints:
            print(f"  {con}")
        
        # Also check NOT NULL constraints specifically if they are not in pg_constraint
        cursor.execute("""
            SELECT column_name, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'user_account'
        """)
        cols = cursor.fetchall()
        print("\nColumn Nullability:")
        for col in cols:
            print(f"  {col}")

if __name__ == "__main__":
    check_constraints()
