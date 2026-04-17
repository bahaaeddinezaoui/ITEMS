import os
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from django.db import connection

def create_location_relation_table():
    """Create the LOCATION_RELATION table in the PostgreSQL database"""
    try:
        with connection.cursor() as cursor:
            # Check if we can connect to the database
            cursor.execute('SELECT version()')
            db_version = cursor.fetchone()
            print(f'Successfully connected to PostgreSQL: {db_version[0]}')
            
            # Check if table already exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'location_relation'
                );
            """)
            table_exists = cursor.fetchone()[0]
            print(f'Location relation table exists: {table_exists}')
            
            if not table_exists:
                # Create the table
                cursor.execute("""
                    CREATE TABLE LOCATION_RELATION (
                        CHILD_LOCATION_ID int NOT NULL,
                        PARENT_LOCATION_ID int NOT NULL,
                        RELATION_ID int,
                        PRIMARY KEY (CHILD_LOCATION_ID, PARENT_LOCATION_ID),
                        CONSTRAINT FK_LOCATION_RELATION_CHILD_LOCATION
                            FOREIGN KEY (CHILD_LOCATION_ID)
                            REFERENCES LOCATION (LOCATION_ID)
                            ON DELETE CASCADE,
                        CONSTRAINT FK_LOCATION_RELATION_PARENT_LOCATION
                            FOREIGN KEY (PARENT_LOCATION_ID)
                            REFERENCES LOCATION (LOCATION_ID)
                            ON DELETE CASCADE
                    );
                """)
                print('Location relation table created successfully!')
                
                # Verify the table was created
                cursor.execute("""
                    SELECT COUNT(*) FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'location_relation'
                """)
                count = cursor.fetchone()[0]
                print(f'Table verification count: {count}')
                
            else:
                print('Location relation table already exists.')
                
                # Show table structure
                cursor.execute("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = 'location_relation'
                    ORDER BY ordinal_position;
                """)
                columns = cursor.fetchall()
                print('Table structure:')
                for col in columns:
                    print(f'  {col[0]}: {col[1]} (nullable: {col[2]}, default: {col[3]})')
                    
    except Exception as e:
        print(f'Database error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_location_relation_table()
