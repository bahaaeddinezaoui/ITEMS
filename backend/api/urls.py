from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, PersonViewSet, UserAccountViewSet, ProblemReportViewSet, MyItemsViewSet, AssetAssignmentViewSet, StockItemAssignmentViewSet, ConsumableAssignmentViewSet, AssetTypeViewSet, AssetBrandViewSet, AssetModelViewSet, StockItemTypeViewSet, StockItemBrandViewSet, StockItemModelViewSet, ConsumableTypeViewSet, ConsumableBrandViewSet, ConsumableModelViewSet, RoomTypeViewSet, RoomViewSet, PositionViewSet, OrganizationalStructureViewSet, OrganizationalStructureRelationViewSet, AssetViewSet, MaintenanceViewSet, StockItemViewSet, ConsumableViewSet

router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')
router.register(r'user-accounts', UserAccountViewSet, basename='useraccount')
router.register(r'problem-reports', ProblemReportViewSet, basename='problemreport')
router.register(r'my-items', MyItemsViewSet, basename='myitems')
router.register(r'asset-assignments', AssetAssignmentViewSet, basename='assetassignment')
router.register(r'stock-item-assignments', StockItemAssignmentViewSet, basename='stockitemassignment')
router.register(r'consumable-assignments', ConsumableAssignmentViewSet, basename='consumableassignment')
router.register(r'asset-types', AssetTypeViewSet, basename='assettype')
router.register(r'asset-brands', AssetBrandViewSet, basename='assetbrand')
router.register(r'asset-models', AssetModelViewSet, basename='assetmodel')
router.register(r'stock-item-types', StockItemTypeViewSet, basename='stockitemtype')
router.register(r'stock-item-brands', StockItemBrandViewSet, basename='stockitembrand')
router.register(r'stock-item-models', StockItemModelViewSet, basename='stockitemmodel')
router.register(r'consumable-types', ConsumableTypeViewSet, basename='consumabletype')
router.register(r'consumable-brands', ConsumableBrandViewSet, basename='consumablebrand')
router.register(r'consumable-models', ConsumableModelViewSet, basename='consumablemodel')
router.register(r'room-types', RoomTypeViewSet, basename='roomtype')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'organizational-structures', OrganizationalStructureViewSet, basename='organizationalstructure')
router.register(r'organizational-structure-relations', OrganizationalStructureRelationViewSet, basename='organizationalstructurerelation')
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'stock-items', StockItemViewSet, basename='stockitem')
router.register(r'consumables', ConsumableViewSet, basename='consumable')
router.register(r'maintenances', MaintenanceViewSet, basename='maintenance')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]
