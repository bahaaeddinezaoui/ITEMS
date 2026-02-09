import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

def check():
    with connection.cursor() as cursor:
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        tables = [t[0] for t in cursor.fetchall()]
        
        target_tables = ['person', 'user_account', 'role', 'person_role_mapping']
        actual_tables = [t for t in target_tables if t in tables]
        
        for table in actual_tables:
            print(f"\nColumns in {table}:")
            cursor.execute(f"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='{table}'")
            cols = cursor.fetchall()
            for col in cols:
                print(col)
        
        print("\nCheck Constraints:")
        cursor.execute("""
            SELECT tc.table_name, cc.check_clause
            FROM information_schema.table_constraints tc
            JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
            WHERE tc.table_schema = 'public' AND tc.constraint_type = 'CHECK'
        """)
        constraints = cursor.fetchall()
        for c in constraints:
            print(c)

if __name__ == "__main__":
    check()
