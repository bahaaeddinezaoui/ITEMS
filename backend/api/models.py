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
    role_code = models.CharField(max_length=60, db_column='role_code')
    role_label = models.CharField(max_length=60, db_column='role_label')
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

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_active(self):
        return self.account_status == 'active'

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
    brand_photo = models.CharField(max_length=512, blank=True, null=True, db_column='brand_photo')

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


class AssetModelDefaultStockItem(models.Model):
    """Maps to asset_model_default_stock_item table - defines default stock items included with an asset model"""
    id = models.AutoField(primary_key=True, db_column='id')
    asset_model = models.ForeignKey(AssetModel, on_delete=models.CASCADE, db_column='asset_model_id', related_name='default_stock_items')
    stock_item_model = models.ForeignKey('StockItemModel', on_delete=models.CASCADE, db_column='stock_item_model_id', related_name='default_for_asset_models')
    quantity = models.IntegerField(default=1, db_column='quantity')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')

    class Meta:
        managed = False
        db_table = 'asset_model_default_stock_item'

    def __str__(self):
        return f"{self.asset_model} includes {self.quantity}x {self.stock_item_model}"


class AssetModelDefaultConsumable(models.Model):
    """Maps to asset_model_default_consumable table - defines default consumables included with an asset model"""
    id = models.AutoField(primary_key=True, db_column='id')
    asset_model = models.ForeignKey(AssetModel, on_delete=models.CASCADE, db_column='asset_model_id', related_name='default_consumables')
    consumable_model = models.ForeignKey('ConsumableModel', on_delete=models.CASCADE, db_column='consumable_model_id', related_name='default_for_asset_models')
    quantity = models.IntegerField(default=1, db_column='quantity')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')

    class Meta:
        managed = False
        db_table = 'asset_model_default_consumable'

    def __str__(self):
        return f"{self.asset_model} includes {self.quantity}x {self.consumable_model}"


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
    brand_photo = models.CharField(max_length=512, blank=True, null=True, db_column='brand_photo')

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
    brand_photo = models.CharField(max_length=512, blank=True, null=True, db_column='brand_photo')

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
    room_type = models.ForeignKey(
        RoomType,
        on_delete=models.SET_NULL,
        db_column='room_type_id',
        null=True,
        blank=True,
    )

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


class Asset(models.Model):
    """Maps to asset table"""
    asset_id = models.AutoField(primary_key=True, db_column='asset_id')
    asset_model = models.ForeignKey(AssetModel, on_delete=models.CASCADE, db_column='asset_model_id')
    attribution_order = models.ForeignKey('AttributionOrder', on_delete=models.SET_NULL, db_column='attribution_order_id', null=True, blank=True)
    asset_serial_number = models.CharField(max_length=48, blank=True, null=True, db_column='asset_serial_number')
    asset_inventory_number = models.CharField(max_length=6, blank=True, null=True, db_column='asset_inventory_number')
    asset_name = models.CharField(max_length=48, blank=True, null=True, db_column='asset_name')
    asset_status = models.CharField(max_length=30, blank=True, null=True, db_column='asset_status')
    asset_service_tag = models.CharField(max_length=24, blank=True, null=True, db_column='asset_service_tag')

    class Meta:
        managed = False
        db_table = 'asset'

    def __str__(self):
        return self.asset_name or f'Asset {self.asset_id}'


class AssetAttributeDefinition(models.Model):
    """Maps to asset_attribute_definition table"""
    asset_attribute_definition_id = models.AutoField(primary_key=True, db_column='asset_attribute_definition_id')
    data_type = models.CharField(max_length=18, blank=True, null=True, db_column='data_type')
    unit = models.CharField(max_length=24, blank=True, null=True, db_column='unit')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')

    class Meta:
        managed = False
        db_table = 'asset_attribute_definition'

    def __str__(self):
        return f"Attr {self.asset_attribute_definition_id}" if self.description is None else self.description


class AssetTypeAttribute(models.Model):
    """Maps to asset_type_attribute table"""
    asset_attribute_definition = models.ForeignKey(
        AssetAttributeDefinition,
        on_delete=models.CASCADE,
        db_column='asset_attribute_definition_id',
        primary_key=True,
    )
    asset_type = models.ForeignKey(AssetType, on_delete=models.CASCADE, db_column='asset_type_id')
    is_mandatory = models.BooleanField(blank=True, null=True, db_column='is_mandatory')
    default_value = models.CharField(max_length=255, blank=True, null=True, db_column='default_value')

    class Meta:
        managed = False
        db_table = 'asset_type_attribute'
        unique_together = (('asset_attribute_definition', 'asset_type'),)


class AssetModelAttributeValue(models.Model):
    """Maps to asset_model_attribute_value table"""
    asset_model = models.ForeignKey(AssetModel, on_delete=models.CASCADE, db_column='asset_model_id', primary_key=True)
    asset_attribute_definition = models.ForeignKey(
        AssetAttributeDefinition,
        on_delete=models.CASCADE,
        db_column='asset_attribute_definition_id',
    )
    value_bool = models.BooleanField(blank=True, null=True, db_column='value_bool')
    value_string = models.CharField(max_length=1024, blank=True, null=True, db_column='value_string')
    value_number = models.DecimalField(max_digits=18, decimal_places=6, blank=True, null=True, db_column='value_number')
    value_date = models.DateField(blank=True, null=True, db_column='value_date')

    class Meta:
        managed = False
        db_table = 'asset_model_attribute_value'
        unique_together = (('asset_model', 'asset_attribute_definition'),)


