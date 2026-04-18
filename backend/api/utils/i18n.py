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
    'AssetType': 'api.models.AssetTypeTranslation',
    'ConsumableType': 'api.models.ConsumableTypeTranslation',
    'StockItemType': 'api.models.StockItemTypeTranslation',
    'LocationType': 'api.models.LocationTypeTranslation',
    'OrganizationalStructureType': 'api.models.OrganizationalStructureTypeTranslation',
    'PhysicalCondition': 'api.models.PhysicalConditionTranslation',
    'Role': 'api.models.RoleTranslation',
    'Position': 'api.models.PositionTranslation',
    'AssetAttributeDefinition': 'api.models.AssetAttributeDefinitionTranslation',
    'ConsumableAttributeDefinition': 'api.models.ConsumableAttributeDefinitionTranslation',
    'StockItemAttributeDefinition': 'api.models.StockItemAttributeDefinitionTranslation',
    'MaintenanceTypicalStep': 'api.models.MaintenanceTypicalStepTranslation',
    'ExternalMaintenanceTypicalStep': 'api.models.ExternalMaintenanceTypicalStepTranslation',
    'Person': 'api.models.PersonTranslation',
    'Supplier': 'api.models.SupplierTranslation',
    'Warehouse': 'api.models.WarehouseTranslation',
    'Location': 'api.models.LocationTranslation',
    'OrganizationalStructure': 'api.models.OrganizationalStructureTranslation',
    'AssetMovement': 'api.models.AssetMovementTranslation',
    'ConsumableMovement': 'api.models.ConsumableMovementTranslation',
    'StockItemMovement': 'api.models.StockItemMovementTranslation',
    'PersonReportsProblemOnAsset': 'api.models.PersonReportsProblemOnAssetTranslation',
    'PersonReportsProblemOnConsumable': 'api.models.PersonReportsProblemOnConsumableTranslation',
    'PersonReportsProblemOnStockItem': 'api.models.PersonReportsProblemOnStockItemTranslation',
    'Maintenance': 'api.models.MaintenanceTranslation',
    'AssetConditionHistory': 'api.models.AssetConditionHistoryTranslation',
    'ConsumableConditionHistory': 'api.models.ConsumableConditionHistoryTranslation',
    'StockItemConditionHistory': 'api.models.StockItemConditionHistoryTranslation',
    'Asset': 'api.models.AssetTranslation',
    'Consumable': 'api.models.ConsumableTranslation',
    'StockItem': 'api.models.StockItemTranslation',
    'AssetModel': 'api.models.AssetModelTranslation',
    'ConsumableModel': 'api.models.ConsumableModelTranslation',
    'StockItemModel': 'api.models.StockItemModelTranslation',
    'AdministrativeCertificate': 'api.models.AdministrativeCertificateTranslation',
    'CompanyAssetRequest': 'api.models.CompanyAssetRequestTranslation',
    'ExternalMaintenanceDocument': 'api.models.ExternalMaintenanceDocumentTranslation',
    'MaintenanceStepItemRequest': 'api.models.MaintenanceStepItemRequestTranslation',
}


def get_translation_model(base_model_name: str) -> Optional[Type[models.Model]]:
    """Get translation model class for a base model name."""
    from django.utils.module_loading import import_string
    model_path = TRANSLATION_MODEL_MAP.get(base_model_name)
    if model_path:
        return import_string(model_path)
    return None
