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
            qs.update(**non_empty_values)
            continue

        create_kwargs = {**lookup, **non_empty_values}

        # Some translation tables are managed=False and may not have a working auto-increment
        # sequence backing the AutoField primary key. In that case, creating without an explicit
        # id can raise a 500 at runtime. Allocate the next id manually when needed.
        pk_field = translation_model._meta.pk
        if pk_field is not None and pk_field.name == 'id':
            last = translation_model.objects.order_by('-id').first()
            create_kwargs['id'] = (last.id + 1) if last else 1

        translation_model.objects.create(**create_kwargs)
