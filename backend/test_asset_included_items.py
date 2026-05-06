"""
Test script: Verify that included stock items and consumables are created
in the database when an asset is created with an attribution order.

Tests:
1. Serializer validation accepts included items with instances (list of dicts)
2. Asset creation with included_stock_items creates StockItem + history records
3. Asset creation with included_consumables creates Consumable + history records
4. Multiple instances per item are created correctly

Usage:
    cd backend
    python test_asset_included_items.py
"""

import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.test import force_authenticate
from api.models import (
    Asset, StockItem, Consumable,
    AssetIsComposedOfStockItemHistory, AssetIsComposedOfConsumableHistory,
    AttributionOrder, Warehouse, AssetType, AssetBrand, AssetModel,
    StockItemType, StockItemBrand, StockItemModel,
    ConsumableType, ConsumableBrand, ConsumableModel,
    UserAccount,
)
from api.serializers import AssetSerializer
from api.views import AssetViewSet


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_or_create(model, defaults, **filters):
    """Like Django's get_or_create but works with managed=False models."""
    existing = model.objects.filter(**filters).first()
    if existing:
        return existing, False
    else:
        obj = model(**filters, **defaults)
        # Get next auto PK
        pk_field = model._meta.pk
        last = model.objects.order_by(f'-{pk_field.name}').first()
        setattr(obj, pk_field.name, (getattr(last, pk_field.name) + 1) if last else 1)
        obj.save()
        return obj, True


def setup_test_data():
    """Create prerequisite records needed for the test."""
    warehouse, _ = get_or_create(Warehouse, {'warehouse_name': 'Test Warehouse'})
    asset_type, _ = get_or_create(AssetType, {'asset_type_label': 'Test Asset Type'})
    asset_brand, _ = get_or_create(AssetBrand, {'brand_name': 'Test Asset Brand'})
    asset_model, _ = get_or_create(
        AssetModel,
        {'asset_brand': asset_brand, 'asset_type': asset_type, 'model_name': 'Test Model'},
    )
    si_type, _ = get_or_create(StockItemType, {'stock_item_type_label': 'Test SI Type'})
    si_brand, _ = get_or_create(StockItemBrand, {'brand_name': 'Test SI Brand'})
    si_model, _ = get_or_create(
        StockItemModel,
        {'stock_item_brand': si_brand, 'stock_item_type': si_type, 'model_name': 'Test SI Model'},
    )
    cons_type, _ = get_or_create(ConsumableType, {'consumable_type_label': 'Test Cons Type'})
    cons_brand, _ = get_or_create(ConsumableBrand, {'brand_name': 'Test Cons Brand'})
    cons_model, _ = get_or_create(
        ConsumableModel,
        {'consumable_brand': cons_brand, 'consumable_type': cons_type, 'model_name': 'Test Cons Model'},
    )
    order, _ = get_or_create(
        AttributionOrder,
        {
            'warehouse': warehouse,
            'attribution_order_full_code': 'TEST-AO-001',
            'attribution_order_date': '2026-01-01',
        },
    )
    return {
        'warehouse': warehouse,
        'asset_type': asset_type,
        'asset_brand': asset_brand,
        'asset_model': asset_model,
        'si_model': si_model,
        'cons_model': cons_model,
        'order': order,
    }


def cleanup_test_data(data, asset_ids, stock_item_ids, consumable_ids):
    """Remove test records to keep DB clean."""
    for sid in stock_item_ids:
        AssetIsComposedOfStockItemHistory.objects.filter(stock_item_id=sid).delete()
        StockItem.objects.filter(stock_item_id=sid).delete()
    for cid in consumable_ids:
        AssetIsComposedOfConsumableHistory.objects.filter(consumable_id=cid).delete()
        Consumable.objects.filter(consumable_id=cid).delete()
    for aid in asset_ids:
        Asset.objects.filter(asset_id=aid).delete()


# ── Tests ────────────────────────────────────────────────────────────────────

