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


class AssetType(models.Model):
    """Maps to asset_type table"""
    asset_type_id = models.AutoField(primary_key=True, db_column='asset_type_id')
    asset_type_label = models.CharField(max_length=60, db_column='asset_type_label')
    asset_type_code = models.CharField(max_length=18, db_column='asset_type_code')

    class Meta:
        managed = False
        db_table = 'asset_type'

    def __str__(self):
        return self.asset_type_label


class AssetBrand(models.Model):
    """Maps to asset_brand table"""
    asset_brand_id = models.AutoField(primary_key=True, db_column='asset_brand_id')
    brand_name = models.CharField(max_length=48, db_column='brand_name')
    brand_code = models.CharField(max_length=16, db_column='brand_code')
    is_active = models.BooleanField(db_column='is_active')

    class Meta:
        managed = False
        db_table = 'asset_brand'

    def __str__(self):
        return self.brand_name


class AssetModel(models.Model):
    """Maps to asset_model table"""
    asset_model_id = models.AutoField(primary_key=True, db_column='asset_model_id')
    asset_brand = models.ForeignKey(AssetBrand, on_delete=models.CASCADE, db_column='asset_brand_id')
    asset_type = models.ForeignKey(AssetType, on_delete=models.CASCADE, db_column='asset_type_id')
    model_name = models.CharField(max_length=48, blank=True, null=True, db_column='model_name')
    model_code = models.CharField(max_length=16, blank=True, null=True, db_column='model_code')
    release_year = models.IntegerField(blank=True, null=True, db_column='release_year')
    discontinued_year = models.IntegerField(blank=True, null=True, db_column='discontinued_year')
    is_active = models.BooleanField(default=True, db_column='is_active')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')
    warranty_expiry_in_months = models.IntegerField(blank=True, null=True, db_column='warranty_expiry_in_months')

    class Meta:
        managed = False
        db_table = 'asset_model'

    def __str__(self):
        return self.model_name


class StockItemType(models.Model):
    """Maps to stock_item_type table"""
    stock_item_type_id = models.AutoField(primary_key=True, db_column='stock_item_type_id')
    stock_item_type_label = models.CharField(max_length=60, db_column='stock_item_type_label')
    stock_item_type_code = models.CharField(max_length=18, db_column='stock_item_type_code')

    class Meta:
        managed = False
        db_table = 'stock_item_type'

    def __str__(self):
        return self.stock_item_type_label


class StockItemBrand(models.Model):
    """Maps to stock_item_brand table"""
    stock_item_brand_id = models.AutoField(primary_key=True, db_column='stock_item_brand_id')
    brand_name = models.CharField(max_length=48, db_column='brand_name')
    brand_code = models.CharField(max_length=16, db_column='brand_code')
    is_active = models.BooleanField(db_column='is_active')

    class Meta:
        managed = False
        db_table = 'stock_item_brand'

    def __str__(self):
        return self.brand_name


class StockItemModel(models.Model):
    """Maps to stock_item_model table"""
    stock_item_model_id = models.AutoField(primary_key=True, db_column='stock_item_model_id')
    stock_item_brand = models.ForeignKey(StockItemBrand, on_delete=models.CASCADE, db_column='stock_item_brand_id')
    stock_item_type = models.ForeignKey(StockItemType, on_delete=models.CASCADE, db_column='stock_item_type_id')
    model_name = models.CharField(max_length=48, blank=True, null=True, db_column='model_name')
    model_code = models.CharField(max_length=16, blank=True, null=True, db_column='model_code')
    release_year = models.IntegerField(blank=True, null=True, db_column='release_year')
    discontinued_year = models.IntegerField(blank=True, null=True, db_column='discontinued_year')
    is_active = models.BooleanField(default=True, db_column='is_active')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')
    warranty_expiry_in_months = models.IntegerField(blank=True, null=True, db_column='warranty_expiry_in_months')

    class Meta:
        managed = False
        db_table = 'stock_item_model'

    def __str__(self):
        return self.model_name


class ConsumableType(models.Model):
    """Maps to consumable_type table"""
    consumable_type_id = models.AutoField(primary_key=True, db_column='consumable_type_id')
    consumable_type_label = models.CharField(max_length=60, db_column='consumable_type_label')
    consumable_type_code = models.CharField(max_length=18, db_column='consumable_type_code')

    class Meta:
        managed = False
        db_table = 'consumable_type'

    def __str__(self):
        return self.consumable_type_label


