"""
I18N Translation Models (Option 2, Variant A: Per-entity translation tables)

These models map to the translation tables created by migration 0013.
"""

from django.db import models

LANGUAGE_CHOICES = [
    ('en', 'English'),
    ('ar', 'Arabic'),
]


# ============================================================================
# SECTION 1: REFERENCE/DICTIONARY DATA (UI Labels)
# ============================================================================

class AssetTypeTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    asset_type = models.ForeignKey('AssetType', on_delete=models.CASCADE, db_column='asset_type_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    asset_type_label = models.CharField(max_length=60, db_column='asset_type_label')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'asset_type_translation'
        unique_together = ['asset_type', 'language_code']


class ConsumableTypeTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    consumable_type = models.ForeignKey('ConsumableType', on_delete=models.CASCADE, db_column='consumable_type_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    consumable_type_label = models.CharField(max_length=60, db_column='consumable_type_label')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'consumable_type_translation'
        unique_together = ['consumable_type', 'language_code']


class StockItemTypeTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    stock_item_type = models.ForeignKey('StockItemType', on_delete=models.CASCADE, db_column='stock_item_type_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    stock_item_type_label = models.CharField(max_length=60, db_column='stock_item_type_label')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'stock_item_type_translation'
        unique_together = ['stock_item_type', 'language_code']


class AssetBrandTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    asset_brand = models.ForeignKey('AssetBrand', on_delete=models.CASCADE, db_column='asset_brand_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    brand_name = models.CharField(max_length=48, db_column='brand_name')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'asset_brand_translation'
        unique_together = ['asset_brand', 'language_code']


class StockItemBrandTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    stock_item_brand = models.ForeignKey('StockItemBrand', on_delete=models.CASCADE, db_column='stock_item_brand_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    brand_name = models.CharField(max_length=48, db_column='brand_name')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'stock_item_brand_translation'
        unique_together = ['stock_item_brand', 'language_code']


class ConsumableBrandTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    consumable_brand = models.ForeignKey('ConsumableBrand', on_delete=models.CASCADE, db_column='consumable_brand_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    brand_name = models.CharField(max_length=48, db_column='brand_name')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'consumable_brand_translation'
        unique_together = ['consumable_brand', 'language_code']


class LocationTypeTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    location_type = models.ForeignKey('LocationType', on_delete=models.CASCADE, db_column='location_type_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    location_type_label = models.CharField(max_length=60, db_column='location_type_label')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'location_type_translation'
        unique_together = ['location_type', 'language_code']


class OrganizationalStructureTypeTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    organizational_structure_type = models.ForeignKey('OrganizationalStructureType', on_delete=models.CASCADE, db_column='organizational_structure_type_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    organizational_structure_type_label = models.CharField(max_length=30, db_column='organizational_structure_type')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'organizational_structure_type_translation'
        unique_together = ['organizational_structure_type', 'language_code']


class PhysicalConditionTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    physical_condition = models.ForeignKey('PhysicalCondition', on_delete=models.CASCADE, db_column='condition_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    condition_label = models.CharField(max_length=12, db_column='condition_label')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'physical_condition_translation'
        unique_together = ['physical_condition', 'language_code']


class RoleTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    role = models.ForeignKey('Role', on_delete=models.CASCADE, db_column='role_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    role_label = models.CharField(max_length=60, db_column='role_label')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'role_translation'
        unique_together = ['role', 'language_code']


class PositionTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    position = models.ForeignKey('Position', on_delete=models.CASCADE, db_column='position_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    position_label = models.CharField(max_length=60, db_column='position_label')
    description = models.CharField(max_length=256, blank=True, null=True, db_column='description')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'position_translation'
        unique_together = ['position', 'language_code']


class AssetAttributeDefinitionTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    asset_attribute_definition = models.ForeignKey('AssetAttributeDefinition', on_delete=models.CASCADE, db_column='asset_attribute_definition_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    description = models.CharField(max_length=256, db_column='description')
    unit = models.CharField(max_length=24, blank=True, null=True, db_column='unit')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'asset_attribute_definition_translation'
        unique_together = ['asset_attribute_definition', 'language_code']


class ConsumableAttributeDefinitionTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    consumable_attribute_definition = models.ForeignKey('ConsumableAttributeDefinition', on_delete=models.CASCADE, db_column='consumable_attribute_definition_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    description = models.CharField(max_length=256, db_column='description')
    unit = models.CharField(max_length=24, blank=True, null=True, db_column='unit')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'consumable_attribute_definition_translation'
        unique_together = ['consumable_attribute_definition', 'language_code']


class StockItemAttributeDefinitionTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    stock_item_attribute_definition = models.ForeignKey('StockItemAttributeDefinition', on_delete=models.CASCADE, db_column='stock_item_attribute_definition_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    description = models.CharField(max_length=256, db_column='description')
    unit = models.CharField(max_length=24, blank=True, null=True, db_column='unit')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'stock_item_attribute_definition_translation'
        unique_together = ['stock_item_attribute_definition', 'language_code']


class MaintenanceTypicalStepTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    maintenance_typical_step = models.ForeignKey('MaintenanceTypicalStep', on_delete=models.CASCADE, db_column='maintenance_typical_step_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    description = models.CharField(max_length=256, db_column='description')
    maintenance_type = models.CharField(max_length=8, blank=True, null=True, db_column='maintenance_type')
    operation_type = models.CharField(max_length=24, blank=True, null=True, db_column='operation_type')
    maintenance_domain = models.CharField(max_length=24, blank=True, null=True, db_column='maintenance_domain')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'maintenance_typical_step_translation'
        unique_together = ['maintenance_typical_step', 'language_code']


class ExternalMaintenanceTypicalStepTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    external_maintenance_typical_step = models.ForeignKey('ExternalMaintenanceTypicalStep', on_delete=models.CASCADE, db_column='external_maintenance_typical_step_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    description = models.CharField(max_length=256, db_column='description')
    maintenance_type = models.CharField(max_length=8, blank=True, null=True, db_column='maintenance_type')
    operation_type = models.CharField(max_length=24, blank=True, null=True, db_column='operation_type')
    maintenance_domain = models.CharField(max_length=24, blank=True, null=True, db_column='maintenance_domain')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'external_maintenance_typical_step_translation'
        unique_together = ['external_maintenance_typical_step', 'language_code']


# ============================================================================
# SECTION 2: ENTITY NAMES
# ============================================================================

class PersonTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    person = models.ForeignKey('Person', on_delete=models.CASCADE, db_column='person_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    first_name = models.CharField(max_length=48, db_column='first_name')
    last_name = models.CharField(max_length=48, db_column='last_name')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'person_translation'
        unique_together = ['person', 'language_code']


class SupplierTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    supplier = models.ForeignKey('Supplier', on_delete=models.CASCADE, db_column='supplier_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    supplier_name = models.CharField(max_length=60, db_column='supplier_name')
    supplier_address = models.CharField(max_length=128, blank=True, null=True, db_column='supplier_address')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'supplier_translation'
        unique_together = ['supplier', 'language_code']


class WarehouseTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    warehouse = models.ForeignKey('Warehouse', on_delete=models.CASCADE, db_column='warehouse_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    warehouse_name = models.CharField(max_length=60, db_column='warehouse_name')
    warehouse_address = models.CharField(max_length=128, blank=True, null=True, db_column='warehouse_address')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'warehouse_translation'
        unique_together = ['warehouse', 'language_code']


class LocationTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    location = models.ForeignKey('Location', on_delete=models.CASCADE, db_column='location_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    location_name = models.CharField(max_length=30, db_column='location_name')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'location_translation'
        unique_together = ['location', 'language_code']


class OrganizationalStructureTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    organizational_structure = models.ForeignKey('OrganizationalStructure', on_delete=models.CASCADE, db_column='organizational_structure_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    structure_name = models.CharField(max_length=255, db_column='structure_name')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'organizational_structure_translation'
        unique_together = ['organizational_structure', 'language_code']


# ============================================================================
# SECTION 3: OPERATIONAL TEXT
# ============================================================================

class AssetMovementTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    asset_movement = models.ForeignKey('AssetMovement', on_delete=models.CASCADE, db_column='asset_movement_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    movement_reason = models.CharField(max_length=128, db_column='movement_reason')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'asset_movement_translation'
        unique_together = ['asset_movement', 'language_code']


class ConsumableMovementTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    consumable_movement = models.ForeignKey('ConsumableMovement', on_delete=models.CASCADE, db_column='consumable_movement_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    movement_reason = models.CharField(max_length=128, db_column='movement_reason')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'consumable_movement_translation'
        unique_together = ['consumable_movement', 'language_code']


class StockItemMovementTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    stock_item_movement = models.ForeignKey('StockItemMovement', on_delete=models.CASCADE, db_column='stock_item_movement_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    movement_reason = models.CharField(max_length=128, db_column='movement_reason')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'stock_item_movement_translation'
        unique_together = ['stock_item_movement', 'language_code']


class PersonReportsProblemOnAssetTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    problem_report = models.ForeignKey('PersonReportsProblemOnAsset', on_delete=models.CASCADE, db_column='report_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    owner_observation = models.CharField(max_length=256, db_column='owner_observation')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'person_reports_problem_on_asset_translation'
        unique_together = ['problem_report', 'language_code']


class PersonReportsProblemOnConsumableTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    problem_report = models.ForeignKey('PersonReportsProblemOnConsumable', on_delete=models.CASCADE, db_column='report_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    owner_observation = models.CharField(max_length=256, db_column='owner_observation')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'person_reports_problem_on_consumable_translation'
        unique_together = ['problem_report', 'language_code']


class PersonReportsProblemOnStockItemTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    problem_report = models.ForeignKey('PersonReportsProblemOnStockItem', on_delete=models.CASCADE, db_column='report_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    owner_observation = models.CharField(max_length=256, db_column='owner_observation')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'person_reports_problem_on_stock_item_translation'
        unique_together = ['problem_report', 'language_code']


class MaintenanceTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    maintenance = models.ForeignKey('Maintenance', on_delete=models.CASCADE, db_column='maintenance_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    description = models.CharField(max_length=256, db_column='description')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'maintenance_translation'
        unique_together = ['maintenance', 'language_code']


class AssetConditionHistoryTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    condition_history = models.ForeignKey('AssetConditionHistory', on_delete=models.CASCADE, db_column='asset_condition_history_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')
    cosmetic_issues = models.CharField(max_length=128, blank=True, null=True, db_column='cosmetic_issues')
    functional_issues = models.CharField(max_length=128, blank=True, null=True, db_column='functional_issues')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'asset_condition_history_translation'
        unique_together = ['condition_history', 'language_code']


class ConsumableConditionHistoryTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    condition_history = models.ForeignKey('ConsumableConditionHistory', on_delete=models.CASCADE, db_column='consumable_condition_history_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')
    cosmetic_issues = models.CharField(max_length=128, blank=True, null=True, db_column='cosmetic_issues')
    functional_issues = models.CharField(max_length=128, blank=True, null=True, db_column='functional_issues')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'consumable_condition_history_translation'
        unique_together = ['condition_history', 'language_code']


class StockItemConditionHistoryTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    condition_history = models.ForeignKey('StockItemConditionHistory', on_delete=models.CASCADE, db_column='stock_item_condition_history_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')
    cosmetic_issues = models.CharField(max_length=128, blank=True, null=True, db_column='cosmetic_issues')
    functional_issues = models.CharField(max_length=128, blank=True, null=True, db_column='functional_issues')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'stock_item_condition_history_translation'
        unique_together = ['condition_history', 'language_code']


# ============================================================================
# SECTION 4: OTHER HUMAN-FACING TEXT
# ============================================================================

class AssetTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    asset = models.ForeignKey('Asset', on_delete=models.CASCADE, db_column='asset_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    asset_name = models.CharField(max_length=48, blank=True, null=True, db_column='asset_name')
    asset_name_in_the_administrative_certificate = models.CharField(max_length=48, blank=True, null=True, db_column='asset_name_in_the_administrative_certificate')
    asset_status = models.CharField(max_length=60, blank=True, null=True, db_column='asset_status')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'asset_translation'
        unique_together = ['asset', 'language_code']


class ConsumableTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    consumable = models.ForeignKey('Consumable', on_delete=models.CASCADE, db_column='consumable_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    consumable_name = models.CharField(max_length=48, blank=True, null=True, db_column='consumable_name')
    consumable_name_in_administrative_certificate = models.CharField(max_length=48, blank=True, null=True, db_column='consumable_name_in_administrative_certificate')
    consumable_status = models.CharField(max_length=60, blank=True, null=True, db_column='consumable_status')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'consumable_translation'
        unique_together = ['consumable', 'language_code']


class StockItemTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    stock_item = models.ForeignKey('StockItem', on_delete=models.CASCADE, db_column='stock_item_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    stock_item_name = models.CharField(max_length=48, blank=True, null=True, db_column='stock_item_name')
    stock_item_name_in_administrative_certificate = models.CharField(max_length=48, blank=True, null=True, db_column='stock_item_name_in_administrative_certificate')
    stock_item_status = models.CharField(max_length=60, blank=True, null=True, db_column='stock_item_status')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'stock_item_translation'
        unique_together = ['stock_item', 'language_code']


class AssetModelTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    asset_model = models.ForeignKey('AssetModel', on_delete=models.CASCADE, db_column='asset_model_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    model_name = models.CharField(max_length=48, blank=True, null=True, db_column='model_name')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'asset_model_translation'
        unique_together = ['asset_model', 'language_code']


class ConsumableModelTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    consumable_model = models.ForeignKey('ConsumableModel', on_delete=models.CASCADE, db_column='consumable_model_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    model_name = models.CharField(max_length=48, blank=True, null=True, db_column='model_name')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'consumable_model_translation'
        unique_together = ['consumable_model', 'language_code']


class StockItemModelTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    stock_item_model = models.ForeignKey('StockItemModel', on_delete=models.CASCADE, db_column='stock_item_model_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    model_name = models.CharField(max_length=48, blank=True, null=True, db_column='model_name')
    notes = models.CharField(max_length=256, blank=True, null=True, db_column='notes')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'stock_item_model_translation'
        unique_together = ['stock_item_model', 'language_code']


class AdministrativeCertificateTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    administrative_certificate = models.ForeignKey('AdministrativeCertificate', on_delete=models.CASCADE, db_column='administrative_certificate_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    interested_organization = models.CharField(max_length=60, blank=True, null=True, db_column='interested_organization')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'administrative_certificate_translation'
        unique_together = ['administrative_certificate', 'language_code']


class CompanyAssetRequestTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    company_asset_request = models.ForeignKey('CompanyAssetRequest', on_delete=models.CASCADE, db_column='company_asset_request_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    title_of_demand = models.CharField(max_length=24, blank=True, null=True, db_column='title_of_demand')
    organization_body_designation = models.CharField(max_length=60, blank=True, null=True, db_column='organization_body_designation')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'company_asset_request_translation'
        unique_together = ['company_asset_request', 'language_code']


class ExternalMaintenanceDocumentTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    external_maintenance_document = models.ForeignKey('ExternalMaintenanceDocument', on_delete=models.CASCADE, db_column='external_maintenance_document_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    maintenance_provider_final_decision = models.CharField(max_length=60, blank=True, null=True, db_column='maintenance_provider_final_decision')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'external_maintenance_document_translation'
        unique_together = ['external_maintenance_document', 'language_code']


class MaintenanceStepItemRequestTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    maintenance_step_item_request = models.ForeignKey('MaintenanceStepItemRequest', on_delete=models.CASCADE, db_column='maintenance_step_item_request_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    note = models.CharField(max_length=256, blank=True, null=True, db_column='note')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'maintenance_step_item_request_translation'
        unique_together = ['maintenance_step_item_request', 'language_code']


class AssetIncidentReportTranslation(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    asset_incident_report = models.ForeignKey('AssetIncidentReport', on_delete=models.CASCADE, db_column='asset_incident_report_id')
    language_code = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, db_column='language_code')
    reason = models.CharField(max_length=32, blank=True, null=True, db_column='reason')
    status = models.CharField(max_length=20, blank=True, null=True, db_column='status')
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    class Meta:
        managed = False
        db_table = 'asset_incident_report_translation'
        unique_together = ['asset_incident_report', 'language_code']
