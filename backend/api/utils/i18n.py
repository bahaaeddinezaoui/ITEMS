"""
I18N Utilities for translation handling.

This module provides helper functions and mixins for working with
the per-entity translation tables.
"""

from typing import Optional, Type, Any
from django.db import models


class TranslationHelper:
    """
    Helper class for fetching translations with fallback logic.
    
    Usage:
        helper = TranslationHelper(AssetTypeTranslation)
        label = helper.get_translated_field(asset_type, 'ar', 'asset_type_label')
        # Returns Arabic label if exists, otherwise falls back to base field
    """
    
    def __init__(self, translation_model: Type[models.Model]):
        self.translation_model = translation_model
    
    def get_translation(self, entity_id: int, language_code: str) -> Optional[models.Model]:
        """Get translation for a specific entity and language."""
        try:
            return self.translation_model.objects.get(
                **{self._get_fk_field_name(): entity_id},
                language_code=language_code
            )
        except self.translation_model.DoesNotExist:
            return None
    
    def get_translated_field(self, entity: Any, language_code: str, 
                            field_name: str, fallback_field_name: str = None) -> Any:
        """
        Get translated field value with fallback to base entity field.
        
        Args:
            entity: The base entity instance
            language_code: Target language code (e.g., 'ar', 'en')
            field_name: Name of the field in translation model
            fallback_field_name: Name of the field in base entity (defaults to field_name)
        
        Returns:
            Translated value or fallback value
        """
        if not fallback_field_name:
            fallback_field_name = field_name
            
        # If requesting default language (en), return base field directly
        if language_code == 'en':
            return getattr(entity, fallback_field_name, None)
        
        # Try to get translation
        translation = self.get_translation(entity.pk, language_code)
        if translation:
            translated_value = getattr(translation, field_name, None)
            if translated_value:
                return translated_value
        
        # Fallback to base entity field
        return getattr(entity, fallback_field_name, None)
    
    def _get_fk_field_name(self) -> str:
        """Infer the foreign key field name from the translation model."""
        # Get the first ForeignKey field that points to the parent model
        for field in self.translation_model._meta.fields:
            if isinstance(field, models.ForeignKey):
                return field.name
        return None


def get_translation_for_entity(entity: Any, language_code: str, 
                               translation_model: Type[models.Model]) -> Optional[models.Model]:
    """
    Get translation instance for a given entity and language.
    
    Args:
        entity: The base entity instance
        language_code: Target language code
        translation_model: The translation model class
    
    Returns:
        Translation instance or None
    """
    if language_code == 'en':
        return None  # Default language, no translation needed
    
    # Find the foreign key field name
    fk_field = None
    for field in translation_model._meta.fields:
        if isinstance(field, models.ForeignKey):
            fk_field = field.name
            break
    
    if not fk_field:
        return None
    
    try:
        return translation_model.objects.get(
            **{fk_field: entity.pk},
            language_code=language_code
        )
    except translation_model.DoesNotExist:
        return None


def translate_field(entity: Any, language_code: str, 
                   base_field_name: str,
                   translation_model: Type[models.Model],
                   translation_field_name: str = None) -> Any:
    """
    Get translated field value with fallback.
    
    Args:
        entity: Base entity instance
        language_code: Target language
        base_field_name: Field name on base entity
        translation_model: Translation model class
        translation_field_name: Field name on translation model (defaults to base_field_name)
    
    Returns:
        Translated value or base value
    """
    if not translation_field_name:
        translation_field_name = base_field_name
    
    # If English or no translation exists, return base field
    if language_code == 'en':
        return getattr(entity, base_field_name, None)
    
    # Try to get translation
    translation = get_translation_for_entity(entity, language_code, translation_model)
    if translation:
        value = getattr(translation, translation_field_name, None)
        if value:
            return value
    
    # Fallback to base field
    return getattr(entity, base_field_name, None)


# ============================================================================
# Translation Mapping for Easy Reference
# ============================================================================