class AssetAttributeValue(models.Model):
    """Maps to asset_attribute_value table"""
    asset_attribute_definition = models.ForeignKey(
        AssetAttributeDefinition,
        on_delete=models.CASCADE,
        db_column='asset_attribute_definition_id',
        primary_key=True,
    )
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, db_column='asset_id')
    value_string = models.CharField(max_length=1024, blank=True, null=True, db_column='value_string')
    value_bool = models.BooleanField(blank=True, null=True, db_column='value_bool')
    value_date = models.DateField(blank=True, null=True, db_column='value_date')
    value_number = models.DecimalField(max_digits=18, decimal_places=6, blank=True, null=True, db_column='value_number')

    class Meta:
        managed = False
        db_table = 'asset_attribute_value'
        unique_together = (('asset_attribute_definition', 'asset'),)


class StockItemAttributeDefinition(models.Model):
    """Maps to stock_item_attribute_definition table"""
    stock_item_attribute_definition_id = models.AutoField(primary_key=True, db_column='stock_item_attribute_definition_id')
    data_type = models.CharField(max_length=18, blank=True, null=True, db_column='data_type')
    unit = models.CharField(max_length=24, blank=True, null=True, db_column='unit')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')

    class Meta:
        managed = False
        db_table = 'stock_item_attribute_definition'

    def __str__(self):
        return f"StockAttr {self.stock_item_attribute_definition_id}" if self.description is None else self.description


class StockItemTypeAttribute(models.Model):
    """Maps to stock_item_type_attribute table"""
    stock_item_attribute_definition = models.ForeignKey(
        StockItemAttributeDefinition,
        on_delete=models.CASCADE,
        db_column='stock_item_attribute_definition_id',
        primary_key=True,
    )
    stock_item_type = models.ForeignKey(StockItemType, on_delete=models.CASCADE, db_column='stock_item_type_id')
    is_mandatory = models.BooleanField(blank=True, null=True, db_column='is_mandatory')
    default_value = models.CharField(max_length=255, blank=True, null=True, db_column='default_value')

    class Meta:
        managed = False
        db_table = 'stock_item_type_attribute'
        unique_together = (('stock_item_attribute_definition', 'stock_item_type'),)


class StockItemModelAttributeValue(models.Model):
    """Maps to stock_item_model_attribute_value table"""
    stock_item_model = models.ForeignKey(StockItemModel, on_delete=models.CASCADE, db_column='stock_item_model_id', primary_key=True)
    stock_item_attribute_definition = models.ForeignKey(
        StockItemAttributeDefinition,
        on_delete=models.CASCADE,
        db_column='stock_item_attribute_definition_id',
    )
    value_bool = models.BooleanField(blank=True, null=True, db_column='value_bool')
    value_string = models.CharField(max_length=1024, blank=True, null=True, db_column='value_string')
    value_number = models.DecimalField(max_digits=18, decimal_places=6, blank=True, null=True, db_column='value_number')
    value_date = models.DateField(blank=True, null=True, db_column='value_date')

    class Meta:
        managed = False
        db_table = 'stock_item_model_attribute_value'
        unique_together = (('stock_item_model', 'stock_item_attribute_definition'),)


class StockItemAttributeValue(models.Model):
    """Maps to stock_item_attribute_value table"""
    stock_item_attribute_definition = models.ForeignKey(
        StockItemAttributeDefinition,
        on_delete=models.CASCADE,
        db_column='stock_item_attribute_definition_id',
        primary_key=True,
    )
    stock_item = models.ForeignKey('StockItem', on_delete=models.CASCADE, db_column='stock_item_id')
    value_string = models.CharField(max_length=1024, blank=True, null=True, db_column='value_string')
    value_bool = models.BooleanField(blank=True, null=True, db_column='value_bool')
    value_date = models.DateField(blank=True, null=True, db_column='value_date')
    value_number = models.DecimalField(max_digits=18, decimal_places=6, blank=True, null=True, db_column='value_number')

    class Meta:
        managed = False
        db_table = 'stock_item_attribute_value'
        unique_together = (('stock_item_attribute_definition', 'stock_item'),)


class ConsumableAttributeDefinition(models.Model):
    """Maps to consumable_attribute_definition table"""
    consumable_attribute_definition_id = models.AutoField(primary_key=True, db_column='consumable_attribute_definition_id')
    data_type = models.CharField(max_length=18, blank=True, null=True, db_column='data_type')
    unit = models.CharField(max_length=24, blank=True, null=True, db_column='unit')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')

    class Meta:
        managed = False
        db_table = 'consumable_attribute_definition'

    def __str__(self):
        return f"ConsAttr {self.consumable_attribute_definition_id}" if self.description is None else self.description


class ConsumableTypeAttribute(models.Model):
    """Maps to consumable_type_attribute table"""
    consumable_attribute_definition = models.ForeignKey(
        ConsumableAttributeDefinition,
        on_delete=models.CASCADE,
        db_column='consumable_attribute_definition_id',
        primary_key=True,
    )
    consumable_type = models.ForeignKey(ConsumableType, on_delete=models.CASCADE, db_column='consumable_type_id')
    is_mandatory = models.BooleanField(blank=True, null=True, db_column='is_mandatory')
    default_value = models.CharField(max_length=255, blank=True, null=True, db_column='default_value')

    class Meta:
        managed = False
        db_table = 'consumable_type_attribute'
        unique_together = (('consumable_attribute_definition', 'consumable_type'),)


