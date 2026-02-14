from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, PersonViewSet, AssetTypeViewSet, AssetBrandViewSet, AssetModelViewSet, StockItemTypeViewSet, StockItemBrandViewSet, StockItemModelViewSet, ConsumableTypeViewSet, ConsumableBrandViewSet, ConsumableModelViewSet, RoomTypeViewSet, RoomViewSet, PositionViewSet, OrganizationalStructureViewSet, OrganizationalStructureRelationViewSet, MaintenanceViewSet, MyItemsView, ProblemReportView, CreateMaintenanceView

router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')
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
router.register(r'maintenances', MaintenanceViewSet, basename='maintenance')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('my-items/', MyItemsView.as_view(), name='my-items'),
    path('problem-reports/create-maintenance/', CreateMaintenanceView.as_view(), name='create-maintenance'),
    path('problem-reports/', ProblemReportView.as_view(), name='problem-reports'),
    path('', include(router.urls)),
]
