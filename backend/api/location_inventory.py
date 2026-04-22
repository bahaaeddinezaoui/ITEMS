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
    PersonRoleMapping,
)
from .translations import LocationTranslation, LocationTypeTranslation


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
    location_name_ar: str | None = None
    location_name_en: str | None = None
    location_type_ar: str | None = None
    location_type_en: str | None = None


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
        user = getattr(request, "user", None)
        person = getattr(user, "person", None)
        is_superuser = getattr(user, "is_superuser", False)
        
        role_codes = set()
        if person:
            role_codes = set(PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True))

        has_full_access = is_superuser or ("asset_responsible" in role_codes) or ("exploitation_chief" in role_codes) or ("it_bureau_chief" in role_codes)
        has_maintenance_access = ("maintenance_chief" in role_codes) or ("it_maintenance_technician" in role_codes) or ("network_maintenance_technician" in role_codes)

        if not has_full_access and not has_maintenance_access:
            return Response({"error": "Forbidden"}, status=403)

        item_type = (request.query_params.get("item_type") or "").strip()
        status = (request.query_params.get("status") or "").strip()
        location_id_raw = (request.query_params.get("location_id") or "").strip()

        location_id = None
        if location_id_raw:
            try:
                location_id = int(location_id_raw)
            except (TypeError, ValueError):
                return Response({"error": "Invalid location_id"}, status=400)

        allowed_location_ids = None
        if not has_full_access and has_maintenance_access:
            allowed_location_ids = list(Location.objects.filter(location_type__location_type_label="Maintenance Room").values_list("location_id", flat=True))
            if not allowed_location_ids:
                allowed_location_ids = [-1]
            
            if location_id is not None:
                if location_id not in allowed_location_ids:
                    return Response({"error": "Forbidden location"}, status=403)
                allowed_location_ids = [location_id]

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

        def _get_loc_translations(loc):
            """Return (name_ar, name_en, type_ar, type_en) for a Location instance."""
            name_ar, name_en, type_ar, type_en = None, None, None, None
            if loc:
                try:
                    name_ar = LocationTranslation.objects.get(location=loc, language_code='ar').location_name
                except LocationTranslation.DoesNotExist:
                    pass
                try:
                    name_en = LocationTranslation.objects.get(location=loc, language_code='en').location_name
                except LocationTranslation.DoesNotExist:
                    pass
                lt = loc.location_type
                if lt:
                    try:
                        type_ar = LocationTypeTranslation.objects.get(location_type=lt, language_code='ar').location_type_label
                    except LocationTypeTranslation.DoesNotExist:
                        pass
                    try:
                        type_en = LocationTypeTranslation.objects.get(location_type=lt, language_code='en').location_type_label
                    except LocationTypeTranslation.DoesNotExist:
                        pass
            return name_ar, name_en, type_ar, type_en

        def _append_assets():
            qs = (
                Asset.objects.select_related("asset_model", "asset_model__asset_type", "asset_model__asset_brand")
                .annotate(current_location_id=asset_loc_sq)
            )
            if status:
                qs = qs.filter(asset_status=status)
            if location_id is not None:
                qs = qs.filter(current_location_id=location_id)
            elif allowed_location_ids is not None:
                qs = qs.filter(current_location_id__in=allowed_location_ids)

            for a in qs:
                loc = None
                if getattr(a, "current_location_id", None):
                    loc = Location.objects.filter(location_id=a.current_location_id).select_related("location_type").first()

                _name_ar, _name_en, _type_ar, _type_en = _get_loc_translations(loc)
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
                        location_name_ar=_name_ar,
                        location_name_en=_name_en,
                        location_type_ar=_type_ar,
                        location_type_en=_type_en,
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
            elif allowed_location_ids is not None:
                qs = qs.filter(current_location_id__in=allowed_location_ids)

            for s in qs:
                loc = None
                if getattr(s, "current_location_id", None):
                    loc = Location.objects.filter(location_id=s.current_location_id).select_related("location_type").first()

                _name_ar, _name_en, _type_ar, _type_en = _get_loc_translations(loc)
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
                        location_name_ar=_name_ar,
                        location_name_en=_name_en,
                        location_type_ar=_type_ar,
                        location_type_en=_type_en,
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
            elif allowed_location_ids is not None:
                qs = qs.filter(current_location_id__in=allowed_location_ids)

            for c in qs:
                loc = None
                if getattr(c, "current_location_id", None):
                    loc = Location.objects.filter(location_id=c.current_location_id).select_related("location_type").first()

                _name_ar, _name_en, _type_ar, _type_en = _get_loc_translations(loc)
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
                        location_name_ar=_name_ar,
                        location_name_en=_name_en,
                        location_type_ar=_type_ar,
                        location_type_en=_type_en,
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
                _name_ar, _name_en, _type_ar, _type_en = _get_loc_translations(loc)
                loc_map[it.location_id] = {
                    "location_id": it.location_id,
                    "location_name": getattr(loc, "location_name", None) if loc else it.location_name,
                    "location_name_ar": _name_ar,
                    "location_name_en": _name_en,
                    "location_type": getattr(getattr(loc, "location_type", None), "location_type_label", None) if loc else None,
                    "location_type_ar": _type_ar,
                    "location_type_en": _type_en,
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
                    "location_name_ar": i.location_name_ar,
                    "location_name_en": i.location_name_en,
                    "location_type_ar": i.location_type_ar,
                    "location_type_en": i.location_type_en,
                }
                for i in items
            ],
        }

        return Response(payload)