class ConsumableModelAttributeValue(models.Model):
    """Maps to consumable_model_attribute_value table"""
    consumable_model = models.ForeignKey(ConsumableModel, on_delete=models.CASCADE, db_column='consumable_model_id', primary_key=True)
    consumable_attribute_definition = models.ForeignKey(
        ConsumableAttributeDefinition,
        on_delete=models.CASCADE,
        db_column='consumable_attribute_definition_id',
    )
    value_bool = models.BooleanField(blank=True, null=True, db_column='value_bool')
    value_string = models.CharField(max_length=1024, blank=True, null=True, db_column='value_string')
    value_number = models.DecimalField(max_digits=18, decimal_places=6, blank=True, null=True, db_column='value_number')
    value_date = models.DateField(blank=True, null=True, db_column='value_date')

    class Meta:
        managed = False
        db_table = 'consumable_model_attribute_value'
        unique_together = (('consumable_model', 'consumable_attribute_definition'),)


class ConsumableAttributeValue(models.Model):
    """Maps to consumable_attribute_value table"""
    consumable_attribute_definition = models.ForeignKey(
        ConsumableAttributeDefinition,
        on_delete=models.CASCADE,
        db_column='consumable_attribute_definition_id',
        primary_key=True,
    )
    consumable = models.ForeignKey('Consumable', on_delete=models.CASCADE, db_column='consumable_id')
    value_string = models.CharField(max_length=1024, blank=True, null=True, db_column='value_string')
    value_bool = models.BooleanField(blank=True, null=True, db_column='value_bool')
    value_date = models.DateField(blank=True, null=True, db_column='value_date')
    value_number = models.DecimalField(max_digits=18, decimal_places=6, blank=True, null=True, db_column='value_number')

    class Meta:
        managed = False
        db_table = 'consumable_attribute_value'
        unique_together = (('consumable_attribute_definition', 'consumable'),)


class AssetIsAssignedToPerson(models.Model):
    """Maps to asset_is_assigned_to_person table"""
    assignment_id = models.AutoField(primary_key=True, db_column='assignment_id')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='person_id')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, db_column='asset_id')
    assigned_by_person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='assigned_by_person_id', related_name='asset_assignments_given')
    start_datetime = models.DateTimeField(db_column='start_datetime')
    end_datetime = models.DateTimeField(db_column='end_datetime', null=True, blank=True)
    condition_on_assignment = models.CharField(max_length=48, db_column='condition_on_assignment')
    is_active = models.BooleanField(db_column='is_active')
    is_confirmed_by_exploitation_chief = models.ForeignKey(
        Person,
        on_delete=models.SET_NULL,
        db_column='is_confirmed_by_exploitation_chief_id',
        null=True,
        blank=True,
        related_name='confirmed_asset_assignments'
    )

    class Meta:
        managed = False
        db_table = 'asset_is_assigned_to_person'

    def __str__(self):
        return f'Asset {self.asset_id} assigned to {self.person}'


class StockItem(models.Model):
    """Maps to stock_item table"""
    stock_item_id = models.AutoField(primary_key=True, db_column='stock_item_id')
    stock_item_model = models.ForeignKey(StockItemModel, on_delete=models.CASCADE, db_column='stock_item_model_id')
    stock_item_inventory_number = models.CharField(max_length=6, blank=True, null=True, db_column='stock_item_inventory_number')
    stock_item_name = models.CharField(max_length=48, blank=True, null=True, db_column='stock_item_name')
    stock_item_status = models.CharField(max_length=30, blank=True, null=True, db_column='stock_item_status')

    class Meta:
        managed = False
        db_table = 'stock_item'

    def __str__(self):
        return self.stock_item_name or f'Stock Item {self.stock_item_id}'


class StockItemIsAssignedToPerson(models.Model):
    """Maps to stock_item_is_assigned_to_person table"""
    assignment_id = models.AutoField(primary_key=True, db_column='assignment_id')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='person_id')
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE, db_column='stock_item_id')
    assigned_by_person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='assigned_by_person_id', related_name='stock_item_assignments_given')
    start_datetime = models.DateTimeField(db_column='start_datetime')
    end_datetime = models.DateTimeField(db_column='end_datetime', null=True, blank=True)
    condition_on_assignment = models.CharField(max_length=48, db_column='condition_on_assignment')
    is_active = models.BooleanField(db_column='is_active')
    is_confirmed_by_exploitation_chief = models.ForeignKey(
        Person,
        on_delete=models.SET_NULL,
        db_column='is_confirmed_by_exploitation_chief_id',
        null=True,
        blank=True,
        related_name='confirmed_stock_item_assignments'
    )

    class Meta:
        managed = False
        db_table = 'stock_item_is_assigned_to_person'

    def __str__(self):
        return f'Stock Item {self.stock_item_id} assigned to {self.person}'


class Consumable(models.Model):
    """Maps to consumable table"""
    consumable_id = models.AutoField(primary_key=True, db_column='consumable_id')
    consumable_model = models.ForeignKey(ConsumableModel, on_delete=models.CASCADE, db_column='consumable_model_id')
    consumable_serial_number = models.CharField(max_length=48, blank=True, null=True, db_column='consumable_serial_number')
    consumable_inventory_number = models.CharField(max_length=6, blank=True, null=True, db_column='consumable_inventory_number')
    consumable_name = models.CharField(max_length=48, blank=True, null=True, db_column='consumable_name')
    consumable_status = models.CharField(max_length=30, blank=True, null=True, db_column='consumable_status')

    class Meta:
        managed = False
        db_table = 'consumable'

    def __str__(self):
        return self.consumable_name or f'Consumable {self.consumable_id}'


