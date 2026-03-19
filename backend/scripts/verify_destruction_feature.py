import os
import django
import sys
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import (
    Asset, StockItem, Consumable, Location, 
    AssetIsComposedOfStockItemHistory, AssetIsComposedOfConsumableHistory,
    StockItemMovement, ConsumableMovement, UserAccount, PersonRoleMapping, Role
)

def setup_test_data():
    print("Setting up test data...")
    
    # 1. Get or create a maintenance chief user for permission check
    user = UserAccount.objects.filter(username='bahaaeddinezaoui').first()
    if not user:
        print("User 'bahaaeddinezaoui' not found. Please run with a valid user.")
        return None, None
    
    # Ensure user has maintenance_chief role
    role = Role.objects.filter(role_code='maintenance_chief').first()
    if not role:
        role = Role.objects.create(role_code='maintenance_chief', role_label='Maintenance Chief')
    PersonRoleMapping.objects.get_or_create(person=user.person, role=role)

    # 2. Get a storage location
    storage_loc = Location.objects.first()
    if not storage_loc:
        print("No locations found in database.")
        return None, None

    # 3. Create a test asset with 'failed' status
    last_asset = Asset.objects.order_by("-asset_id").first()
    next_id = (last_asset.asset_id + 1) if last_asset else 1
    asset = Asset.objects.create(
        asset_id=next_id,
        asset_name="Test Asset for Destruction",
        asset_status="failed",
        asset_model_id=1,
        attribution_order_id=None
    )
    
    # Create a mock movement for the asset so we have a source location for recovered items
    from api.models import AssetMovement
    last_am = AssetMovement.objects.order_by("-asset_movement_id").first()
    next_am_id = (last_am.asset_movement_id + 1) if last_am else 1
    AssetMovement.objects.create(
        asset_movement_id=next_am_id,
        asset=asset,
        source_location=storage_loc,
        destination_location=storage_loc,
        movement_reason="Test setup",
        movement_datetime=timezone.now(),
        status="accepted"
    )
    print(f"Created Asset ID: {asset.asset_id} with mock movement")

    # 4. Create composing items
    last_si = StockItem.objects.order_by("-stock_item_id").first()
    next_si_id = (last_si.stock_item_id + 1) if last_si else 1
    si = StockItem.objects.create(
        stock_item_id=next_si_id,
        stock_item_name="Composed Stock Item",
        stock_item_status="Included with Asset",
        stock_item_model_id=1
    )
    AssetIsComposedOfStockItemHistory.objects.create(
        asset=asset,
        stock_item=si,
        start_datetime=timezone.now()
    )
    print(f"Created StockItem ID: {si.stock_item_id} (Composed)")

    last_con = Consumable.objects.order_by("-consumable_id").first()
    next_con_id = (last_con.consumable_id + 1) if last_con else 1
    con = Consumable.objects.create(
        consumable_id=next_con_id,
        consumable_name="Composed Consumable",
        consumable_status="Included with Asset",
        consumable_model_id=1
    )
    AssetIsComposedOfConsumableHistory.objects.create(
        asset=asset,
        consumable=con,
        start_datetime=timezone.now()
    )
    print(f"Created Consumable ID: {con.consumable_id} (Composed)")

    return asset, storage_loc

def verify_results(asset_id, stock_item_id, consumable_id, storage_loc_id):
    print("\nVerifying results...")
    
    # Check Asset status
    asset = Asset.objects.get(asset_id=asset_id)
    print(f"Asset Status: {asset.asset_status} (Expected: suggested_for_destruction)")
    
    # Check StockItem (Selected for destruction)
    si = StockItem.objects.get(stock_item_id=stock_item_id)
    print(f"StockItem Status: {si.stock_item_status} (Expected: suggested_for_destruction)")
    
    # Check Consumable (Recovered - NOT selected for destruction)
    con = Consumable.objects.get(consumable_id=consumable_id)
    print(f"Consumable Status: {con.consumable_status} (Expected: Included with Asset / unchanged but unmapped)")
    
    # Check Composition history for Consumable (should be ended)
    history = AssetIsComposedOfConsumableHistory.objects.filter(asset_id=asset_id, consumable_id=consumable_id).first()
    print(f"Consumable Composition Ended: {history.end_datetime is not None} (Expected: True)")
    
    # Check for Movement Request for Consumable
    move = ConsumableMovement.objects.filter(consumable_id=consumable_id, destination_location_id=storage_loc_id).first()
    if move:
        print(f"Consumable Movement Created: ID {move.consumable_movement_id}, Status: {move.status}")
    else:
        print("Consumable Movement NOT found! (Expected: Found)")

if __name__ == "__main__":
    asset, storage_loc = setup_test_data()
    if not asset:
        sys.exit(1)
    
    asset_id = asset.asset_id
    si_id = StockItem.objects.filter(composition_history__asset=asset).first().stock_item_id
    con_id = Consumable.objects.filter(composition_history__asset=asset).first().consumable_id
    storage_id = storage_loc.location_id

    print(f"\nSimulating 'suggest_for_destruction' call for Asset {asset_id}...")
    print(f"Destroying StockItem {si_id}, Recovering Consumable {con_id} to Location {storage_id}")

    # We manually trigger the ViewSet logic since running a full API request requires more setup
    from api.views import AssetViewSet
    from rest_framework.test import APIRequestFactory, force_authenticate
    
    factory = APIRequestFactory()
    user = UserAccount.objects.get(username='bahaaeddinezaoui')
    
    request = factory.post(f'/api/assets/{asset_id}/suggest-for-destruction/', {
        'stock_item_ids': [si_id],
        'consumable_ids': [], # Only Si selected
        'storage_location_id': storage_id
    }, format='json')
    
    force_authenticate(request, user=user)
    
    view = AssetViewSet.as_view({'post': 'suggest_for_destruction'})
    response = view(request, pk=asset_id)
    
    print(f"Response Status: {response.status_code}")
    if response.status_code == 200:
        verify_results(asset_id, si_id, con_id, storage_id)
    else:
        print(f"Error Response: {response.data}")
