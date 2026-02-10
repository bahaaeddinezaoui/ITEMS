from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from .models import UserAccount

class UserAccountJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """
        Custom get_user to look up the user in our custom UserAccount table.
        SimpleJWT by default looks in the standard auth_user table.
        """
        try:
            # SimpleJWT puts the user identifier in the claim specified by settings.USER_ID_CLAIM
            # We manually set 'user_id' in LoginView.
            user_id = validated_token.get('user_id')
            if not user_id:
                return None
                
            user = UserAccount.objects.get(user_id=user_id)
            
            # SimpleJWT expects an object that has is_authenticated = True
            # We add it dynamically if it doesn't exist to satisfy internal checks
            if not hasattr(user, 'is_authenticated'):
                user.is_authenticated = True
                
            return user
        except UserAccount.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found', code='user_not_found')
        except Exception as e:
            raise exceptions.AuthenticationFailed(str(e))
