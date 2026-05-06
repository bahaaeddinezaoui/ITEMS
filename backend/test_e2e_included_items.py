"""
End-to-end HTTP test: Simulate the exact frontend flow for creating
an attribution order with assets that have included stock items and consumables.

This test uses the actual HTTP API (no mocks) to verify the full pipeline.

Usage:
    cd backend
    python test_e2e_included_items.py
"""

import os
import sys
import json
import urllib.request
import urllib.error

BASE_URL = 'http://localhost:8000/api'


def api_request(method, path, data=None, token=None):
    """Make an API request and return (status_code, response_data)."""
    url = f'{BASE_URL}{path}'
    body = json.dumps(data).encode('utf-8') if data else None
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode('utf-8')
        try:
            resp_data = json.loads(resp_body)
        except Exception:
            # Extract error from HTML if possible
            import re
            title_match = re.search(r'<title>(.*?)</title>', resp_body)
            exception_match = re.search(r'<pre[^>]*class="exception_message"[^>]*>(.*?)</pre>', resp_body, re.DOTALL)
            if not exception_match:
                exception_match = re.search(r'Exception Value:.*?<pre[^>]*>(.*?)</pre>', resp_body, re.DOTALL)
            if not exception_match:
                exception_match = re.search(r'<h1>(.*?)</h1>', resp_body)
            err_msg = exception_match.group(1).strip() if exception_match else (title_match.group(1) if title_match else resp_body[:500])
            resp_data = {'error': err_msg, 'html': resp_body[:2000]}
        return e.code, resp_data


def login(username, password):
    """Login and return the access token."""
    status, data = api_request('POST', '/auth/login/', {
        'username': username,
        'password': password,
    })
    if status != 200:
        print(f"Login failed: {status} {data}")
        sys.exit(1)
    return data['access']


def get_first_id(path, token, id_field):
    """Get the first record's ID from a list endpoint."""
    status, data = api_request('GET', path, token=token)
    if status != 200:
        return None
    results = data if isinstance(data, list) else data.get('results', [])
    if results and len(results) > 0:
        return results[0].get(id_field)
    return None


