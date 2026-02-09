from django.db import models


class Person(models.Model):
    """Maps to person table"""
    person_id = models.AutoField(primary_key=True, db_column='person_id')
    first_name = models.CharField(max_length=48, db_column='first_name')
    last_name = models.CharField(max_length=48, db_column='last_name')
    sex = models.CharField(max_length=6, db_column='sex')
    birth_date = models.DateField(db_column='birth_date')
    is_approved = models.BooleanField(default=False, db_column='is_approved')

    class Meta:
        managed = False
        db_table = 'person'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Role(models.Model):
    """Maps to role table"""
    role_id = models.AutoField(primary_key=True, db_column='role_id')
    role_code = models.CharField(max_length=24, db_column='role_code')
    role_label = models.CharField(max_length=24, db_column='role_label')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')

    class Meta:
        managed = False
        db_table = 'role'

    def __str__(self):
        return self.role_label


class PersonRoleMapping(models.Model):
    """Maps to person_role_mapping table"""
    # Note: Composite primary key (role_id, person_id) not directly supported by Django
    # Using role_id as primary key placeholder since managed=False
    role = models.ForeignKey(Role, on_delete=models.CASCADE, db_column='role_id', primary_key=True)
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='person_id')

    class Meta:
        managed = False
        db_table = 'person_role_mapping'
        unique_together = (('role', 'person'),)


class UserAccount(models.Model):
    """Maps to user_account table"""
    user_id = models.AutoField(primary_key=True, db_column='user_id')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='person_id')
    username = models.CharField(max_length=20, unique=True, db_column='username')
    password_hash = models.CharField(max_length=512, db_column='password_hash')
    created_at_datetime = models.DateTimeField(db_column='created_at_datetime')
    disabled_at_datetime = models.DateTimeField(blank=True, null=True, db_column='disabled_at_datetime')
    last_login = models.DateTimeField(blank=True, null=True, db_column='last_login')
    account_status = models.CharField(max_length=24, db_column='account_status')
    failed_login_attempts = models.IntegerField(default=0, db_column='failed_login_attempts')
    password_last_changed_datetime = models.DateTimeField(db_column='password_last_changed_datetime')
    created_by_user_id = models.IntegerField(blank=True, null=True, db_column='created_by_user_id')
    modified_by_user_id = models.IntegerField(blank=True, null=True, db_column='modified_by_user_id')
    modified_at_datetime = models.DateTimeField(blank=True, null=True, db_column='modified_at_datetime')

    class Meta:
        managed = False
        db_table = 'user_account'

    def __str__(self):
        return self.username

    def get_roles(self):
        """Get all roles for this user's person"""
        return PersonRoleMapping.objects.filter(person=self.person).select_related('role')

    def is_superuser(self):
        """Check if user has superuser role"""
        return PersonRoleMapping.objects.filter(
            person=self.person,
            role__role_code='superuser'
        ).exists()
