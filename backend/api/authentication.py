from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from django.utils import timezone
from .models import UserAccount, UserSession

class UserAccountJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        
        # Check session validity
        session_id = validated_token.get('session_id')
        if session_id:
            try:
                session = UserSession.objects.get(session_id=session_id)
                if session.logout_datetime is not None:
                    raise exceptions.AuthenticationFailed('Session has been ended', code='session_ended')
                
                # Update last activity
                session.last_activity = timezone.now()
                session.save(update_fields=['last_activity'])
                
                # Attach session_id to request for context in serializers/views
                request.session_id = session_id
                
            except UserSession.DoesNotExist:
                raise exceptions.AuthenticationFailed('Session not found', code='session_not_found')

        user = self.get_user(validated_token)
        return user, validated_token

    def get_user(self, validated_token):
        """
        Custom get_user to look up the user in our custom UserAccount table.
        """
        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                return None
                
            user = UserAccount.objects.get(user_id=user_id)
            
            if not hasattr(user, 'is_authenticated'):
                user.is_authenticated = True
                
            return user
        except UserAccount.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found', code='user_not_found')
        except Exception as e:
            raise exceptions.AuthenticationFailed(str(e))