class ConsumableIsAssignedToPerson(models.Model):
    """Maps to consumable_is_assigned_to_person table"""
    assignment_id = models.AutoField(primary_key=True, db_column='assignment_id')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='person_id')
    consumable = models.ForeignKey(Consumable, on_delete=models.CASCADE, db_column='consumable_id')
    assigned_by_person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='assigned_by_person_id', related_name='consumable_assignments_given')
    start_datetime = models.DateTimeField(db_column='start_datetime')
    end_datetime = models.DateTimeField(db_column='end_datetime', null=True, blank=True)
    condition_on_assignment = models.CharField(max_length=48, db_column='condition_on_assignment')
    is_active = models.BooleanField(db_column='is_active')
    is_confirmed_by_exploitation_chief = models.ForeignKey(
        Person,
        on_delete=models.SET_NULL,
        db_column='is_confirmed_by_exploitation_chief_id',
        null=True,
        blank=True,
        related_name='confirmed_consumable_assignments'
    )

    class Meta:
        managed = False
        db_table = 'consumable_is_assigned_to_person'

    def __str__(self):
        return f'Consumable {self.consumable_id} assigned to {self.person}'


class PersonReportsProblemOnAsset(models.Model):
    """Maps to person_reports_problem_on_asset table"""
    report_id = models.IntegerField(primary_key=True, db_column='report_id')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, db_column='asset_id')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='person_id')
    report_datetime = models.DateTimeField(db_column='report_datetime')
    owner_observation = models.CharField(max_length=256, db_column='owner_observation')

    class Meta:
        managed = False
        db_table = 'person_reports_problem_on_asset'

    def __str__(self):
        return f'Problem report on asset {self.asset_id} by {self.person}'


class PersonReportsProblemOnStockItem(models.Model):
    """Maps to person_reports_problem_on_stock_item table"""
    report_id = models.IntegerField(primary_key=True, db_column='report_id')
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE, db_column='stock_item_id')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='person_id')
    report_datetime = models.DateTimeField(db_column='report_datetime')
    owner_observation = models.CharField(max_length=256, db_column='owner_observation')

    class Meta:
        managed = False
        db_table = 'person_reports_problem_on_stock_item'

    def __str__(self):
        return f'Problem report on stock item {self.stock_item_id} by {self.person}'


class PersonReportsProblemOnConsumable(models.Model):
    """Maps to person_reports_problem_on_consumable table"""
    report_id = models.IntegerField(primary_key=True, db_column='report_id')
    consumable = models.ForeignKey(Consumable, on_delete=models.CASCADE, db_column='consumable_id')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='person_id')
    report_datetime = models.DateTimeField(db_column='report_datetime')
    owner_observation = models.CharField(max_length=256, db_column='owner_observation')

    class Meta:
        managed = False
        db_table = 'person_reports_problem_on_consumable'

    def __str__(self):
        return f'Problem report on consumable {self.consumable_id} by {self.person}'


class MaintenanceTypicalStep(models.Model):
    """Maps to maintenance_typical_step table"""
    maintenance_typical_step_id = models.AutoField(primary_key=True, db_column='maintenance_typical_step_id')
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_column='estimated_cost')
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_column='actual_cost')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')
    maintenance_type = models.CharField(max_length=8, blank=True, null=True, db_column='maintenance_type')
    operation_type = models.CharField(max_length=24, blank=True, null=True, db_column='operation_type')

    class Meta:
        managed = False
        db_table = 'maintenance_typical_step'

    def __str__(self):
        return f'Step {self.maintenance_typical_step_id}'


class Maintenance(models.Model):
    """Maps to maintenance table"""
    maintenance_id = models.IntegerField(primary_key=True, db_column='maintenance_id')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, db_column='asset_id')
    performed_by_person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='performed_by_person_id', related_name='maintenance_performed')
    approved_by_maintenance_chief = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='approved_by_maintenance_chief_id', related_name='maintenance_approved')
    is_approved_by_maintenance_chief = models.BooleanField(blank=True, null=True, db_column='is_approved_by_maintenance_chief')
    maintenance_status = models.CharField(max_length=20, blank=True, null=True, db_column='maintenance_status')
    start_datetime = models.DateTimeField(blank=True, null=True, db_column='start_datetime')
    end_datetime = models.DateTimeField(blank=True, null=True, db_column='end_datetime')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')
    is_successful = models.BooleanField(blank=True, null=True, db_column='is_successful')
    digital_copy = models.BinaryField(blank=True, null=True, db_column='digital_copy')

    class Meta:
        managed = False
        db_table = 'maintenance'

    def __str__(self):
        return f'Maintenance {self.maintenance_id} on asset {self.asset_id}'


