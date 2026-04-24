"""
API Views for I18N Translation Management.

These views provide CRUD operations for managing translations across
all translatable entities in the system.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.apps import apps
from django.db import transaction

from api.translations import (
    # Reference/Dictionary Data
    AssetTypeTranslation,
    ConsumableTypeTranslation,
    StockItemTypeTranslation,
    LocationTypeTranslation,
    OrganizationalStructureTypeTranslation,
    PhysicalConditionTranslation,
    RoleTranslation,
    PositionTranslation,
    AssetAttributeDefinitionTranslation,
    ConsumableAttributeDefinitionTranslation,
    StockItemAttributeDefinitionTranslation,
    MaintenanceTypicalStepTranslation,
    ExternalMaintenanceTypicalStepTranslation,
    # Entity Names
    PersonTranslation,
    SupplierTranslation,
    WarehouseTranslation,
    LocationTranslation,
    OrganizationalStructureTranslation,
    # Operational Text
    AssetMovementTranslation,
    ConsumableMovementTranslation,
    StockItemMovementTranslation,
    PersonReportsProblemOnAssetTranslation,
    PersonReportsProblemOnConsumableTranslation,
    PersonReportsProblemOnStockItemTranslation,
    MaintenanceTranslation,
    AssetConditionHistoryTranslation,
    ConsumableConditionHistoryTranslation,
    StockItemConditionHistoryTranslation,
    # Other Human-Facing Text
    AssetTranslation,
    ConsumableTranslation,
    StockItemTranslation,
    AssetModelTranslation,
    ConsumableModelTranslation,
    StockItemModelTranslation,
    AdministrativeCertificateTranslation,
    CompanyAssetRequestTranslation,
    ExternalMaintenanceDocumentTranslation,
    MaintenanceStepItemRequestTranslation,
    AssetIncidentReportTranslation,
)


class BaseTranslationViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet for translation management.
    
    Provides common functionality for all translation viewsets:
    - Filtering by language_code
    - Bulk create/update operations
    - Fallback handling
    """
    
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        """Filter by language_code if provided."""
        queryset = super().get_queryset()
        language_code = self.request.query_params.get('lang')
        if language_code:
            queryset = queryset.filter(language_code=language_code)
        return queryset
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """
        Bulk create or update translations.
        
        Request body:
        {
            "translations": [
                {
                    "entity_id": 1,
                    "language_code": "ar",
                    "field_name": "translated_value"
                }
            ]
        }
        """
        translations_data = request.data.get('translations', [])
        
        with transaction.atomic():
            for trans_data in translations_data:
                entity_id = trans_data.pop('entity_id', None)
                language_code = trans_data.pop('language_code', None)
                
                if not entity_id or not language_code:
                    continue
                
                # Get or create translation
                fk_field = self._get_fk_field_name()
                filter_kwargs = {
                    fk_field: entity_id,
                    'language_code': language_code
                }
                
                translation, created = self.get_queryset().model.objects.update_or_create(
                    **filter_kwargs,
                    defaults=trans_data
                )
        
        return Response(
            {'message': f'Processed {len(translations_data)} translations'},
            status=status.HTTP_200_OK
        )
    
    def _get_fk_field_name(self):
        """Get the foreign key field name for this translation model."""
        model = self.get_queryset().model
        for field in model._meta.fields:
            if field.is_relation and field.many_to_one:
                return field.name
        return None


# ============================================================================
# Reference/Dictionary Data Views
# ============================================================================

class AssetTypeTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for AssetType translations."""
    queryset = AssetTypeTranslation.objects.all()


class ConsumableTypeTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for ConsumableType translations."""
    queryset = ConsumableTypeTranslation.objects.all()


class StockItemTypeTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for StockItemType translations."""
    queryset = StockItemTypeTranslation.objects.all()


class LocationTypeTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for LocationType translations."""
    queryset = LocationTypeTranslation.objects.all()


class OrganizationalStructureTypeTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for OrganizationalStructureType translations."""
    queryset = OrganizationalStructureTypeTranslation.objects.all()


class PhysicalConditionTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for PhysicalCondition translations."""
    queryset = PhysicalConditionTranslation.objects.all()


class RoleTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for Role translations."""
    queryset = RoleTranslation.objects.all()


class PositionTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for Position translations."""
    queryset = PositionTranslation.objects.all()


class AssetAttributeDefinitionTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for AssetAttributeDefinition translations."""
    queryset = AssetAttributeDefinitionTranslation.objects.all()


class ConsumableAttributeDefinitionTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for ConsumableAttributeDefinition translations."""
    queryset = ConsumableAttributeDefinitionTranslation.objects.all()


class StockItemAttributeDefinitionTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for StockItemAttributeDefinition translations."""
    queryset = StockItemAttributeDefinitionTranslation.objects.all()


class MaintenanceTypicalStepTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for MaintenanceTypicalStep translations."""
    queryset = MaintenanceTypicalStepTranslation.objects.all()


class ExternalMaintenanceTypicalStepTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for ExternalMaintenanceTypicalStep translations."""
    queryset = ExternalMaintenanceTypicalStepTranslation.objects.all()


# ============================================================================
# Entity Names Views
# ============================================================================

class PersonTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for Person translations."""
    queryset = PersonTranslation.objects.all()


class SupplierTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for Supplier translations."""
    queryset = SupplierTranslation.objects.all()


class WarehouseTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for Warehouse translations."""
    queryset = WarehouseTranslation.objects.all()


class LocationTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for Location translations."""
    queryset = LocationTranslation.objects.all()


class OrganizationalStructureTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for OrganizationalStructure translations."""
    queryset = OrganizationalStructureTranslation.objects.all()


