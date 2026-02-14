from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, PersonViewSet, AssetTypeViewSet, AssetBrandViewSet, AssetModelViewSet, AssetViewSet, StockItemTypeViewSet, StockItemBrandViewSet, StockItemModelViewSet, StockItemViewSet, ConsumableTypeViewSet, ConsumableBrandViewSet, ConsumableModelViewSet, ConsumableViewSet, AssetAttributeDefinitionViewSet, AssetTypeAttributeViewSet, AssetModelAttributeValueViewSet, AssetAttributeValueViewSet, StockItemAttributeDefinitionViewSet, StockItemTypeAttributeViewSet, StockItemModelAttributeValueViewSet, StockItemAttributeValueViewSet, ConsumableAttributeDefinitionViewSet, ConsumableTypeAttributeViewSet, ConsumableModelAttributeValueViewSet, ConsumableAttributeValueViewSet

router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')
router.register(r'asset-types', AssetTypeViewSet, basename='assettype')
router.register(r'asset-brands', AssetBrandViewSet, basename='assetbrand')
router.register(r'asset-models', AssetModelViewSet, basename='assetmodel')
router.register(r'assets', AssetViewSet, basename='asset')
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
# NOTE: room/org-structure/maintenance endpoints were removed from api.views during refactor.
# Re-add their viewsets to api.views (or split into separate modules) if you still need these routes.

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    # NOTE: my-items/problem-reports endpoints were removed from api.views during refactor.
    # Re-add their views to api.views (or split into separate modules) if you still need these routes.
    path('', include(router.urls)),
]