class MaintenanceStep(models.Model):
    """Maps to maintenance_step table"""
    maintenance_step_id = models.IntegerField(primary_key=True, db_column='maintenance_step_id')
    maintenance = models.ForeignKey(Maintenance, on_delete=models.CASCADE, db_column='maintenance_id', related_name='steps')
    maintenance_typical_step = models.ForeignKey(MaintenanceTypicalStep, on_delete=models.CASCADE, db_column='maintenance_typical_step_id')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='person_id')
    is_successful = models.BooleanField(default=False, db_column='is_successful')
    start_datetime = models.DateTimeField(blank=True, null=True, db_column='start_datetime')
    end_datetime = models.DateTimeField(blank=True, null=True, db_column='end_datetime')
    maintenance_step_status = models.CharField(max_length=60, blank=True, null=True, db_column='maintenance_step_status')
    asset_condition_history = models.IntegerField(blank=True, null=True, db_column='asset_condition_history_id')
    stock_item_condition_history = models.IntegerField(blank=True, null=True, db_column='stock_item_condition_history_id')
    consumable_condition_history = models.IntegerField(blank=True, null=True, db_column='consumable_condition_history_id')

    class Meta:
        managed = False
        db_table = 'maintenance_step'

    def __str__(self):
        return f'Step {self.maintenance_step_id} for maintenance {self.maintenance_id}'


class MaintenanceStepAttributeChange(models.Model):
    maintenance_step_attribute_change_id = models.BigAutoField(primary_key=True, db_column='maintenance_step_attribute_change_id')
    maintenance_step = models.ForeignKey(
        MaintenanceStep,
        on_delete=models.CASCADE,
        db_column='maintenance_step_id',
        related_name='attribute_changes',
    )
    target_type = models.CharField(max_length=20, db_column='target_type')
    target_id = models.IntegerField(blank=True, null=True, db_column='target_id')
    attribute_definition_id = models.IntegerField(db_column='attribute_definition_id')
    value_string = models.CharField(max_length=1024, blank=True, null=True, db_column='value_string')
    value_bool = models.BooleanField(blank=True, null=True, db_column='value_bool')
    value_date = models.DateField(blank=True, null=True, db_column='value_date')
    value_number = models.DecimalField(max_digits=18, decimal_places=6, blank=True, null=True, db_column='value_number')
    created_at_datetime = models.DateTimeField(auto_now_add=True, db_column='created_at_datetime')
    created_by_user_id = models.IntegerField(blank=True, null=True, db_column='created_by_user_id')
    applied_at_datetime = models.DateTimeField(blank=True, null=True, db_column='applied_at_datetime')

    class Meta:
        db_table = 'maintenance_step_attribute_change'

    def __str__(self):
        return f"StepAttrChange {self.maintenance_step_attribute_change_id} ({self.target_type})"


class StockItemIsCompatibleWithAsset(models.Model):
    """Maps to stock_item_is_compatible_with_asset table"""
    stock_item_model = models.ForeignKey(
        StockItemModel,
        on_delete=models.CASCADE,
        db_column='stock_item_model_id',
        primary_key=True,
        related_name='+',
    )
    asset_model = models.ForeignKey(
        AssetModel,
        on_delete=models.CASCADE,
        db_column='asset_model_id',
        related_name='+',
    )

    class Meta:
        managed = False
        db_table = 'stock_item_is_compatible_with_asset'
        unique_together = (('stock_item_model', 'asset_model'),)


class ConsumableIsCompatibleWithAsset(models.Model):
    """Maps to consumable_is_compatible_with_asset table"""
    consumable_model = models.ForeignKey(
        ConsumableModel,
        on_delete=models.CASCADE,
        db_column='consumable_model_id',
        primary_key=True,
        related_name='+',
    )
    asset_model = models.ForeignKey(
        AssetModel,
        on_delete=models.CASCADE,
        db_column='asset_model_id',
        related_name='+',
    )

    class Meta:
        managed = False
        db_table = 'consumable_is_compatible_with_asset'
        unique_together = (('consumable_model', 'asset_model'),)


class AssetIsComposedOfStockItemHistory(models.Model):
    """Maps to asset_is_composed_of_stock_item_history table"""
    id = models.AutoField(primary_key=True, db_column='id')
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE, db_column='stock_item_id', related_name='composition_history')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, db_column='asset_id', related_name='stock_item_composition_history')
    maintenance_step = models.ForeignKey(MaintenanceStep, on_delete=models.CASCADE, db_column='maintenance_step_id', related_name='+', blank=True, null=True)
    attribution_order = models.ForeignKey('AttributionOrder', on_delete=models.CASCADE, db_column='attribution_order_id', related_name='stock_item_composition_history', blank=True, null=True)
    start_datetime = models.DateTimeField(blank=True, null=True, db_column='start_datetime')
    end_datetime = models.DateTimeField(blank=True, null=True, db_column='end_datetime')

    class Meta:
        managed = False
        db_table = 'asset_is_composed_of_stock_item_history'


class AssetIsComposedOfConsumableHistory(models.Model):
    """Maps to asset_is_composed_of_consumable_history table"""
    id = models.AutoField(primary_key=True, db_column='id')
    consumable = models.ForeignKey(Consumable, on_delete=models.CASCADE, db_column='consumable_id', related_name='composition_history')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, db_column='asset_id', related_name='consumable_composition_history')
    maintenance_step = models.ForeignKey(MaintenanceStep, on_delete=models.CASCADE, db_column='maintenance_step_id', related_name='+', blank=True, null=True)
    attribution_order = models.ForeignKey('AttributionOrder', on_delete=models.CASCADE, db_column='attribution_order_id', related_name='consumable_composition_history', blank=True, null=True)
    start_datetime = models.DateTimeField(blank=True, null=True, db_column='start_datetime')
    end_datetime = models.DateTimeField(blank=True, null=True, db_column='end_datetime')

    class Meta:
        managed = False
        db_table = 'asset_is_composed_of_consumable_history'


