"""
URL routes for I18N translation management.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views_i18n import (
    # Reference/Dictionary Data
    AssetTypeTranslationViewSet,
    ConsumableTypeTranslationViewSet,
    StockItemTypeTranslationViewSet,
    LocationTypeTranslationViewSet,
    OrganizationalStructureTypeTranslationViewSet,
    PhysicalConditionTranslationViewSet,
    RoleTranslationViewSet,
    PositionTranslationViewSet,
    AssetAttributeDefinitionTranslationViewSet,
    ConsumableAttributeDefinitionTranslationViewSet,
    StockItemAttributeDefinitionTranslationViewSet,
    MaintenanceTypicalStepTranslationViewSet,
    ExternalMaintenanceTypicalStepTranslationViewSet,
    # Entity Names
    PersonTranslationViewSet,
    SupplierTranslationViewSet,
    WarehouseTranslationViewSet,
    LocationTranslationViewSet,
    OrganizationalStructureTranslationViewSet,
    # Operational Text
    AssetMovementTranslationViewSet,
    ConsumableMovementTranslationViewSet,
    StockItemMovementTranslationViewSet,
    PersonReportsProblemOnAssetTranslationViewSet,
    PersonReportsProblemOnConsumableTranslationViewSet,
    PersonReportsProblemOnStockItemTranslationViewSet,
    MaintenanceTranslationViewSet,
    AssetConditionHistoryTranslationViewSet,
    ConsumableConditionHistoryTranslationViewSet,
    StockItemConditionHistoryTranslationViewSet,
    # Other Human-Facing Text
    AssetTranslationViewSet,
    ConsumableTranslationViewSet,
    StockItemTranslationViewSet,
    AssetModelTranslationViewSet,
    ConsumableModelTranslationViewSet,
    StockItemModelTranslationViewSet,
    AdministrativeCertificateTranslationViewSet,
    CompanyAssetRequestTranslationViewSet,
    ExternalMaintenanceDocumentTranslationViewSet,
    MaintenanceStepItemRequestTranslationViewSet,
    AssetIncidentReportTranslationViewSet,
    # Metadata
    I18NMetadataView,
    I18NSearchView,
)

# Create router for viewsets
router = DefaultRouter()

# Reference/Dictionary Data routes
router.register(r'translations/asset-types', AssetTypeTranslationViewSet, basename='assettype-translation')
router.register(r'translations/consumable-types', ConsumableTypeTranslationViewSet, basename='consumabletype-translation')
router.register(r'translations/stock-item-types', StockItemTypeTranslationViewSet, basename='stockitemtype-translation')
router.register(r'translations/location-types', LocationTypeTranslationViewSet, basename='locationtype-translation')
router.register(r'translations/org-structure-types', OrganizationalStructureTypeTranslationViewSet, basename='orgstructuretype-translation')
router.register(r'translations/physical-conditions', PhysicalConditionTranslationViewSet, basename='physicalcondition-translation')
router.register(r'translations/roles', RoleTranslationViewSet, basename='role-translation')
router.register(r'translations/positions', PositionTranslationViewSet, basename='position-translation')
router.register(r'translations/asset-attr-defs', AssetAttributeDefinitionTranslationViewSet, basename='assetattrdef-translation')
router.register(r'translations/consumable-attr-defs', ConsumableAttributeDefinitionTranslationViewSet, basename='consumableattrdef-translation')
router.register(r'translations/stock-item-attr-defs', StockItemAttributeDefinitionTranslationViewSet, basename='stockitemattrdef-translation')
router.register(r'translations/maintenance-steps', MaintenanceTypicalStepTranslationViewSet, basename='maintenancestep-translation')
router.register(r'translations/ext-maintenance-steps', ExternalMaintenanceTypicalStepTranslationViewSet, basename='extmaintenancestep-translation')

# Entity Names routes
router.register(r'translations/persons', PersonTranslationViewSet, basename='person-translation')
router.register(r'translations/suppliers', SupplierTranslationViewSet, basename='supplier-translation')
router.register(r'translations/warehouses', WarehouseTranslationViewSet, basename='warehouse-translation')
router.register(r'translations/locations', LocationTranslationViewSet, basename='location-translation')
router.register(r'translations/org-structures', OrganizationalStructureTranslationViewSet, basename='orgstructure-translation')

# Operational Text routes
router.register(r'translations/asset-movements', AssetMovementTranslationViewSet, basename='assetmovement-translation')
router.register(r'translations/consumable-movements', ConsumableMovementTranslationViewSet, basename='consumablemovement-translation')
router.register(r'translations/stock-item-movements', StockItemMovementTranslationViewSet, basename='stockitemmovement-translation')
router.register(r'translations/problem-reports-assets', PersonReportsProblemOnAssetTranslationViewSet, basename='problemreportasset-translation')
router.register(r'translations/problem-reports-consumables', PersonReportsProblemOnConsumableTranslationViewSet, basename='problemreportconsumable-translation')
router.register(r'translations/problem-reports-stock-items', PersonReportsProblemOnStockItemTranslationViewSet, basename='problemreportstockitem-translation')
router.register(r'translations/maintenances', MaintenanceTranslationViewSet, basename='maintenance-translation')
router.register(r'translations/asset-condition-histories', AssetConditionHistoryTranslationViewSet, basename='assetconditionhistory-translation')
router.register(r'translations/consumable-condition-histories', ConsumableConditionHistoryTranslationViewSet, basename='consumableconditionhistory-translation')
router.register(r'translations/stock-item-condition-histories', StockItemConditionHistoryTranslationViewSet, basename='stockitemconditionhistory-translation')

# Other Human-Facing Text routes
router.register(r'translations/assets', AssetTranslationViewSet, basename='asset-translation')
router.register(r'translations/consumables', ConsumableTranslationViewSet, basename='consumable-translation')
router.register(r'translations/stock-items', StockItemTranslationViewSet, basename='stockitem-translation')
router.register(r'translations/asset-models', AssetModelTranslationViewSet, basename='assetmodel-translation')
router.register(r'translations/consumable-models', ConsumableModelTranslationViewSet, basename='consumablemodel-translation')
router.register(r'translations/stock-item-models', StockItemModelTranslationViewSet, basename='stockitemmodel-translation')
router.register(r'translations/administrative-certificates', AdministrativeCertificateTranslationViewSet, basename='administrativecertificate-translation')
router.register(r'translations/company-asset-requests', CompanyAssetRequestTranslationViewSet, basename='companyassetrequest-translation')
router.register(r'translations/ext-maintenance-documents', ExternalMaintenanceDocumentTranslationViewSet, basename='extmaintenancedocument-translation')
router.register(r'translations/maintenance-step-item-requests', MaintenanceStepItemRequestTranslationViewSet, basename='maintenancestepitemrequest-translation')
router.register(r'translations/asset-incident-reports', AssetIncidentReportTranslationViewSet, basename='assetincidentreport-translation')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
    path('i18n/metadata/', I18NMetadataView.as_view(), name='i18n-metadata'),
    path('i18n/search/', I18NSearchView.as_view(), name='i18n-search'),
]
