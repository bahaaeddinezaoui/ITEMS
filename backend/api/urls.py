from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import LoginView, LogoutView, UserSessionViewSet, AuthenticationLogViewSet, ChangePasswordView, AdminResetUserPasswordView, UserAccountCreateView, UserAccountDetailView, SignupView, ApproveUserAccountView, PendingUserAccountsView, PersonViewSet, AssetTypeViewSet, AssetBrandViewSet, AssetModelViewSet, AssetModelDefaultStockItemViewSet, AssetModelDefaultConsumableViewSet, AssetViewSet, AssetIsAssignedToPersonViewSet, StockItemIsAssignedToPersonViewSet, ConsumableIsAssignedToPersonViewSet, StockItemTypeViewSet, StockItemBrandViewSet, StockItemModelViewSet, StockItemViewSet, ConsumableTypeViewSet, ConsumableBrandViewSet, ConsumableModelViewSet, ConsumableViewSet, AssetAttributeDefinitionViewSet, AssetTypeAttributeViewSet, AssetModelAttributeValueViewSet, AssetAttributeValueViewSet, StockItemAttributeDefinitionViewSet, StockItemTypeAttributeViewSet, StockItemModelAttributeValueViewSet, StockItemAttributeValueViewSet, ConsumableAttributeDefinitionViewSet, ConsumableTypeAttributeViewSet, ConsumableModelAttributeValueViewSet, ConsumableAttributeValueViewSet, MaintenanceViewSet, MaintenanceStepViewSet, MaintenanceTypicalStepViewSet, MaintenanceStepItemRequestViewSet, ProblemReportViewSet, MyItemsView, DashboardKpiView, LocationTypeViewSet, LocationViewSet, LocationRelationViewSet, PhysicalConditionViewSet, PositionViewSet, RoleViewSet, PositionRoleMappingViewSet, OrganizationalStructureTypeViewSet, OrganizationalStructureViewSet, OrganizationalStructureRelationViewSet, WarehouseViewSet, AttributionOrderViewSet, AttributionOrderAssetStockItemAccessoryViewSet, AttributionOrderAssetConsumableAccessoryViewSet, ReceiptReportViewSet, AdministrativeCertificateViewSet, StockItemConsumableDestructionCertificateViewSet, AssetDestructionCertificateViewSet, CompanyAssetRequestViewSet, AssetIncidentReportViewSet, ExternalMaintenanceProviderViewSet, ExternalMaintenanceTypicalStepViewSet, ExternalMaintenanceViewSet, ExternalMaintenanceStepViewSet, AssetMaintenanceTimelineView, StockItemMovementApprovalViewSet, ConsumableMovementApprovalViewSet, AssetMovementApprovalViewSet, PurchaseOrderViewSet, BackorderReportViewSet, InventoryReportViewSet
from .location_inventory import LocationInventoryView