def main():
    print("Logging in as admin...")
    token = login('admin', 'password123')
    print("  OK")

    # ── Step 1: Get prerequisite IDs ──────────────────────────────────────
    print("\nFetching prerequisite data...")
    warehouse_id = get_first_id('/warehouses/', token, 'warehouse_id')
    asset_model_id = get_first_id('/asset-models/', token, 'asset_model_id')
    si_model_id = get_first_id('/stock-item-models/', token, 'stock_item_model_id')
    cons_model_id = get_first_id('/consumable-models/', token, 'consumable_model_id')

    print(f"  warehouse_id={warehouse_id}")
    print(f"  asset_model_id={asset_model_id}")
    print(f"  stock_item_model_id={si_model_id}")
    print(f"  consumable_model_id={cons_model_id}")

    if not all([warehouse_id, asset_model_id, si_model_id, cons_model_id]):
        print("  FAIL: Missing prerequisite data. Create at least one of each in the app first.")
        sys.exit(1)

    # ── Step 2: Count existing records ────────────────────────────────────
    import os
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
    import django
    django.setup()
    from api.models import StockItem, Consumable, AssetIsComposedOfStockItemHistory, AssetIsComposedOfConsumableHistory, Asset

    stock_count_before = StockItem.objects.count()
    cons_count_before = Consumable.objects.count()
    si_history_before = AssetIsComposedOfStockItemHistory.objects.count()
    cons_history_before = AssetIsComposedOfConsumableHistory.objects.count()

    print(f"\nRecords before test:")
    print(f"  StockItem: {stock_count_before}")
    print(f"  Consumable: {cons_count_before}")
    print(f"  SI History: {si_history_before}")
    print(f"  Cons History: {cons_history_before}")

    # ── Step 3: Create Attribution Order ──────────────────────────────────
    print("\nCreating attribution order...")
    order_data = {
        'warehouse': warehouse_id,
        'attribution_order_full_code': f'E2E-TEST-{__import__("time").time()}',
        'attribution_order_date': '2026-01-01',
    }
    status, order_resp = api_request('POST', '/attribution-orders/', order_data, token=token)
    if status != 201:
        print(f"  FAIL: Could not create attribution order: {status} {order_resp}")
        sys.exit(1)
    order_id = order_resp['attribution_order_id']
    print(f"  Created order id={order_id}")

    # ── Step 4: Create Asset with included items ──────────────────────────
    # This simulates EXACTLY what the frontend sends
    print("\nCreating asset with included stock items and consumables...")

    payload = {
        'asset_model': asset_model_id,
        'attribution_order': order_id,
        'asset_status': 'not_delivered_to_company',
        'asset_serial_number': '',
        'asset_inventory_number': '',
        'asset_name': 'E2E Test Asset',
        # This is what the frontend sends from the draft
        'included_stock_items': [
            {
                'stock_item_model': si_model_id,
                'quantity': 2,
                'instances': [
                    {'stock_item_name': 'E2E-KB-1', 'stock_item_inventory_number': 'E001'},
                    {'stock_item_name': 'E2E-KB-2', 'stock_item_inventory_number': 'E002'},
                ],
            }
        ],
        'included_consumables': [
            {
                'consumable_model': cons_model_id,
                'quantity': 1,
                'instances': [
                    {
                        'consumable_name': 'E2E-Toner-1',
                        'consumable_serial_number': 'E2ETN001',
                        'consumable_inventory_number': 'CI001',
                    },
                ],
            }
        ],
    }

    print(f"  Payload (included_stock_items): {json.dumps(payload['included_stock_items'], indent=2)}")
    print(f"  Payload (included_consumables): {json.dumps(payload['included_consumables'], indent=2)}")

    status, asset_resp = api_request('POST', '/assets/', payload, token=token)

    print(f"\n  Response status: {status}")
    if status != 201:
        print(f"  FAIL: Asset creation returned {status}")
        print(f"  Response: {json.dumps(asset_resp, indent=2)}")
        # Cleanup order
        try:
            api_request('DELETE', f'/attribution-orders/{order_id}/', token=token)
        except Exception:
            pass
        sys.exit(1)

    asset_id = asset_resp.get('asset_id')
    print(f"  Created asset id={asset_id}")

    # ── Step 5: Verify records in DB ──────────────────────────────────────
    print("\nVerifying database records...")

    stock_count_after = StockItem.objects.count()
    cons_count_after = Consumable.objects.count()
    si_history_after = AssetIsComposedOfStockItemHistory.objects.count()
    cons_history_after = AssetIsComposedOfConsumableHistory.objects.count()

    new_stock_items = stock_count_after - stock_count_before
    new_consumables = cons_count_after - cons_count_before
    new_si_history = si_history_after - si_history_before
    new_cons_history = cons_history_after - cons_history_before

    print(f"  New StockItem records: {new_stock_items}")
    print(f"  New Consumable records: {new_consumables}")
    print(f"  New SI History records: {new_si_history}")
    print(f"  New Cons History records: {new_cons_history}")

    # Check for our specific items
    e2e_stock_items = StockItem.objects.filter(stock_item_name__startswith='E2E-Keyboard')
    e2e_consumables = Consumable.objects.filter(consumable_name__startswith='E2E-Toner')

    print(f"\n  E2E StockItems found: {e2e_stock_items.count()}")
    for si in e2e_stock_items:
        print(f"    id={si.stock_item_id}, name={si.stock_item_name}, inv={si.stock_item_inventory_number}, status={si.stock_item_status}")

    print(f"  E2E Consumables found: {e2e_consumables.count()}")
    for c in e2e_consumables:
        print(f"    id={c.consumable_id}, name={c.consumable_name}, serial={c.consumable_serial_number}, status={c.consumable_status}")

    # Check history links
    si_history_for_asset = AssetIsComposedOfStockItemHistory.objects.filter(asset_id=asset_id, end_datetime__isnull=True)
    cons_history_for_asset = AssetIsComposedOfConsumableHistory.objects.filter(asset_id=asset_id, end_datetime__isnull=True)

    print(f"\n  Active SI history for asset: {si_history_for_asset.count()}")
    print(f"  Active Cons history for asset: {cons_history_for_asset.count()}")

    # ── Step 6: Results ───────────────────────────────────────────────────
    all_pass = True

    if new_stock_items < 2:
        print(f"\n  [FAIL] Expected at least 2 new StockItem records, got {new_stock_items}")
        all_pass = False
    else:
        print(f"\n  [PASS] StockItem records created ({new_stock_items})")

    if new_consumables < 1:
        print(f"  [FAIL] Expected at least 1 new Consumable record, got {new_consumables}")
        all_pass = False
    else:
        print(f"  [PASS] Consumable records created ({new_consumables})")

    if new_si_history < 2:
        print(f"  [FAIL] Expected at least 2 new SI history records, got {new_si_history}")
        all_pass = False
    else:
        print(f"  [PASS] SI history records created ({new_si_history})")

    if new_cons_history < 1:
        print(f"  [FAIL] Expected at least 1 new Cons history record, got {new_cons_history}")
        all_pass = False
    else:
        print(f"  [PASS] Cons history records created ({new_cons_history})")

    if e2e_stock_items.count() < 2:
        print(f"  [FAIL] E2E StockItems not found by name")
        all_pass = False
    else:
        print(f"  [PASS] E2E StockItems found by name ({e2e_stock_items.count()})")

    if e2e_consumables.count() < 1:
        print(f"  [FAIL] E2E Consumables not found by name")
        all_pass = False
    else:
        print(f"  [PASS] E2E Consumables found by name ({e2e_consumables.count()})")

    # ── Cleanup ───────────────────────────────────────────────────────────
    print("\nCleaning up...")
    # Delete history records first, then items, then asset, then order
    for h in AssetIsComposedOfStockItemHistory.objects.filter(asset_id=asset_id):
        h.delete()
    for h in AssetIsComposedOfConsumableHistory.objects.filter(asset_id=asset_id):
        h.delete()
    for si in e2e_stock_items:
        si.delete()
    for c in e2e_consumables:
        c.delete()
    Asset.objects.filter(asset_id=asset_id).delete()
    from api.models import AttributionOrder
    AttributionOrder.objects.filter(attribution_order_id=order_id).delete()
    print("  Done.")

    if all_pass:
        print("\n=== ALL E2E TESTS PASSED ===")
    else:
        print("\n=== SOME E2E TESTS FAILED ===")
        sys.exit(1)


if __name__ == '__main__':
    main()
