from waitress import serve
import os
import sys

# Add the backend folder to the path just in case
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the WSGI application from your ems project
from ems.wsgi import application

if __name__ == '__main__':
    print("--------------------------------------------------")
    print("  EQUIPMENT MANAGEMENT SYSTEM - BACKEND IS STARTING")
    print("  RUNNING ON: http://0.0.0.0:8000")
    print("  (Press Ctrl+C to stop)")
    print("--------------------------------------------------")
    
    # Waitress is a production WSGI server for Windows
    serve(application, host='0.0.0.0', port=8000, threads=4)
