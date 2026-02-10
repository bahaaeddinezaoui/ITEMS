import psycopg2

try:
    conn = psycopg2.connect('dbname=ems user=postgres password=postgres host=localhost')
    cur = conn.cursor()
    
    # Check if room_type table exists
    cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'room_type')")
    room_type_exists = cur.fetchone()[0]
    print(f"room_type table exists: {room_type_exists}")
    
    # Check room table columns
    cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'room' ORDER BY ordinal_position")
    print("\nColumns in room table:")
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]}")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
