from __future__ import annotations

from dataclasses import dataclass

from django.db.models import OuterRef, Subquery
from django.db.models.functions import Coalesce
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Asset,
    AssetMovement,
    Consumable,
    ConsumableMovement,
    Location,
    StockItem,
    StockItemMovement,
)


@dataclass(frozen=True)
class _ItemRow:
    item_type: str
    item_id: int
    name: str | None
    inventory_number: str | None
    serial_number: str | None
    model: str | None
    brand: str | None
    type_label: str | None
    status: str | None
    location_id: int | None
    location_name: str | None


class LocationInventoryView(APIView):
    """Aggregated inventory by location for asset responsible.

    Query params:
      - item_type: asset | stock_item | consumable
      - status: item status (exact match)
      - location_id: location id

    Returns:
      {
        summary: {total_assets, total_stock_items, total_consumables},
        locations: [{location_id, location_name, location_type, asset_count, stock_item_count, consumable_count}],
        items: [{... item fields ...}]
      }
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        item_type = (request.query_params.get("item_type") or "").strip()
        status = (request.query_params.get("status") or "").strip()
        location_id_raw = (request.query_params.get("location_id") or "").strip()

        location_id = None
        if location_id_raw:
            try:
                location_id = int(location_id_raw)
            except (TypeError, ValueError):
                return Response({"error": "Invalid location_id"}, status=400)

        # Subqueries to get current location from latest movement
        asset_loc_sq = Subquery(
            AssetMovement.objects.filter(asset_id=OuterRef("asset_id"))
            .order_by("-asset_movement_id")
            .values("destination_location_id")[:1]
        )
        stock_loc_sq = Subquery(
            StockItemMovement.objects.filter(stock_item_id=OuterRef("stock_item_id"))
            .order_by("-stock_item_movement_id")
            .values("destination_location_id")[:1]
        )
        cons_loc_sq = Subquery(
            ConsumableMovement.objects.filter(consumable_id=OuterRef("consumable_id"))
            .order_by("-consumable_movement_id")
            .values("destination_location_id")[:1]
        )

        items: list[_ItemRow] = []

        def _append_assets():
            qs = (
                Asset.objects.select_related("asset_model", "asset_model__asset_type", "asset_model__asset_brand")
                .annotate(current_location_id=asset_loc_sq)
            )
            if status:
                qs = qs.filter(asset_status=status)
            if location_id is not None:
                qs = qs.filter(current_location_id=location_id)

            for a in qs:
                loc = None
                if getattr(a, "current_location_id", None):
                    loc = Location.objects.filter(location_id=a.current_location_id).select_related("location_type").first()

                items.append(
                    _ItemRow(
                        item_type="asset",
                        item_id=a.asset_id,
                        name=getattr(a, "asset_name", None),
                        inventory_number=getattr(a, "asset_inventory_number", None),
                        serial_number=getattr(a, "asset_serial_number", None),
                        model=getattr(getattr(a, "asset_model", None), "asset_model_name", None),
                        brand=getattr(getattr(getattr(a, "asset_model", None), "asset_brand", None), "asset_brand_name", None),
                        type_label=getattr(getattr(getattr(a, "asset_model", None), "asset_type", None), "asset_type_name", None),
                        status=getattr(a, "asset_status", None),
                        location_id=getattr(a, "current_location_id", None),
                        location_name=getattr(loc, "location_name", None) if loc else None,
                    )
                )

        def _append_stock_items():
            qs = (
                StockItem.objects.select_related(
                    "stock_item_model",
                    "stock_item_model__stock_item_type",
                    "stock_item_model__stock_item_brand",
                )
                .annotate(current_location_id=stock_loc_sq)
            )
            if status:
                qs = qs.filter(stock_item_status=status)
            if location_id is not None:
                qs = qs.filter(current_location_id=location_id)

            for s in qs:
                loc = None
                if getattr(s, "current_location_id", None):
                    loc = Location.objects.filter(location_id=s.current_location_id).select_related("location_type").first()

                items.append(
                    _ItemRow(
                        item_type="stock_item",
                        item_id=s.stock_item_id,
                        name=getattr(s, "stock_item_name", None),
                        inventory_number=getattr(s, "stock_item_inventory_number", None),
                        serial_number=getattr(s, "stock_item_serial_number", None),
                        model=getattr(getattr(s, "stock_item_model", None), "stock_item_model_name", None),
                        brand=getattr(getattr(getattr(s, "stock_item_model", None), "stock_item_brand", None), "stock_item_brand_name", None),
                        type_label=getattr(getattr(getattr(s, "stock_item_model", None), "stock_item_type", None), "stock_item_type_name", None),
                        status=getattr(s, "stock_item_status", None),
                        location_id=getattr(s, "current_location_id", None),
                        location_name=getattr(loc, "location_name", None) if loc else None,
                    )
                )

        def _append_consumables():
            qs = (
                Consumable.objects.select_related(
                    "consumable_model",
                    "consumable_model__consumable_type",
                    "consumable_model__consumable_brand",
                )
                .annotate(current_location_id=cons_loc_sq)
            )
            if status:
                qs = qs.filter(consumable_status=status)
            if location_id is not None:
                qs = qs.filter(current_location_id=location_id)

            for c in qs:
                loc = None
                if getattr(c, "current_location_id", None):
                    loc = Location.objects.filter(location_id=c.current_location_id).select_related("location_type").first()

                items.append(
                    _ItemRow(
                        item_type="consumable",
                        item_id=c.consumable_id,
                        name=getattr(c, "consumable_name", None),
                        inventory_number=getattr(c, "consumable_inventory_number", None),
                        serial_number=getattr(c, "consumable_serial_number", None),
                        model=getattr(getattr(c, "consumable_model", None), "consumable_model_name", None),
                        brand=getattr(getattr(getattr(c, "consumable_model", None), "consumable_brand", None), "consumable_brand_name", None),
                        type_label=getattr(getattr(getattr(c, "consumable_model", None), "consumable_type", None), "consumable_type_name", None),
                        status=getattr(c, "consumable_status", None),
                        location_id=getattr(c, "current_location_id", None),
                        location_name=getattr(loc, "location_name", None) if loc else None,
                    )
                )

        if item_type in {"", "asset"}:
            _append_assets()
        if item_type in {"", "stock_item"}:
            _append_stock_items()
        if item_type in {"", "consumable"}:
            _append_consumables()

        # Build location aggregates from items
        loc_map: dict[int, dict] = {}
        for it in items:
            if it.location_id is None:
                continue
            if it.location_id not in loc_map:
                loc = Location.objects.filter(location_id=it.location_id).select_related("location_type").first()
                loc_map[it.location_id] = {
                    "location_id": it.location_id,
                    "location_name": getattr(loc, "location_name", None) if loc else it.location_name,
                    "location_type": getattr(getattr(loc, "location_type", None), "location_type_label", None) if loc else None,
                    "asset_count": 0,
                    "stock_item_count": 0,
                    "consumable_count": 0,
                }
            if it.item_type == "asset":
                loc_map[it.location_id]["asset_count"] += 1
            elif it.item_type == "stock_item":
                loc_map[it.location_id]["stock_item_count"] += 1
            else:
                loc_map[it.location_id]["consumable_count"] += 1

        locations = sorted(loc_map.values(), key=lambda r: (r.get("location_name") or ""))

        payload = {
            "summary": {
                "total_assets": sum(1 for i in items if i.item_type == "asset"),
                "total_stock_items": sum(1 for i in items if i.item_type == "stock_item"),
                "total_consumables": sum(1 for i in items if i.item_type == "consumable"),
            },
            "locations": locations,
            "items": [
                {
                    "item_type": i.item_type,
                    "item_id": i.item_id,
                    "name": i.name,
                    "inventory_number": i.inventory_number,
                    "serial_number": i.serial_number,
                    "model": i.model,
                    "brand": i.brand,
                    "type": i.type_label,
                    "status": i.status,
                    "location_id": i.location_id,
                    "location_name": i.location_name,
                }
                for i in items
            ],
        }

        return Response(payload)
