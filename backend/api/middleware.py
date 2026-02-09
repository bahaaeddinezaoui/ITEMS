import datetime
import traceback
import os

class DebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.log_file = os.path.join(os.getcwd(), 'root_debug.log')

    def __call__(self, request):
        now = datetime.datetime.now()
        method = request.method
        path = request.path
        
        try:
            # Log request start
            with open(self.log_file, 'a') as f:
                f.write(f"[{now}] START {method} {path}\n")
                f.flush()

            response = self.get_response(request)
            
            # Log request end with status
            with open(self.log_file, 'a') as f:
                f.write(f"[{datetime.datetime.now()}] END   {method} {path} -> {response.status_code}\n")
                if not (200 <= response.status_code < 300):
                    try:
                        f.write(f"Response Body: {response.content[:500].decode()}\n")
                    except:
                        f.write(f"Response Body: [Binary or undecodable content]\n")
                f.flush()
            
            return response
        except Exception as e:
            # Log crash
            with open(self.log_file, 'a') as f:
                f.write(f"[{datetime.datetime.now()}] CRASH {method} {path} -> {str(e)}\n")
                f.write(traceback.format_exc())
                f.write("-" * 40 + "\n")
                f.flush()
            raise