class ConsumableIsUsedInStockItemHistory(models.Model):
    """Maps to consumable_is_used_in_stock_item_history table"""
    id = models.AutoField(primary_key=True, db_column='id')
    consumable = models.ForeignKey(Consumable, on_delete=models.CASCADE, db_column='consumable_id', related_name='stock_item_usage_history')
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE, db_column='stock_item_id', related_name='consumable_usage_history')
    maintenance_step = models.ForeignKey(MaintenanceStep, on_delete=models.CASCADE, db_column='maintenance_step_id', related_name='+', blank=True, null=True)
    attribution_order = models.ForeignKey('AttributionOrder', on_delete=models.CASCADE, db_column='attribution_order_id', related_name='consumable_usage_history', blank=True, null=True)
    start_datetime = models.DateTimeField(blank=True, null=True, db_column='start_datetime')
    end_datetime = models.DateTimeField(blank=True, null=True, db_column='end_datetime')

    class Meta:
        managed = False
        db_table = 'consumable_is_used_in_stock_item_history'


class AssetMovement(models.Model):
    """Maps to asset_movement table"""
    asset_movement_id = models.IntegerField(primary_key=True, db_column='asset_movement_id')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, db_column='asset_id', related_name='+')
    source_room = models.ForeignKey(Room, on_delete=models.CASCADE, db_column='source_room_id', related_name='+')
    destination_room = models.ForeignKey(Room, on_delete=models.CASCADE, db_column='destination_room_id', related_name='+')
    maintenance_step = models.ForeignKey(
        MaintenanceStep,
        on_delete=models.SET_NULL,
        db_column='maintenance_step_id',
        null=True,
        blank=True,
        related_name='+',
    )
    external_maintenance_step_id = models.IntegerField(blank=True, null=True, db_column='external_maintenance_step_id')
    movement_reason = models.CharField(max_length=128, db_column='movement_reason')
    movement_datetime = models.DateTimeField(db_column='movement_datetime')

    class Meta:
        managed = False
        db_table = 'asset_movement'


class StockItemMovement(models.Model):
    """Maps to stock_item_movement table"""
    stock_item_movement_id = models.IntegerField(primary_key=True, db_column='stock_item_movement_id')
    stock_item = models.ForeignKey(StockItem, on_delete=models.CASCADE, db_column='stock_item_id', related_name='+')
    source_room = models.ForeignKey(Room, on_delete=models.CASCADE, db_column='source_room_id', related_name='+')
    destination_room = models.ForeignKey(Room, on_delete=models.CASCADE, db_column='destination_room_id', related_name='+')
    maintenance_step = models.ForeignKey(MaintenanceStep, on_delete=models.SET_NULL, db_column='maintenance_step_id', null=True, blank=True, related_name='+')
    external_maintenance_step_id = models.IntegerField(blank=True, null=True, db_column='external_maintenance_step_id')
    movement_reason = models.CharField(max_length=128, db_column='movement_reason')
    movement_datetime = models.DateTimeField(db_column='movement_datetime')

    class Meta:
        managed = False
        db_table = 'stock_item_movement'


class ConsumableMovement(models.Model):
    """Maps to consumable_movement table"""
    consumable_movement_id = models.IntegerField(primary_key=True, db_column='consumable_movement_id')
    destination_room = models.ForeignKey(Room, on_delete=models.CASCADE, db_column='destination_room_id', related_name='+')
    source_room = models.ForeignKey(Room, on_delete=models.CASCADE, db_column='source_room_id', related_name='+')
    maintenance_step = models.ForeignKey(MaintenanceStep, on_delete=models.SET_NULL, db_column='maintenance_step_id', null=True, blank=True, related_name='+')
    external_maintenance_step_id = models.IntegerField(blank=True, null=True, db_column='external_maintenance_step_id')
    consumable = models.ForeignKey(Consumable, on_delete=models.CASCADE, db_column='consumable_id', related_name='+')
    movement_reason = models.CharField(max_length=128, db_column='movement_reason')
    movement_datetime = models.DateTimeField(db_column='movement_datetime')

    class Meta:
        managed = False
        db_table = 'consumable_movement'


class PhysicalCondition(models.Model):
    """Maps to physical_condition table"""
    condition_id = models.IntegerField(primary_key=True, db_column='condition_id')
    condition_code = models.CharField(max_length=12, blank=True, null=True, db_column='condition_code')
    condition_label = models.CharField(max_length=12, blank=True, null=True, db_column='condition_label')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')

    class Meta:
        managed = False
        db_table = 'physical_condition'


class AssetConditionHistory(models.Model):
    """Maps to asset_condition_history table"""
    asset_condition_history_id = models.IntegerField(primary_key=True, db_column='asset_condition_history_id')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, db_column='asset_id', related_name='+')
    condition = models.ForeignKey(PhysicalCondition, on_delete=models.CASCADE, db_column='condition_id', related_name='+')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')
    cosmetic_issues = models.CharField(max_length=128, blank=True, null=True, db_column='cosmetic_issues')
    functional_issues = models.CharField(max_length=128, blank=True, null=True, db_column='functional_issues')
    recommendation = models.CharField(max_length=128, blank=True, null=True, db_column='recommendation')
    created_at = models.DateTimeField(blank=True, null=True, db_column='created_at')

    class Meta:
        managed = False
        db_table = 'asset_condition_history'