def test_serializer_accepts_included_items_with_instances(data):
    """Test 1: AssetSerializer should validate included items with instances (list of dicts)."""
    print("\n" + "=" * 60)
    print("TEST 1: Serializer accepts included items with instances")
    print("=" * 60)

    payload = {
        'asset_model': data['asset_model'].asset_model_id,
        'attribution_order': data['order'].attribution_order_id,
        'asset_status': 'not_delivered_to_company',
        'included_stock_items': [
            {
                'stock_item_model': data['si_model'].stock_item_model_id,
                'quantity': 2,
                'instances': [
                    {'stock_item_name': 'Keyboard-1', 'stock_item_inventory_number': 'KB001'},
                    {'stock_item_name': 'Keyboard-2', 'stock_item_inventory_number': 'KB002'},
                ],
            }
        ],
        'included_consumables': [
            {
                'consumable_model': data['cons_model'].consumable_model_id,
                'quantity': 1,
                'instances': [
                    {'consumable_name': 'Toner-1', 'consumable_serial_number': 'TN001', 'consumable_inventory_number': 'CI001'},
                ],
            }
        ],
    }

    serializer = AssetSerializer(data=payload)
    is_valid = serializer.is_valid()

    if not is_valid:
        print(f"  FAIL: Serializer validation errors: {serializer.errors}")
        return False

    # Verify types are preserved
    stock_items = serializer.validated_data['included_stock_items']
    consumables = serializer.validated_data['included_consumables']

    item = stock_items[0]
    if not isinstance(item['stock_item_model'], int):
        print(f"  FAIL: stock_item_model should be int, got {type(item['stock_item_model'])}: {item['stock_item_model']}")
        return False
    if not isinstance(item['quantity'], int):
        print(f"  FAIL: quantity should be int, got {type(item['quantity'])}: {item['quantity']}")
        return False
    if not isinstance(item['instances'], list):
        print(f"  FAIL: instances should be list, got {type(item['instances'])}: {item['instances']}")
        return False

    cons_item = consumables[0]
    if not isinstance(cons_item['consumable_model'], int):
        print(f"  FAIL: consumable_model should be int, got {type(cons_item['consumable_model'])}")
        return False
    if not isinstance(cons_item['instances'], list):
        print(f"  FAIL: consumable instances should be list, got {type(cons_item['instances'])}")
        return False

    print("  PASS: Serializer validates successfully with correct types")
    print(f"    stock_item_model={item['stock_item_model']} (int), quantity={item['quantity']} (int)")
    print(f"    instances={item['instances']} (list of dict)")
    print(f"    consumable_model={cons_item['consumable_model']} (int)")
    print(f"    consumable instances={cons_item['instances']} (list of dict)")
    return True


def test_asset_creation_with_included_stock_items(data):
    """Test 2: Creating an asset with included_stock_items creates StockItem + history records."""
    print("\n" + "=" * 60)
    print("TEST 2: Asset creation with included stock items")
    print("=" * 60)

    # Count before
    stock_count_before = StockItem.objects.count()
    history_count_before = AssetIsComposedOfStockItemHistory.objects.count()

    # Build request
    payload = {
        'asset_model': data['asset_model'].asset_model_id,
        'attribution_order': data['order'].attribution_order_id,
        'asset_status': 'not_delivered_to_company',
        'included_stock_items': [
            {
                'stock_item_model': data['si_model'].stock_item_model_id,
                'quantity': 2,
                'instances': [
                    {'stock_item_name': 'TestKeyboard-1', 'stock_item_inventory_number': 'TKB001'},
                    {'stock_item_name': 'TestKeyboard-2', 'stock_item_inventory_number': 'TKB002'},
                ],
            }
        ],
        'included_consumables': [],
    }

    factory = RequestFactory()
    request = factory.post('/api/assets/', json.dumps(payload), content_type='application/json')

    # Authenticate as superuser
    admin_user = UserAccount.objects.get(username='admin')
    force_authenticate(request, user=admin_user)

    view = AssetViewSet.as_view({'post': 'create'})
    response = view(request)

    if response.status_code != 201:
        print(f"  FAIL: Asset creation returned {response.status_code}")
        print(f"  Response: {response.data}")
        return False, []

    asset_id = response.data.get('asset_id')
    print(f"  Asset created with id={asset_id}")

    # Verify StockItem records were created
    stock_count_after = StockItem.objects.count()
    new_stock_items = stock_count_after - stock_count_before
    if new_stock_items < 2:
        print(f"  FAIL: Expected at least 2 new StockItem records, got {new_stock_items}")
        return False, [asset_id]

    # Verify history records
    history_count_after = AssetIsComposedOfStockItemHistory.objects.count()
    new_history = history_count_after - history_count_before
    if new_history < 2:
        print(f"  FAIL: Expected at least 2 new history records, got {new_history}")
        return False, [asset_id]

    # Verify the stock items are linked to the asset
    history_records = AssetIsComposedOfStockItemHistory.objects.filter(
        asset_id=asset_id, end_datetime__isnull=True
    )
    if history_records.count() < 2:
        print(f"  FAIL: Expected at least 2 active history records for asset {asset_id}, got {history_records.count()}")
        return False, [asset_id]

    # Verify stock item names from instances
    for h in history_records:
        si = h.stock_item
        if si.stock_item_name and si.stock_item_name.startswith('TestKeyboard'):
            print(f"  StockItem id={si.stock_item_id}, name={si.stock_item_name}, "
                  f"inv_num={si.stock_item_inventory_number}, status={si.stock_item_status}")
            if si.stock_item_status != 'not_delivered_to_company':
                print(f"  FAIL: Expected status 'not_delivered_to_company', got '{si.stock_item_status}'")
                return False, [asset_id]

    print("  PASS: StockItem + history records created correctly")
    return True, [asset_id]