# Map of base models to their translation models
TRANSLATION_MODEL_MAP = {
    'AssetType': 'api.translations.AssetTypeTranslation',
    'ConsumableType': 'api.translations.ConsumableTypeTranslation',
    'StockItemType': 'api.translations.StockItemTypeTranslation',
    'AssetBrand': 'api.translations.AssetBrandTranslation',
    'StockItemBrand': 'api.translations.StockItemBrandTranslation',
    'ConsumableBrand': 'api.translations.ConsumableBrandTranslation',
    'LocationType': 'api.translations.LocationTypeTranslation',
    'OrganizationalStructureType': 'api.translations.OrganizationalStructureTypeTranslation',
    'PhysicalCondition': 'api.translations.PhysicalConditionTranslation',
    'MaintenanceStepStatus': 'api.translations.MaintenanceStepStatusTranslation',
    'Role': 'api.translations.RoleTranslation',
    'Position': 'api.translations.PositionTranslation',
    'AssetAttributeDefinition': 'api.translations.AssetAttributeDefinitionTranslation',
    'ConsumableAttributeDefinition': 'api.translations.ConsumableAttributeDefinitionTranslation',
    'StockItemAttributeDefinition': 'api.translations.StockItemAttributeDefinitionTranslation',
    'MaintenanceTypicalStep': 'api.translations.MaintenanceTypicalStepTranslation',
    'ExternalMaintenanceTypicalStep': 'api.translations.ExternalMaintenanceTypicalStepTranslation',
    'Person': 'api.translations.PersonTranslation',
    'Supplier': 'api.translations.SupplierTranslation',
    'Warehouse': 'api.translations.WarehouseTranslation',
    'Location': 'api.translations.LocationTranslation',
    'OrganizationalStructure': 'api.translations.OrganizationalStructureTranslation',
    'AssetMovement': 'api.translations.AssetMovementTranslation',
    'ConsumableMovement': 'api.translations.ConsumableMovementTranslation',
    'StockItemMovement': 'api.translations.StockItemMovementTranslation',
    'PersonReportsProblemOnAsset': 'api.translations.PersonReportsProblemOnAssetTranslation',
    'PersonReportsProblemOnConsumable': 'api.translations.PersonReportsProblemOnConsumableTranslation',
    'PersonReportsProblemOnStockItem': 'api.translations.PersonReportsProblemOnStockItemTranslation',
    'Maintenance': 'api.translations.MaintenanceTranslation',
    'AssetConditionHistory': 'api.translations.AssetConditionHistoryTranslation',
    'ConsumableConditionHistory': 'api.translations.ConsumableConditionHistoryTranslation',
    'StockItemConditionHistory': 'api.translations.StockItemConditionHistoryTranslation',
    'Asset': 'api.translations.AssetTranslation',
    'Consumable': 'api.translations.ConsumableTranslation',
    'StockItem': 'api.translations.StockItemTranslation',
    'AssetModel': 'api.translations.AssetModelTranslation',
    'ConsumableModel': 'api.translations.ConsumableModelTranslation',
    'StockItemModel': 'api.translations.StockItemModelTranslation',
    'AdministrativeCertificate': 'api.translations.AdministrativeCertificateTranslation',
    'CompanyAssetRequest': 'api.translations.CompanyAssetRequestTranslation',
    'ExternalMaintenanceDocument': 'api.translations.ExternalMaintenanceDocumentTranslation',
    'MaintenanceStepItemRequest': 'api.translations.MaintenanceStepItemRequestTranslation',
    'AssetIncidentReport': 'api.translations.AssetIncidentReportTranslation',
}


def get_translation_model(base_model_name: str) -> Optional[Type[models.Model]]:
    """Get translation model class for a base model name."""
    from django.utils.module_loading import import_string
    model_path = TRANSLATION_MODEL_MAP.get(base_model_name)
    if model_path:
        return import_string(model_path)
    return None


