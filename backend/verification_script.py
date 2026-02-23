import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ems.settings')
django.setup()

from api.models import (
    Warehouse, 
    AttributionOrder, 
    Asset, 
    AssetModel, 
    AssetType, 
    AssetBrand
)

def verify_attribution_order():
    print("Starting verification of Attribution Order backend implementation...")

    try:
        # 1. Create a Warehouse
        warehouse, _ = Warehouse.objects.get_or_create(
            warehouse_id=999,
            defaults={
                'warehouse_name': "Test Warehouse",
                'warehouse_address': "123 Test St"
            }
        )
        print(f"Verified Warehouse: {warehouse}")

        # 2. Create an Attribution Order
        order, _ = AttributionOrder.objects.get_or_create(
            attribution_order_id=999,
            defaults={
                'warehouse': warehouse,
                'attribution_order_full_code': "TEST-ORD-2026",
                'attribution_order_date': date.today(),
                'is_signed_by_central_chief': False,
                'attribution_order_barcode': "BARCODE-TEST"
            }
        )
        print(f"Verified Attribution Order: {order}")

        # 3. Create an Asset linked to it
        atype = AssetType.objects.first()
        abrand = AssetBrand.objects.first()
        
        if not atype or not abrand:
            print("Error: Need AssetType and AssetBrand to create AssetModel")
            return

        amodel, _ = AssetModel.objects.get_or_create(
            asset_model_id=999,
            defaults={
                'model_name': 'Test Model',
                'asset_type': atype,
                'asset_brand': abrand
            }
        )
        print(f"Verified AssetModel: {amodel}")
        
        asset, _ = Asset.objects.get_or_create(
            asset_id=999,
            defaults={
                'asset_model': amodel,
                'attribution_order': order,
                'asset_serial_number': "SN-TEST-123",
                'asset_inventory_number': "123456",
                'asset_name': "Test Asset",
                'asset_status': "In Stock"
            }
        )
        print(f"Verified Asset: {asset}")

        # 4. Verify linking
        retrieved_asset = Asset.objects.get(asset_id=999)
        if retrieved_asset.attribution_order == order:
            print("VERIFICATION_SUCCESS: Asset correctly linked to Attribution Order.")
        else:
            print("VERIFICATION_FAILURE: Asset link retrieved but incorrect.")

        # Cleanup
        asset.delete()
        order.delete()
        warehouse.delete()
        if amodel.asset_model_id == 999:
            amodel.delete()
        print("Cleanup successful.")

    except Exception as e:
        print(f"ERROR during verification: {e}")

if __name__ == "__main__":
    verify_attribution_order()