class MaintenanceStepItemRequest(models.Model):
    """New table: maintenance_step_item_request"""
    maintenance_step_item_request_id = models.IntegerField(primary_key=True, db_column='maintenance_step_item_request_id')
    maintenance_step = models.ForeignKey(MaintenanceStep, on_delete=models.CASCADE, db_column='maintenance_step_id', related_name='+')
    requested_by_person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='requested_by_person_id', related_name='+')
    fulfilled_by_person = models.ForeignKey(Person, on_delete=models.SET_NULL, db_column='fulfilled_by_person_id', null=True, blank=True, related_name='+')
    rejected_by_person = models.ForeignKey(Person, on_delete=models.SET_NULL, db_column='rejected_by_person_id', null=True, blank=True, related_name='+')
    request_type = models.CharField(max_length=24, db_column='request_type')
    status = models.CharField(max_length=24, db_column='status')
    created_at = models.DateTimeField(db_column='created_at')
    fulfilled_at = models.DateTimeField(blank=True, null=True, db_column='fulfilled_at')
    rejected_at = models.DateTimeField(blank=True, null=True, db_column='rejected_at')
    requested_stock_item_model = models.ForeignKey(StockItemModel, on_delete=models.SET_NULL, db_column='requested_stock_item_model_id', null=True, blank=True, related_name='+')
    requested_consumable_model = models.ForeignKey(ConsumableModel, on_delete=models.SET_NULL, db_column='requested_consumable_model_id', null=True, blank=True, related_name='+')
    stock_item = models.ForeignKey(StockItem, on_delete=models.SET_NULL, db_column='stock_item_id', null=True, blank=True, related_name='+')
    consumable = models.ForeignKey(Consumable, on_delete=models.SET_NULL, db_column='consumable_id', null=True, blank=True, related_name='+')
    source_room = models.ForeignKey(Room, on_delete=models.SET_NULL, db_column='source_room_id', null=True, blank=True, related_name='+')
    destination_room = models.ForeignKey(Room, on_delete=models.SET_NULL, db_column='destination_room_id', null=True, blank=True, related_name='+')
    note = models.CharField(max_length=256, blank=True, null=True, db_column='note')

    class Meta:
        managed = False
        db_table = 'maintenance_step_item_request'


class Warehouse(models.Model):
    """Maps to warehouse table"""
    warehouse_id = models.AutoField(primary_key=True, db_column='warehouse_id')
    warehouse_name = models.CharField(max_length=60, db_column='warehouse_name', blank=True, null=True)
    warehouse_address = models.CharField(max_length=128, db_column='warehouse_address', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'warehouse'

    def __str__(self):
        return self.warehouse_name or f"Warehouse {self.warehouse_id}"


class AttributionOrder(models.Model):
    """Maps to attribution_order table"""
    attribution_order_id = models.AutoField(primary_key=True, db_column='attribution_order_id')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, db_column='warehouse_id')
    attribution_order_full_code = models.CharField(max_length=48, db_column='attribution_order_full_code', blank=True, null=True)
    attribution_order_date = models.DateField(db_column='attribution_order_date', blank=True, null=True)
    is_signed_by_central_chief = models.BooleanField(db_column='is_signed_by_central_chief', default=False)
    attribution_order_barcode = models.CharField(max_length=24, db_column='attribution_order_barcode', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'attribution_order'

    def __str__(self):
        return self.attribution_order_full_code or f"Order {self.attribution_order_id}"


class ReceiptReport(models.Model):
    """Maps to receipt_report table"""
    receipt_report_id = models.AutoField(primary_key=True, db_column='receipt_report_id')
    report_datetime = models.DateTimeField(db_column='report_datetime', blank=True, null=True, auto_now_add=True)
    report_full_code = models.CharField(max_length=48, db_column='report_full_code', blank=True, null=True)
    digital_copy = models.BinaryField(db_column='digital_copy', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'receipt_report'

    def __str__(self):
        return self.report_full_code or f"Receipt Report {self.receipt_report_id}"


class ExternalMaintenanceProvider(models.Model):
    external_maintenance_provider_id = models.IntegerField(primary_key=True, db_column='external_maintenance_provider_id')
    external_maintenance_provider_name = models.CharField(max_length=48, blank=True, null=True, db_column='external_maintenance_provider_name')
    external_maintenance_provider_location = models.CharField(max_length=128, blank=True, null=True, db_column='external_maintenance_provider_location')

    class Meta:
        managed = False
        db_table = 'external_maintenance_provider'

    def __str__(self):
        return self.external_maintenance_provider_name or f"Provider {self.external_maintenance_provider_id}"


class ExternalMaintenance(models.Model):
    external_maintenance_id = models.IntegerField(primary_key=True, db_column='external_maintenance_id')
    maintenance = models.ForeignKey('Maintenance', on_delete=models.CASCADE, db_column='maintenance_id', related_name='+')
    external_maintenance_provider = models.ForeignKey(
        ExternalMaintenanceProvider,
        on_delete=models.SET_NULL,
        db_column='external_maintenance_provider_id',
        null=True,
        blank=True,
        related_name='+',
    )
    external_maintenance_status = models.CharField(
        max_length=32,
        blank=True,
        null=True,
        db_column='external_maintenance_status',
    )
    item_received_by_maintenance_provider_datetime = models.DateTimeField(blank=True, null=True, db_column='item_received_by_maintenance_provider_datetime')
    item_sent_to_company_datetime = models.DateTimeField(blank=True, null=True, db_column='item_sent_to_company_datetime')
    item_sent_to_external_maintenance_datetime = models.DateTimeField(blank=True, null=True, db_column='item_sent_to_external_maintenance_datetime')
    item_received_by_company_datetime = models.DateTimeField(blank=True, null=True, db_column='item_received_by_company_datetime')

    class Meta:
        managed = False
        db_table = 'external_maintenance'


class ExternalMaintenanceTypicalStep(models.Model):
    external_maintenance_typical_step_id = models.IntegerField(primary_key=True, db_column='external_maintenance_typical_step_id')
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_column='estimated_cost')
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, db_column='actual_cost')
    maintenance_type = models.CharField(max_length=8, blank=True, null=True, db_column='maintenance_type')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')

    class Meta:
        managed = False
        db_table = 'external_maintenance_typical_step'


