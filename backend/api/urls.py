from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, PersonViewSet, AssetTypeViewSet, AssetBrandViewSet, AssetModelViewSet, StockItemTypeViewSet, StockItemBrandViewSet, StockItemModelViewSet

router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')
router.register(r'asset-types', AssetTypeViewSet, basename='assettype')
router.register(r'asset-brands', AssetBrandViewSet, basename='assetbrand')
router.register(r'asset-models', AssetModelViewSet, basename='assetmodel')
router.register(r'stock-item-types', StockItemTypeViewSet, basename='stockitemtype')
router.register(r'stock-item-brands', StockItemBrandViewSet, basename='stockitembrand')
router.register(r'stock-item-models', StockItemModelViewSet, basename='stockitemmodel')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]