class ConsumableBrand(models.Model):
    """Maps to consumable_brand table"""
    consumable_brand_id = models.AutoField(primary_key=True, db_column='consumable_brand_id')
    brand_name = models.CharField(max_length=48, db_column='brand_name')
    brand_code = models.CharField(max_length=16, db_column='brand_code')
    is_active = models.BooleanField(db_column='is_active')

    class Meta:
        managed = False
        db_table = 'consumable_brand'

    def __str__(self):
        return self.brand_name


class ConsumableModel(models.Model):
    """Maps to consumable_model table"""
    consumable_model_id = models.AutoField(primary_key=True, db_column='consumable_model_id')
    consumable_brand = models.ForeignKey(ConsumableBrand, on_delete=models.CASCADE, db_column='consumable_brand_id')
    consumable_type = models.ForeignKey(ConsumableType, on_delete=models.CASCADE, db_column='consumable_type_id')
    model_name = models.CharField(max_length=48, blank=True, null=True, db_column='model_name')
    model_code = models.CharField(max_length=16, blank=True, null=True, db_column='model_code')
    release_year = models.IntegerField(blank=True, null=True, db_column='release_year')
    discontinued_year = models.IntegerField(blank=True, null=True, db_column='discontinued_year')
    is_active = models.BooleanField(default=True, db_column='is_active')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')
    warranty_expiry_in_months = models.IntegerField(blank=True, null=True, db_column='warranty_expiry_in_months')

    class Meta:
        managed = False
        db_table = 'consumable_model'

    def __str__(self):
        return self.model_name


class RoomType(models.Model):
    """Maps to room_type table"""
    room_type_id = models.AutoField(primary_key=True, db_column='room_type_id')
    room_type_label = models.CharField(max_length=60, db_column='room_type_label')
    room_type_code = models.CharField(max_length=18, db_column='room_type_code')

    class Meta:
        managed = False
        db_table = 'room_type'

    def __str__(self):
        return self.room_type_label


class Room(models.Model):
    """Maps to room table"""
    room_id = models.AutoField(primary_key=True, db_column='room_id')
    room_name = models.CharField(max_length=30, db_column='room_name')
    room_type = models.CharField(max_length=24, db_column='room_type')

    class Meta:
        managed = False
        db_table = 'room'

    def __str__(self):
        return self.room_name


class Position(models.Model):
    """Maps to position table"""
    position_id = models.AutoField(primary_key=True, db_column='position_id')
    position_code = models.CharField(max_length=48, db_column='position_code')
    position_label = models.CharField(max_length=60, db_column='position_label')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')

    class Meta:
        managed = False
        db_table = 'position'

    def __str__(self):
        return self.position_label


class OrganizationalStructure(models.Model):
    """Maps to organizational_structure table"""
    organizational_structure_id = models.AutoField(primary_key=True, db_column='organizational_structure_id')
    structure_code = models.CharField(max_length=50, db_column='structure_code')
    structure_name = models.CharField(max_length=255, db_column='structure_name')
    structure_type = models.CharField(max_length=30, db_column='structure_type')
    is_active = models.BooleanField(db_column='is_active')

    class Meta:
        managed = False
        db_table = 'organizational_structure'

    def __str__(self):
        return self.structure_name


class OrganizationalStructureRelation(models.Model):
    """Maps to organizational_structure_relation table"""
    organizational_structure = models.ForeignKey(
        OrganizationalStructure,
        on_delete=models.CASCADE,
        db_column='organizational_structure_id',
        related_name='child_relations',
        primary_key=True
    )
    parent_organizational_structure = models.ForeignKey(
        OrganizationalStructure,
        on_delete=models.CASCADE,
        db_column='parent_organizational_structure_id',
        related_name='parent_relations'
    )
    relation_id = models.IntegerField(blank=True, null=True, db_column='relation_id')
    relation_type = models.CharField(max_length=60, blank=True, null=True, db_column='relation_type')

    class Meta:
        managed = False
        db_table = 'organizational_structure_relation'
        unique_together = (('organizational_structure', 'parent_organizational_structure'),)

    def __str__(self):
        return f"{self.organizational_structure.structure_name} -> {self.parent_organizational_structure.structure_name}"
