from rest_framework import serializers
from .models import Person, UserAccount, Role


class PersonSerializer(serializers.ModelSerializer):
    """Serializer for Person model"""
    class Meta:
        model = Person
        fields = ['person_id', 'first_name', 'last_name', 'sex', 'birth_date', 'is_approved']
        read_only_fields = ['person_id']


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for Role model"""
    class Meta:
        model = Role
        fields = ['role_id', 'role_code', 'role_label', 'description']


class LoginSerializer(serializers.Serializer):
    """Serializer for login request"""
    username = serializers.CharField(max_length=20)
    password = serializers.CharField(max_length=128, write_only=True)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with roles"""
    person = PersonSerializer(read_only=True)
    is_superuser = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()

    class Meta:
        model = UserAccount
        fields = ['user_id', 'username', 'person', 'is_superuser', 'roles', 'last_login']

    def get_is_superuser(self, obj):
        return obj.is_superuser()

    def get_roles(self, obj):
        role_mappings = obj.get_roles()
        return [RoleSerializer(rm.role).data for rm in role_mappings]