def test_asset_creation_with_included_consumables(data):
    """Test 3: Creating an asset with included_consumables creates Consumable + history records."""
    print("\n" + "=" * 60)
    print("TEST 3: Asset creation with included consumables")
    print("=" * 60)

    cons_count_before = Consumable.objects.count()
    cons_history_before = AssetIsComposedOfConsumableHistory.objects.count()

    payload = {
        'asset_model': data['asset_model'].asset_model_id,
        'attribution_order': data['order'].attribution_order_id,
        'asset_status': 'not_delivered_to_company',
        'included_stock_items': [],
        'included_consumables': [
            {
                'consumable_model': data['cons_model'].consumable_model_id,
                'quantity': 3,
                'instances': [
                    {'consumable_name': 'TestToner-1', 'consumable_serial_number': 'TTN001', 'consumable_inventory_number': 'TCI001'},
                    {'consumable_name': 'TestToner-2', 'consumable_serial_number': 'TTN002', 'consumable_inventory_number': 'TCI002'},
                    {'consumable_name': 'TestToner-3', 'consumable_serial_number': 'TTN003', 'consumable_inventory_number': 'TCI003'},
                ],
            }
        ],
    }

    factory = RequestFactory()
    request = factory.post('/api/assets/', json.dumps(payload), content_type='application/json')

    admin_user = UserAccount.objects.get(username='admin')
    force_authenticate(request, user=admin_user)

    view = AssetViewSet.as_view({'post': 'create'})
    response = view(request)

    if response.status_code != 201:
        print(f"  FAIL: Asset creation returned {response.status_code}")
        print(f"  Response: {response.data}")
        return False, []

    asset_id = response.data.get('asset_id')
    print(f"  Asset created with id={asset_id}")

    # Verify Consumable records
    cons_count_after = Consumable.objects.count()
    new_consumables = cons_count_after - cons_count_before
    if new_consumables < 3:
        print(f"  FAIL: Expected at least 3 new Consumable records, got {new_consumables}")
        return False, [asset_id]

    # Verify history records
    cons_history_after = AssetIsComposedOfConsumableHistory.objects.count()
    new_cons_history = cons_history_after - cons_history_before
    if new_cons_history < 3:
        print(f"  FAIL: Expected at least 3 new consumable history records, got {new_cons_history}")
        return False, [asset_id]

    # Verify consumable details
    history_records = AssetIsComposedOfConsumableHistory.objects.filter(
        asset_id=asset_id, end_datetime__isnull=True
    )
    if history_records.count() < 3:
        print(f"  FAIL: Expected at least 3 active consumable history records, got {history_records.count()}")
        return False, [asset_id]

    for h in history_records:
        c = h.consumable
        if c.consumable_name and c.consumable_name.startswith('TestToner'):
            print(f"  Consumable id={c.consumable_id}, name={c.consumable_name}, "
                  f"serial={c.consumable_serial_number}, inv_num={c.consumable_inventory_number}, "
                  f"status={c.consumable_status}")
            if c.consumable_status != 'not_delivered_to_company':
                print(f"  FAIL: Expected status 'not_delivered_to_company', got '{c.consumable_status}'")
                return False, [asset_id]

    print("  PASS: Consumable + history records created correctly")
    return True, [asset_id]