def save_translations(entity, translations_data: dict, base_model_name: str = None) -> None:
    """
    Create or update translation rows for an entity.
    
    Args:
        entity: The base entity instance
        translations_data: Dict of {language_code: {field_name: value}}
            Example: {"ar": {"asset_type_label": "حاسوب"}, "fr": {"asset_type_label": "Ordinateur"}}
        base_model_name: Name of the base model (e.g., 'AssetType'). If None, inferred from entity class.
    
    Returns:
        None
    """
    if not translations_data:
        return
    
    if not base_model_name:
        base_model_name = entity.__class__.__name__
    
    translation_model = get_translation_model(base_model_name)
    if not translation_model:
        return
    
    # Find the FK field name on the translation model
    fk_field = None
    for field in translation_model._meta.fields:
        if field.is_relation and field.many_to_one:
            fk_field = field.name
            break
    
    if not fk_field:
        return
    
    for language_code, field_values in translations_data.items():
        if not field_values:
            continue
        
        # Filter out empty values
        non_empty_values = {k: v for k, v in field_values.items() if v}
        if not non_empty_values:
            continue
        
        lookup = {fk_field: entity, 'language_code': language_code}
        qs = translation_model.objects.filter(**lookup)
        if qs.exists():
            try:
                qs.update(**non_empty_values)
            except Exception:
                # Column may not exist yet if migration not applied; try without status fields
                status_fields = {'asset_status', 'stock_item_status', 'consumable_status'}
                safe_values = {k: v for k, v in non_empty_values.items() if k not in status_fields}
                if safe_values:
                    try:
                        qs.update(**safe_values)
                    except Exception:
                        pass
            continue

        create_kwargs = {**lookup, **non_empty_values}

        # Some translation tables are managed=False and may not have a working auto-increment
        # sequence backing the AutoField primary key. In that case, creating without an explicit
        # id can raise a 500 at runtime. Allocate the next id manually when needed.
        pk_field = translation_model._meta.pk
        if pk_field is not None and pk_field.name == 'id':
            last = translation_model.objects.order_by('-id').first()
            create_kwargs['id'] = (last.id + 1) if last else 1

        try:
            translation_model.objects.create(**create_kwargs)
        except Exception:
            # Column may not exist yet if migration not applied; try without status fields
            status_fields = {'asset_status', 'stock_item_status', 'consumable_status'}
            safe_kwargs = {k: v for k, v in create_kwargs.items() if k not in status_fields}
            if safe_kwargs:
                try:
                    translation_model.objects.create(**safe_kwargs)
                except Exception:
                    pass


def sync_status_translations(entity, status_value, base_model_name=None):
    """
    Sync the status field across all translation rows for an entity.

    When the base entity's status changes, this updates the status column
    in every language row of the translation table with the human-readable
    translated label for that language.

    Args:
        entity: The base entity instance (Asset, StockItem, Consumable)
        status_value: The new status value (e.g. 'in_stock')
        base_model_name: Name of the base model. If None, inferred from entity.
    """
    if not base_model_name:
        base_model_name = entity.__class__.__name__

    # Determine the status field name on the translation model
    status_field_map = {
        'Asset': 'asset_status',
        'StockItem': 'stock_item_status',
        'Consumable': 'consumable_status',
    }
    status_field = status_field_map.get(base_model_name)
    if not status_field:
        return

    translation_model = get_translation_model(base_model_name)
    if not translation_model:
        return

    # Find the FK field name on the translation model
    fk_field = None
    for field in translation_model._meta.fields:
        if field.is_relation and field.many_to_one:
            fk_field = field.name
            break

    if not fk_field:
        return

    # Update each translation row with the translated status for its language
    try:
        for row in translation_model.objects.filter(**{fk_field: entity}):
            translated = translate_status(status_value, row.language_code)
            setattr(row, status_field, translated)
            row.save(update_fields=[status_field])
    except Exception:
        pass