router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')
router.register(r'asset-types', AssetTypeViewSet, basename='assettype')
router.register(r'asset-brands', AssetBrandViewSet, basename='assetbrand')
router.register(r'asset-models', AssetModelViewSet, basename='assetmodel')
router.register(r'asset-model-default-stock-items', AssetModelDefaultStockItemViewSet, basename='assetmodeldefaultstockitem')
router.register(r'asset-model-default-consumables', AssetModelDefaultConsumableViewSet, basename='assetmodeldefaultconsumable')
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'asset-assignments', AssetIsAssignedToPersonViewSet, basename='assetassignment')
router.register(r'stock-item-assignments', StockItemIsAssignedToPersonViewSet, basename='stockitemassignment')
router.register(r'consumable-assignments', ConsumableIsAssignedToPersonViewSet, basename='consumableassignment')
router.register(r'asset-attribute-definitions', AssetAttributeDefinitionViewSet, basename='assetattributedefinition')
router.register(r'asset-type-attributes', AssetTypeAttributeViewSet, basename='assettypeattribute')
router.register(r'asset-model-attributes', AssetModelAttributeValueViewSet, basename='assetmodelattribute')
router.register(r'asset-attributes', AssetAttributeValueViewSet, basename='assetattribute')
router.register(r'stock-item-attribute-definitions', StockItemAttributeDefinitionViewSet, basename='stockitemattributedefinition')
router.register(r'stock-item-type-attributes', StockItemTypeAttributeViewSet, basename='stockitemtypeattribute')
router.register(r'stock-item-model-attributes', StockItemModelAttributeValueViewSet, basename='stockitemmodelattribute')
router.register(r'stock-item-attributes', StockItemAttributeValueViewSet, basename='stockitemattribute')
router.register(r'consumable-attribute-definitions', ConsumableAttributeDefinitionViewSet, basename='consumableattributedefinition')
router.register(r'consumable-type-attributes', ConsumableTypeAttributeViewSet, basename='consumabletypeattribute')
router.register(r'consumable-model-attributes', ConsumableModelAttributeValueViewSet, basename='consumablemodelattribute')
router.register(r'consumable-attributes', ConsumableAttributeValueViewSet, basename='consumableattribute')
router.register(r'stock-item-types', StockItemTypeViewSet, basename='stockitemtype')
router.register(r'stock-item-brands', StockItemBrandViewSet, basename='stockitembrand')
router.register(r'stock-item-models', StockItemModelViewSet, basename='stockitemmodel')
router.register(r'stock-items', StockItemViewSet, basename='stockitem')
router.register(r'consumable-types', ConsumableTypeViewSet, basename='consumabletype')
router.register(r'consumable-brands', ConsumableBrandViewSet, basename='consumablebrand')
router.register(r'consumable-models', ConsumableModelViewSet, basename='consumablemodel')
router.register(r'consumables', ConsumableViewSet, basename='consumable')
router.register(r'maintenances', MaintenanceViewSet, basename='maintenance')
router.register(r'maintenance-steps', MaintenanceStepViewSet, basename='maintenancestep')
router.register(r'maintenance-step-item-requests', MaintenanceStepItemRequestViewSet, basename='maintenancestepitemrequest')
router.register(r'maintenance-typical-steps', MaintenanceTypicalStepViewSet, basename='maintenancetypicalstep')
router.register(r'problem-reports', ProblemReportViewSet, basename='problemreport')
router.register(r'location-types', LocationTypeViewSet, basename='locationtype')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'location-relations', LocationRelationViewSet, basename='locationrelation')
router.register(r'physical-conditions', PhysicalConditionViewSet, basename='physicalcondition')
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'position-role-mappings', PositionRoleMappingViewSet, basename='positionrolemapping')
router.register(r'organizational-structure-types', OrganizationalStructureTypeViewSet, basename='organizationalstructuretype')
router.register(r'organizational-structures', OrganizationalStructureViewSet, basename='organizationalstructure')
router.register(r'organizational-structure-relations', OrganizationalStructureRelationViewSet, basename='organizationalstructurerelation')
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'attribution-orders', AttributionOrderViewSet, basename='attributionorder')
router.register(r'attribution-order-asset-stock-item-accessories', AttributionOrderAssetStockItemAccessoryViewSet, basename='attributionorderassetstockitemaccessory')
router.register(r'attribution-order-asset-consumable-accessories', AttributionOrderAssetConsumableAccessoryViewSet, basename='attributionorderassetconsumableaccessory')
router.register(r'receipt-reports', ReceiptReportViewSet, basename='receiptreport')
router.register(r'administrative-certificates', AdministrativeCertificateViewSet, basename='administrativecertificate')
router.register(r'stock-item-consumable-destruction-certificates', StockItemConsumableDestructionCertificateViewSet, basename='stockitemconsumabledestructioncertificate')
router.register(r'asset-destruction-certificates', AssetDestructionCertificateViewSet, basename='assetdestructioncertificate')
router.register(r'company-asset-requests', CompanyAssetRequestViewSet, basename='companyassetrequest')
router.register(r'asset-incident-reports', AssetIncidentReportViewSet, basename='assetincidentreport')
router.register(r'external-maintenance-providers', ExternalMaintenanceProviderViewSet, basename='externalmaintenanceprovider')
router.register(r'external-maintenance-typical-steps', ExternalMaintenanceTypicalStepViewSet, basename='externalmaintenancetypicalstep')
router.register(r'external-maintenances', ExternalMaintenanceViewSet, basename='externalmaintenance')
router.register(r'external-maintenance-steps', ExternalMaintenanceStepViewSet, basename='externalmaintenancestep')
router.register(r'stock-item-movements-approval', StockItemMovementApprovalViewSet, basename='stockitemmovementapproval')
router.register(r'consumable-movements-approval', ConsumableMovementApprovalViewSet, basename='consumablemovementapproval')
router.register(r'asset-movements-approval', AssetMovementApprovalViewSet, basename='assetmovementapproval')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'backorder-reports', BackorderReportViewSet, basename='backorderreport')
router.register(r'inventory-reports', InventoryReportViewSet, basename='inventoryreport')
router.register(r'user-sessions', UserSessionViewSet, basename='usersession')
router.register(r'auth-logs', AuthenticationLogViewSet, basename='authlog')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('my-items/', MyItemsView.as_view(), name='my-items'),
    path('dashboard/kpis/', DashboardKpiView.as_view(), name='dashboard-kpis'),
    path('asset-maintenance-timeline/', AssetMaintenanceTimelineView.as_view(), name='asset-maintenance-timeline'),
    path('asset-maintenance-timeline/<int:asset_id>/', AssetMaintenanceTimelineView.as_view(), name='asset-maintenance-timeline-detail'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/admin-reset-password/', AdminResetUserPasswordView.as_view(), name='admin-reset-password'),
    path('user-accounts/', UserAccountCreateView.as_view(), name='user-accounts'),
    path('user-accounts/detail/', UserAccountDetailView.as_view(), name='user-account-detail'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/approve-user/', ApproveUserAccountView.as_view(), name='approve-user'),
    path('auth/pending-users/', PendingUserAccountsView.as_view(), name='pending-users'),
    path('location-inventory/', LocationInventoryView.as_view(), name='location-inventory'),
    path('i18n/', include('api.urls_i18n')),
    # All endpoints have been restored and are now available
    path('', include(router.urls)),
]