# ============================================================================
# Operational Text Views
# ============================================================================

class AssetMovementTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for AssetMovement translations."""
    queryset = AssetMovementTranslation.objects.all()


class ConsumableMovementTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for ConsumableMovement translations."""
    queryset = ConsumableMovementTranslation.objects.all()


class StockItemMovementTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for StockItemMovement translations."""
    queryset = StockItemMovementTranslation.objects.all()


class PersonReportsProblemOnAssetTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for PersonReportsProblemOnAsset translations."""
    queryset = PersonReportsProblemOnAssetTranslation.objects.all()


class PersonReportsProblemOnConsumableTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for PersonReportsProblemOnConsumable translations."""
    queryset = PersonReportsProblemOnConsumableTranslation.objects.all()


class PersonReportsProblemOnStockItemTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for PersonReportsProblemOnStockItem translations."""
    queryset = PersonReportsProblemOnStockItemTranslation.objects.all()


class MaintenanceTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for Maintenance translations."""
    queryset = MaintenanceTranslation.objects.all()


class AssetConditionHistoryTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for AssetConditionHistory translations."""
    queryset = AssetConditionHistoryTranslation.objects.all()


class ConsumableConditionHistoryTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for ConsumableConditionHistory translations."""
    queryset = ConsumableConditionHistoryTranslation.objects.all()


class StockItemConditionHistoryTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for StockItemConditionHistory translations."""
    queryset = StockItemConditionHistoryTranslation.objects.all()


# ============================================================================
# Other Human-Facing Text Views
# ============================================================================

class AssetTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for Asset translations."""
    queryset = AssetTranslation.objects.all()


class ConsumableTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for Consumable translations."""
    queryset = ConsumableTranslation.objects.all()


class StockItemTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for StockItem translations."""
    queryset = StockItemTranslation.objects.all()


class AssetModelTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for AssetModel translations."""
    queryset = AssetModelTranslation.objects.all()


class ConsumableModelTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for ConsumableModel translations."""
    queryset = ConsumableModelTranslation.objects.all()


class StockItemModelTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for StockItemModel translations."""
    queryset = StockItemModelTranslation.objects.all()


class AdministrativeCertificateTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for AdministrativeCertificate translations."""
    queryset = AdministrativeCertificateTranslation.objects.all()


class CompanyAssetRequestTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for CompanyAssetRequest translations."""
    queryset = CompanyAssetRequestTranslation.objects.all()


class ExternalMaintenanceDocumentTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for ExternalMaintenanceDocument translations."""
    queryset = ExternalMaintenanceDocumentTranslation.objects.all()


class MaintenanceStepItemRequestTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for MaintenanceStepItemRequest translations."""
    queryset = MaintenanceStepItemRequestTranslation.objects.all()


class AssetIncidentReportTranslationViewSet(BaseTranslationViewSet):
    """ViewSet for AssetIncidentReport translations."""
    queryset = AssetIncidentReportTranslation.objects.all()


# ============================================================================
# I18N Metadata View
# =============================================================================

from rest_framework.views import APIView


class I18NMetadataView(APIView):
    """
    View to get I18N metadata about the system.
    
    Returns:
        - Available languages
        - Translatable entities
        - Translation coverage statistics
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get I18N metadata."""
        from api.utils.i18n import TRANSLATION_MODEL_MAP
        
        # Calculate translation coverage for each entity
        coverage_stats = {}
        
        for base_model_name, translation_model_path in TRANSLATION_MODEL_MAP.items():
            try:
                translation_model = apps.get_model(translation_model_path.replace('api.models.', 'api.'))
                total_entities = apps.get_model('api', base_model_name).objects.count()
                
                # Count entities with translations
                en_count = translation_model.objects.filter(language_code='en').count()
                ar_count = translation_model.objects.filter(language_code='ar').count()
                
                coverage_stats[base_model_name] = {
                    'total_entities': total_entities,
                    'english_translations': en_count,
                    'arabic_translations': ar_count,
                    'coverage_percent': round((ar_count / total_entities * 100), 2) if total_entities > 0 else 0
                }
            except Exception as e:
                coverage_stats[base_model_name] = {'error': str(e)}
        
        return Response({
            'available_languages': [
                {'code': 'en', 'name': 'English', 'is_default': True},
                {'code': 'ar', 'name': 'Arabic', 'is_default': False},
            ],
            'translatable_entities': list(TRANSLATION_MODEL_MAP.keys()),
            'coverage_stats': coverage_stats,
        })


class I18NSearchView(APIView):
    """
    Search for translations across all entities.
    
    Query params:
        - q: Search query
        - lang: Language code to search in (default: all)
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Search translations."""
        query = request.query_params.get('q', '')
        language_code = request.query_params.get('lang')
        
        if not query or len(query) < 2:
            return Response(
                {'error': 'Search query must be at least 2 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        
        # Search in reference data translations (simplified example)
        from api.models import AssetTypeTranslation
        
        asset_type_qs = AssetTypeTranslation.objects.filter(
            asset_type_label__icontains=query
        )
        if language_code:
            asset_type_qs = asset_type_qs.filter(language_code=language_code)
        
        for trans in asset_type_qs[:10]:
            results.append({
                'entity_type': 'AssetType',
                'entity_id': trans.asset_type_id,
                'language': trans.language_code,
                'matched_field': 'asset_type_label',
                'value': trans.asset_type_label,
            })
        
        return Response({
            'query': query,
            'language_filter': language_code,
            'results_count': len(results),
            'results': results,
        })