def bulk_sync_status_translations(model_class, filter_kwargs, new_status):
    """
    Update the status field on the base model AND sync to translation tables in bulk.

    This replaces direct ``Model.objects.filter(...).update(status=...)`` calls
    so that the translation rows stay in sync.

    Args:
        model_class: The base model class (Asset, StockItem, Consumable)
        filter_kwargs: Dict of kwargs to filter the base model queryset
        new_status: The new status value (e.g. 'in_stock', 'failed')

    Returns:
        Number of rows updated in the base table (same as queryset.update() return value)
    """
    # Determine the status field name on the base model
    base_model_name = model_class.__name__
    status_field_map = {
        'Asset': 'asset_status',
        'StockItem': 'stock_item_status',
        'Consumable': 'consumable_status',
    }
    base_status_field = status_field_map.get(base_model_name)
    if not base_status_field:
        # Not a model with a translatable status — cannot proceed
        return 0

    # Update the base table
    count = model_class.objects.filter(**filter_kwargs).update(**{base_status_field: new_status})

    if count == 0:
        return count

    # Now sync the translation table
    translation_status_field = base_status_field  # same name on translation model
    translation_model = get_translation_model(base_model_name)
    if not translation_model:
        return count

    # Find FK field name on the translation model
    fk_field = None
    for field in translation_model._meta.fields:
        if field.is_relation and field.many_to_one:
            fk_field = field.name
            break
    if not fk_field:
        return count

    # Get the PKs of the updated entities
    updated_pks = list(model_class.objects.filter(**filter_kwargs).values_list('pk', flat=True))

    # Update translation rows for all affected entities with translated status per language
    if updated_pks:
        try:
            for row in translation_model.objects.filter(
                **{f'{fk_field}_id__in': updated_pks}
            ):
                translated = translate_status(new_status, row.language_code)
                setattr(row, translation_status_field, translated)
                row.save(update_fields=[translation_status_field])
        except Exception:
            pass

    return count


# Status translation mappings (snake_case -> human-readable EN / Arabic)
STATUS_TRANSLATIONS = {
    # Stock item & Consumable statuses
    'not_delivered_to_company': {
        'en': 'Not Delivered to Company',
        'ar': 'لم يتم تسليمها للشركة',
    },
    'in_stock': {
        'en': 'In Stock',
        'ar': 'في المخزون',
    },
    'in_use': {
        'en': 'In Use',
        'ar': 'قيد الاستخدام',
    },
    'assigned': {
        'en': 'Assigned',
        'ar': 'معين',
    },
    'maintenance': {
        'en': 'Maintenance',
        'ar': 'قيد الصيانة',
    },
    'reserved': {
        'en': 'Reserved',
        'ar': 'محجوز',
    },
    'failed': {
        'en': 'Failed',
        'ar': 'معطل',
    },
    'lost': {
        'en': 'Lost',
        'ar': 'مفقود',
    },
    'stolen': {
        'en': 'Stolen',
        'ar': 'مسروق',
    },
    'irrecoverably_damaged': {
        'en': 'Irrecoverably Damaged',
        'ar': 'تالف بشكل لا يمكن إصلاحه',
    },
    'destroyed': {
        'en': 'Destroyed',
        'ar': 'متلف',
    },
    'suggested_for_destruction': {
        'en': 'Suggested for Destruction',
        'ar': 'مقترح للإتلاف',
    },
    # Additional statuses that may appear
    'active': {
        'en': 'Active',
        'ar': 'نشط',
    },
    # Maintenance step statuses
    'pending': {
        'en': 'Pending',
        'ar': 'قيد الانتظار',
    },
    'started': {
        'en': 'Started',
        'ar': 'بدأت',
    },
    'pending_stock_item': {
        'en': 'Pending (waiting for stock item)',
        'ar': 'قيد الانتظار (في انتظار عنصر المخزون)',
    },
    'pending_consumable': {
        'en': 'Pending (waiting for consumable)',
        'ar': 'قيد الانتظار (في انتظار المستهلك)',
    },
    'in_progress': {
        'en': 'In Progress',
        'ar': 'قيد التنفيذ',
    },
    'done': {
        'en': 'Done',
        'ar': 'منتهية',
    },
    'failed_higher_level': {
        'en': 'Failed (to be sent to a higher level)',
        'ar': 'فشلت (يجب إرسالها إلى مستوى أعلى)',
    },
    'cancelled': {
        'en': 'Cancelled',
        'ar': 'ملغاة',
    },
}


def translate_status(status_value, language_code):
    """
    Translate a snake_case status value to a human-readable label.

    Args:
        status_value: The raw status string (e.g. 'not_delivered_to_company')
        language_code: 'en' or 'ar'

    Returns:
        Human-readable status label, or the original value if no mapping exists.
    """
    if not status_value:
        return status_value
    key = status_value.strip().lower()
    mapping = STATUS_TRANSLATIONS.get(key)
    if mapping:
        return mapping.get(language_code, status_value)
    return status_value