def test_asset_creation_with_both_included_items(data):
    """Test 4: Creating an asset with both included stock items and consumables."""
    print("\n" + "=" * 60)
    print("TEST 4: Asset creation with both included stock items AND consumables")
    print("=" * 60)

    payload = {
        'asset_model': data['asset_model'].asset_model_id,
        'attribution_order': data['order'].attribution_order_id,
        'asset_status': 'not_delivered_to_company',
        'included_stock_items': [
            {
                'stock_item_model': data['si_model'].stock_item_model_id,
                'quantity': 1,
                'instances': [
                    {'stock_item_name': 'TestMouse-1', 'stock_item_inventory_number': 'TM001'},
                ],
            }
        ],
        'included_consumables': [
            {
                'consumable_model': data['cons_model'].consumable_model_id,
                'quantity': 1,
                'instances': [
                    {'consumable_name': 'TestCable-1', 'consumable_serial_number': 'TC001', 'consumable_inventory_number': 'TCI101'},
                ],
            }
        ],
    }

    factory = RequestFactory()
    request = factory.post('/api/assets/', json.dumps(payload), content_type='application/json')

    admin_user = UserAccount.objects.get(username='admin')
    force_authenticate(request, user=admin_user)

    view = AssetViewSet.as_view({'post': 'create'})
    response = view(request)

    if response.status_code != 201:
        print(f"  FAIL: Asset creation returned {response.status_code}")
        print(f"  Response: {response.data}")
        return False, []

    asset_id = response.data.get('asset_id')
    print(f"  Asset created with id={asset_id}")

    # Verify both stock item and consumable history exist
    si_history = AssetIsComposedOfStockItemHistory.objects.filter(asset_id=asset_id, end_datetime__isnull=True)
    cons_history = AssetIsComposedOfConsumableHistory.objects.filter(asset_id=asset_id, end_datetime__isnull=True)

    if si_history.count() < 1:
        print(f"  FAIL: Expected at least 1 stock item history, got {si_history.count()}")
        return False, [asset_id]
    if cons_history.count() < 1:
        print(f"  FAIL: Expected at least 1 consumable history, got {cons_history.count()}")
        return False, [asset_id]

    si = si_history.first().stock_item
    c = cons_history.first().consumable
    print(f"  StockItem: id={si.stock_item_id}, name={si.stock_item_name}, status={si.stock_item_status}")
    print(f"  Consumable: id={c.consumable_id}, name={c.consumable_name}, status={c.consumable_status}")

    print("  PASS: Both stock items and consumables created correctly")
    return True, [asset_id]


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("Setting up test data...")
    data = setup_test_data()
    print(f"  warehouse_id={data['warehouse'].warehouse_id}")
    print(f"  asset_model_id={data['asset_model'].asset_model_id}")
    print(f"  stock_item_model_id={data['si_model'].stock_item_model_id}")
    print(f"  consumable_model_id={data['cons_model'].consumable_model_id}")
    print(f"  attribution_order_id={data['order'].attribution_order_id}")

    all_asset_ids = []
    all_stock_item_ids = []
    all_consumable_ids = []
    results = []

    # Test 1: Serializer validation
    ok = test_serializer_accepts_included_items_with_instances(data)
    results.append(("Serializer validation", ok))

    # Test 2: Stock items
    ok, asset_ids = test_asset_creation_with_included_stock_items(data)
    all_asset_ids.extend(asset_ids)
    results.append(("Included stock items creation", ok))

    # Test 3: Consumables
    ok, asset_ids = test_asset_creation_with_included_consumables(data)
    all_asset_ids.extend(asset_ids)
    results.append(("Included consumables creation", ok))

    # Test 4: Both
    ok, asset_ids = test_asset_creation_with_both_included_items(data)
    all_asset_ids.extend(asset_ids)
    results.append(("Both included items creation", ok))

    # Collect stock item and consumable IDs for cleanup
    for aid in all_asset_ids:
        for h in AssetIsComposedOfStockItemHistory.objects.filter(asset_id=aid):
            all_stock_item_ids.append(h.stock_item_id)
        for h in AssetIsComposedOfConsumableHistory.objects.filter(asset_id=aid):
            all_consumable_ids.append(h.consumable_id)

    # Cleanup
    print("\nCleaning up test data...")
    cleanup_test_data(data, all_asset_ids, all_stock_item_ids, all_consumable_ids)
    print("  Done.")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    all_passed = True
    for name, ok in results:
        status = "PASS" if ok else "FAIL"
        print(f"  [{status}] {name}")
        if not ok:
            all_passed = False

    print()
    if all_passed:
        print("All tests passed!")
    else:
        print("Some tests FAILED!")
        sys.exit(1)


if __name__ == '__main__':
    main()