class ExternalMaintenanceStep(models.Model):
    external_maintenance_step_id = models.IntegerField(primary_key=True, db_column='external_maintenance_step_id')
    external_maintenance = models.ForeignKey(
        ExternalMaintenance,
        on_delete=models.CASCADE,
        db_column='external_maintenance_id',
        related_name='+',
    )
    external_maintenance_typical_step = models.ForeignKey(
        ExternalMaintenanceTypicalStep,
        on_delete=models.CASCADE,
        db_column='external_maintenance_typical_step_id',
        related_name='+',
    )
    start_datetime = models.DateTimeField(blank=True, null=True, db_column='start_datetime')
    end_datetime = models.DateTimeField(blank=True, null=True, db_column='end_datetime')
    is_successful = models.BooleanField(blank=True, null=True, db_column='is_successful')

    class Meta:
        managed = False
        db_table = 'external_maintenance_step'


class ExternalMaintenanceDocument(models.Model):
    external_maintenance_document_id = models.IntegerField(primary_key=True, db_column='external_maintenance_document_id')
    external_maintenance = models.ForeignKey(
        ExternalMaintenance,
        on_delete=models.CASCADE,
        db_column='external_maintenance_id',
        related_name='+',
    )
    document_is_signed = models.BooleanField(blank=True, null=True, db_column='document_is_signed')
    item_is_received_by_maintenance_provider = models.BooleanField(blank=True, null=True, db_column='item_is_received_by_maintenance_provider')
    maintenance_provider_final_decision = models.CharField(max_length=60, blank=True, null=True, db_column='maintenance_provider_final_decision')
    digital_copy = models.BinaryField(blank=True, null=True, db_column='digital_copy')

    class Meta:
        managed = False
        db_table = 'external_maintenance_document'


class AdministrativeCertificate(models.Model):
    """Maps to administrative_certificate table"""
    administrative_certificate_id = models.AutoField(primary_key=True, db_column='administrative_certificate_id')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, db_column='warehouse_id')
    attribution_order = models.ForeignKey(AttributionOrder, on_delete=models.CASCADE, db_column='attribution_order_id', related_name='administrative_certificates')
    receipt_report = models.ForeignKey(ReceiptReport, on_delete=models.CASCADE, db_column='receipt_report_id', related_name='administrative_certificates')
    interested_organization = models.CharField(max_length=60, db_column='interested_organization', blank=True, null=True)
    operation = models.CharField(max_length=20, db_column='operation', blank=True, null=True)
    format = models.CharField(max_length=8, db_column='format', blank=True, null=True)
    is_signed_by_warehouse_storage_magaziner = models.BooleanField(db_column='is_signed_by_warehouse_storage_magaziner', default=False)
    is_signed_by_warehouse_storage_accountant = models.BooleanField(db_column='is_signed_by_warehouse_storage_accountant', default=False)
    is_signed_by_warehouse_storage_marketer = models.BooleanField(db_column='is_signed_by_warehouse_storage_marketer', default=False)
    is_signed_by_warehouse_it_chief = models.BooleanField(db_column='is_signed_by_warehouse_it_chief', default=False)
    is_signed_by_warehouse_leader = models.BooleanField(db_column='is_signed_by_warehouse_leader', default=False)
    digital_copy = models.BinaryField(db_column='digital_copy', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'administrative_certificate'

    def __str__(self):
        return f"Certificate {self.administrative_certificate_id} for Order {self.attribution_order_id}"


class CompanyAssetRequest(models.Model):
    """Maps to company_asset_request table"""

    company_asset_request_id = models.IntegerField(primary_key=True, db_column="company_asset_request_id")
    attribution_order = models.ForeignKey(AttributionOrder, on_delete=models.DO_NOTHING, db_column="attribution_order_id")
    is_signed_by_company = models.BooleanField(blank=True, null=True, db_column="is_signed_by_company")
    administrative_serial_number = models.CharField(max_length=18, blank=True, null=True, db_column="administrative_serial_number")
    title_of_demand = models.CharField(max_length=255, blank=True, null=True, db_column="title_of_demand")
    organization_body_designation = models.CharField(max_length=255, blank=True, null=True, db_column="organization_body_designation")
    register_number_or_book_journal_of_corpse = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_column="register_number_or_book_journal_of_corpse",
    )
    register_number_or_book_journal_of_establishment = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_column="register_number_or_book_journal_of_establishment",
    )
    is_signed_by_company_leader = models.BooleanField(blank=True, null=True, db_column="is_signed_by_company_leader")
    is_signed_by_regional_provider = models.BooleanField(blank=True, null=True, db_column="is_signed_by_regional_provider")
    is_signed_by_company_representative = models.BooleanField(
        blank=True,
        null=True,
        db_column="is_signed_by_company_representative",
    )
    digital_copy = models.BinaryField(blank=True, null=True, db_column="digital_copy")

    class Meta:
        managed = False
        db_table = "company_asset_request"

    def __str__(self):
        return f"Company Asset Request {self.company_asset_request_id}"
