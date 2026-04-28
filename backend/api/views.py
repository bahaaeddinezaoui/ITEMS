from __future__ import annotations

import hashlib
import os
import datetime
import json
from decimal import Decimal

from django.utils import timezone
from django.db import connection
from django.db import transaction
from django.db.models import OuterRef, Subquery, Q, Max, Prefetch
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import FileResponse
from django.conf import settings
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action

from .models import (
    Asset,
    AssetAttributeDefinition,
    AssetAttributeValue,
    AssetBrand,
    AssetIsAssignedToPerson,
    AssetModel,
    AssetModelAttributeValue,
    AssetModelDefaultStockItem,
    AssetModelDefaultConsumable,
    AssetType,
    AssetTypeAttribute,
    Consumable,
    ConsumableAttributeDefinition,
    ConsumableAttributeValue,
    ConsumableBrand,
    ConsumableIsAssignedToPerson,
    ConsumableModel,
    ConsumableModelAttributeValue,
    ConsumableType,
    ConsumableTypeAttribute,
    ExternalMaintenance,
    Maintenance,
    MaintenanceStep,
    MaintenanceTypicalStep,
    OrganizationalStructureType,
    OrganizationalStructure,
    OrganizationalStructureRelation,
    Person,
    PersonReportsProblemOnAsset,
    PersonReportsProblemOnAssetIncludedConsumable,
    PersonReportsProblemOnAssetIncludedContext,
    PersonReportsProblemOnAssetIncludedStockItem,
    PersonReportsProblemOnConsumable,
    PersonReportsProblemOnStockItem,
    PersonRoleMapping,
    Role,
    Position,
    PositionRoleMapping,
    Location,
    LocationRelation,
    LocationType,
    StockItem,
    StockItemAttributeDefinition,
    StockItemAttributeValue,
    StockItemBrand,
    StockItemIsAssignedToPerson,
    StockItemModel,
    StockItemModelAttributeValue,
    StockItemType,
    StockItemTypeAttribute,
    UserAccount,
    AuthenticationLog,
    UserSession,
    Warehouse,
    AttributionOrder,
    ReceiptReport,
    AdministrativeCertificate,
    StockItemConsumableDestructionCertificate,
    AssetDestructionCertificate,
    AssetDestructionCertificateAsset,
    AssetFailedExternalMaintenance,
    CompanyAssetRequest,
    AssetIncidentReport,
    AssetIncidentReportStockItem,
    AssetIncidentReportConsumable,
    StockItemIsCompatibleWithAsset,
    ConsumableIsCompatibleWithAsset,
    AssetIsComposedOfStockItemHistory,
    AssetIsComposedOfConsumableHistory,
    AttributionOrderAssetStockItemAccessory,
    AttributionOrderAssetConsumableAccessory,
    ConsumableIsUsedInStockItemHistory,
    StockItemMovement,
    ConsumableMovement,
    MaintenanceStepItemRequest,
    PersonAssignment,
    AssetMovement,
    PhysicalCondition,
    AssetConditionHistory,
    ExternalMaintenanceProvider,
    ExternalMaintenance,
    ExternalMaintenanceStep,
    ExternalMaintenanceTypicalStep,
    ExternalMaintenanceDocument,
    MaintenanceStepAttributeChange,
)

from .serializers import StockItemConsumableDestructionCertificateSerializer, AssetDestructionCertificateSerializer


def _parse_default_value(data_type: str | None, default_value: str | None):
    if default_value is None:
        return {"value_bool": None, "value_string": None, "value_number": None, "value_date": None}

    dt = (data_type or "").strip().lower()
    raw = default_value.strip()

    if dt in {"bool", "boolean"}:
        if raw.lower() in {"true", "1", "yes", "y", "t"}:
            return {"value_bool": True, "value_string": None, "value_number": None, "value_date": None}
        if raw.lower() in {"false", "0", "no", "n", "f"}:
            return {"value_bool": False, "value_string": None, "value_number": None, "value_date": None}
        return {"value_bool": None, "value_string": raw, "value_number": None, "value_date": None}

    if dt in {"number", "numeric", "decimal", "int", "integer", "float", "double"}:
        try:
            return {"value_bool": None, "value_string": None, "value_number": Decimal(raw), "value_date": None}
        except Exception:
            return {"value_bool": None, "value_string": raw, "value_number": None, "value_date": None}

    if dt in {"date"}:
        try:
            return {
                "value_bool": None,
                "value_string": None,
                "value_number": None,
                "value_date": datetime.date.fromisoformat(raw),
            }
        except Exception:
            return {"value_bool": None, "value_string": raw, "value_number": None, "value_date": None}

    return {"value_bool": None, "value_string": raw, "value_number": None, "value_date": None}


def _cascade_move_composed_items(
    *,
    asset_id: int,
    source_location_id: int,
    destination_location_id: int,
    movement_reason: str,
    movement_datetime,
    maintenance_step_id=None,
    external_maintenance_step_id=None,
    maintenance_id=None,
):
    stock_item_ids = list(
        AssetIsComposedOfStockItemHistory.objects.filter(asset_id=asset_id, end_datetime__isnull=True).values_list(
            "stock_item_id", flat=True
        )
    )
    consumable_ids = list(
        AssetIsComposedOfConsumableHistory.objects.filter(asset_id=asset_id, end_datetime__isnull=True).values_list(
            "consumable_id", flat=True
        )
    )

    last_stock_move = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
    next_stock_move_id = (last_stock_move.stock_item_movement_id + 1) if last_stock_move else 1

    for stock_item_id in stock_item_ids:
        last_move = (
            StockItemMovement.objects.filter(stock_item_id=stock_item_id)
            .order_by("-stock_item_movement_id")
            .first()
        )
        current_location_id = last_move.destination_location_id if last_move else source_location_id
        if current_location_id == destination_location_id:
            continue

        _create_stock_item_movement_with_translations(
            movement_reason=movement_reason,
            stock_item_movement_id=next_stock_move_id,
            stock_item_id=stock_item_id,
            source_location_id=current_location_id,
            destination_location_id=destination_location_id,
            maintenance_step_id=maintenance_step_id,
            external_maintenance_step_id=external_maintenance_step_id,
            maintenance_id=maintenance_id,
            movement_datetime=movement_datetime,
        )
        next_stock_move_id += 1

    last_consumable_move = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
    next_consumable_move_id = (last_consumable_move.consumable_movement_id + 1) if last_consumable_move else 1

    for consumable_id in consumable_ids:
        last_move = (
            ConsumableMovement.objects.filter(consumable_id=consumable_id)
            .order_by("-consumable_movement_id")
            .first()
        )
        current_location_id = last_move.destination_location_id if last_move else source_location_id
        if current_location_id == destination_location_id:
            continue

        _create_consumable_movement_with_translations(
            movement_reason=movement_reason,
            consumable_movement_id=next_consumable_move_id,
            consumable_id=consumable_id,
            source_location_id=current_location_id,
            destination_location_id=destination_location_id,
            maintenance_step_id=maintenance_step_id,
            external_maintenance_step_id=external_maintenance_step_id,
            maintenance_id=maintenance_id,
            movement_datetime=movement_datetime,
        )
        next_consumable_move_id += 1


REASON_EN_MAP = {
    "return_to_owner": "Return to owner",
    "maintenance_create": "Maintenance",
    "maintenance_step_return_to_owner": "Maintenance step return to owner",
    "maintenance_step_remove": "Maintenance step remove",
    "maintenance_step_fulfill_request": "Maintenance step fulfill request",
    "problem_report_include": "Problem report include",
    "manual_move": "Manual move",
    "attribution": "Attribution",
    "transfer": "Transfer",
    "destruction": "Destruction",
    "destruction_item_recovered": "Destruction item recovered",
    "manual_split": "Manual split",
    "sent_to_external_maintenance": "Sent to external maintenance provider",
    "received_from_external_maintenance": "Received by company from external maintenance",
}

REASON_AR_MAP = {
    "return_to_owner": "إرجاع للمالك",
    "maintenance_create": "صيانة",
    "maintenance_step_return_to_owner": "إرجاع خطوة صيانة",
    "maintenance_step_remove": "إزالة خطوة صيانة",
    "maintenance_step_fulfill_request": "تلبية طلب خطوة صيانة",
    "problem_report_include": "تضمين تقرير مشكلة",
    "manual_move": "نقل يدوي",
    "attribution": "إسناد",
    "transfer": "نقل",
    "destruction": "إتلاف",
    "destruction_item_recovered": "استرجاع عنصر من الإتلاف",
    "manual_split": "تقسيم يدوي",
    "sent_to_external_maintenance": "إرسال إلى مزود الصيانة الخارجية",
    "received_from_external_maintenance": "استلام من الصيانة الخارجية",
}


def _create_asset_movement_with_translations(
    *,
    movement_reason_en: str,
    movement_reason_ar: str = None,
    **kwargs,
):
    """Create an AssetMovement row and persist translations.

    - English movement_reason is stored in both the original asset_movement table
      AND the asset_movement_translation table (language_code='en').
    - Arabic movement_reason (if provided) is stored ONLY in the
      asset_movement_translation table (language_code='ar').
    - For snake_case reasons, the English translation uses human-readable form
      (e.g. "Return to owner" instead of "return_to_owner").
    """
    from api.translations import AssetMovementTranslation

    movement = AssetMovement.objects.create(movement_reason=movement_reason_en, **kwargs)

    # English translation row — use human-readable form for snake_case reasons
    en_reason = REASON_EN_MAP.get(movement_reason_en, movement_reason_en)
    last_t = AssetMovementTranslation.objects.order_by('-id').first()
    next_t_id = (last_t.id + 1) if last_t else 1
    AssetMovementTranslation.objects.create(
        id=next_t_id,
        asset_movement=movement,
        language_code='en',
        movement_reason=en_reason,
    )

    # Arabic translation row
    ar_reason = movement_reason_ar or REASON_AR_MAP.get(movement_reason_en)
    if ar_reason:
        last_t = AssetMovementTranslation.objects.order_by('-id').first()
        next_t_id = (last_t.id + 1) if last_t else 1
        AssetMovementTranslation.objects.create(
            id=next_t_id,
            asset_movement=movement,
            language_code='ar',
            movement_reason=ar_reason,
        )

    return movement


def _create_stock_item_movement_with_translations(
    *,
    movement_reason: str,
    **kwargs,
):
    """Create a StockItemMovement row and persist translations."""
    from api.translations import StockItemMovementTranslation

    movement = StockItemMovement.objects.create(movement_reason=movement_reason, **kwargs)

    en_reason = REASON_EN_MAP.get(movement_reason, movement_reason)
    last_t = StockItemMovementTranslation.objects.order_by('-id').first()
    next_t_id = (last_t.id + 1) if last_t else 1
    StockItemMovementTranslation.objects.create(
        id=next_t_id,
        stock_item_movement=movement,
        language_code='en',
        movement_reason=en_reason,
    )

    ar_reason = REASON_AR_MAP.get(movement_reason)
    if ar_reason:
        last_t = StockItemMovementTranslation.objects.order_by('-id').first()
        next_t_id = (last_t.id + 1) if last_t else 1
        StockItemMovementTranslation.objects.create(
            id=next_t_id,
            stock_item_movement=movement,
            language_code='ar',
            movement_reason=ar_reason,
        )

    return movement


def _create_consumable_movement_with_translations(
    *,
    movement_reason: str,
    **kwargs,
):
    """Create a ConsumableMovement row and persist translations."""
    from api.translations import ConsumableMovementTranslation

    movement = ConsumableMovement.objects.create(movement_reason=movement_reason, **kwargs)

    en_reason = REASON_EN_MAP.get(movement_reason, movement_reason)
    last_t = ConsumableMovementTranslation.objects.order_by('-id').first()
    next_t_id = (last_t.id + 1) if last_t else 1
    ConsumableMovementTranslation.objects.create(
        id=next_t_id,
        consumable_movement=movement,
        language_code='en',
        movement_reason=en_reason,
    )

    ar_reason = REASON_AR_MAP.get(movement_reason)
    if ar_reason:
        last_t = ConsumableMovementTranslation.objects.order_by('-id').first()
        next_t_id = (last_t.id + 1) if last_t else 1
        ConsumableMovementTranslation.objects.create(
            id=next_t_id,
            consumable_movement=movement,
            language_code='ar',
            movement_reason=ar_reason,
        )

    return movement


def _cascade_move_stock_item_consumables(
    *,
    stock_item_id: int,
    source_location_id: int,
    destination_location_id: int,
    movement_reason: str,
    movement_datetime,
    maintenance_step_id=None,
    external_maintenance_step_id=None,
    maintenance_id=None,
):
    consumable_ids = list(
        ConsumableIsUsedInStockItemHistory.objects.filter(
            stock_item_id=stock_item_id,
            end_datetime__isnull=True,
        ).values_list("consumable_id", flat=True)
    )

    last_consumable_move = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
    next_consumable_move_id = (last_consumable_move.consumable_movement_id + 1) if last_consumable_move else 1

    for consumable_id in consumable_ids:
        last_move = (
            ConsumableMovement.objects.filter(consumable_id=consumable_id)
            .order_by("-consumable_movement_id")
            .first()
        )
        current_location_id = last_move.destination_location_id if last_move else source_location_id
        if current_location_id == destination_location_id:
            continue

        _create_consumable_movement_with_translations(
            movement_reason=movement_reason,
            consumable_movement_id=next_consumable_move_id,
            consumable_id=consumable_id,
            source_location_id=current_location_id,
            destination_location_id=destination_location_id,
            maintenance_step_id=maintenance_step_id,
            external_maintenance_step_id=external_maintenance_step_id,
            maintenance_id=maintenance_id,
            movement_datetime=movement_datetime,
        )
        next_consumable_move_id += 1


def _sync_asset_model_attribute_values(asset_model: AssetModel) -> None:
    type_attrs = list(
        AssetTypeAttribute.objects.select_related("asset_attribute_definition")
        .filter(asset_type_id=asset_model.asset_type_id)
        .values(
            "asset_attribute_definition_id",
            "default_value",
            "asset_attribute_definition__data_type",
        )
    )
    type_def_ids = {row["asset_attribute_definition_id"] for row in type_attrs}

    existing_qs = AssetModelAttributeValue.objects.filter(asset_model_id=asset_model.asset_model_id)
    existing_def_ids = set(existing_qs.values_list("asset_attribute_definition_id", flat=True))

    missing_ids = type_def_ids - existing_def_ids
    extra_ids = existing_def_ids - type_def_ids

    if extra_ids:
        existing_qs.filter(asset_attribute_definition_id__in=extra_ids).delete()

    if missing_ids:
        type_map = {row["asset_attribute_definition_id"]: row for row in type_attrs}
        for definition_id in missing_ids:
            row = type_map.get(definition_id)
            if not row:
                continue
            parsed = _parse_default_value(
                row.get("asset_attribute_definition__data_type"),
                row.get("default_value"),
            )
            instance = AssetModelAttributeValue()
            instance.asset_model_id = asset_model.asset_model_id
            instance.asset_attribute_definition_id = definition_id
            instance.value_bool = parsed["value_bool"]
            instance.value_string = parsed["value_string"]
            instance.value_number = parsed["value_number"]
            instance.value_date = parsed["value_date"]
            instance.save(force_insert=True)


def _sync_stock_item_model_attribute_values(stock_item_model: StockItemModel) -> None:
    type_attrs = list(
        StockItemTypeAttribute.objects.select_related("stock_item_attribute_definition")
        .filter(stock_item_type_id=stock_item_model.stock_item_type_id)
        .values(
            "stock_item_attribute_definition_id",
            "default_value",
            "stock_item_attribute_definition__data_type",
        )
    )
    type_def_ids = {row["stock_item_attribute_definition_id"] for row in type_attrs}

    existing_qs = StockItemModelAttributeValue.objects.filter(stock_item_model_id=stock_item_model.stock_item_model_id)
    existing_def_ids = set(existing_qs.values_list("stock_item_attribute_definition_id", flat=True))

    missing_ids = type_def_ids - existing_def_ids
    extra_ids = existing_def_ids - type_def_ids

    if extra_ids:
        existing_qs.filter(stock_item_attribute_definition_id__in=extra_ids).delete()

    if missing_ids:
        type_map = {row["stock_item_attribute_definition_id"]: row for row in type_attrs}
        for definition_id in missing_ids:
            row = type_map.get(definition_id)
            if not row:
                continue
            parsed = _parse_default_value(
                row.get("stock_item_attribute_definition__data_type"),
                row.get("default_value"),
            )
            instance = StockItemModelAttributeValue()
            instance.stock_item_model_id = stock_item_model.stock_item_model_id
            instance.stock_item_attribute_definition_id = definition_id
            instance.value_bool = parsed["value_bool"]
            instance.value_string = parsed["value_string"]
            instance.value_number = parsed["value_number"]
            instance.value_date = parsed["value_date"]
            instance.save(force_insert=True)


def _sync_consumable_model_attribute_values(consumable_model: ConsumableModel) -> None:
    type_attrs = list(
        ConsumableTypeAttribute.objects.select_related("consumable_attribute_definition")
        .filter(consumable_type_id=consumable_model.consumable_type_id)
        .values(
            "consumable_attribute_definition_id",
            "default_value",
            "consumable_attribute_definition__data_type",
        )
    )
    type_def_ids = {row["consumable_attribute_definition_id"] for row in type_attrs}

    existing_qs = ConsumableModelAttributeValue.objects.filter(consumable_model_id=consumable_model.consumable_model_id)
    existing_def_ids = set(existing_qs.values_list("consumable_attribute_definition_id", flat=True))

    missing_ids = type_def_ids - existing_def_ids
    extra_ids = existing_def_ids - type_def_ids

    if extra_ids:
        existing_qs.filter(consumable_attribute_definition_id__in=extra_ids).delete()

    if missing_ids:
        type_map = {row["consumable_attribute_definition_id"]: row for row in type_attrs}
        for definition_id in missing_ids:
            row = type_map.get(definition_id)
            if not row:
                continue
            parsed = _parse_default_value(
                row.get("consumable_attribute_definition__data_type"),
                row.get("default_value"),
            )
            instance = ConsumableModelAttributeValue()
            instance.consumable_model_id = consumable_model.consumable_model_id
            instance.consumable_attribute_definition_id = definition_id
            instance.value_bool = parsed["value_bool"]
            instance.value_string = parsed["value_string"]
            instance.value_number = parsed["value_number"]
            instance.value_date = parsed["value_date"]
            instance.save(force_insert=True)


def _sync_asset_attribute_values(asset: Asset) -> None:
    model_defs = list(
        AssetModelAttributeValue.objects.filter(asset_model_id=asset.asset_model_id).values(
            "asset_attribute_definition_id",
            "value_bool",
            "value_string",
            "value_number",
            "value_date",
        )
    )
    model_def_ids = {row["asset_attribute_definition_id"] for row in model_defs}

    existing_qs = AssetAttributeValue.objects.filter(asset_id=asset.asset_id)
    existing_def_ids = set(existing_qs.values_list("asset_attribute_definition_id", flat=True))

    missing_ids = model_def_ids - existing_def_ids
    extra_ids = existing_def_ids - model_def_ids

    if extra_ids:
        existing_qs.filter(asset_attribute_definition_id__in=extra_ids).delete()

    if missing_ids:
        model_map = {row["asset_attribute_definition_id"]: row for row in model_defs}
        for definition_id in missing_ids:
            row = model_map.get(definition_id)
            if not row:
                continue
            instance = AssetAttributeValue()
            instance.asset_attribute_definition_id = definition_id
            instance.asset_id = asset.asset_id
            instance.value_bool = row.get("value_bool")
            instance.value_string = row.get("value_string")
            instance.value_number = row.get("value_number")
            instance.value_date = row.get("value_date")
            instance.save(force_insert=True)


def _sync_stock_item_attribute_values(stock_item: StockItem) -> None:
    model_defs = list(
        StockItemModelAttributeValue.objects.filter(stock_item_model_id=stock_item.stock_item_model_id).values(
            "stock_item_attribute_definition_id",
            "value_bool",
            "value_string",
            "value_number",
            "value_date",
        )
    )
    model_def_ids = {row["stock_item_attribute_definition_id"] for row in model_defs}

    existing_qs = StockItemAttributeValue.objects.filter(stock_item_id=stock_item.stock_item_id)
    existing_def_ids = set(existing_qs.values_list("stock_item_attribute_definition_id", flat=True))

    missing_ids = model_def_ids - existing_def_ids
    extra_ids = existing_def_ids - model_def_ids

    if extra_ids:
        existing_qs.filter(stock_item_attribute_definition_id__in=extra_ids).delete()

    if missing_ids:
        model_map = {row["stock_item_attribute_definition_id"]: row for row in model_defs}
        for definition_id in missing_ids:
            row = model_map.get(definition_id)
            if not row:
                continue
            instance = StockItemAttributeValue()
            instance.stock_item_attribute_definition_id = definition_id
            instance.stock_item_id = stock_item.stock_item_id
            instance.value_bool = row.get("value_bool")
            instance.value_string = row.get("value_string")
            instance.value_number = row.get("value_number")
            instance.value_date = row.get("value_date")
            instance.save(force_insert=True)


def _sync_consumable_attribute_values(consumable: Consumable) -> None:
    model_defs = list(
        ConsumableModelAttributeValue.objects.filter(consumable_model_id=consumable.consumable_model_id).values(
            "consumable_attribute_definition_id",
            "value_bool",
            "value_string",
            "value_number",
            "value_date",
        )
    )
    model_def_ids = {row["consumable_attribute_definition_id"] for row in model_defs}

    existing_qs = ConsumableAttributeValue.objects.filter(consumable_id=consumable.consumable_id)
    existing_def_ids = set(existing_qs.values_list("consumable_attribute_definition_id", flat=True))

    missing_ids = model_def_ids - existing_def_ids
    extra_ids = existing_def_ids - model_def_ids

    if extra_ids:
        existing_qs.filter(consumable_attribute_definition_id__in=extra_ids).delete()

    if missing_ids:
        model_map = {row["consumable_attribute_definition_id"]: row for row in model_defs}
        for definition_id in missing_ids:
            row = model_map.get(definition_id)
            if not row:
                continue
            instance = ConsumableAttributeValue()
            instance.consumable_attribute_definition_id = definition_id
            instance.consumable_id = consumable.consumable_id
            instance.value_bool = row.get("value_bool")
            instance.value_string = row.get("value_string")
            instance.value_number = row.get("value_number")
            instance.value_date = row.get("value_date")
            instance.save(force_insert=True)
from .serializers import (
    AssetAttributeDefinitionSerializer,
    AssetAttributeValueSerializer,
    AssetBrandSerializer,
    AssetIsAssignedToPersonSerializer,
    AssetModelAttributeValueSerializer,
    AssetModelDefaultStockItemSerializer,
    AssetModelDefaultConsumableSerializer,
    AssetModelSerializer,
    AssetSerializer,
    AssetTypeAttributeSerializer,
    AssetTypeSerializer,
    ConsumableAttributeDefinitionSerializer,
    ConsumableAttributeValueSerializer,
    ConsumableBrandSerializer,
    ConsumableModelAttributeValueSerializer,
    ConsumableModelSerializer,
    ConsumableSerializer,
    ConsumableIsAssignedToPersonSerializer,
    ConsumableTypeAttributeSerializer,
    ConsumableTypeSerializer,
    LoginSerializer,
    MaintenanceStepSerializer,
    MaintenanceSerializer,
    MaintenanceTypicalStepSerializer,
    MaintenanceTypicalStepSerializer,
    PhysicalConditionSerializer,
    OrganizationalStructureTypeSerializer,
    OrganizationalStructureRelationSerializer,
    OrganizationalStructureSerializer,
    PersonSerializer,
    PersonReportsProblemOnAssetSerializer,
    PersonReportsProblemOnStockItemSerializer,
    PersonReportsProblemOnConsumableSerializer,
    PositionSerializer,
    PositionRoleMappingSerializer,
    RoleSerializer,
    LocationSerializer,
    LocationRelationSerializer,
    LocationTypeSerializer,
    StockItemAttributeDefinitionSerializer,
    StockItemAttributeValueSerializer,
    StockItemBrandSerializer,
    StockItemModelAttributeValueSerializer,
    StockItemModelSerializer,
    StockItemSerializer,
    StockItemIsAssignedToPersonSerializer,
    StockItemTypeAttributeSerializer,
    StockItemTypeSerializer,
    UserProfileSerializer,
    WarehouseSerializer,
    AttributionOrderSerializer,
    AttributionOrderAssetStockItemAccessorySerializer,
    AttributionOrderAssetConsumableAccessorySerializer,
    ReceiptReportSerializer,
    AdministrativeCertificateSerializer,
    CompanyAssetRequestSerializer,
    AssetIncidentReportSerializer,
    MaintenanceStepItemRequestSerializer,
    AuthenticationLogSerializer,
    UserSessionSerializer,
    ExternalMaintenanceProviderSerializer,
    ExternalMaintenanceSerializer,
    ExternalMaintenanceStepSerializer,
    ExternalMaintenanceTypicalStepSerializer,
)


def hash_password(password: str) -> str:
    """Hash password using SHA-512 to match existing database format."""

    return hashlib.sha512(password.encode()).hexdigest()


class SuperuserWriteMixin:
    """Mixin enforcing superuser-only writes while allowing authenticated reads."""

    permission_classes = [IsAuthenticated]

    def _get_user_account(self, request):
        # If authentication already resolved our custom UserAccount, use it.
        # Do not rely on is_authenticated always being present/true.
        if hasattr(request, "user") and request.user and isinstance(request.user, UserAccount):
            return request.user

        # For tests using force_authenticate, request.user is set directly
        if hasattr(request, "user") and request.user and getattr(request.user, "is_authenticated", False):

            # Fallback: DRF may set request.user to a different user type.
            # Try to resolve our UserAccount via username / id.
            try:
                username = getattr(request.user, "username", None)
                if username:
                    return UserAccount.objects.get(username=username)
            except UserAccount.DoesNotExist:
                pass
            except Exception:
                pass

            try:
                user_id = getattr(request.user, "user_id", None) or getattr(request.user, "id", None)
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
            except UserAccount.DoesNotExist:
                pass
            except Exception:
                pass

        # Primary: resolve via JWT claims in request.auth (varies by authentication backend).
        token_payload = None
        try:
            if hasattr(request, "auth") and request.auth is not None:
                if isinstance(request.auth, dict):
                    token_payload = request.auth
                elif hasattr(request.auth, "payload") and isinstance(getattr(request.auth, "payload"), dict):
                    token_payload = request.auth.payload
                elif hasattr(request.auth, "get"):
                    # Some token types implement dict-like .get
                    token_payload = request.auth
        except Exception:
            token_payload = None

        if token_payload is not None:
            try:
                user_id = token_payload.get("user_id")
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
            except (UserAccount.DoesNotExist, AttributeError, KeyError, TypeError):
                pass

            try:
                username = token_payload.get("username")
                if username:
                    return UserAccount.objects.get(username=username)
            except (UserAccount.DoesNotExist, AttributeError, KeyError, TypeError):
                pass

        return None

    def _require_superuser(self, request, action_label: str):
        user_account = self._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)
        if not user_account.is_superuser():
            return Response({"error": f"Only superusers can {action_label}"}, status=status.HTTP_403_FORBIDDEN)
        return None

    def create(self, request, *args, **kwargs):  # noqa: D401
        denial = self._require_superuser(request, f"create {self.basename.replace('-', ' ')}")
        if denial:
            return denial
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        denial = self._require_superuser(request, f"update {self.basename.replace('-', ' ')}")
        if denial:
            return denial
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, f"delete {self.basename.replace('-', ' ')}")
        if denial:
            return denial
        return super().destroy(request, *args, **kwargs)


class MaintenanceTypicalStepViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = MaintenanceTypicalStep.objects.all().order_by("maintenance_typical_step_id")
    serializer_class = MaintenanceTypicalStepSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="field-choices")
    def field_choices(self, request):
        """Return distinct/allowed values for maintenance_type, operation_type, maintenance_domain, with Arabic labels."""
        from django.db import connection

        # Static Arabic translation map for known values
        ar_map = {
            "maintenance_type": {"Software": "برمجي", "Hardware": "عتادي"},
            "operation_type": {"add": "إضافة", "change": "تغيير", "remove": "نزع", "inspect": "فحص"},
            "maintenance_domain": {"it": "تكنولوجيا المعلومات", "network": "شبكي"},
        }

        choices = {}
        with connection.cursor() as cursor:
            # maintenance_type: distinct non-null values from both tables
            cursor.execute(
                "SELECT DISTINCT maintenance_type FROM ("
                "  SELECT maintenance_type FROM maintenance_typical_step WHERE maintenance_type IS NOT NULL "
                " UNION "
                "  SELECT maintenance_type FROM external_maintenance_typical_step WHERE maintenance_type IS NOT NULL"
                ") sub ORDER BY maintenance_type"
            )
            choices["maintenance_type"] = [
                {"value": row[0].strip(), "label_ar": ar_map["maintenance_type"].get(row[0].strip(), "")}
                for row in cursor.fetchall()
            ]

            # operation_type: from CHECK constraint on maintenance_typical_step
            cursor.execute(
                "SELECT DISTINCT operation_type FROM maintenance_typical_step "
                "WHERE operation_type IS NOT NULL ORDER BY operation_type"
            )
            choices["operation_type"] = [
                {"value": row[0].strip(), "label_ar": ar_map["operation_type"].get(row[0].strip(), "")}
                for row in cursor.fetchall()
            ]

            # maintenance_domain: from ENUM type
            cursor.execute(
                "SELECT unnest(enum_range(NULL::public.maintenance_domain))::text ORDER BY 1"
            )
            choices["maintenance_domain"] = [
                {"value": row[0], "label_ar": ar_map["maintenance_domain"].get(row[0], "")}
                for row in cursor.fetchall()
            ]

        return Response(choices)

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create maintenance typical steps")
        if denial:
            return denial

        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            last_item = MaintenanceTypicalStep.objects.order_by("-maintenance_typical_step_id").first()
            next_id = (last_item.maintenance_typical_step_id + 1) if last_item else 1

            translations_data = serializer.validated_data.pop('translations', None)
            instance = MaintenanceTypicalStep.objects.create(
                maintenance_typical_step_id=next_id,
                **serializer.validated_data,
            )
            if translations_data:
                from api.utils.i18n import save_translations
                save_translations(instance, translations_data)

            out = self.get_serializer(instance)
            return Response(out.data, status=status.HTTP_201_CREATED)
        except Exception as exc:
            import os
            import traceback
            try:
                log_path = os.path.join(os.getcwd(), 'root_debug.log')
                with open(log_path, 'a', encoding='utf-8') as f:
                    f.write(f"\n[MaintenanceTypicalStepViewSet.create] ERROR: {str(exc)}\n")
                    f.write(traceback.format_exc())
                    f.write("-" * 40 + "\n")
                    f.flush()
            except Exception:
                pass
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MaintenanceViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = Maintenance.objects.all().order_by("maintenance_id")
    serializer_class = MaintenanceSerializer

    @action(detail=False, methods=["get"], url_path="technician-stats")
    def technician_stats(self, request):
        user_account = self._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("maintenance_chief" not in role_codes) and ("it_bureau_chief" not in role_codes):
            return Response({"error": "Unauthorized access to statistics"}, status=status.HTTP_403_FORBIDDEN)

        from django.db.models import Count, Case, When, IntegerField
        
        # Calculate basic stats grouping by technician
        # Note: performed_by_person__first_name etc might be inaccessible if the person has no UserAccount, 
        # but here we use models.Person fields directly (Maintenance has performed_by_person FK to Person).
        stats = Maintenance.objects.values(
            'performed_by_person_id',
            'performed_by_person__first_name',
            'performed_by_person__last_name'
        ).annotate(
            total_maintenances=Count('maintenance_id'),
            successful_maintenances=Count(Case(When(is_successful=True, then=1), output_field=IntegerField())),
            failed_maintenances=Count(Case(When(is_successful=False, then=1), output_field=IntegerField())),
            pending_maintenances=Count(Case(When(end_datetime__isnull=True, then=1), output_field=IntegerField())),
            completed_maintenances=Count(Case(When(end_datetime__isnull=False, then=1), output_field=IntegerField())),
        ).order_by('-total_maintenances')

        # Convert to list and calculate duration stats
        stats_list = list(stats)
        
        for entry in stats_list:
            if entry['completed_maintenances'] > 0:
                entry['success_rate'] = round((entry['successful_maintenances'] / entry['completed_maintenances']) * 100, 2)
            else:
                entry['success_rate'] = 0
                
            # Quick avg duration calculation
            maintenances = Maintenance.objects.filter(
                performed_by_person_id=entry['performed_by_person_id'],
                start_datetime__isnull=False,
                end_datetime__isnull=False
            )
            
            durations_hours = []
            for m in maintenances:
                if m.end_datetime and m.start_datetime:
                    diff = m.end_datetime - m.start_datetime
                    durations_hours.append(diff.total_seconds() / 3600.0)
            
            if durations_hours:
                entry['avg_duration_hours'] = round(sum(durations_hours) / len(durations_hours), 2)
            else:
                entry['avg_duration_hours'] = 0

        return Response(stats_list, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="my-stats")
    def my_stats(self, request):
        user_account = self._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = user_account.person
        from django.db.models import Count, Case, When, IntegerField
        from django.db.models.functions import TruncMonth

        # Overall summary stats
        summary = Maintenance.objects.filter(performed_by_person=person).aggregate(
            total_maintenances=Count('maintenance_id'),
            successful_maintenances=Count(Case(When(is_successful=True, then=1), output_field=IntegerField())),
            failed_maintenances=Count(Case(When(is_successful=False, then=1), output_field=IntegerField())),
            pending_maintenances=Count(Case(When(end_datetime__isnull=True, then=1), output_field=IntegerField())),
            completed_maintenances=Count(Case(When(end_datetime__isnull=False, then=1), output_field=IntegerField())),
        )

        completed = summary['completed_maintenances'] or 0
        summary['success_rate'] = round((summary['successful_maintenances'] / completed) * 100, 1) if completed > 0 else 0
        
        # Monthly trend (last 6 months)
        from django.utils import timezone
        import datetime
        six_months_ago = timezone.now() - datetime.timedelta(days=180)
        
        monthly_stats = Maintenance.objects.filter(
            performed_by_person=person,
            start_datetime__gte=six_months_ago
        ).annotate(
            month=TruncMonth('start_datetime')
        ).values('month').annotate(
            count=Count('maintenance_id'),
            successful=Count(Case(When(is_successful=True, then=1), output_field=IntegerField()))
        ).order_by('month')

        # Average duration
        maintenances = Maintenance.objects.filter(
            performed_by_person=person,
            start_datetime__isnull=False,
            end_datetime__isnull=False
        )
        durations = [(m.end_datetime - m.start_datetime).total_seconds() / 3600.0 for m in maintenances if m.end_datetime and m.start_datetime]
        summary['avg_duration_hours'] = round(sum(durations) / len(durations), 1) if durations else 0

        return Response({
            "summary": summary,
            "monthly_trend": list(monthly_stats)
        }, status=status.HTTP_200_OK)

    def get_queryset(self):
        qs = (
            Maintenance.objects.select_related(
                "asset",
                "asset__asset_model__asset_brand",
                "asset__asset_model__asset_type",
                "performed_by_person",
            )
            .all()
            .order_by("-start_datetime", "-maintenance_id")
        )

        user_account = self._get_user_account(self.request)
        if not user_account:
            return Maintenance.objects.none()

        if user_account.is_superuser():
            return qs

        person = getattr(user_account, "person", None)
        if not person:
            return Maintenance.objects.none()

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )
        if "maintenance_chief" in role_codes or "it_bureau_chief" in role_codes:
            return qs

        if "asset_responsible" in role_codes:
            # Asset responsible should be able to see maintenances that are awaiting their approval
            # via a pending maintenance-create asset movement request.
            pending_moves = list(
                AssetMovement.objects.filter(Q(status="pending") | Q(status__isnull=True))
                .filter(movement_reason="maintenance_create")
                .values("asset_id", "maintenance_id")
            )

            maintenance_ids = []
            asset_ids = []
            for row in pending_moves:
                try:
                    mid = row.get("maintenance_id")
                    if mid:
                        maintenance_ids.append(int(mid))
                    else:
                        asset_ids.append(int(row.get("asset_id")))
                except Exception:
                    continue

            if maintenance_ids:
                return qs.filter(maintenance_id__in=maintenance_ids)
            if asset_ids:
                return qs.filter(asset_id__in=asset_ids, start_datetime__isnull=True, end_datetime__isnull=True)
            return Maintenance.objects.none()

        if "it_maintenance_technician" in role_codes or "network_maintenance_technician" in role_codes:
            return qs.filter(Q(performed_by_person=person) | Q(steps__person=person)).distinct()

        return Maintenance.objects.none()

    def partial_update(self, request, *args, **kwargs):
        """Allow updating maintenance_status for chiefs and assigned technicians."""
        maintenance = self.get_object()
        user_account = self._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = getattr(user_account, "person", None)
        if not person:
            return Response({"error": "Person not found"}, status=status.HTTP_404_NOT_FOUND)

        # Only maintenance_status is allowed via this endpoint for non-superusers
        allowed_fields = {"maintenance_status"}
        data = request.data.copy()
        disallowed = set(data.keys()) - allowed_fields
        if disallowed and not user_account.is_superuser():
            return Response(
                {"error": f"Only {', '.join(allowed_fields)} can be updated. Remove: {', '.join(disallowed)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_allowed = False
        if user_account.is_superuser():
            is_allowed = True
        else:
            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            if "maintenance_chief" in role_codes or "it_bureau_chief" in role_codes:
                is_allowed = True
            elif getattr(maintenance, "performed_by_person_id", None) == person.person_id:
                is_allowed = True
            elif MaintenanceStep.objects.filter(maintenance_id=maintenance.maintenance_id, person_id=person.person_id).exists():
                is_allowed = True

        if not is_allowed:
            return Response({"error": "Not allowed to update this maintenance"}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(maintenance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create maintenances")
        if denial:
            return denial

        last_item = Maintenance.objects.order_by("-maintenance_id").first()
        next_id = (last_item.maintenance_id + 1) if last_item else 1
        data = request.data.copy()
        if 'digital_copy' in request.FILES:
            data.pop('digital_copy', None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        data["start_datetime"] = None
        maintenance = Maintenance.objects.create(maintenance_id=next_id, **data)
        return Response(self.get_serializer(maintenance).data, status=status.HTTP_201_CREATED)


    def destroy(self, request, *args, **kwargs):
        maintenance = self.get_object()
        user_account = self._get_user_account(request)
        person = getattr(user_account, "person", None) if user_account else None
        
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        is_allowed = False
        if user_account.is_superuser():
            is_allowed = True
        elif person:
            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            if "maintenance_chief" in role_codes or "it_bureau_chief" in role_codes:
                is_allowed = True
            elif maintenance.performed_by_person_id == person.person_id:
                is_allowed = True
            elif MaintenanceStep.objects.filter(maintenance_id=maintenance.maintenance_id, person_id=person.person_id).exists():
                is_allowed = True

        if not is_allowed:
            return Response({"error": "Not allowed to cancel this maintenance"}, status=status.HTTP_403_FORBIDDEN)

        if maintenance.steps.exists():
            return Response({"error": "Cannot cancel maintenance that has steps"}, status=status.HTTP_400_BAD_REQUEST)

        from .models import ExternalMaintenance
        if ExternalMaintenance.objects.filter(maintenance=maintenance).exists():
            return Response({"error": "Cannot cancel maintenance that has external maintenances"}, status=status.HTTP_400_BAD_REQUEST)

        maintenance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="end")
    def end(self, request, pk=None):
        maintenance = self.get_object()

        user_account = self._get_user_account(request)
        person = getattr(user_account, "person", None) if user_account else None
        if not person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        is_allowed = False
        if user_account and user_account.is_superuser():
            is_allowed = True
        else:
            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            if "maintenance_chief" in role_codes or "it_bureau_chief" in role_codes:
                is_allowed = True
            elif getattr(maintenance, "performed_by_person_id", None) == getattr(person, "person_id", None):
                is_allowed = True
            elif MaintenanceStep.objects.filter(maintenance_id=maintenance.maintenance_id, person_id=person.person_id).exists():
                is_allowed = True

        if not is_allowed:
            return Response({"error": "Not allowed to end this maintenance"}, status=status.HTTP_403_FORBIDDEN)

        if getattr(maintenance, "end_datetime", None) is not None:
            return Response({"error": "Maintenance already ended"}, status=status.HTTP_400_BAD_REQUEST)

        terminal_statuses = {
            "done",
            "failed (to be sent to a higher level)",
            "cancelled",
        }
        non_terminal_exists = maintenance.steps.exclude(maintenance_step_status__in=terminal_statuses).exists()
        if non_terminal_exists:
            return Response(
                {"error": "Cannot end maintenance while some steps are not done/failed/cancelled"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_successful_raw = request.data.get("is_successful", "__missing__") if hasattr(request, "data") else "__missing__"
        if is_successful_raw == "__missing__":
            return Response({"error": "is_successful is required (true/false)"}, status=status.HTTP_400_BAD_REQUEST)

        if isinstance(is_successful_raw, bool):
            is_successful_value = is_successful_raw
        elif isinstance(is_successful_raw, (int, float)):
            is_successful_value = bool(is_successful_raw)
        else:
            s = str(is_successful_raw).strip().lower()
            if s in {"true", "1", "yes", "y"}:
                is_successful_value = True
            elif s in {"false", "0", "no", "n"}:
                is_successful_value = False
            else:
                return Response({"error": "Invalid is_successful"}, status=status.HTTP_400_BAD_REQUEST)

        update_payload = {
            "end_datetime": timezone.now(),
            "is_successful": is_successful_value,
            "maintenance_status": "completed" if is_successful_value else "failed",
        }

        Maintenance.objects.filter(maintenance_id=maintenance.maintenance_id).update(**update_payload)
        maintenance.refresh_from_db()
        return Response(self.get_serializer(maintenance).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="request-return-to-owner")
    def request_return_to_owner(self, request, pk=None):
        maintenance = self.get_object()

        user_account = self._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = user_account.person
        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )
        is_allowed = (
            "it_maintenance_technician" in role_codes
            or "network_maintenance_technician" in role_codes
            or "maintenance_chief" in role_codes
            or "it_bureau_chief" in role_codes
            or user_account.is_superuser()
        )
        if not is_allowed:
            return Response({"error": "Only maintenance technicians or chiefs can request return"}, status=status.HTTP_403_FORBIDDEN)

        if (not user_account.is_superuser()) and ("maintenance_chief" not in role_codes) and ("it_bureau_chief" not in role_codes) and (maintenance.performed_by_person_id != person.person_id):
            # Also allow technicians who have at least one step assigned on this maintenance
            from .models import MaintenanceStep
            is_step_assigned = MaintenanceStep.objects.filter(
                maintenance_id=maintenance.maintenance_id,
                person_id=person.person_id,
            ).exists()
            if not is_step_assigned:
                return Response({"error": "Only the assigned technician can request return"}, status=status.HTTP_403_FORBIDDEN)

        asset = getattr(maintenance, "asset", None)
        if not asset:
            return Response({"error": "Maintenance asset not found"}, status=status.HTTP_404_NOT_FOUND)

        destination_location_id = request.data.get("destination_location_id")
        if not destination_location_id:
            return Response({"error": "destination_location_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            destination_location_id_int = int(destination_location_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_location = Location.objects.filter(location_id=destination_location_id_int).first()
        if not destination_location:
            return Response({"error": "Destination location not found"}, status=status.HTTP_404_NOT_FOUND)

        last_move = (
            AssetMovement.objects.select_related("destination_location")
            .filter(asset_id=asset.asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        if last_move and last_move.destination_location_id:
            source_location = last_move.destination_location
        else:
            source_location = destination_location
        if last_move and source_location.location_id == destination_location.location_id:
            return Response(
                {
                    "asset_id": asset.asset_id,
                    "source_location_id": source_location.location_id,
                    "destination_location_id": destination_location.location_id,
                    "status": "no_change",
                },
                status=status.HTTP_200_OK,
            )

        last_asset_move = AssetMovement.objects.order_by("-asset_movement_id").first()
        next_asset_move_id = (last_asset_move.asset_movement_id + 1) if last_asset_move else 1

        now_dt = timezone.now()
        _create_asset_movement_with_translations(
            movement_reason_en="return_to_owner",
            asset_movement_id=next_asset_move_id,
            asset=asset,
            source_location=source_location,
            destination_location=destination_location,
            maintenance_step=None,
            external_maintenance_step_id=None,
            movement_datetime=now_dt,
            status="pending",
        )

        _cascade_move_composed_items(
            asset_id=asset.asset_id,
            source_location_id=source_location.location_id,
            destination_location_id=destination_location.location_id,
            movement_reason="return_to_owner",
            movement_datetime=now_dt,
            maintenance_step_id=None,
            external_maintenance_step_id=None,
            maintenance_id=None,
        )

        return Response(
            {
                "asset_movement_id": next_asset_move_id,
                "asset_id": asset.asset_id,
                "source_location_id": source_location.location_id,
                "destination_location_id": destination_location.location_id,
                "status": "pending",
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"], url_path="pending-return-to-owner-exists")
    def pending_return_to_owner_exists(self, request, pk=None):
        maintenance = self.get_object()

        user_account = self._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = user_account.person
        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )
        is_allowed = (
            "it_maintenance_technician" in role_codes
            or "network_maintenance_technician" in role_codes
            or "maintenance_chief" in role_codes
            or "it_bureau_chief" in role_codes
            or user_account.is_superuser()
        )
        if not is_allowed:
            return Response({"error": "Only maintenance technicians or chiefs can access this"}, status=status.HTTP_403_FORBIDDEN)

        if (not user_account.is_superuser()) and ("maintenance_chief" not in role_codes) and ("it_bureau_chief" not in role_codes) and (maintenance.performed_by_person_id != person.person_id):
            # Also allow technicians who have at least one step assigned on this maintenance
            from .models import MaintenanceStep
            is_step_assigned = MaintenanceStep.objects.filter(
                maintenance_id=maintenance.maintenance_id,
                person_id=person.person_id,
            ).exists()
            if not is_step_assigned:
                return Response({"error": "Only the assigned technician can access this"}, status=status.HTTP_403_FORBIDDEN)

        asset_id = getattr(maintenance, "asset_id", None)
        if not asset_id:
            return Response({"exists": False}, status=status.HTTP_200_OK)

        exists = AssetMovement.objects.filter(
            asset_id=asset_id,
            status="pending",
            movement_reason="return_to_owner",
        ).exists()

        return Response({"exists": bool(exists)}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="return-to-owner-default-location")
    def return_to_owner_default_location(self, request, pk=None):
        maintenance = self.get_object()

        user_account = self._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = user_account.person
        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )
        is_allowed = (
            "it_maintenance_technician" in role_codes
            or "network_maintenance_technician" in role_codes
            or "maintenance_chief" in role_codes
            or "it_bureau_chief" in role_codes
            or user_account.is_superuser()
        )
        if not is_allowed:
            return Response({"error": "Only maintenance technicians or chiefs can access this"}, status=status.HTTP_403_FORBIDDEN)

        if (not user_account.is_superuser()) and ("maintenance_chief" not in role_codes) and ("it_bureau_chief" not in role_codes) and (maintenance.performed_by_person_id != person.person_id):
            # Also allow technicians who have at least one step assigned on this maintenance
            from .models import MaintenanceStep
            is_step_assigned = MaintenanceStep.objects.filter(
                maintenance_id=maintenance.maintenance_id,
                person_id=person.person_id,
            ).exists()
            if not is_step_assigned:
                return Response({"error": "Only the assigned technician can access this"}, status=status.HTTP_403_FORBIDDEN)

        asset_id = getattr(maintenance, "asset_id", None)
        if not asset_id:
            return Response({"destination_location_id": None}, status=status.HTTP_200_OK)

        last_move = (
            AssetMovement.objects.filter(asset_id=asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        if not last_move or not last_move.source_location_id:
            return Response({"destination_location_id": None}, status=status.HTTP_200_OK)

        return Response({"destination_location_id": int(last_move.source_location_id)}, status=status.HTTP_200_OK)


    @action(detail=False, methods=["post"], url_path="create-direct")
    def create_direct(self, request):
        user_account = self._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("maintenance_chief" not in role_codes) and ("it_bureau_chief" not in role_codes):
            return Response({"error": "Only maintenance chiefs can create maintenance"}, status=status.HTTP_403_FORBIDDEN)

        asset_id = request.data.get("asset_id")
        technician_person_id = request.data.get("technician_person_id")
        description = request.data.get("description")
        destination_location_id = request.data.get("destination_location_id")

        if not asset_id:
            return Response({"error": "asset_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not technician_person_id:
            return Response({"error": "technician_person_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        asset = Asset.objects.filter(asset_id=asset_id).first()
        if not asset:
            return Response({"error": "Asset not found"}, status=status.HTTP_404_NOT_FOUND)

        last_move = (
            AssetMovement.objects.select_related("destination_location", "destination_location__location_type")
            .filter(asset_id=asset.asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        current_location = last_move.destination_location if last_move else None

        def _is_maintenance_location(location: Location | None) -> bool:
            if not location or not getattr(location, "location_type", None):
                return False
            code = getattr(location.location_type, "location_type_code", None)
            label = (getattr(location.location_type, "location_type_label", None) or "").lower()
            if code and str(code).upper() in {"MR", "MAINTENANCE", "MAINT"}:
                return True
            return "maintenance" in label

        if not current_location or not _is_maintenance_location(current_location):
            if not destination_location_id:
                return Response(
                    {
                        "error": "Asset is not in a maintenance location. destination_location_id is required to move the asset before creating maintenance.",
                        "current_location": LocationSerializer(current_location).data if current_location else None,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            destination_location = Location.objects.select_related("location_type").filter(location_id=destination_location_id).first()
            if not destination_location:
                return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)
            if not _is_maintenance_location(destination_location):
                return Response({"error": "destination_location_id must be a maintenance location"}, status=status.HTTP_400_BAD_REQUEST)
            source_location = current_location or destination_location

            last_asset_move = AssetMovement.objects.order_by("-asset_movement_id").first()
            next_asset_move_id = (last_asset_move.asset_movement_id + 1) if last_asset_move else 1
            _create_asset_movement_with_translations(
                movement_reason_en="maintenance_create",
                asset_movement_id=next_asset_move_id,
                asset=asset,
                source_location=source_location,
                destination_location=destination_location,
                maintenance_step=None,
                external_maintenance_step_id=None,
                movement_datetime=timezone.now(),
            )
            _cascade_move_composed_items(
                asset_id=asset.asset_id,
                source_location_id=source_location.location_id,
                destination_location_id=destination_location.location_id,
                movement_reason="maintenance_create",
                movement_datetime=timezone.now(),
                maintenance_step_id=None,
                external_maintenance_step_id=None,
                maintenance_id=None,
            )

        technician = Person.objects.filter(person_id=technician_person_id).first()
        if not technician:
            return Response({"error": "Technician not found"}, status=status.HTTP_404_NOT_FOUND)

        last_item = Maintenance.objects.order_by("-maintenance_id").first()
        next_id = (last_item.maintenance_id + 1) if last_item else 1

        try:
            maintenance = Maintenance.objects.create(
                maintenance_id=next_id,
                asset=asset,
                performed_by_person=technician,
                approved_by_maintenance_chief=user_account.person,
                maintenance_status="pending",
                description=description,
                start_datetime=None,
                end_datetime=None,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create maintenance due to database constraints.",
                    "details": "Check required fields in Maintenance model (approved_by_maintenance_chief, end_datetime, etc.)",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(self.get_serializer(maintenance).data, status=status.HTTP_201_CREATED)


class AssetMaintenanceTimelineView(APIView):
    """Returns maintenance timeline for assets where the user made a problem report"""
    permission_classes = [IsAuthenticated]

    def get(self, request, asset_id=None):
        user_account = None
        try:
            if hasattr(request, "auth") and request.auth is not None:
                user_id = request.auth.get("user_id")
                if user_id:
                    user_account = UserAccount.objects.select_related("person").get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            user_account = None

        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = user_account.person

        visibility = (request.query_params.get("visibility") or "").strip().lower() or "owned_only"
        try:
            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
        except Exception:
            role_codes = set()
        allowed_anytime = getattr(user_account, "is_superuser", lambda: False)() or ("maintenance_chief" in role_codes)
        if visibility == "anytime" and not allowed_anytime:
            visibility = "owned_only"

        if asset_id is not None:
            aid = int(asset_id)
            if visibility == "anytime":
                asset_ids = [aid]
            else:
                # owned_only: allow if the user has ever been assigned this asset
                owned = AssetIsAssignedToPerson.objects.filter(asset_id=aid, person_id=person.person_id).exists()
                if not owned:
                    return Response({"error": "Not allowed to view maintenance timeline for this asset"}, status=status.HTTP_403_FORBIDDEN)
                asset_ids = [aid]
        else:
            # When no asset_id is provided, default to assets owned by the user
            owned_ids = list(
                AssetIsAssignedToPerson.objects.filter(person_id=person.person_id)
                .values_list("asset_id", flat=True)
                .distinct()
            )
            asset_ids = owned_ids

        if not asset_ids:
            return Response({"maintenances": [], "steps": []})

        # Get all maintenances for these assets
        maintenances = (
            Maintenance.objects.filter(asset_id__in=asset_ids)
            .select_related("asset", "performed_by_person")
            .order_by("-start_datetime", "-maintenance_id")
        )

        maintenance_ids = list(maintenances.values_list("maintenance_id", flat=True))

        # Get all maintenance steps for these maintenances
        steps = (
            MaintenanceStep.objects.filter(maintenance_id__in=maintenance_ids)
            .select_related("maintenance", "maintenance_typical_step", "person")
            .order_by("maintenance_id", "maintenance_step_id")
        )

        # Serialize data
        from .serializers import MaintenanceSerializer, MaintenanceStepSerializer

        maintenances_data = MaintenanceSerializer(maintenances, many=True).data
        steps_data = MaintenanceStepSerializer(steps, many=True).data

        return Response({
            "maintenances": maintenances_data,
            "steps": steps_data,
        })


class ChangePasswordView(APIView):
    """Handle user password change."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = None
        try:
            if hasattr(request, "auth") and request.auth is not None:
                user_id = request.auth.get("user_id")
        except Exception:
            pass

        if not user_id and hasattr(request, "user") and request.user:
            user_id = getattr(request.user, "user_id", None)

        if not user_id:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = UserAccount.objects.get(user_id=user_id)
        except UserAccount.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response({"error": "Both old and new passwords are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Hash old password to check against database
        if user.password_hash != hash_password(old_password):
            return Response({"error": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)

        # Update password
        user.password_hash = hash_password(new_password)
        user.password_last_changed_datetime = timezone.now()
        user.save(update_fields=["password_hash", "password_last_changed_datetime"])

        return Response({"message": "Password changed successfully"})


class AdminResetUserPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        if not user_account.is_superuser():
            return Response({"error": "Only superuser can reset passwords"}, status=status.HTTP_403_FORBIDDEN)

        username = request.data.get("username")
        new_password = request.data.get("new_password")
        if not username or not new_password:
            return Response(
                {"error": "Both username and new_password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            target = UserAccount.objects.get(username=username)
        except UserAccount.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        target.password_hash = hash_password(new_password)
        target.password_last_changed_datetime = timezone.now()
        target.failed_login_attempts = 0
        target.save(update_fields=["password_hash", "password_last_changed_datetime", "failed_login_attempts"])

        return Response({"message": "Password reset successfully", "username": username}, status=status.HTTP_200_OK)


class UserAccountCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        actor = SuperuserWriteMixin()._get_user_account(request)
        if not actor:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)
        if not actor.is_superuser():
            return Response({"error": "Only superusers can create user accounts"}, status=status.HTTP_403_FORBIDDEN)

        person_id = request.data.get("person_id")
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password")
        account_status = (request.data.get("account_status") or "active").strip() or "active"
        role_code = (request.data.get("role_code") or "").strip()

        if not person_id or not username or not password:
            return Response(
                {"error": "person_id, username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            person = Person.objects.get(person_id=int(person_id))
        except (ValueError, TypeError, Person.DoesNotExist):
            return Response({"error": "Invalid person_id"}, status=status.HTTP_400_BAD_REQUEST)

        if UserAccount.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
        if UserAccount.objects.filter(person=person).exists():
            return Response({"error": "This person already has an account"}, status=status.HTTP_400_BAD_REQUEST)

        role = None
        if role_code:
            role = Role.objects.filter(role_code=role_code).order_by("role_id").first()
            if not role:
                return Response({"error": f"Role not found for role_code '{role_code}'"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            last_user = UserAccount.objects.order_by("-user_id").first()
            next_user_id = (last_user.user_id + 1) if last_user else 1
            now_ts = timezone.now()

            with transaction.atomic():
                account = UserAccount.objects.create(
                    user_id=next_user_id,
                    person=person,
                    username=username,
                    password_hash=hash_password(password),
                    created_at_datetime=now_ts,
                    disabled_at_datetime=now_ts,
                    last_login=now_ts,
                    account_status=account_status,
                    failed_login_attempts=0,
                    password_last_changed_datetime=now_ts,
                    created_by_user_id=getattr(actor, "user_id", None),
                    modified_by_user_id=getattr(actor, "user_id", None),
                    modified_at_datetime=now_ts,
                )

                if role is not None:
                    with connection.cursor() as cursor:
                        cursor.execute(
                            """
                            INSERT INTO person_role_mapping (role_id, person_id)
                            VALUES (%s, %s)
                            ON CONFLICT (role_id, person_id) DO NOTHING
                            """,
                            [role.role_id, person.person_id],
                        )

            return Response(
                {
                    "user_id": account.user_id,
                    "username": account.username,
                    "person_id": person.person_id,
                    "account_status": account.account_status,
                },
                status=status.HTTP_201_CREATED,
            )
        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as exc:
            return Response({"error": f"Could not create account due to a data conflict: {exc}"}, status=status.HTTP_400_BAD_REQUEST)


class UserAccountDetailView(APIView):
    """Superuser-only endpoint to get/update a user account by person_id."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        actor = SuperuserWriteMixin()._get_user_account(request)
        if not actor:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)
        if not actor.is_superuser():
            return Response({"error": "Only superusers can view user account details"}, status=status.HTTP_403_FORBIDDEN)

        person_id = request.query_params.get("person_id")
        if not person_id:
            return Response({"error": "person_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ua = UserAccount.objects.get(person_id=int(person_id))
        except (ValueError, TypeError, UserAccount.DoesNotExist):
            return Response({"error": "User account not found for this person"}, status=status.HTTP_404_NOT_FOUND)

        # Get role
        role_code = None
        role_label = None
        mapping = PersonRoleMapping.objects.filter(person=ua.person).select_related('role').first()
        if mapping and mapping.role:
            role_code = mapping.role.role_code
            role_label = mapping.role.role_label

        # Get assignment
        assignment = PersonAssignment.objects.filter(person=ua.person).select_related('position').first()
        position_label = assignment.position.position_label if assignment and assignment.position else None
        position_id = assignment.position.position_id if assignment and assignment.position else None

        return Response({
            "user_id": ua.user_id,
            "username": ua.username,
            "is_approved": ua.is_approved,
            "account_status": ua.account_status,
            "created_at_datetime": ua.created_at_datetime,
            "person_id": ua.person_id,
            "role_code": role_code,
            "role_label": role_label,
            "position_id": position_id,
            "position_label": position_label,
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        actor = SuperuserWriteMixin()._get_user_account(request)
        if not actor:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)
        if not actor.is_superuser():
            return Response({"error": "Only superusers can update user accounts"}, status=status.HTTP_403_FORBIDDEN)

        person_id = request.data.get("person_id")
        if not person_id:
            return Response({"error": "person_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ua = UserAccount.objects.get(person_id=int(person_id))
        except (ValueError, TypeError, UserAccount.DoesNotExist):
            return Response({"error": "User account not found for this person"}, status=status.HTTP_404_NOT_FOUND)

        username = request.data.get("username")
        account_status = request.data.get("account_status")
        is_approved = request.data.get("is_approved")
        role_code = request.data.get("role_code")

        update_fields = []

        if username is not None:
            username = username.strip()
            if UserAccount.objects.filter(username=username).exclude(user_id=ua.user_id).exists():
                return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
            ua.username = username
            update_fields.append("username")

        if account_status is not None:
            ua.account_status = account_status
            update_fields.append("account_status")

        if is_approved is not None:
            if is_approved and ua.person and not ua.person.is_approved:
                return Response(
                    {"error": "Cannot approve a user account before approving the person"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            ua.is_approved = is_approved
            update_fields.append("is_approved")
            if is_approved and ua.account_status == "pending_approval":
                ua.account_status = "active"
                if "account_status" not in update_fields:
                    update_fields.append("account_status")

        if update_fields:
            ua.modified_at_datetime = timezone.now()
            update_fields.append("modified_at_datetime")
            ua.save(update_fields=update_fields)

        # Update role if provided
        if role_code is not None:
            if role_code:
                role = Role.objects.filter(role_code=role_code).order_by("role_id").first()
                if not role:
                    return Response({"error": f"Role not found for role_code '{role_code}'"}, status=status.HTTP_400_BAD_REQUEST)
                with connection.cursor() as cursor:
                    cursor.execute(
                        "DELETE FROM person_role_mapping WHERE person_id = %s",
                        [ua.person_id],
                    )
                    cursor.execute(
                        "INSERT INTO person_role_mapping (role_id, person_id) VALUES (%s, %s) ON CONFLICT (role_id, person_id) DO NOTHING",
                        [role.role_id, ua.person_id],
                    )
            else:
                with connection.cursor() as cursor:
                    cursor.execute(
                        "DELETE FROM person_role_mapping WHERE person_id = %s",
                        [ua.person_id],
                    )

        return Response({
            "message": "User account updated successfully",
            "user_id": ua.user_id,
            "username": ua.username,
            "is_approved": ua.is_approved,
            "account_status": ua.account_status,
        }, status=status.HTTP_200_OK)


class MaintenanceStepViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceStep.objects.all().order_by("maintenance_step_id")
    serializer_class = MaintenanceStepSerializer
    permission_classes = [IsAuthenticated]

    _TERMINAL_STEP_STATUSES = {
        "done",
        "failed (to be sent to a higher level)",
        "cancelled",
    }

    def _maybe_set_maintenance_start_datetime(self, step: MaintenanceStep, *, new_status: str | None = None):
        try:
            maintenance = getattr(step, "maintenance", None)
            if not maintenance or getattr(maintenance, "start_datetime", None) is not None:
                return

            step_id = getattr(step, "maintenance_step_id", None)
            if step_id is None:
                return

            first_step = (
                MaintenanceStep.objects.filter(maintenance_id=maintenance.maintenance_id)
                .order_by("maintenance_step_id")
                .first()
            )
            if not first_step or first_step.maintenance_step_id != step_id:
                return

            Maintenance.objects.filter(maintenance_id=maintenance.maintenance_id, start_datetime__isnull=True).update(
                start_datetime=timezone.now()
            )
        except Exception:
            return

    def _maybe_set_maintenance_in_progress_status(self, step: MaintenanceStep, *, new_status: str | None = None):
        try:
            if new_status != "In Progress":
                return

            maintenance = getattr(step, "maintenance", None)
            if not maintenance:
                return

            step_id = getattr(step, "maintenance_step_id", None)
            if step_id is None:
                return

            first_step = (
                MaintenanceStep.objects.filter(maintenance_id=maintenance.maintenance_id)
                .order_by("maintenance_step_id")
                .first()
            )
            if not first_step or first_step.maintenance_step_id != step_id:
                return

            Maintenance.objects.filter(maintenance_id=maintenance.maintenance_id).filter(
                Q(maintenance_status__isnull=True)
                | Q(maintenance_status="")
                | Q(maintenance_status="pending")
                | Q(maintenance_status="started")
            ).update(maintenance_status="in_progress")
        except Exception:
            return

    def _maybe_set_maintenance_started_status(self, step: MaintenanceStep, *, new_status: str | None = None):
        try:
            if new_status != "started":
                return

            maintenance = getattr(step, "maintenance", None)
            if not maintenance:
                return

            step_id = getattr(step, "maintenance_step_id", None)
            if step_id is None:
                return

            first_step = (
                MaintenanceStep.objects.filter(maintenance_id=maintenance.maintenance_id)
                .order_by("maintenance_step_id")
                .first()
            )
            if not first_step or first_step.maintenance_step_id != step_id:
                return

            Maintenance.objects.filter(maintenance_id=maintenance.maintenance_id).filter(
                Q(maintenance_status__isnull=True) | Q(maintenance_status="") | Q(maintenance_status="pending")
            ).update(maintenance_status="started")
        except Exception:
            return

    def _get_user_id(self, request):
        try:
            if hasattr(request, "user") and request.user and getattr(request.user, "is_authenticated", False):
                if isinstance(request.user, UserAccount):
                    return getattr(request.user, "user_id", None)
        except Exception:
            pass

        try:
            if hasattr(request, "auth") and request.auth is not None:
                return request.auth.get("user_id")
        except Exception:
            return None

        return None

    def _require_asset_composition(self, *, asset_id: int, target_type: str, target_id: int | None):
        if target_type == "asset":
            return

        if target_type == "stock_item":
            if target_id is None:
                raise ValidationError({"target_id": "target_id is required for stock_item"})
            is_composed = AssetIsComposedOfStockItemHistory.objects.filter(
                asset_id=asset_id,
                stock_item_id=target_id,
                end_datetime__isnull=True,
            ).exists()
            if not is_composed:
                raise ValidationError({"target_id": "Stock item is not currently composed in this asset"})
            return

        if target_type == "consumable":
            if target_id is None:
                raise ValidationError({"target_id": "target_id is required for consumable"})
            is_composed = AssetIsComposedOfConsumableHistory.objects.filter(
                asset_id=asset_id,
                consumable_id=target_id,
                end_datetime__isnull=True,
            ).exists()
            if not is_composed:
                raise ValidationError({"target_id": "Consumable is not currently composed in this asset"})
            return

        raise ValidationError({"target_type": "Invalid target_type"})

    def _validate_and_normalize_change(self, change: dict):
        target_type = change.get("target_type")
        target_id = change.get("target_id")
        attribute_definition_id = change.get("attribute_definition_id")

        if target_type not in {"asset", "stock_item", "consumable"}:
            raise ValidationError({"target_type": "target_type must be 'asset', 'stock_item', or 'consumable'"})

        try:
            if target_id not in (None, ""):
                target_id = int(target_id)
            else:
                target_id = None
        except (TypeError, ValueError):
            raise ValidationError({"target_id": "Invalid target_id"})

        try:
            attribute_definition_id = int(attribute_definition_id)
        except (TypeError, ValueError):
            raise ValidationError({"attribute_definition_id": "Invalid attribute_definition_id"})

        value_fields = [
            "value_string",
            "value_bool",
            "value_number",
            "value_date",
        ]
        provided = [f for f in value_fields if f in change and change.get(f) is not None]
        if len(provided) > 1:
            raise ValidationError({"value": "Only one value field can be set"})

        if target_type == "asset":
            if not AssetAttributeDefinition.objects.filter(asset_attribute_definition_id=attribute_definition_id).exists():
                raise ValidationError({"attribute_definition_id": "Invalid asset attribute definition"})
        elif target_type == "stock_item":
            if not StockItemAttributeDefinition.objects.filter(stock_item_attribute_definition_id=attribute_definition_id).exists():
                raise ValidationError({"attribute_definition_id": "Invalid stock item attribute definition"})
        else:
            if not ConsumableAttributeDefinition.objects.filter(consumable_attribute_definition_id=attribute_definition_id).exists():
                raise ValidationError({"attribute_definition_id": "Invalid consumable attribute definition"})

        normalized = {
            "target_type": target_type,
            "target_id": target_id,
            "attribute_definition_id": attribute_definition_id,
            "value_string": change.get("value_string"),
            "value_bool": change.get("value_bool"),
            "value_number": change.get("value_number"),
            "value_date": change.get("value_date"),
        }
        return normalized

    def _apply_pending_attribute_changes(self, step: MaintenanceStep):
        maintenance = getattr(step, "maintenance", None)
        asset = getattr(maintenance, "asset", None) if maintenance else None
        if not asset:
            raise ValidationError({"maintenance": "Maintenance asset not found"})

        pending = list(
            MaintenanceStepAttributeChange.objects.filter(
                maintenance_step_id=step.maintenance_step_id,
                applied_at_datetime__isnull=True,
            ).order_by("maintenance_step_attribute_change_id")
        )
        if not pending:
            return

        now_dt = timezone.now()
        with connection.cursor() as cursor:
            for ch in pending:
                self._require_asset_composition(
                    asset_id=asset.asset_id,
                    target_type=ch.target_type,
                    target_id=ch.target_id,
                )

                if ch.target_type == "asset":
                    cursor.execute(
                        """
                        INSERT INTO public.asset_attribute_value
                            (asset_id, asset_attribute_definition_id, value_string, value_bool, value_date, value_number)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (asset_id, asset_attribute_definition_id)
                        DO UPDATE SET
                            value_string = EXCLUDED.value_string,
                            value_bool = EXCLUDED.value_bool,
                            value_date = EXCLUDED.value_date,
                            value_number = EXCLUDED.value_number
                        """,
                        [
                            asset.asset_id,
                            ch.attribute_definition_id,
                            ch.value_string,
                            ch.value_bool,
                            ch.value_date,
                            ch.value_number,
                        ],
                    )
                elif ch.target_type == "stock_item":
                    cursor.execute(
                        """
                        INSERT INTO public.stock_item_attribute_value
                            (stock_item_id, stock_item_attribute_definition_id, value_string, value_bool, value_date, value_number)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (stock_item_id, stock_item_attribute_definition_id)
                        DO UPDATE SET
                            value_string = EXCLUDED.value_string,
                            value_bool = EXCLUDED.value_bool,
                            value_date = EXCLUDED.value_date,
                            value_number = EXCLUDED.value_number
                        """,
                        [
                            ch.target_id,
                            ch.attribute_definition_id,
                            ch.value_string,
                            ch.value_bool,
                            ch.value_date,
                            ch.value_number,
                        ],
                    )
                else:
                    cursor.execute(
                        """
                        INSERT INTO public.consumable_attribute_value
                            (consumable_id, consumable_attribute_definition_id, value_string, value_bool, value_date, value_number)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (consumable_id, consumable_attribute_definition_id)
                        DO UPDATE SET
                            value_string = EXCLUDED.value_string,
                            value_bool = EXCLUDED.value_bool,
                            value_date = EXCLUDED.value_date,
                            value_number = EXCLUDED.value_number
                        """,
                        [
                            ch.target_id,
                            ch.attribute_definition_id,
                            ch.value_string,
                            ch.value_bool,
                            ch.value_date,
                            ch.value_number,
                        ],
                    )

        MaintenanceStepAttributeChange.objects.filter(
            maintenance_step_id=step.maintenance_step_id,
            applied_at_datetime__isnull=True,
        ).update(applied_at_datetime=now_dt)

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = getattr(instance, "maintenance_step_status", None)
        new_status = serializer.validated_data.get("maintenance_step_status", old_status)

        if old_status in self._TERMINAL_STEP_STATUSES and new_status != old_status:
            raise ValidationError({"maintenance_step_status": "Cannot change status of a terminal step"})

        with transaction.atomic():
            updated = serializer.save()

            if new_status == "done" and old_status != "done":
                self._apply_pending_attribute_changes(updated)

        if new_status == "started" and old_status != "started":
            try:
                if getattr(updated, "start_datetime", None) is None:
                    MaintenanceStep.objects.filter(
                        maintenance_step_id=updated.maintenance_step_id,
                        start_datetime__isnull=True,
                    ).update(start_datetime=timezone.now())
                    updated.start_datetime = timezone.now()
            except Exception:
                pass
            self._maybe_set_maintenance_start_datetime(updated, new_status=new_status)
            self._maybe_set_maintenance_started_status(updated, new_status=new_status)

        if new_status == "In Progress" and old_status != "In Progress":
            self._maybe_set_maintenance_in_progress_status(updated, new_status=new_status)

        try:
            if new_status != "done" or old_status == "done":
                return

            typical_step = getattr(updated, "maintenance_typical_step", None)
            op_type = getattr(typical_step, "operation_type", None)
            if op_type != "add":
                return

            maintenance = getattr(updated, "maintenance", None)
            asset = getattr(maintenance, "asset", None) if maintenance else None
            if not asset:
                return

            fulfilled_req = (
                MaintenanceStepItemRequest.objects.filter(
                    maintenance_step=updated,
                    status="fulfilled",
                )
                .order_by("-fulfilled_at", "-maintenance_step_item_request_id")
                .first()
            )
            if not fulfilled_req:
                print(
                    f"[maintenance-step] done+add but no fulfilled request for step_id={updated.maintenance_step_id}"
                )
                return

            now_dt = timezone.now()

            with connection.cursor() as cursor:
                if getattr(fulfilled_req, "stock_item_id", None):
                    cursor.execute(
                        """
                        INSERT INTO public.asset_is_composed_of_stock_item_history
                            (stock_item_id, asset_id, maintenance_step_id, start_datetime, end_datetime)
                        VALUES (%s, %s, %s, %s, NULL)
                        ON CONFLICT DO NOTHING
                        """,
                        [
                            fulfilled_req.stock_item_id,
                            asset.asset_id,
                            updated.maintenance_step_id,
                            now_dt,
                        ],
                    )

                if getattr(fulfilled_req, "consumable_id", None):
                    cursor.execute(
                        """
                        INSERT INTO public.asset_is_composed_of_consumable_history
                            (consumable_id, asset_id, maintenance_step_id, start_datetime, end_datetime)
                        VALUES (%s, %s, %s, %s, NULL)
                        ON CONFLICT DO NOTHING
                        """,
                        [
                            fulfilled_req.consumable_id,
                            asset.asset_id,
                            updated.maintenance_step_id,
                            now_dt,
                        ],
                    )
        except Exception:
            # Never break the status update due to automatic composition insert.
            print(
                f"[maintenance-step] failed to auto-compose on done+add for step_id={getattr(updated, 'maintenance_step_id', None)}"
            )
            return

    @action(detail=True, methods=["post"], url_path="attribute-changes")
    def attribute_changes(self, request, pk=None):
        step = self.get_object()
        _, denial = self._require_can_act_on_step(request, step)
        if denial:
            return denial

        if getattr(step, "maintenance_step_status", None) in self._TERMINAL_STEP_STATUSES:
            return Response({"error": "Step is done"}, status=status.HTTP_400_BAD_REQUEST)

        maintenance = getattr(step, "maintenance", None)
        asset = getattr(maintenance, "asset", None) if maintenance else None
        if not asset:
            return Response({"error": "Maintenance asset not found"}, status=status.HTTP_400_BAD_REQUEST)

        payload = request.data
        if isinstance(payload, list):
            changes = payload
        else:
            changes = payload.get("changes")

        if not changes or not isinstance(changes, list):
            return Response({"error": "changes must be a non-empty list"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = self._get_user_id(request)
        created_ids = []
        for raw in changes:
            if not isinstance(raw, dict):
                raise ValidationError({"changes": "Each change must be an object"})

            normalized = self._validate_and_normalize_change(raw)
            self._require_asset_composition(
                asset_id=asset.asset_id,
                target_type=normalized["target_type"],
                target_id=normalized["target_id"],
            )

            row = MaintenanceStepAttributeChange.objects.create(
                maintenance_step_id=step.maintenance_step_id,
                target_type=normalized["target_type"],
                target_id=normalized["target_id"],
                attribute_definition_id=normalized["attribute_definition_id"],
                value_string=normalized["value_string"],
                value_bool=normalized["value_bool"],
                value_number=normalized["value_number"],
                value_date=normalized["value_date"],
                created_by_user_id=user_id,
            )
            created_ids.append(row.maintenance_step_attribute_change_id)

        return Response(
            {"created": len(created_ids), "maintenance_step_attribute_change_ids": created_ids},
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        maintenance = getattr(instance, "maintenance", None)
        if maintenance and getattr(maintenance, "end_datetime", None) is not None:
            return Response({"error": "Maintenance is ended"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate assignment permission if person_id is being changed
        person_id = request.data.get("person_id")
        if person_id is not None:
            try:
                person_id_int = int(person_id)
                is_allowed, error_response = self._validate_assignment_permission(request, person_id_int)
                if not is_allowed:
                    return error_response
            except (ValueError, TypeError):
                return Response({"error": "Invalid person_id"}, status=status.HTTP_400_BAD_REQUEST)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        maintenance = getattr(instance, "maintenance", None)
        if maintenance and getattr(maintenance, "end_datetime", None) is not None:
            return Response({"error": "Maintenance is ended"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate assignment permission if person_id is being changed
        person_id = request.data.get("person_id")
        if person_id is not None:
            try:
                person_id_int = int(person_id)
                is_allowed, error_response = self._validate_assignment_permission(request, person_id_int)
                if not is_allowed:
                    return error_response
            except (ValueError, TypeError):
                return Response({"error": "Invalid person_id"}, status=status.HTTP_400_BAD_REQUEST)

        return super().partial_update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        last_item = MaintenanceStep.objects.order_by("-maintenance_step_id").first()
        next_id = (last_item.maintenance_step_id + 1) if last_item else 1

        data = request.data.copy()
        if 'digital_copy' in request.FILES:
            data.pop('digital_copy', None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        maintenance = serializer.validated_data.get("maintenance")
        if maintenance and getattr(maintenance, "end_datetime", None) is not None:
            return Response({"error": "Maintenance is ended"}, status=status.HTTP_400_BAD_REQUEST)

        # Block starting a maintenance until all required movements (asset + included items) have been decided.
        # We only block when creating the first step.
        if maintenance and getattr(maintenance, "start_datetime", None) is None:
            try:
                pending_asset_move = AssetMovement.objects.filter(
                    status="pending",
                    movement_reason="maintenance_create",
                    maintenance_id=maintenance.maintenance_id,
                ).exists()
                pending_stock_moves = StockItemMovement.objects.filter(
                    status="pending",
                    movement_reason="problem_report_include",
                    maintenance_id=maintenance.maintenance_id,
                ).exists()
                pending_consumable_moves = ConsumableMovement.objects.filter(
                    status="pending",
                    movement_reason="problem_report_include",
                    maintenance_id=maintenance.maintenance_id,
                ).exists()

                if pending_asset_move or pending_stock_moves or pending_consumable_moves:
                    pending_parts = []
                    if pending_asset_move:
                        pending_parts.append("asset movement request")
                    if pending_stock_moves:
                        pending_parts.append("included stock items movements")
                    if pending_consumable_moves:
                        pending_parts.append("included consumables movements")

                    return Response(
                        {
                            "error": "Maintenance cannot start until the following approvals are decided (accepted/rejected): "
                            + ", ".join(pending_parts)
                            + ".",
                            "pending_approvals": {
                                "asset_movement": bool(pending_asset_move),
                                "included_stock_items": bool(pending_stock_moves),
                                "included_consumables": bool(pending_consumable_moves),
                            },
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except Exception:
                pass

        # Validate assignment permission
        person_data = serializer.validated_data.get("person")
        target_person_id = getattr(person_data, "person_id", None) if person_data else request.data.get("person_id")
        if target_person_id:
            try:
                target_person_id = int(target_person_id)
                is_allowed, error_response = self._validate_assignment_permission(request, target_person_id)
                if not is_allowed:
                    return error_response
            except (ValueError, TypeError):
                return Response({"error": "Invalid person_id"}, status=status.HTTP_400_BAD_REQUEST)

        asset_id = getattr(maintenance, "asset_id", None) if maintenance else None
        if asset_id:
            open_external_maintenance_q = (
                Q(
                    external_maintenance_status__isnull=True,
                    item_sent_to_external_maintenance_datetime__isnull=False,
                    item_received_by_company_datetime__isnull=True,
                )
                | (
                    Q(external_maintenance_status__isnull=False)
                    & ~Q(external_maintenance_status__in=["DRAFT", "RECEIVED_BY_COMPANY"])
                )
            )
            if (
                ExternalMaintenance.objects.filter(maintenance__asset_id=asset_id)
                .filter(open_external_maintenance_q)
                .exists()
            ):
                return Response(
                    {
                        "error": "Cannot create maintenance steps while the asset has an ongoing external maintenance.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        data = dict(serializer.validated_data)
        if not data.get("maintenance_step_status"):
            data["maintenance_step_status"] = "pending"

        try:
            step = MaintenanceStep.objects.create(
                maintenance_step_id=next_id,
                **data,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create maintenance step due to database constraints.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        self._maybe_set_maintenance_start_datetime(step, new_status=getattr(step, "maintenance_step_status", None))

        return Response(self.get_serializer(step).data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        qs = (
            MaintenanceStep.objects.select_related("maintenance", "maintenance_typical_step", "person")
            .all()
            .order_by("maintenance_step_id")
        )
        maintenance_id = self.request.query_params.get("maintenance")
        if maintenance_id is not None:
            try:
                qs = qs.filter(maintenance_id=int(maintenance_id))
            except (ValueError, TypeError):
                pass
        return qs

    def _get_user_person(self, request):
        user_account = None
        try:
            if hasattr(request, "auth") and request.auth is not None:
                user_id = request.auth.get("user_id")
                if user_id:
                    user_account = UserAccount.objects.select_related("person").get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            user_account = None

        if user_account and user_account.person:
            return user_account.person
        return None

    def _validate_assignment_permission(self, request, target_person_id: int | None):
        """
        Validates that the current user can assign a maintenance step to the target person.
        A maintenance_technician cannot assign a step to a maintenance_chief.
        Only maintenance_chiefs (or superusers) can assign steps to maintenance_chiefs.
        Returns (is_allowed, error_response)
        """
        if target_person_id is None:
            return True, None

        person = self._get_user_person(request)
        if not person:
            return False, Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get current user's roles
        user_role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        # Superusers and maintenance_chiefs can assign to anyone
        if "superuser" in user_role_codes or "maintenance_chief" in user_role_codes or "it_bureau_chief" in user_role_codes:
            return True, None

        # Check if target person is a maintenance_chief
        target_is_chief = PersonRoleMapping.objects.filter(
            person_id=target_person_id,
            role__role_code="maintenance_chief"
        ).exists()

        target_is_itbc = PersonRoleMapping.objects.filter(
            person_id=target_person_id,
            role__role_code="it_bureau_chief",
        ).exists()

        if target_is_chief or target_is_itbc:
            return False, Response(
                {"error": "Only maintenance chiefs can assign steps to other maintenance chiefs"},
                status=status.HTTP_403_FORBIDDEN
            )

        return True, None

    def _is_assigned_technician(self, person, maintenance_id) -> bool:
        """Check if the person has at least one MaintenanceStep assigned to them on this maintenance."""
        return MaintenanceStep.objects.filter(
            maintenance_id=maintenance_id,
            person_id=person.person_id,
        ).exists()

    def _require_can_request_for_step(self, request, step: MaintenanceStep):
        person = self._get_user_person(request)
        if not person:
            return None, Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        if (step.person_id == person.person_id) or ("maintenance_chief" in role_codes) or ("it_bureau_chief" in role_codes) or ("superuser" in role_codes):
            return person, None

        # Also allow technicians who have at least one step assigned on the same maintenance
        maintenance_id = getattr(step, "maintenance_id", None)
        if maintenance_id and self._is_assigned_technician(person, maintenance_id):
            return person, None

        return None, Response({"error": "Not allowed to request items for this step"}, status=status.HTTP_403_FORBIDDEN)

    def _require_can_act_on_step(self, request, step: MaintenanceStep):
        # Same rule-set as requesting: assigned technician, maintenance chief, or superuser
        return self._require_can_request_for_step(request, step)

    @action(detail=True, methods=["post"], url_path="update-asset-condition")
    def update_asset_condition(self, request, pk=None):
        step = self.get_object()
        _, denial = self._require_can_act_on_step(request, step)
        if denial:
            return denial

        if getattr(step, "maintenance_step_status", None) in self._TERMINAL_STEP_STATUSES:
            return Response({"error": "Step is done"}, status=status.HTTP_400_BAD_REQUEST)

        condition_id = request.data.get("condition_id")
        notes = request.data.get("notes")
        cosmetic_issues = request.data.get("cosmetic_issues")
        functional_issues = request.data.get("functional_issues")
        recommendation = request.data.get("recommendation")
        if not condition_id:
            return Response({"error": "condition_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        maintenance = getattr(step, "maintenance", None)
        asset = getattr(maintenance, "asset", None) if maintenance else None
        if not asset:
            return Response({"error": "Maintenance asset not found"}, status=status.HTTP_400_BAD_REQUEST)

        condition = PhysicalCondition.objects.filter(condition_id=condition_id).first()
        if not condition:
            return Response({"error": "Invalid condition_id"}, status=status.HTTP_400_BAD_REQUEST)

        condition_code = (getattr(condition, "condition_code", None) or "").strip().lower()
        condition_label = (getattr(condition, "condition_label", None) or "").strip().lower()
        if condition_code == "failed" or condition_label == "failed":
            return Response(
                {"error": "Asset physical condition can only be set to failed during external maintenance."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        last_item = AssetConditionHistory.objects.order_by("-asset_condition_history_id").first()
        next_id = (last_item.asset_condition_history_id + 1) if last_item else 1

        AssetConditionHistory.objects.create(
            asset_condition_history_id=next_id,
            asset=asset,
            condition=condition,
            notes=notes,
            cosmetic_issues=cosmetic_issues,
            functional_issues=functional_issues,
            recommendation=recommendation,
            created_at=timezone.now(),
        )

        MaintenanceStep.objects.filter(maintenance_step_id=step.maintenance_step_id).update(asset_condition_history=next_id)

        return Response({"asset_condition_history_id": next_id}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="components")
    def components(self, request, pk=None):
        step = self.get_object()
        _, denial = self._require_can_act_on_step(request, step)
        if denial:
            return denial

        maintenance = getattr(step, "maintenance", None)
        asset = getattr(maintenance, "asset", None) if maintenance else None
        if not asset:
            return Response({"error": "Maintenance asset not found"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT s.stock_item_id, s.stock_item_inventory_number, s.stock_item_name
                FROM public.asset_is_composed_of_stock_item_history h
                JOIN public.stock_item s ON s.stock_item_id = h.stock_item_id
                WHERE h.asset_id = %s AND h.end_datetime IS NULL
                ORDER BY s.stock_item_id
                """,
                [asset.asset_id],
            )
            stock_rows = cursor.fetchall()

            cursor.execute(
                """
                SELECT c.consumable_id, c.consumable_inventory_number, c.consumable_name
                FROM public.asset_is_composed_of_consumable_history h
                JOIN public.consumable c ON c.consumable_id = h.consumable_id
                WHERE h.asset_id = %s AND h.end_datetime IS NULL
                ORDER BY c.consumable_id
                """,
                [asset.asset_id],
            )
            consumable_rows = cursor.fetchall()

        return Response(
            {
                "stock_items": [
                    {
                        "stock_item_id": r[0],
                        "stock_item_inventory_number": r[1],
                        "stock_item_name": r[2],
                    }
                    for r in stock_rows
                ],
                "consumables": [
                    {
                        "consumable_id": r[0],
                        "consumable_inventory_number": r[1],
                        "consumable_name": r[2],
                    }
                    for r in consumable_rows
                ],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="remove-component")
    def remove_component(self, request, pk=None):
        step = self.get_object()
        _, denial = self._require_can_act_on_step(request, step)
        if denial:
            return denial

        typical_step = getattr(step, "maintenance_typical_step", None)
        op_type = getattr(typical_step, "operation_type", None)
        if op_type != "remove":
            return Response({"error": "This action is only available for operation_type 'remove'"}, status=status.HTTP_400_BAD_REQUEST)

        component_type = request.data.get("component_type")
        component_id = request.data.get("component_id")
        destination_location_id = request.data.get("destination_location_id")
        if component_type not in {"stock_item", "consumable"}:
            return Response({"error": "component_type must be 'stock_item' or 'consumable'"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            component_id_int = int(component_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid component_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_location = None
        if destination_location_id not in (None, ""):
            try:
                destination_location_id_int = int(destination_location_id)
            except (TypeError, ValueError):
                return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

            destination_location = Location.objects.filter(location_id=destination_location_id_int).first()
            if not destination_location:
                return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        maintenance = getattr(step, "maintenance", None)
        asset = getattr(maintenance, "asset", None) if maintenance else None
        if not asset:
            return Response({"error": "Maintenance asset not found"}, status=status.HTTP_400_BAD_REQUEST)

        now_dt = timezone.now()
        with connection.cursor() as cursor:
            if component_type == "stock_item":
                cursor.execute(
                    """
                    UPDATE public.asset_is_composed_of_stock_item_history
                    SET end_datetime = %s
                    WHERE asset_id = %s AND stock_item_id = %s AND end_datetime IS NULL
                    """,
                    [now_dt, asset.asset_id, component_id_int],
                )
                updated_rows = cursor.rowcount
            else:
                cursor.execute(
                    """
                    UPDATE public.asset_is_composed_of_consumable_history
                    SET end_datetime = %s
                    WHERE asset_id = %s AND consumable_id = %s AND end_datetime IS NULL
                    """,
                    [now_dt, asset.asset_id, component_id_int],
                )
                updated_rows = cursor.rowcount

        if not updated_rows:
            return Response({"error": "Component not found on asset (or already removed)"}, status=status.HTTP_404_NOT_FOUND)

        if destination_location and component_type == "stock_item":
            last_move = (
                StockItemMovement.objects.filter(stock_item_id=component_id_int)
                .order_by("-stock_item_movement_id")
                .first()
            )
            if last_move:
                source_location = last_move.destination_location
            else:
                source_location = destination_location
            last_move_global = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
            next_move_id = (last_move_global.stock_item_movement_id + 1) if last_move_global else 1

            _create_stock_item_movement_with_translations(
                movement_reason="maintenance_step_remove",
                stock_item_movement_id=next_move_id,
                stock_item_id=component_id_int,
                source_location=source_location,
                destination_location=destination_location,
                maintenance_step=step,
                movement_datetime=now_dt,
            )
            _cascade_move_stock_item_consumables(
                stock_item_id=component_id_int,
                source_location_id=source_location.location_id,
                destination_location_id=destination_location.location_id,
                movement_reason="maintenance_step_remove",
                movement_datetime=now_dt,
                maintenance_step_id=step.maintenance_step_id,
                external_maintenance_step_id=None,
            )
        elif destination_location and component_type == "consumable":
            last_move = (
                ConsumableMovement.objects.filter(consumable_id=component_id_int)
                .order_by("-consumable_movement_id")
                .first()
            )
            if last_move:
                source_location = last_move.destination_location
            else:
                source_location = destination_location
            last_move_global = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
            next_move_id = (last_move_global.consumable_movement_id + 1) if last_move_global else 1

            _create_consumable_movement_with_translations(
                movement_reason="maintenance_step_remove",
                consumable_movement_id=next_move_id,
                consumable_id=component_id_int,
                source_location=source_location,
                destination_location=destination_location,
                maintenance_step=step,
                movement_datetime=now_dt,
            )

        step.maintenance_step_status = "done"
        step.save(update_fields=["maintenance_step_status"])
        return Response(self.get_serializer(step).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="return-to-owner")
    def return_to_owner(self, request, pk=None):
        step = self.get_object()
        user_account, denial = self._require_can_manage_step(request, step)
        if denial:
            return denial

        component_type = request.data.get("component_type")
        component_id = request.data.get("component_id")

        if not component_type or not component_id:
            return Response({"error": "component_type and component_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            component_id_int = int(component_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid component_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_location_id = request.data.get("destination_location_id")
        if not destination_location_id:
            return Response({"error": "destination_location_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            destination_location_id_int = int(destination_location_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_location = Location.objects.filter(location_id=destination_location_id_int).first()
        if not destination_location:
            return Response({"error": "Destination location not found"}, status=status.HTTP_404_NOT_FOUND)

        now_dt = timezone.now()

        if component_type == "stock_item":
            last_move = StockItemMovement.objects.filter(stock_item_id=component_id_int).order_by("-stock_item_movement_id").first()
            if not last_move:
                return Response({"error": "No movement history for stock item"}, status=status.HTTP_400_BAD_REQUEST)
            
            source_location = last_move.destination_location
            last_global = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
            next_move_id = (last_global.stock_item_movement_id + 1) if last_global else 1

            _create_stock_item_movement_with_translations(
                movement_reason="maintenance_step_return_to_owner",
                stock_item_movement_id=next_move_id,
                stock_item_id=component_id_int,
                source_location=source_location,
                destination_location=destination_location,
                maintenance_step=step,
                movement_datetime=now_dt,
                status="pending",
            )
        elif component_type == "consumable":
            last_move = ConsumableMovement.objects.filter(consumable_id=component_id_int).order_by("-consumable_movement_id").first()
            if not last_move:
                return Response({"error": "No movement history for consumable"}, status=status.HTTP_400_BAD_REQUEST)

            source_location = last_move.destination_location
            last_global = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
            next_id = (last_global.consumable_movement_id + 1) if last_global else 1

            _create_consumable_movement_with_translations(
                movement_reason="maintenance_step_return_to_owner",
                consumable_movement_id=next_id,
                consumable_id=component_id_int,
                source_location=source_location,
                destination_location=destination_location,
                maintenance_step=step,
                movement_datetime=now_dt,
                status="pending",
            )
        else:
            return Response({"error": "Invalid component_type"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Return to owner requested and pending approval"}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="request-stock-item")
    def request_stock_item(self, request, pk=None):
        step = self.get_object()
        person, denial = self._require_can_request_for_step(request, step)
        if denial:
            return denial

        existing_req = MaintenanceStepItemRequest.objects.filter(
            maintenance_step=step,
            status__in=["pending", "fulfilled"],
        ).exists()
        if existing_req:
            return Response(
                {"error": "This maintenance step already has an item request. You cannot request multiple items in the same step."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        requested_stock_item_model_id = request.data.get("requested_stock_item_model_id")
        note = request.data.get("note")
        if not requested_stock_item_model_id:
            return Response(
                {"error": "requested_stock_item_model_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        maintenance = step.maintenance
        asset_model_id = getattr(maintenance.asset, "asset_model_id", None)
        if not asset_model_id:
            return Response({"error": "Maintenance asset model not found"}, status=status.HTTP_400_BAD_REQUEST)

        compatible_model_ids = list(
            StockItemIsCompatibleWithAsset.objects.filter(asset_model_id=asset_model_id).values_list(
                "stock_item_model_id", flat=True
            )
        )
        if not compatible_model_ids:
            return Response({"error": "No compatible stock item models for this asset"}, status=status.HTTP_404_NOT_FOUND)

        try:
            requested_stock_item_model_id_int = int(requested_stock_item_model_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid requested_stock_item_model_id"}, status=status.HTTP_400_BAD_REQUEST)

        if requested_stock_item_model_id_int not in set(compatible_model_ids):
            return Response({"error": "Requested stock item model is not compatible with this asset"}, status=status.HTTP_400_BAD_REQUEST)

        last_req = MaintenanceStepItemRequest.objects.order_by("-maintenance_step_item_request_id").first()
        next_req_id = (last_req.maintenance_step_item_request_id + 1) if last_req else 1

        req = MaintenanceStepItemRequest.objects.create(
            maintenance_step_item_request_id=next_req_id,
            maintenance_step=step,
            requested_by_person=person,
            request_type="stock_item",
            status="pending",
            created_at=timezone.now(),
            requested_stock_item_model_id=requested_stock_item_model_id_int,
            note=note,
        )

        step.maintenance_step_status = "pending (waiting for stock item)"
        step.save(update_fields=["maintenance_step_status"])

        return Response(MaintenanceStepItemRequestSerializer(req).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="request-consumable")
    def request_consumable(self, request, pk=None):
        step = self.get_object()
        person, denial = self._require_can_request_for_step(request, step)
        if denial:
            return denial

        existing_req = MaintenanceStepItemRequest.objects.filter(
            maintenance_step=step,
            status__in=["pending", "fulfilled"],
        ).exists()
        if existing_req:
            return Response(
                {"error": "This maintenance step already has an item request. You cannot request multiple items in the same step."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        requested_consumable_model_id = request.data.get("requested_consumable_model_id")
        note = request.data.get("note")
        if not requested_consumable_model_id:
            return Response(
                {"error": "requested_consumable_model_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        maintenance = step.maintenance
        asset_model_id = getattr(maintenance.asset, "asset_model_id", None)
        if not asset_model_id:
            return Response({"error": "Maintenance asset model not found"}, status=status.HTTP_400_BAD_REQUEST)

        compatible_model_ids = list(
            ConsumableIsCompatibleWithAsset.objects.filter(asset_model_id=asset_model_id).values_list(
                "consumable_model_id", flat=True
            )
        )
        if not compatible_model_ids:
            return Response({"error": "No compatible consumable models for this asset"}, status=status.HTTP_404_NOT_FOUND)

        try:
            requested_consumable_model_id_int = int(requested_consumable_model_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid requested_consumable_model_id"}, status=status.HTTP_400_BAD_REQUEST)

        if requested_consumable_model_id_int not in set(compatible_model_ids):
            return Response({"error": "Requested consumable model is not compatible with this asset"}, status=status.HTTP_400_BAD_REQUEST)

        last_req = MaintenanceStepItemRequest.objects.order_by("-maintenance_step_item_request_id").first()
        next_req_id = (last_req.maintenance_step_item_request_id + 1) if last_req else 1

        req = MaintenanceStepItemRequest.objects.create(
            maintenance_step_item_request_id=next_req_id,
            maintenance_step=step,
            requested_by_person=person,
            request_type="consumable",
            status="pending",
            created_at=timezone.now(),
            requested_consumable_model_id=requested_consumable_model_id_int,
            note=note,
        )

        step.maintenance_step_status = "pending (waiting for consumable)"
        step.save(update_fields=["maintenance_step_status"])

        return Response(MaintenanceStepItemRequestSerializer(req).data, status=status.HTTP_201_CREATED)


class MaintenanceStepItemRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceStepItemRequest.objects.all().order_by("-created_at")
    serializer_class = MaintenanceStepItemRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = (
            MaintenanceStepItemRequest.objects.all()
            .select_related(
                "maintenance_step",
                "maintenance_step__maintenance",
                "maintenance_step__maintenance__asset",
            )
            .order_by("-created_at")
        )
        user_account = SuperuserWriteMixin()._get_user_account(self.request)
        if not user_account or not user_account.person:
            return MaintenanceStepItemRequest.objects.none()

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if user_account.is_superuser() or ("stock_consumable_responsible" in role_codes) or ("exploitation_chief" in role_codes):
            return qs

        if ("maintenance_chief" in role_codes) or ("it_bureau_chief" in role_codes):
            return qs

        return MaintenanceStepItemRequest.objects.none()

    def _require_responsible(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return None, Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if user_account.is_superuser() or ("stock_consumable_responsible" in role_codes) or ("exploitation_chief" in role_codes):
            return user_account.person, None

        return None, Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=["post"], url_path="fulfill")
    def fulfill(self, request, pk=None):
        person, denial = self._require_responsible(request)
        if denial:
            return denial

        req = self.get_object()
        if req.status != "pending":
            return Response({"error": "Only pending requests can be fulfilled"}, status=status.HTTP_400_BAD_REQUEST)

        source_location_id = request.data.get("source_location_id")
        destination_location_id = request.data.get("destination_location_id")
        note = request.data.get("note")
        if not source_location_id or not destination_location_id:
            return Response({"error": "source_location_id and destination_location_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        source_location = Location.objects.filter(location_id=source_location_id).first()
        destination_location = Location.objects.filter(location_id=destination_location_id).first()
        if not source_location or not destination_location:
            return Response({"error": "Invalid source/destination location"}, status=status.HTTP_400_BAD_REQUEST)

        step = req.maintenance_step
        maintenance = step.maintenance
        asset_model_id = getattr(maintenance.asset, "asset_model_id", None)
        if not asset_model_id:
            return Response({"error": "Maintenance asset model not found"}, status=status.HTTP_400_BAD_REQUEST)

        if req.request_type == "stock_item":
            stock_item_id = request.data.get("stock_item_id")
            if not stock_item_id:
                return Response({"error": "stock_item_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            stock_item = StockItem.objects.filter(stock_item_id=stock_item_id).first()
            if not stock_item:
                return Response({"error": "Stock item not found"}, status=status.HTTP_404_NOT_FOUND)

            if req.requested_stock_item_model_id and (stock_item.stock_item_model_id != req.requested_stock_item_model_id):
                return Response({"error": "Stock item model does not match requested model"}, status=status.HTTP_400_BAD_REQUEST)

            is_compatible = StockItemIsCompatibleWithAsset.objects.filter(
                asset_model_id=asset_model_id,
                stock_item_model_id=stock_item.stock_item_model_id,
            ).exists()
            if not is_compatible:
                return Response({"error": "Stock item model is not compatible with this asset"}, status=status.HTTP_400_BAD_REQUEST)

            is_in_use = AssetIsComposedOfStockItemHistory.objects.filter(
                stock_item_id=stock_item.stock_item_id,
                end_datetime__isnull=True,
            ).exists()
            if is_in_use:
                return Response({"error": "Stock item is currently assigned/in use"}, status=status.HTTP_400_BAD_REQUEST)

            last_move = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
            next_move_id = (last_move.stock_item_movement_id + 1) if last_move else 1

            _create_stock_item_movement_with_translations(
                movement_reason="maintenance_step_fulfill_request",
                stock_item_movement_id=next_move_id,
                stock_item=stock_item,
                source_location=source_location,
                destination_location=destination_location,
                maintenance_step=step,
                movement_datetime=timezone.now(),
            )

            _cascade_move_stock_item_consumables(
                stock_item_id=stock_item.stock_item_id,
                source_location_id=source_location.location_id,
                destination_location_id=destination_location.location_id,
                movement_reason="maintenance_step_fulfill_request",
                movement_datetime=timezone.now(),
                maintenance_step_id=step.maintenance_step_id,
                external_maintenance_step_id=None,
            )

            req.stock_item = stock_item

        elif req.request_type == "consumable":
            consumable_id = request.data.get("consumable_id")
            if not consumable_id:
                return Response({"error": "consumable_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            consumable = Consumable.objects.filter(consumable_id=consumable_id).first()
            if not consumable:
                return Response({"error": "Consumable not found"}, status=status.HTTP_404_NOT_FOUND)

            if req.requested_consumable_model_id and (consumable.consumable_model_id != req.requested_consumable_model_id):
                return Response({"error": "Consumable model does not match requested model"}, status=status.HTTP_400_BAD_REQUEST)

            is_compatible = ConsumableIsCompatibleWithAsset.objects.filter(
                asset_model_id=asset_model_id,
                consumable_model_id=consumable.consumable_model_id,
            ).exists()
            if not is_compatible:
                return Response({"error": "Consumable model is not compatible with this asset"}, status=status.HTTP_400_BAD_REQUEST)

            is_in_use = AssetIsComposedOfConsumableHistory.objects.filter(
                consumable_id=consumable.consumable_id,
                end_datetime__isnull=True,
            ).exists()
            if is_in_use:
                return Response({"error": "Consumable is currently assigned/in use"}, status=status.HTTP_400_BAD_REQUEST)

            last_move = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
            next_move_id = (last_move.consumable_movement_id + 1) if last_move else 1

            _create_consumable_movement_with_translations(
                movement_reason="maintenance_step_fulfill_request",
                consumable_movement_id=next_move_id,
                consumable=consumable,
                source_location=source_location,
                destination_location=destination_location,
                maintenance_step=step,
                movement_datetime=timezone.now(),
            )

            req.consumable = consumable
        else:
            return Response({"error": "Invalid request_type"}, status=status.HTTP_400_BAD_REQUEST)

        req.source_location = source_location
        req.destination_location = destination_location
        req.status = "fulfilled"
        req.fulfilled_at = timezone.now()
        req.fulfilled_by_person = person
        if note is not None:
            req.note = note
        req.save()

        step.maintenance_step_status = "In Progress"
        step.save(update_fields=["maintenance_step_status"])

        try:
            maintenance = getattr(step, "maintenance", None)
            step_id = getattr(step, "maintenance_step_id", None)
            if maintenance and step_id is not None:
                first_step = (
                    MaintenanceStep.objects.filter(maintenance_id=maintenance.maintenance_id)
                    .order_by("maintenance_step_id")
                    .first()
                )
                if first_step and first_step.maintenance_step_id == step_id:
                    Maintenance.objects.filter(maintenance_id=maintenance.maintenance_id).filter(
                        Q(maintenance_status__isnull=True)
                        | Q(maintenance_status="")
                        | Q(maintenance_status="pending")
                        | Q(maintenance_status="started")
                    ).update(maintenance_status="in_progress")
        except Exception:
            pass

        return Response(self.get_serializer(req).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        person, denial = self._require_responsible(request)
        if denial:
            return denial

        req = self.get_object()
        if req.status != "pending":
            return Response({"error": "Only pending requests can be rejected"}, status=status.HTTP_400_BAD_REQUEST)

        note = request.data.get("note")

        req.status = "rejected"
        req.rejected_at = timezone.now()
        req.rejected_by_person = person

        req.fulfilled_at = None
        req.fulfilled_by_person = None
        req.source_location = None
        req.destination_location = None
        req.stock_item = None
        req.consumable = None
        if note is not None:
            req.note = note
        req.save()

        step = req.maintenance_step
        step.maintenance_step_status = "started"
        step.save(update_fields=["maintenance_step_status"])

        try:
            maintenance = getattr(step, "maintenance", None)
            step_id = getattr(step, "maintenance_step_id", None)
            if maintenance and step_id is not None:
                first_step = (
                    MaintenanceStep.objects.filter(maintenance_id=maintenance.maintenance_id)
                    .order_by("maintenance_step_id")
                    .first()
                )
                if first_step and first_step.maintenance_step_id == step_id:
                    Maintenance.objects.filter(maintenance_id=maintenance.maintenance_id).filter(
                        Q(maintenance_status__isnull=True) | Q(maintenance_status="") | Q(maintenance_status="pending")
                    ).update(maintenance_status="started")
        except Exception:
            pass

        return Response(self.get_serializer(req).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="select-random")
    def select_random(self, request, pk=None):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        req = self.get_object()
        if req.status != "pending":
            return Response({"error": "Only pending requests can be fulfilled"}, status=status.HTTP_400_BAD_REQUEST)

        step = req.maintenance_step
        maintenance = step.maintenance
        asset_model_id = getattr(maintenance.asset, "asset_model_id", None)
        if not asset_model_id:
            return Response({"error": "Maintenance asset model not found"}, status=status.HTTP_400_BAD_REQUEST)

        if req.request_type == "stock_item":
            if not req.requested_stock_item_model_id:
                return Response({"error": "Request missing requested_stock_item_model_id"}, status=status.HTTP_400_BAD_REQUEST)

            is_compatible = StockItemIsCompatibleWithAsset.objects.filter(
                asset_model_id=asset_model_id,
                stock_item_model_id=req.requested_stock_item_model_id,
            ).exists()
            if not is_compatible:
                return Response({"error": "Requested stock item model is not compatible with this asset"}, status=status.HTTP_400_BAD_REQUEST)

            used_stock_item_ids = AssetIsComposedOfStockItemHistory.objects.filter(
                end_datetime__isnull=True
            ).values_list("stock_item_id", flat=True)

            last_dest_location_subq = Subquery(
                StockItemMovement.objects.filter(stock_item_id=OuterRef("stock_item_id"))
                .order_by("-stock_item_movement_id")
                .values("destination_location_id")[:1]
            )

            candidates = (
                StockItem.objects.filter(stock_item_model_id=req.requested_stock_item_model_id)
                .exclude(stock_item_id__in=used_stock_item_ids)
                .annotate(current_location_id=last_dest_location_subq)
                .exclude(current_location_id__isnull=True)
            )

            chosen = candidates.order_by("?").first()
            if not chosen:
                return Response({"error": "No eligible stock items found"}, status=status.HTTP_404_NOT_FOUND)

            return Response(
                {
                    "request_type": "stock_item",
                    "stock_item_id": chosen.stock_item_id,
                    "source_location_id": getattr(chosen, "current_location_id", None),
                },
                status=status.HTTP_200_OK,
            )

        if req.request_type == "consumable":
            if not req.requested_consumable_model_id:
                return Response({"error": "Request missing requested_consumable_model_id"}, status=status.HTTP_400_BAD_REQUEST)

            is_compatible = ConsumableIsCompatibleWithAsset.objects.filter(
                asset_model_id=asset_model_id,
                consumable_model_id=req.requested_consumable_model_id,
            ).exists()
            if not is_compatible:
                return Response({"error": "Requested consumable model is not compatible with this asset"}, status=status.HTTP_400_BAD_REQUEST)

            used_consumable_ids = AssetIsComposedOfConsumableHistory.objects.filter(
                end_datetime__isnull=True
            ).values_list("consumable_id", flat=True)

            last_dest_location_subq = Subquery(
                ConsumableMovement.objects.filter(consumable_id=OuterRef("consumable_id"))
                .order_by("-consumable_movement_id")
                .values("destination_location_id")[:1]
            )

            candidates = (
                Consumable.objects.filter(consumable_model_id=req.requested_consumable_model_id)
                .exclude(consumable_id__in=used_consumable_ids)
                .annotate(current_location_id=last_dest_location_subq)
                .exclude(current_location_id__isnull=True)
            )

            chosen = candidates.order_by("?").first()
            if not chosen:
                return Response({"error": "No eligible consumables found"}, status=status.HTTP_404_NOT_FOUND)

            return Response(
                {
                    "request_type": "consumable",
                    "consumable_id": chosen.consumable_id,
                    "source_location_id": getattr(chosen, "current_location_id", None),
                },
                status=status.HTTP_200_OK,
            )

        return Response({"error": "Invalid request_type"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], url_path="eligible-items")
    def eligible_items(self, request, pk=None):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        req = self.get_object()
        if req.status != "pending":
            return Response({"error": "Only pending requests can be fulfilled"}, status=status.HTTP_400_BAD_REQUEST)

        step = req.maintenance_step
        maintenance = step.maintenance
        asset_model_id = getattr(maintenance.asset, "asset_model_id", None)
        if not asset_model_id:
            return Response({"error": "Maintenance asset model not found"}, status=status.HTTP_400_BAD_REQUEST)

        if req.request_type == "stock_item":
            if not req.requested_stock_item_model_id:
                return Response({"error": "Request missing requested_stock_item_model_id"}, status=status.HTTP_400_BAD_REQUEST)

            is_compatible = StockItemIsCompatibleWithAsset.objects.filter(
                asset_model_id=asset_model_id,
                stock_item_model_id=req.requested_stock_item_model_id,
            ).exists()
            if not is_compatible:
                return Response({"error": "Requested stock item model is not compatible with this asset"}, status=status.HTTP_400_BAD_REQUEST)

            used_stock_item_ids = AssetIsComposedOfStockItemHistory.objects.filter(
                end_datetime__isnull=True
            ).values_list("stock_item_id", flat=True)

            last_dest_location_subq = Subquery(
                StockItemMovement.objects.filter(stock_item_id=OuterRef("stock_item_id"))
                .order_by("-stock_item_movement_id")
                .values("destination_location_id")[:1]
            )

            candidates = (
                StockItem.objects.filter(stock_item_model_id=req.requested_stock_item_model_id)
                .exclude(stock_item_id__in=used_stock_item_ids)
                .annotate(current_location_id=last_dest_location_subq)
                .exclude(current_location_id__isnull=True)
                .values("stock_item_id", "stock_item_inventory_number", "current_location_id")
                .order_by("stock_item_id")
            )

            return Response(
                {
                    "request_type": "stock_item",
                    "results": list(candidates),
                },
                status=status.HTTP_200_OK,
            )

        if req.request_type == "consumable":
            if not req.requested_consumable_model_id:
                return Response({"error": "Request missing requested_consumable_model_id"}, status=status.HTTP_400_BAD_REQUEST)

            is_compatible = ConsumableIsCompatibleWithAsset.objects.filter(
                asset_model_id=asset_model_id,
                consumable_model_id=req.requested_consumable_model_id,
            ).exists()
            if not is_compatible:
                return Response({"error": "Requested consumable model is not compatible with this asset"}, status=status.HTTP_400_BAD_REQUEST)

            used_consumable_ids = AssetIsComposedOfConsumableHistory.objects.filter(
                end_datetime__isnull=True
            ).values_list("consumable_id", flat=True)

            last_dest_location_subq = Subquery(
                ConsumableMovement.objects.filter(consumable_id=OuterRef("consumable_id"))
                .order_by("-consumable_movement_id")
                .values("destination_location_id")[:1]
            )

            candidates = (
                Consumable.objects.filter(consumable_model_id=req.requested_consumable_model_id)
                .exclude(consumable_id__in=used_consumable_ids)
                .annotate(current_location_id=last_dest_location_subq)
                .exclude(current_location_id__isnull=True)
                .values("consumable_id", "consumable_inventory_number", "current_location_id")
                .order_by("consumable_id")
            )

            return Response(
                {
                    "request_type": "consumable",
                    "results": list(candidates),
                },
                status=status.HTTP_200_OK,
            )

        return Response({"error": "Invalid request_type"}, status=status.HTTP_400_BAD_REQUEST)


class ExternalMaintenanceProviderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExternalMaintenanceProvider.objects.all().order_by("external_maintenance_provider_id")
    serializer_class = ExternalMaintenanceProviderSerializer
    permission_classes = [IsAuthenticated]


class ExternalMaintenanceTypicalStepViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ExternalMaintenanceTypicalStep.objects.all().order_by("external_maintenance_typical_step_id")
    serializer_class = ExternalMaintenanceTypicalStepSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create external maintenance typical steps")
        if denial:
            return denial

        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            last_item = ExternalMaintenanceTypicalStep.objects.order_by("-external_maintenance_typical_step_id").first()
            next_id = (last_item.external_maintenance_typical_step_id + 1) if last_item else 1

            translations_data = serializer.validated_data.pop('translations', None)
            instance = ExternalMaintenanceTypicalStep.objects.create(
                external_maintenance_typical_step_id=next_id,
                **serializer.validated_data,
            )
            if translations_data:
                from api.utils.i18n import save_translations
                save_translations(instance, translations_data)

            out = self.get_serializer(instance)
            return Response(out.data, status=status.HTTP_201_CREATED)
        except Exception as exc:
            import os
            import traceback
            try:
                log_path = os.path.join(os.getcwd(), 'root_debug.log')
                with open(log_path, 'a', encoding='utf-8') as f:
                    f.write(f"\n[ExternalMaintenanceTypicalStepViewSet.create] ERROR: {str(exc)}\n")
                    f.write(traceback.format_exc())
                    f.write("-" * 40 + "\n")
                    f.flush()
            except Exception:
                pass
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExternalMaintenanceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExternalMaintenance.objects.select_related("maintenance", "maintenance__asset").all().order_by(
        "-external_maintenance_id"
    )
    serializer_class = ExternalMaintenanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        maintenance_id = self.request.query_params.get("maintenance")
        if maintenance_id is not None:
            try:
                qs = qs.filter(maintenance_id=int(maintenance_id))
            except (ValueError, TypeError):
                pass
        return qs

    @action(detail=False, methods=["post"], url_path="create-for-maintenance")
    def create_for_maintenance(self, request):
        maintenance_id = request.data.get("maintenance_id")

        if not maintenance_id:
            return Response({"error": "maintenance_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Permission check: only the main technician (performed_by_person), chiefs, and superusers
        # can create external maintenances. Step-assigned technicians cannot.
        user_account = None
        try:
            if hasattr(request, "auth") and request.auth is not None:
                user_id = request.auth.get("user_id")
                if user_id:
                    user_account = UserAccount.objects.select_related("person").get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            user_account = None

        if user_account and user_account.person and not user_account.is_superuser():
            person = user_account.person
            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            is_chief = ("maintenance_chief" in role_codes) or ("it_bureau_chief" in role_codes)
            if not is_chief:
                # Must be the performed_by_person of the maintenance
                try:
                    maintenance_id_int = int(maintenance_id)
                except (ValueError, TypeError):
                    maintenance_id_int = None
                if maintenance_id_int:
                    is_main_tech = Maintenance.objects.filter(
                        maintenance_id=maintenance_id_int,
                        performed_by_person_id=person.person_id,
                    ).exists()
                    if not is_main_tech:
                        return Response(
                            {"error": "Only the main assigned technician or maintenance chief can create an external maintenance"},
                            status=status.HTTP_403_FORBIDDEN,
                        )

        try:
            maintenance_id_int = int(maintenance_id)
        except (ValueError, TypeError):
            return Response({"error": "Invalid ids"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            maintenance = Maintenance.objects.select_related("asset").get(maintenance_id=maintenance_id_int)
        except Maintenance.DoesNotExist:
            return Response({"error": "Maintenance not found"}, status=status.HTTP_404_NOT_FOUND)

        # Block starting a maintenance externally until all required movements have been decided.
        if getattr(maintenance, "start_datetime", None) is None:
            try:
                pending_asset_move = AssetMovement.objects.filter(
                    status="pending",
                    movement_reason="maintenance_create",
                    maintenance_id=maintenance.maintenance_id,
                ).exists()
                pending_stock_moves = StockItemMovement.objects.filter(
                    status="pending",
                    movement_reason="problem_report_include",
                    maintenance_id=maintenance.maintenance_id,
                ).exists()
                pending_consumable_moves = ConsumableMovement.objects.filter(
                    status="pending",
                    movement_reason="problem_report_include",
                    maintenance_id=maintenance.maintenance_id,
                ).exists()

                if pending_asset_move or pending_stock_moves or pending_consumable_moves:
                    pending_parts = []
                    if pending_asset_move:
                        pending_parts.append("asset movement request")
                    if pending_stock_moves:
                        pending_parts.append("included stock items movements")
                    if pending_consumable_moves:
                        pending_parts.append("included consumables movements")

                    return Response(
                        {
                            "error": "Maintenance cannot start until the following approvals are decided (accepted/rejected): "
                            + ", ".join(pending_parts)
                            + ".",
                            "pending_approvals": {
                                "asset_movement": bool(pending_asset_move),
                                "included_stock_items": bool(pending_stock_moves),
                                "included_consumables": bool(pending_consumable_moves),
                            },
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except Exception:
                pass

        asset_id = getattr(maintenance, "asset_id", None)
        if asset_id and ExternalMaintenance.objects.filter(
            maintenance__asset_id=asset_id,
        ).filter(
            Q(external_maintenance_status__isnull=True, item_received_by_company_datetime__isnull=True)
            | (Q(external_maintenance_status__isnull=False) & ~Q(external_maintenance_status="RECEIVED_BY_COMPANY"))
        ).exists():
            return Response(
                {
                    "error": "Cannot create a new external maintenance because an external maintenance is already open for this asset.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        last_em = ExternalMaintenance.objects.order_by("-external_maintenance_id").first()
        next_em_id = (last_em.external_maintenance_id + 1) if last_em else 1

        try:
            em = ExternalMaintenance.objects.create(
                external_maintenance_id=next_em_id,
                maintenance_id=maintenance_id_int,
                external_maintenance_status="DRAFT",
            )
        except IntegrityError:
            return Response(
                {"error": "Failed to create external maintenance due to database constraints."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            Maintenance.objects.filter(maintenance_id=maintenance_id_int, start_datetime__isnull=True).update(
                start_datetime=timezone.now()
            )
        except Exception:
            pass

        payload = ExternalMaintenanceSerializer(em).data
        return Response(payload, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="send-to-provider")
    def send_to_provider(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("asset_responsible" not in role_codes) and ("exploitation_chief" not in role_codes) and ("it_bureau_chief" not in role_codes):
            return Response(
                {"error": "Only asset responsible can send to external maintenance provider"},
                status=status.HTTP_403_FORBIDDEN,
            )

        provider_id = request.data.get("external_maintenance_provider_id")
        if not provider_id:
            return Response(
                {"error": "external_maintenance_provider_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        destination_location_id = request.data.get("destination_location_id")
        if not destination_location_id:
            return Response(
                {"error": "destination_location_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            provider_id_int = int(provider_id)
            destination_location_id_int = int(destination_location_id)
        except (ValueError, TypeError):
            return Response({"error": "Invalid ids"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            em = ExternalMaintenance.objects.select_related("maintenance", "maintenance__asset").get(
                external_maintenance_id=int(pk)
            )
        except (ExternalMaintenance.DoesNotExist, ValueError, TypeError):
            return Response({"error": "External maintenance not found"}, status=status.HTTP_404_NOT_FOUND)

        if em.item_sent_to_external_maintenance_datetime is not None:
            return Response({"error": "External maintenance already sent"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ExternalMaintenanceProvider.objects.get(external_maintenance_provider_id=provider_id_int)
        except ExternalMaintenanceProvider.DoesNotExist:
            return Response({"error": "Provider not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            destination_location = Location.objects.select_related("location_type").get(location_id=destination_location_id_int)
        except Location.DoesNotExist:
            return Response({"error": "Destination location not found"}, status=status.HTTP_404_NOT_FOUND)

        if not destination_location.location_type or destination_location.location_type.location_type_label != "External Maintenance Center":
            return Response(
                {"error": "Destination location must be of type 'External Maintenance Center'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        asset_id = getattr(em.maintenance, "asset_id", None)
        if not asset_id:
            return Response({"error": "External maintenance has no associated asset"}, status=status.HTTP_400_BAD_REQUEST)

        last_move = (
            AssetMovement.objects.select_related("destination_location")
            .filter(asset_id=asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        source_location_id = (
            last_move.destination_location_id
            if last_move and last_move.destination_location_id
            else destination_location_id_int
        )

        last_asset_move = AssetMovement.objects.order_by("-asset_movement_id").first()
        next_asset_move_id = (last_asset_move.asset_movement_id + 1) if last_asset_move else 1

        now = timezone.now()
        try:
            _create_asset_movement_with_translations(
                movement_reason_en="sent_to_external_maintenance",
                asset_movement_id=next_asset_move_id,
                asset_id=asset_id,
                source_location_id=source_location_id,
                destination_location_id=destination_location_id_int,
                maintenance_step_id=None,
                external_maintenance_step_id=None,
                movement_datetime=now,
            )
            _cascade_move_composed_items(
                asset_id=asset_id,
                source_location_id=source_location_id,
                destination_location_id=destination_location_id_int,
                movement_reason="sent_to_external_maintenance",
                movement_datetime=now,
                maintenance_step_id=None,
                external_maintenance_step_id=None,
            )
            em.item_sent_to_external_maintenance_datetime = now
            em.external_maintenance_status = "SENT_TO_PROVIDER"
            em.external_maintenance_provider_id = provider_id_int
            em.save(
                update_fields=[
                    "item_sent_to_external_maintenance_datetime",
                    "external_maintenance_status",
                    "external_maintenance_provider",
                ]
            )
        except IntegrityError:
            return Response(
                {"error": "Failed to send to external maintenance provider due to database constraints."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = ExternalMaintenanceSerializer(em).data
        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="create-step")
    def create_step(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("it_maintenance_technician" not in role_codes) and ("network_maintenance_technician" not in role_codes):
            return Response(
                {"error": "Only maintenance technician can create external maintenance steps"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Only the main technician (performed_by_person) or chiefs can create external maintenance steps.
        # Step-assigned technicians who are not the main technician cannot.
        if (not user_account.is_superuser()) and ("maintenance_chief" not in role_codes) and ("it_bureau_chief" not in role_codes):
            try:
                em = ExternalMaintenance.objects.select_related("maintenance").get(external_maintenance_id=int(pk))
                if em.maintenance and em.maintenance.performed_by_person_id != user_account.person.person_id:
                    return Response(
                        {"error": "Only the main assigned technician or maintenance chief can create external maintenance steps"},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            except (ExternalMaintenance.DoesNotExist, ValueError, TypeError):
                pass

        typical_step_id = request.data.get("external_maintenance_typical_step_id")
        if not typical_step_id:
            return Response(
                {"error": "external_maintenance_typical_step_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            typical_step_id_int = int(typical_step_id)
        except (ValueError, TypeError):
            return Response({"error": "Invalid ids"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            em = ExternalMaintenance.objects.get(external_maintenance_id=int(pk))
        except (ExternalMaintenance.DoesNotExist, ValueError, TypeError):
            return Response({"error": "External maintenance not found"}, status=status.HTTP_404_NOT_FOUND)

        if em.item_sent_to_external_maintenance_datetime is None:
            return Response({"error": "External maintenance not sent yet"}, status=status.HTTP_400_BAD_REQUEST)

        em_status = getattr(em, "external_maintenance_status", None)
        if em_status is not None:
            if em_status != "RECEIVED_BY_PROVIDER":
                return Response(
                    {"error": "External maintenance is not received by provider yet"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            if em.item_received_by_maintenance_provider_datetime is None:
                return Response(
                    {"error": "External maintenance is not received by provider yet"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if em.item_received_by_company_datetime is not None:
            return Response({"error": "External maintenance already received by company"}, status=status.HTTP_400_BAD_REQUEST)

        provider_id_int = getattr(em, "external_maintenance_provider_id", None)
        if not provider_id_int:
            return Response(
                {"error": "External maintenance has no provider selected yet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            typical_step = ExternalMaintenanceTypicalStep.objects.get(
                external_maintenance_typical_step_id=typical_step_id_int
            )
        except ExternalMaintenanceTypicalStep.DoesNotExist:
            return Response({"error": "Typical step not found"}, status=status.HTTP_404_NOT_FOUND)

        last_step = ExternalMaintenanceStep.objects.order_by("-external_maintenance_step_id").first()
        next_step_id = (last_step.external_maintenance_step_id + 1) if last_step else 1

        now = timezone.now()
        try:
            step = ExternalMaintenanceStep.objects.create(
                external_maintenance_step_id=next_step_id,
                external_maintenance=em,
                external_maintenance_typical_step=typical_step,
                start_datetime=now,
            )
        except IntegrityError:
            return Response(
                {"error": "Failed to create external maintenance step due to database constraints."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = ExternalMaintenanceStepSerializer(step).data
        return Response(payload, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="confirm-received-by-provider")
    def confirm_received_by_provider(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("asset_responsible" not in role_codes) and ("exploitation_chief" not in role_codes) and ("it_bureau_chief" not in role_codes):
            return Response(
                {"error": "Only asset responsible can confirm receipt by maintenance provider"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            em = ExternalMaintenance.objects.get(external_maintenance_id=int(pk))
        except (ExternalMaintenance.DoesNotExist, ValueError, TypeError):
            return Response({"error": "External maintenance not found"}, status=status.HTTP_404_NOT_FOUND)

        if em.item_sent_to_external_maintenance_datetime is None:
            return Response({"error": "External maintenance not sent yet"}, status=status.HTTP_400_BAD_REQUEST)

        if em.item_received_by_maintenance_provider_datetime is not None:
            return Response({"error": "Already confirmed as received by maintenance provider"}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        try:
            em.item_received_by_maintenance_provider_datetime = now
            em.external_maintenance_status = "RECEIVED_BY_PROVIDER"
            em.save(
                update_fields=[
                    "item_received_by_maintenance_provider_datetime",
                    "external_maintenance_status",
                ]
            )
        except IntegrityError:
            return Response(
                {"error": "Failed to confirm receipt due to database constraints."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = ExternalMaintenanceSerializer(em).data
        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="confirm-received-by-company")
    def confirm_received_by_company(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("asset_responsible" not in role_codes) and ("exploitation_chief" not in role_codes) and ("it_bureau_chief" not in role_codes):
            return Response(
                {"error": "Only asset responsible can confirm asset received by company"},
                status=status.HTTP_403_FORBIDDEN,
            )

        destination_location_id = request.data.get("destination_location_id")
        if not destination_location_id:
            return Response({"error": "destination_location_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            destination_location_id_int = int(destination_location_id)
        except (ValueError, TypeError):
            return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            em = ExternalMaintenance.objects.select_related("maintenance").get(external_maintenance_id=int(pk))
        except (ExternalMaintenance.DoesNotExist, ValueError, TypeError):
            return Response({"error": "External maintenance not found"}, status=status.HTTP_404_NOT_FOUND)

        if em.item_sent_to_company_datetime is None:
            return Response({"error": "Asset not sent to company yet"}, status=status.HTTP_400_BAD_REQUEST)

        if em.item_received_by_company_datetime is not None:
            return Response({"error": "Already confirmed as received by company"}, status=status.HTTP_400_BAD_REQUEST)

        asset_id = getattr(em.maintenance, "asset_id", None)
        if not asset_id:
            return Response({"error": "External maintenance has no associated asset"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            destination_location = Location.objects.get(location_id=destination_location_id_int)
        except Location.DoesNotExist:
            return Response({"error": "Destination location not found"}, status=status.HTTP_404_NOT_FOUND)

        last_move = (
            AssetMovement.objects.select_related("destination_location")
            .filter(asset_id=asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        source_location_id = (
            last_move.destination_location_id
            if last_move and last_move.destination_location_id
            else destination_location_id_int
        )

        if last_move and last_move.destination_location_id == destination_location_id_int:
            return Response({"error": "Asset is already in this location"}, status=status.HTTP_400_BAD_REQUEST)

        last_asset_move = AssetMovement.objects.order_by("-asset_movement_id").first()
        next_asset_move_id = (last_asset_move.asset_movement_id + 1) if last_asset_move else 1

        last_external_step = (
            ExternalMaintenanceStep.objects.filter(external_maintenance=em)
            .order_by("-external_maintenance_step_id")
            .first()
        )
        external_step_id = last_external_step.external_maintenance_step_id if last_external_step else None

        now = timezone.now()
        try:
            _create_asset_movement_with_translations(
                movement_reason_en="received_from_external_maintenance",
                asset_movement_id=next_asset_move_id,
                asset_id=asset_id,
                source_location_id=source_location_id,
                destination_location_id=destination_location_id_int,
                maintenance_step_id=None,
                external_maintenance_step_id=external_step_id,
                movement_datetime=now,
            )
            _cascade_move_composed_items(
                asset_id=asset_id,
                source_location_id=source_location_id,
                destination_location_id=destination_location_id_int,
                movement_reason="received_from_external_maintenance",
                movement_datetime=now,
                maintenance_step_id=None,
                external_maintenance_step_id=external_step_id,
            )
            em.item_received_by_company_datetime = now
            em.external_maintenance_status = "RECEIVED_BY_COMPANY"
            em.save(update_fields=["item_received_by_company_datetime", "external_maintenance_status"])
        except IntegrityError:
            return Response(
                {"error": "Failed to confirm received by company due to database constraints."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = ExternalMaintenanceSerializer(em).data
        payload["destination_location"] = {"location_id": destination_location.location_id, "location_name": destination_location.location_name}
        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="confirm-sent-to-company")
    def confirm_sent_to_company(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("asset_responsible" not in role_codes) and ("exploitation_chief" not in role_codes) and ("it_bureau_chief" not in role_codes):
            return Response(
                {"error": "Only asset responsible can confirm asset sent to company"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            em = ExternalMaintenance.objects.get(external_maintenance_id=int(pk))
        except (ExternalMaintenance.DoesNotExist, ValueError, TypeError):
            return Response({"error": "External maintenance not found"}, status=status.HTTP_404_NOT_FOUND)

        if em.item_received_by_maintenance_provider_datetime is None:
            return Response(
                {"error": "Cannot confirm sent to company before being received by maintenance provider"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if em.item_sent_to_company_datetime is not None:
            return Response({"error": "Already confirmed as sent to company"}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        try:
            em.item_sent_to_company_datetime = now
            em.external_maintenance_status = "SENT_TO_COMPANY"
            em.save(update_fields=["item_sent_to_company_datetime", "external_maintenance_status"])
        except IntegrityError:
            return Response(
                {"error": "Failed to confirm sent to company due to database constraints."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = ExternalMaintenanceSerializer(em).data
        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="mark-failed")
    def mark_failed(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )

        target_type = request.data.get("target_type") or "asset"
        target_id = request.data.get("target_id")
        include_composed = bool(request.data.get("include_composed"))

        if target_type not in {"asset", "stock_item", "consumable"}:
            return Response({"error": "Invalid target_type"}, status=status.HTTP_400_BAD_REQUEST)

        if target_type == "asset":
            if (not user_account.is_superuser()) and ("asset_responsible" not in role_codes) and ("exploitation_chief" not in role_codes) and ("it_bureau_chief" not in role_codes):
                return Response(
                    {"error": "Only asset responsible can mark asset as failed"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        else:
            if (not user_account.is_superuser()) and ("stock_consumable_responsible" not in role_codes) and ("exploitation_chief" not in role_codes):
                return Response(
                    {"error": "Only stock items and consumables responsible can mark items as failed"},
                    status=status.HTTP_403_FORBIDDEN,
                )

        try:
            em = ExternalMaintenance.objects.select_related("maintenance", "maintenance__asset").get(
                external_maintenance_id=int(pk)
            )
        except (ExternalMaintenance.DoesNotExist, ValueError, TypeError):
            return Response({"error": "External maintenance not found"}, status=status.HTTP_404_NOT_FOUND)

        asset_id = getattr(em.maintenance, "asset_id", None) if getattr(em, "maintenance", None) else None
        if not asset_id:
            return Response({"error": "External maintenance has no associated asset"}, status=status.HTTP_400_BAD_REQUEST)

        if target_type == "asset":
            em_status = getattr(em, "external_maintenance_status", None)
            received_by_provider = (
                em_status == "RECEIVED_BY_PROVIDER" or getattr(em, "item_received_by_maintenance_provider_datetime", None) is not None
            )
            if not received_by_provider:
                return Response(
                    {"error": "Asset cannot be marked as failed until it has been received by maintenance provider"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            if target_type != "asset":
                try:
                    target_id_int = int(target_id)
                except (ValueError, TypeError):
                    return Response({"error": "target_id is required"}, status=status.HTTP_400_BAD_REQUEST)

                if target_type == "stock_item":
                    is_composed = AssetIsComposedOfStockItemHistory.objects.filter(
                        asset_id=asset_id,
                        stock_item_id=target_id_int,
                        end_datetime__isnull=True,
                    ).exists()
                    if not is_composed:
                        return Response(
                            {"error": "Stock item is not currently composed in this asset"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    from api.utils.i18n import bulk_sync_status_translations
                    bulk_sync_status_translations(StockItem, {'stock_item_id': target_id_int}, 'failed')

                elif target_type == "consumable":
                    is_composed = AssetIsComposedOfConsumableHistory.objects.filter(
                        asset_id=asset_id,
                        consumable_id=target_id_int,
                        end_datetime__isnull=True,
                    ).exists()
                    if not is_composed:
                        return Response(
                            {"error": "Consumable is not currently composed in this asset"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    from api.utils.i18n import bulk_sync_status_translations
                    bulk_sync_status_translations(Consumable, {'consumable_id': target_id_int}, 'failed')

                payload = ExternalMaintenanceSerializer(em).data
                payload["updated"] = {"target_type": target_type, "target_id": target_id_int, "status": "failed"}
                return Response(payload, status=status.HTTP_200_OK)

            now = timezone.now()
            from api.utils.i18n import bulk_sync_status_translations
            bulk_sync_status_translations(Asset, {'asset_id': asset_id}, 'failed')

            # Record which external maintenance caused the asset to become failed.
            # This is later used when creating asset destruction certificates.
            AssetFailedExternalMaintenance.objects.update_or_create(
                asset_id=asset_id,
                defaults={
                    "external_maintenance_id": int(pk),
                    "failed_datetime": now,
                },
            )

            updated = {"asset_id": asset_id, "asset_status": "failed"}

            if include_composed:
                stock_item_ids = list(
                    AssetIsComposedOfStockItemHistory.objects.filter(asset_id=asset_id, end_datetime__isnull=True).values_list(
                        "stock_item_id", flat=True
                    )
                )
                consumable_ids = list(
                    AssetIsComposedOfConsumableHistory.objects.filter(asset_id=asset_id, end_datetime__isnull=True).values_list(
                        "consumable_id", flat=True
                    )
                )

                if stock_item_ids:
                    from api.utils.i18n import bulk_sync_status_translations
                    bulk_sync_status_translations(StockItem, {'stock_item_id__in': stock_item_ids}, 'failed')
                if consumable_ids:
                    from api.utils.i18n import bulk_sync_status_translations as _bsct_c
                    _bsct_c(Consumable, {'consumable_id__in': consumable_ids}, 'failed')

                updated["stock_item_ids"] = stock_item_ids
                updated["consumable_ids"] = consumable_ids

            payload = ExternalMaintenanceSerializer(em).data
            payload["updated"] = updated
            return Response(payload, status=status.HTTP_200_OK)
        except IntegrityError:
            return Response(
                {"error": "Failed to mark as failed due to database constraints."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ExternalMaintenanceStepViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExternalMaintenanceStep.objects.select_related(
        "external_maintenance",
        "external_maintenance__maintenance",
        "external_maintenance__external_maintenance_provider",
        "external_maintenance_typical_step",
    ).all().order_by("-external_maintenance_step_id")
    serializer_class = ExternalMaintenanceStepSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        maintenance_id = self.request.query_params.get("maintenance")
        if maintenance_id is not None:
            try:
                qs = qs.filter(external_maintenance__maintenance_id=int(maintenance_id))
            except (ValueError, TypeError):
                pass
        return qs


class MyItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_account = None
        try:
            if hasattr(request, "auth") and request.auth is not None:
                user_id = request.auth.get("user_id")
                if user_id:
                    user_account = UserAccount.objects.select_related("person").get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            user_account = None

        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = user_account.person

        current_assets = list(
            Asset.objects.filter(assetisassignedtoperson__person=person, assetisassignedtoperson__is_active=True)
            .distinct()
            .order_by("asset_id")
        )
        asset_history = list(
            AssetIsAssignedToPerson.objects.filter(person=person).select_related("asset").order_by("-start_datetime")
        )

        current_stock_items = list(
            StockItem.objects.filter(stockitemisassignedtoperson__person=person, stockitemisassignedtoperson__is_active=True)
            .distinct()
            .order_by("stock_item_id")
        )
        stock_history = list(
            StockItemIsAssignedToPerson.objects.filter(person=person)
            .select_related("stock_item")
            .order_by("-start_datetime")
        )

        current_consumables = list(
            Consumable.objects.filter(consumableisassignedtoperson__person=person, consumableisassignedtoperson__is_active=True)
            .distinct()
            .order_by("consumable_id")
        )
        consumable_history = list(
            ConsumableIsAssignedToPerson.objects.filter(person=person)
            .select_related("consumable")
            .order_by("-start_datetime")
        )

        return Response(
            {
                "assets": {
                    "current": AssetSerializer(current_assets, many=True).data,
                    "history": AssetIsAssignedToPersonSerializer(asset_history, many=True).data,
                },
                "stock_items": {
                    "current": StockItemSerializer(current_stock_items, many=True).data,
                    "history": StockItemIsAssignedToPersonSerializer(stock_history, many=True).data,
                },
                "consumables": {
                    "current": ConsumableSerializer(current_consumables, many=True).data,
                    "history": ConsumableIsAssignedToPersonSerializer(consumable_history, many=True).data,
                },
            }
        )


class DashboardKpiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not getattr(user_account, "person", None):
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = user_account.person
        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        # My items (always relevant when user has a linked person)
        my_assets_count = AssetIsAssignedToPerson.objects.filter(person=person, is_active=True).count()
        my_stock_items_count = StockItemIsAssignedToPerson.objects.filter(person=person, is_active=True).count()
        my_consumables_count = ConsumableIsAssignedToPerson.objects.filter(person=person, is_active=True).count()

        # Maintenances: mirror MaintenanceViewSet visibility rules at a high-level.
        maint_qs = Maintenance.objects.all()
        if user_account.is_superuser() or ("maintenance_chief" in role_codes) or ("it_bureau_chief" in role_codes):
            visible_maint_qs = maint_qs
        elif "asset_responsible" in role_codes:
            pending_moves = AssetMovement.objects.filter(Q(status="pending") | Q(status__isnull=True)).filter(
                movement_reason="maintenance_create"
            )
            maintenance_ids = list(
                pending_moves.exclude(maintenance_id__isnull=True).values_list("maintenance_id", flat=True)
            )
            asset_ids = list(
                pending_moves.filter(maintenance_id__isnull=True).values_list("asset_id", flat=True)
            )
            if maintenance_ids:
                visible_maint_qs = maint_qs.filter(maintenance_id__in=maintenance_ids)
            elif asset_ids:
                visible_maint_qs = maint_qs.filter(asset_id__in=asset_ids, start_datetime__isnull=True, end_datetime__isnull=True)
            else:
                visible_maint_qs = Maintenance.objects.none()
        elif ("it_maintenance_technician" in role_codes) or ("network_maintenance_technician" in role_codes):
            visible_maint_qs = maint_qs.filter(Q(performed_by_person=person) | Q(steps__person=person)).distinct()
        else:
            visible_maint_qs = Maintenance.objects.none()

        open_maintenances_count = visible_maint_qs.filter(end_datetime__isnull=True).count()
        awaiting_approval_count = 0
        if user_account.is_superuser() or ("maintenance_chief" in role_codes) or ("it_bureau_chief" in role_codes):
            awaiting_approval_count = visible_maint_qs.filter(
                Q(is_approved_by_maintenance_chief__isnull=True) | Q(is_approved_by_maintenance_chief=False)
            ).count()

        # Maintenance step item requests inbox
        pending_item_requests_count = None
        if user_account.is_superuser() or ("stock_consumable_responsible" in role_codes) or ("exploitation_chief" in role_codes):
            pending_item_requests_count = MaintenanceStepItemRequest.objects.filter(status="pending").count()

        # Purchase orders: count orders with remaining lines to be received
        purchase_orders_remaining_count = None
        can_view_purchase_orders = user_account.is_superuser() or (
            role_codes
            & {
                "stock_consumable_responsible",
                "exploitation_chief",
                "director_admin_support",
                "protection_and_security_bureau_chief",
                "school_headquarter",
                "it_bureau_chief",
            }
        )
        if can_view_purchase_orders:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT COUNT(*)
                    FROM public.purchase_order po
                    WHERE (
                        EXISTS (
                            SELECT 1
                            FROM public.stock_item_model_is_found_in_purchase_order l
                            WHERE l.purchase_order_id = po.purchase_order_id
                              AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                        )
                        OR EXISTS (
                            SELECT 1
                            FROM public.consumable_model_is_found_in_purchase_order l
                            WHERE l.purchase_order_id = po.purchase_order_id
                              AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                        )
                    )
                    """
                )
                row = cursor.fetchone()
                purchase_orders_remaining_count = int(row[0] or 0) if row else 0

        # Incident reports awaiting signature for the current user/role
        pending_incident_signatures_count = 0
        try:
            incident_qs = AssetIncidentReport.objects.all()

            owner_pending = incident_qs.filter(owner_person=person, is_signed_by_owner=False).count()
            pending_incident_signatures_count += owner_pending

            if user_account.is_superuser() or ("it_bureau_chief" in role_codes):
                pending_incident_signatures_count += incident_qs.filter(is_signed_by_it_bureau_chief=False).count()
            if user_account.is_superuser() or ("exploitation_chief" in role_codes):
                pending_incident_signatures_count += incident_qs.filter(is_signed_by_exploitation_chief=False).count()
            if user_account.is_superuser() or ("protection_and_security_bureau_chief" in role_codes):
                pending_incident_signatures_count += incident_qs.filter(
                    is_signed_by_protection_and_security_bureau_chief=False
                ).count()
            if user_account.is_superuser() or ("school_headquarter" in role_codes):
                # Prefer requests directed to the logged-in school headquarter person.
                pending_incident_signatures_count += incident_qs.filter(
                    Q(school_headquarter_person=person) | Q(school_headquarter_person__isnull=True),
                    is_signed_by_school_headquarter=False,
                ).count()
        except Exception:
            pending_incident_signatures_count = 0

        return Response(
            {
                "my_items": {
                    "assets": my_assets_count,
                    "stock_items": my_stock_items_count,
                    "consumables": my_consumables_count,
                },
                "maintenances": {
                    "open": open_maintenances_count,
                    "awaiting_approval": awaiting_approval_count,
                },
                "procurement": {
                    "pending_item_requests": pending_item_requests_count,
                    "purchase_orders_with_remaining": purchase_orders_remaining_count,
                },
                "incidents": {
                    "pending_signatures": pending_incident_signatures_count,
                },
            },
            status=status.HTTP_200_OK,
        )


class ProblemReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _normalize_report(self, item_type, report):
        item = getattr(report, item_type, None)
        item_data = {"item_id": item.pk if item else None}

        if item_type == "asset" and item:
            asset_model = getattr(item, "asset_model", None)
            asset_brand = getattr(asset_model, "asset_brand", None) if asset_model else None
            # Get current location for asset
            last_move = (
                AssetMovement.objects.filter(asset=item)
                .select_related("destination_location", "destination_location__location_type")
                .order_by("-asset_movement_id")
                .first()
            )
            current_location = getattr(last_move, "destination_location", None)
            item_data.update({
                "item_name": item.asset_name,
                "item_inventory_number": item.asset_inventory_number,
                "item_serial_number": item.asset_serial_number,
                "item_service_tag": item.asset_service_tag,
                "item_status": item.asset_status,
                "item_model_name": getattr(asset_model, "model_name", None) if asset_model else None,
                "item_brand_name": getattr(asset_brand, "brand_name", None) if asset_brand else None,
                "item_current_location": getattr(current_location, "location_name", None),
                "item_current_location_type": getattr(getattr(current_location, "location_type", None), "location_type_label", None),
            })
        elif item_type == "stock_item" and item:
            stock_model = getattr(item, "stock_item_model", None)
            stock_brand = getattr(stock_model, "stock_item_brand", None) if stock_model else None
            # Get current location for stock item
            last_move = (
                StockItemMovement.objects.filter(stock_item=item)
                .select_related("destination_location", "destination_location__location_type")
                .order_by("-stock_item_movement_id")
                .first()
            )
            current_location = getattr(last_move, "destination_location", None)
            item_data.update({
                "item_name": item.stock_item_name,
                "item_inventory_number": item.stock_item_inventory_number,
                "item_status": item.stock_item_status,
                "item_model_name": getattr(stock_model, "model_name", None) if stock_model else None,
                "item_brand_name": getattr(stock_brand, "brand_name", None) if stock_brand else None,
                "item_current_location": getattr(current_location, "location_name", None),
                "item_current_location_type": getattr(getattr(current_location, "location_type", None), "location_type_label", None),
            })
        elif item_type == "consumable" and item:
            consumable_model = getattr(item, "consumable_model", None)
            consumable_brand = getattr(consumable_model, "consumable_brand", None) if consumable_model else None
            # Get current location for consumable
            last_move = (
                ConsumableMovement.objects.filter(consumable=item)
                .select_related("destination_location", "destination_location__location_type")
                .order_by("-consumable_movement_id")
                .first()
            )
            current_location = getattr(last_move, "destination_location", None)
            item_data.update({
                "item_name": item.consumable_name,
                "item_inventory_number": item.consumable_inventory_number,
                "item_serial_number": item.consumable_serial_number,
                "item_status": item.consumable_status,
                "item_model_name": getattr(consumable_model, "model_name", None) if consumable_model else None,
                "item_brand_name": getattr(consumable_brand, "brand_name", None) if consumable_brand else None,
                "item_current_location": getattr(current_location, "location_name", None),
                "item_current_location_type": getattr(getattr(current_location, "location_type", None), "location_type_label", None),
            })

        return {
            "item_type": item_type,
            "report_id": report.report_id,
            "person_id": report.person_id if hasattr(report, "person_id") else report.person.person_id,
            "person_name": f"{report.person.first_name} {report.person.last_name}",
            "report_datetime": report.report_datetime,
            "owner_observation": report.owner_observation,
            **item_data,
        }

    @action(detail=False, methods=["get"], url_path="eligible-items")
    def eligible_items(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        asset_id = request.query_params.get("asset_id")
        if not asset_id:
            return Response({"error": "asset_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            asset_id_int = int(asset_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid asset_id"}, status=status.HTTP_400_BAD_REQUEST)

        asset = Asset.objects.filter(asset_id=asset_id_int).first()
        if not asset:
            return Response({"error": "Asset not found"}, status=status.HTTP_404_NOT_FOUND)

        if Maintenance.objects.filter(asset_id=asset_id_int, end_datetime__isnull=True).exists():
            return Response(
                {"error": "You cannot report a problem on an asset that is already under maintenance."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        open_external_maintenance_q = (
            Q(
                external_maintenance_status__isnull=True,
                item_sent_to_external_maintenance_datetime__isnull=False,
                item_received_by_company_datetime__isnull=True,
            )
            | (
                Q(external_maintenance_status__isnull=False)
                & ~Q(external_maintenance_status__in=["DRAFT", "RECEIVED_BY_COMPANY"])
            )
        )
        if ExternalMaintenance.objects.filter(maintenance__asset_id=asset_id_int).filter(open_external_maintenance_q).exists():
            return Response(
                {"error": "You cannot report a problem on an asset that is already under external maintenance."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now_dt = timezone.now()

        owner_assignment = (
            AssetIsAssignedToPerson.objects.filter(asset_id=asset_id_int, is_active=True)
            .select_related("person")
            .first()
        )
        if not owner_assignment or not owner_assignment.person:
            return Response({"error": "Asset owner not found"}, status=status.HTTP_400_BAD_REQUEST)

        owner = owner_assignment.person

        active_stock_item_ids = set(
            AssetIsComposedOfStockItemHistory.objects.filter(
                asset_id=asset_id_int,
                start_datetime__lte=now_dt,
            )
            .filter(Q(end_datetime__isnull=True) | Q(end_datetime__gt=now_dt))
            .values_list("stock_item_id", flat=True)
        )
        active_consumable_ids = set(
            AssetIsComposedOfConsumableHistory.objects.filter(
                asset_id=asset_id_int,
                start_datetime__lte=now_dt,
            )
            .filter(Q(end_datetime__isnull=True) | Q(end_datetime__gt=now_dt))
            .values_list("consumable_id", flat=True)
        )

        eligible_stock_items = list(
            StockItem.objects.filter(
                stockitemisassignedtoperson__person=owner,
                stockitemisassignedtoperson__is_active=True,
            )
            .exclude(stock_item_id__in=active_stock_item_ids)
            .distinct()
            .order_by("stock_item_id")
        )
        eligible_consumables = list(
            Consumable.objects.filter(
                consumableisassignedtoperson__person=owner,
                consumableisassignedtoperson__is_active=True,
            )
            .exclude(consumable_id__in=active_consumable_ids)
            .distinct()
            .order_by("consumable_id")
        )

        return Response(
            {
                "owner_person_id": owner.person_id,
                "asset_id": asset.asset_id,
                "stock_items": [
                    {
                        "stock_item_id": s.stock_item_id,
                        "stock_item_inventory_number": s.stock_item_inventory_number,
                        "stock_item_name": s.stock_item_name,
                    }
                    for s in eligible_stock_items
                ],
                "consumables": [
                    {
                        "consumable_id": c.consumable_id,
                        "consumable_inventory_number": c.consumable_inventory_number,
                        "consumable_name": c.consumable_name,
                    }
                    for c in eligible_consumables
                ],
            },
            status=status.HTTP_200_OK,
        )

    def list(self, request):
        asset_reports = PersonReportsProblemOnAsset.objects.select_related(
            "asset", "asset__asset_model", "asset__asset_model__asset_brand"
        ).all().order_by("-report_datetime")
        stock_reports = PersonReportsProblemOnStockItem.objects.select_related(
            "stock_item", "stock_item__stock_item_model", "stock_item__stock_item_model__stock_item_brand"
        ).all().order_by("-report_datetime")
        consumable_reports = PersonReportsProblemOnConsumable.objects.select_related(
            "consumable", "consumable__consumable_model", "consumable__consumable_model__consumable_brand"
        ).all().order_by("-report_datetime")

        data = [self._normalize_report("asset", r) for r in asset_reports] + [self._normalize_report("stock_item", r) for r in stock_reports] + [
            self._normalize_report("consumable", r) for r in consumable_reports
        ]
        data.sort(key=lambda x: x.get("report_datetime") or timezone.now(), reverse=True)
        return Response(data)

    @action(detail=False, methods=["get"], url_path="mine")
    def mine(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person_id = user_account.person.person_id
        asset_reports = PersonReportsProblemOnAsset.objects.select_related(
            "asset", "asset__asset_model", "asset__asset_model__asset_brand"
        ).filter(person_id=person_id).order_by("-report_datetime")
        stock_reports = PersonReportsProblemOnStockItem.objects.select_related(
            "stock_item", "stock_item__stock_item_model", "stock_item__stock_item_model__stock_item_brand"
        ).filter(person_id=person_id).order_by("-report_datetime")
        consumable_reports = PersonReportsProblemOnConsumable.objects.select_related(
            "consumable", "consumable__consumable_model", "consumable__consumable_model__consumable_brand"
        ).filter(person_id=person_id).order_by("-report_datetime")

        data = [self._normalize_report("asset", r) for r in asset_reports] + [self._normalize_report("stock_item", r) for r in stock_reports] + [
            self._normalize_report("consumable", r) for r in consumable_reports
        ]
        data.sort(key=lambda x: x.get("report_datetime") or timezone.now(), reverse=True)
        return Response(data)

    def create(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        item_type = request.data.get("item_type")
        item_id = request.data.get("item_id")
        owner_observation = request.data.get("owner_observation")

        if item_type not in {"asset", "stock_item", "consumable"}:
            return Response({"error": "Invalid item_type"}, status=status.HTTP_400_BAD_REQUEST)
        if not item_id:
            return Response({"error": "item_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not owner_observation:
            return Response({"error": "owner_observation is required"}, status=status.HTTP_400_BAD_REQUEST)

        person = user_account.person

        if item_type == "asset":
            included_stock_item_ids = request.data.get("included_stock_item_ids") or []
            included_consumable_ids = request.data.get("included_consumable_ids") or []
            destination_location_id = request.data.get("destination_location_id")

            try:
                asset_id_int = int(item_id)
            except (TypeError, ValueError):
                return Response({"error": "Invalid item_id"}, status=status.HTTP_400_BAD_REQUEST)

            if Maintenance.objects.filter(asset_id=asset_id_int, end_datetime__isnull=True).exists():
                return Response(
                    {"error": "You cannot report a problem on an asset that is already under maintenance."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            open_external_maintenance_q = (
                Q(
                    external_maintenance_status__isnull=True,
                    item_sent_to_external_maintenance_datetime__isnull=False,
                    item_received_by_company_datetime__isnull=True,
                )
                | (
                    Q(external_maintenance_status__isnull=False)
                    & ~Q(external_maintenance_status__in=["DRAFT", "RECEIVED_BY_COMPANY"])
                )
            )
            if ExternalMaintenance.objects.filter(maintenance__asset_id=asset_id_int).filter(open_external_maintenance_q).exists():
                return Response(
                    {"error": "You cannot report a problem on an asset that is already under external maintenance."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            has_included_items = bool(included_stock_item_ids or included_consumable_ids)
            if not has_included_items:
                destination_location_id = None

            try:
                included_stock_item_ids = [int(x) for x in (included_stock_item_ids or [])]
                included_consumable_ids = [int(x) for x in (included_consumable_ids or [])]
            except (TypeError, ValueError):
                return Response({"error": "Invalid included item ids"}, status=status.HTTP_400_BAD_REQUEST)

            if has_included_items and not destination_location_id:
                return Response({"error": "destination_location_id is required when including items"}, status=status.HTTP_400_BAD_REQUEST)

            destination_location = None
            if destination_location_id:
                try:
                    destination_location_id_int = int(destination_location_id)
                except (TypeError, ValueError):
                    destination_location = None
            if has_included_items and destination_location_id:
                destination_location = Location.objects.select_related("location_type").filter(location_id=destination_location_id).first()
                if not destination_location:
                    return Response({"error": "Destination location not found"}, status=status.HTTP_404_NOT_FOUND)
                if not destination_location.location_type_id or int(destination_location.location_type_id) != 2:
                    return Response({"error": "Destination location must be a maintenance location"}, status=status.HTTP_400_BAD_REQUEST)

            last = PersonReportsProblemOnAsset.objects.order_by("-report_id").first()
            next_id = (last.report_id + 1) if last else 1
            now_dt = timezone.now()

            with transaction.atomic():
                report = PersonReportsProblemOnAsset.objects.create(
                    report_id=next_id,
                    asset_id=item_id,
                    person=person,
                    report_datetime=now_dt,
                    owner_observation=owner_observation,
                )

                if included_stock_item_ids or included_consumable_ids:
                    owner_assignment = (
                        AssetIsAssignedToPerson.objects.filter(asset_id=asset_id_int, is_active=True)
                        .select_related("person")
                        .first()
                    )
                    if not owner_assignment or not owner_assignment.person:
                        raise ValidationError({"error": "Asset owner not found"})
                    owner = owner_assignment.person

                    active_stock_item_ids = set(
                        AssetIsComposedOfStockItemHistory.objects.filter(
                            asset_id=asset_id_int,
                            start_datetime__lte=now_dt,
                        )
                        .filter(Q(end_datetime__isnull=True) | Q(end_datetime__gt=now_dt))
                        .values_list("stock_item_id", flat=True)
                    )
                    active_consumable_ids = set(
                        AssetIsComposedOfConsumableHistory.objects.filter(
                            asset_id=asset_id_int,
                            start_datetime__lte=now_dt,
                        )
                        .filter(Q(end_datetime__isnull=True) | Q(end_datetime__gt=now_dt))
                        .values_list("consumable_id", flat=True)
                    )

                    eligible_stock_item_ids = set(
                        StockItem.objects.filter(
                            stockitemisassignedtoperson__person=owner,
                            stockitemisassignedtoperson__is_active=True,
                        )
                        .exclude(stock_item_id__in=active_stock_item_ids)
                        .values_list("stock_item_id", flat=True)
                    )
                    eligible_consumable_ids = set(
                        Consumable.objects.filter(
                            consumableisassignedtoperson__person=owner,
                            consumableisassignedtoperson__is_active=True,
                        )
                        .exclude(consumable_id__in=active_consumable_ids)
                        .values_list("consumable_id", flat=True)
                    )

                    invalid_stock = [sid for sid in included_stock_item_ids if sid not in eligible_stock_item_ids]
                    if invalid_stock:
                        raise ValidationError({"error": f"Invalid stock items selected: {invalid_stock}"})
                    invalid_consumables = [cid for cid in included_consumable_ids if cid not in eligible_consumable_ids]
                    if invalid_consumables:
                        raise ValidationError({"error": f"Invalid consumables selected: {invalid_consumables}"})

                    if not destination_location:
                        raise ValidationError({"error": "Destination location not found"})

                    if not destination_location:
                        raise ValidationError({"error": "destination_location_id is required when including items"})

                    PersonReportsProblemOnAssetIncludedContext.objects.update_or_create(
                        report_id=report.report_id,
                        defaults={"destination_location_id": destination_location.location_id},
                    )

                    for stock_item_id_int in included_stock_item_ids:
                        PersonReportsProblemOnAssetIncludedStockItem.objects.get_or_create(
                            report_id=report.report_id,
                            stock_item_id=stock_item_id_int,
                        )

                    for consumable_id_int in included_consumable_ids:
                        PersonReportsProblemOnAssetIncludedConsumable.objects.get_or_create(
                            report_id=report.report_id,
                            consumable_id=consumable_id_int,
                        )

            return Response(PersonReportsProblemOnAssetSerializer(report).data, status=status.HTTP_201_CREATED)

        if item_type == "stock_item":
            last = PersonReportsProblemOnStockItem.objects.order_by("-report_id").first()
            next_id = (last.report_id + 1) if last else 1
            report = PersonReportsProblemOnStockItem.objects.create(
                report_id=next_id,
                stock_item_id=item_id,
                person=person,
                owner_observation=owner_observation,
            )
            return Response(PersonReportsProblemOnStockItemSerializer(report).data, status=status.HTTP_201_CREATED)

        last = PersonReportsProblemOnConsumable.objects.order_by("-report_id").first()
        next_id = (last.report_id + 1) if last else 1
        report = PersonReportsProblemOnConsumable.objects.create(
            report_id=next_id,
            consumable_id=item_id,
            person=person,
            owner_observation=owner_observation,
        )
        return Response(PersonReportsProblemOnConsumableSerializer(report).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="create-maintenance")
    def create_maintenance(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("maintenance_chief" not in role_codes):
            return Response({"error": "Only maintenance chiefs can create maintenance"}, status=status.HTTP_403_FORBIDDEN)

        item_type = request.data.get("item_type")
        report_id = request.data.get("report_id")
        technician_person_id = request.data.get("technician_person_id")
        description = request.data.get("description")
        destination_location_id = request.data.get("destination_location_id")

        if item_type not in {"asset", "stock_item", "consumable"}:
            return Response({"error": "Invalid item_type"}, status=status.HTTP_400_BAD_REQUEST)
        if not report_id:
            return Response({"error": "report_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not technician_person_id:
            return Response({"error": "technician_person_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if description is None or not str(description).strip():
            return Response(
                {"error": "description is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        description = str(description).strip()
        if len(description) > 256:
            return Response(
                {"error": "description must be at most 256 characters"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        technician = Person.objects.filter(person_id=technician_person_id).first()
        if not technician:
            return Response({"error": "Technician not found"}, status=status.HTTP_404_NOT_FOUND)

        if item_type != "asset":
            return Response(
                {"error": "Maintenance can only be created for assets in the current schema"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report = PersonReportsProblemOnAsset.objects.filter(report_id=report_id).first()
        if not report:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

        last_item = Maintenance.objects.order_by("-maintenance_id").first()
        next_maintenance_id = (last_item.maintenance_id + 1) if last_item else 1

        # Create included-item movements ONLY now (at maintenance creation time), using persisted selections.
        included_ctx = PersonReportsProblemOnAssetIncludedContext.objects.filter(report_id=report.report_id).first()
        included_destination_location_id = getattr(included_ctx, "destination_location_id", None) if included_ctx else None

        stock_item_ids_to_include = list(
            PersonReportsProblemOnAssetIncludedStockItem.objects.filter(report_id=report.report_id).values_list(
                "stock_item_id", flat=True
            )
        )
        consumable_ids_to_include = list(
            PersonReportsProblemOnAssetIncludedConsumable.objects.filter(report_id=report.report_id).values_list(
                "consumable_id", flat=True
            )
        )

        if (stock_item_ids_to_include or consumable_ids_to_include) and not included_destination_location_id:
            return Response(
                {"error": "Included items exist for this report but destination maintenance location is missing"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if stock_item_ids_to_include or consumable_ids_to_include:
            destination_location = Location.objects.filter(location_id=included_destination_location_id).first()
            if not destination_location:
                return Response({"error": "Destination location not found"}, status=status.HTTP_400_BAD_REQUEST)

            now_dt = timezone.now()

            last_stock_move = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
            next_stock_move_id = (last_stock_move.stock_item_movement_id + 1) if last_stock_move else 1

            for stock_item_id_int in stock_item_ids_to_include:
                last_accepted_move = (
                    StockItemMovement.objects.filter(stock_item_id=stock_item_id_int, status="accepted")
                    .order_by("-stock_item_movement_id")
                    .first()
                )
                last_move_any = (
                    StockItemMovement.objects.filter(stock_item_id=stock_item_id_int)
                    .order_by("-stock_item_movement_id")
                    .first()
                )
                if last_accepted_move:
                    source_location = last_accepted_move.destination_location
                elif last_move_any and getattr(last_move_any, "status", None) == "pending":
                    source_location = last_move_any.source_location
                elif last_move_any:
                    source_location = last_move_any.destination_location
                else:
                    source_location = destination_location

                _create_stock_item_movement_with_translations(
                    movement_reason="problem_report_include",
                    stock_item_movement_id=next_stock_move_id,
                    stock_item_id=stock_item_id_int,
                    source_location=source_location,
                    destination_location=destination_location,
                    maintenance_step=None,
                    external_maintenance_step_id=None,
                    maintenance_id=next_maintenance_id,
                    movement_datetime=now_dt,
                    status="pending",
                )
                next_stock_move_id += 1

            last_cons_move = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
            next_consumable_move_id = (last_cons_move.consumable_movement_id + 1) if last_cons_move else 1

            for consumable_id_int in consumable_ids_to_include:
                last_accepted_move = (
                    ConsumableMovement.objects.filter(consumable_id=consumable_id_int, status="accepted")
                    .order_by("-consumable_movement_id")
                    .first()
                )
                last_move_any = (
                    ConsumableMovement.objects.filter(consumable_id=consumable_id_int)
                    .order_by("-consumable_movement_id")
                    .first()
                )
                if last_accepted_move:
                    source_location = last_accepted_move.destination_location
                elif last_move_any and getattr(last_move_any, "status", None) == "pending":
                    source_location = last_move_any.source_location
                elif last_move_any:
                    source_location = last_move_any.destination_location
                else:
                    source_location = destination_location

                _create_consumable_movement_with_translations(
                    movement_reason="problem_report_include",
                    consumable_movement_id=next_consumable_move_id,
                    consumable_id=consumable_id_int,
                    source_location=source_location,
                    destination_location=destination_location,
                    maintenance_step=None,
                    external_maintenance_step_id=None,
                    maintenance_id=next_maintenance_id,
                    movement_datetime=now_dt,
                    status="pending",
                )
                next_consumable_move_id += 1

            # Clear persisted selections to prevent duplicates on repeated create-maintenance calls.
            try:
                PersonReportsProblemOnAssetIncludedStockItem.objects.filter(report_id=report.report_id).delete()
                PersonReportsProblemOnAssetIncludedConsumable.objects.filter(report_id=report.report_id).delete()
                PersonReportsProblemOnAssetIncludedContext.objects.filter(report_id=report.report_id).delete()
            except Exception:
                pass

        # If the asset is not currently in a maintenance location, creating a maintenance should initiate
        # an asset movement request (pending) to be approved by the asset responsible.
        asset_id = getattr(report, "asset_id", None)
        if asset_id:
            last_move = (
                AssetMovement.objects.select_related("destination_location", "destination_location__location_type")
                .filter(asset_id=asset_id)
                .order_by("-asset_movement_id")
                .first()
            )
            current_location = last_move.destination_location if last_move else None

            def _is_maintenance_location(location: Location | None) -> bool:
                if not location or not getattr(location, "location_type", None):
                    return False
                code = getattr(location.location_type, "location_type_code", None)
                label = (getattr(location.location_type, "location_type_label", None) or "").lower()
                if code and str(code).upper() in {"MR", "MAINTENANCE", "MAINT"}:
                    return True
                return "maintenance" in label

            # Always require an asset-responsible decision for maintenance creation.
            # If the asset is already in a maintenance location, we create a no-op movement (source=destination=current)
            # purely to represent the approval requirement.
            already_exists = AssetMovement.objects.filter(
                asset_id=asset_id,
                movement_reason="maintenance_create",
                maintenance_id=next_maintenance_id,
            ).exists()

            if not already_exists:
                if not current_location:
                    if not destination_location_id:
                        return Response(
                            {
                                "error": "Asset is not in a maintenance location. destination_location_id is required to request moving the asset to a maintenance location.",
                                "current_location": None,
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    try:
                        destination_location_id_int = int(destination_location_id)
                    except (TypeError, ValueError):
                        return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

                    destination_location = Location.objects.select_related("location_type").filter(location_id=destination_location_id_int).first()
                    if not destination_location:
                        return Response({"error": "Destination location not found"}, status=status.HTTP_404_NOT_FOUND)

                    if not _is_maintenance_location(destination_location):
                        return Response({"error": "destination_location_id must be a maintenance location"}, status=status.HTTP_400_BAD_REQUEST)

                    dest_location_id = destination_location.location_id
                    source_location_id = dest_location_id
                elif not _is_maintenance_location(current_location):
                    if not destination_location_id:
                        return Response(
                            {
                                "error": "Asset is not in a maintenance location. destination_location_id is required to request moving the asset to a maintenance location.",
                                "current_location": LocationSerializer(current_location).data if current_location else None,
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    try:
                        destination_location_id_int = int(destination_location_id)
                    except (TypeError, ValueError):
                        return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

                    destination_location = Location.objects.select_related("location_type").filter(location_id=destination_location_id_int).first()
                    if not destination_location:
                        return Response({"error": "Destination location not found"}, status=status.HTTP_404_NOT_FOUND)

                    if not _is_maintenance_location(destination_location):
                        return Response({"error": "destination_location_id must be a maintenance location"}, status=status.HTTP_400_BAD_REQUEST)

                    dest_location_id = destination_location.location_id
                    source_location_id = current_location.location_id
                else:
                    dest_location_id = current_location.location_id
                    source_location_id = current_location.location_id

                last_asset_move = AssetMovement.objects.order_by("-asset_movement_id").first()
                next_asset_move_id = (last_asset_move.asset_movement_id + 1) if last_asset_move else 1
                _create_asset_movement_with_translations(
                    movement_reason_en="maintenance_create",
                    asset_movement_id=next_asset_move_id,
                    asset_id=asset_id,
                    source_location_id=source_location_id,
                    destination_location_id=dest_location_id,
                    maintenance_step_id=None,
                    external_maintenance_step_id=None,
                    maintenance_id=next_maintenance_id,
                    movement_datetime=timezone.now(),
                    status="pending",
                )

        next_id = next_maintenance_id
        try:
            maintenance = Maintenance.objects.create(
                maintenance_id=next_id,
                performed_by_person=technician,
                approved_by_maintenance_chief=user_account.person,
                maintenance_status="pending",
                description=description,
                start_datetime=None,
                end_datetime=None,
                asset_id=report.asset_id,
                is_approved_by_maintenance_chief=True,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create maintenance due to database constraints.",
                    "details": "Check required fields and uniqueness constraints.",
                    "details": "Check required fields in Maintenance model (approved_by_maintenance_chief, end_datetime, etc.)",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(MaintenanceSerializer(maintenance).data, status=status.HTTP_201_CREATED)
def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


class LoginView(APIView):
    """Handle user authentication."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        with open("api_debug.log", "a") as f:
            f.write(f"\n[{timezone.now()}] Login attempt for: {username}\n")

        try:
            user = UserAccount.objects.select_related("person").get(username=username)
        except UserAccount.DoesNotExist:
            with open("api_debug.log", "a") as f:
                f.write(f"User not found: {username}\n")
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        password_hash = hash_password(password)
        if user.password_hash != password_hash:
            with open("api_debug.log", "a") as f:
                f.write(f"Password mismatch for user: {username}\n")
            user.failed_login_attempts += 1
            user.save(update_fields=["failed_login_attempts"])
            
            # Log failure
            last_log = AuthenticationLog.objects.order_by("-log_id").first()
            next_log_id = (last_log.log_id + 1) if last_log else 1
            AuthenticationLog.objects.create(
                log_id=next_log_id,
                user=user,
                attempted_username=username[:50],
                event_type="LOGIN_FAILURE",
                ip_address=get_client_ip(request),
                event_timestamp=timezone.now(),
                failure_reason="Invalid Password"
            )
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if user.account_status != "active":
            return Response({"error": "Account is not active"}, status=status.HTTP_403_FORBIDDEN)

        if not user.is_approved:
            return Response({"error": "Account pending approval"}, status=status.HTTP_403_FORBIDDEN)

        user.last_login = timezone.now()
        user.failed_login_attempts = 0
        user.save(update_fields=["last_login", "failed_login_attempts"])

        # Log success
        last_log = AuthenticationLog.objects.order_by("-log_id").first()
        next_log_id = (last_log.log_id + 1) if last_log else 1
        AuthenticationLog.objects.create(
            log_id=next_log_id,
            user=user,
            attempted_username=username[:50],
            event_type="LOGIN_SUCCESS",
            ip_address=get_client_ip(request),
            event_timestamp=timezone.now(),
        )

        # Create session
        last_sess = UserSession.objects.order_by("-session_id").first()
        next_sess_id = (last_sess.session_id + 1) if last_sess else 1
        user_session = UserSession.objects.create(
            session_id=next_sess_id,
            user=user,
            ip_address=get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:60],
            login_datetime=timezone.now(),
            last_activity=timezone.now(),
        )

        refresh = RefreshToken()
        refresh["user_id"] = user.user_id
        refresh["username"] = user.username
        refresh["is_superuser"] = user.is_superuser()
        refresh["session_id"] = user_session.session_id

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserProfileSerializer(user).data,
            }
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.auth.get("session_id")
        if session_id:
            UserSession.objects.filter(session_id=session_id).update(logout_datetime=timezone.now())

            last_log = AuthenticationLog.objects.order_by("-log_id").first()
            next_log_id = (last_log.log_id + 1) if last_log else 1
            AuthenticationLog.objects.create(
                log_id=next_log_id,
                user=request.user,
                event_type="LOGOUT",
                ip_address=get_client_ip(request),
                event_timestamp=timezone.now(),
            )

        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


class UserSessionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSessionSerializer

    def get_queryset(self):
        return UserSession.objects.filter(user=self.request.user, logout_datetime__isnull=True).order_by(
            "-login_datetime"
        )

    @action(detail=True, methods=["post"])
    def terminate(self, request, pk=None):
        session = self.get_object()
        if session.user_id != request.user.user_id:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        session.logout_datetime = timezone.now()
        session.save()
        return Response({"status": "session terminated"})


class AuthenticationLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AuthenticationLogSerializer

    def get_queryset(self):
        return AuthenticationLog.objects.filter(user=self.request.user).order_by("-event_timestamp")


class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all().order_by("person_id")
    serializer_class = PersonSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Person.objects.all().order_by("person_id")
        is_approved = self.request.query_params.get("is_approved")
        if is_approved is not None:
            queryset = queryset.filter(is_approved=is_approved.lower() == "true")

        role = self.request.query_params.get("role")
        if role is not None:
            queryset = queryset.filter(personrolemapping__role__role_code=role).distinct()

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_person = Person.objects.order_by("-person_id").first()
        next_id = (last_person.person_id + 1) if last_person else 1
        translations_data = serializer.validated_data.pop('translations', None)
        person = Person.objects.create(person_id=next_id, **serializer.validated_data)

        # Always save English translation from first_name/last_name
        try:
            if not translations_data:
                translations_data = {}
            if 'en' not in translations_data:
                translations_data['en'] = {}
            if person.first_name:
                translations_data['en']['first_name'] = person.first_name
            if person.last_name:
                translations_data['en']['last_name'] = person.last_name
            from api.utils.i18n import save_translations
            save_translations(person, translations_data)
        except (json.JSONDecodeError, TypeError):
            pass

        return Response(PersonSerializer(person).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        translations_data = serializer.validated_data.pop('translations', None)
        serializer.save()

        # Always save English translation from first_name/last_name
        try:
            if not translations_data:
                translations_data = {}
            if 'en' not in translations_data:
                translations_data['en'] = {}
            if instance.first_name:
                translations_data['en']['first_name'] = instance.first_name
            if instance.last_name:
                translations_data['en']['last_name'] = instance.last_name
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        except (json.JSONDecodeError, TypeError):
            pass

        return Response(PersonSerializer(instance).data)


class AssetTypeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetType.objects.all().order_by("asset_type_id")
    serializer_class = AssetTypeSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create asset types")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        last_type = AssetType.objects.all().order_by("-asset_type_id").first()
        next_id = (last_type.asset_type_id + 1) if last_type else 1
        
        translations_data = serializer.validated_data.pop('translations', None)
        asset_type = AssetType.objects.create(asset_type_id=next_id, **serializer.validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(asset_type, translations_data)
        return Response(AssetTypeSerializer(asset_type).data, status=status.HTTP_201_CREATED)


class AssetBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetBrand.objects.all().order_by("asset_brand_id")
    serializer_class = AssetBrandSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create asset brands")
        if denial:
            return denial

        translations_data = request.data.get('translations')
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        mutable_data.pop('translations', None)

        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        validated_data.pop('translations', None)

        last_brand = AssetBrand.objects.all().order_by("-asset_brand_id").first()
        next_id = (last_brand.asset_brand_id + 1) if last_brand else 1

        try:
            brand = AssetBrand.objects.create(
                asset_brand_id=next_id,
                **validated_data,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create asset brand due to database constraints.",
                    "details": "Check required fields and uniqueness constraints.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Always save English translation from brand_name
        try:
            translations_dict = json.loads(translations_data) if translations_data and isinstance(translations_data, str) else (translations_data or {})
            if not isinstance(translations_dict, dict):
                translations_dict = {}
            if brand.brand_name:
                if 'en' not in translations_dict:
                    translations_dict['en'] = {}
                translations_dict['en']['brand_name'] = brand.brand_name
            from api.utils.i18n import save_translations
            save_translations(brand, translations_dict)
        except (json.JSONDecodeError, TypeError):
            pass

        return Response(self.get_serializer(brand).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        translations_data = request.data.get('translations')
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        mutable_data.pop('translations', None)

        serializer = self.get_serializer(instance, data=mutable_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.validated_data.pop('translations', None)
        serializer.save()

        # Always save English translation from brand_name
        try:
            translations_dict = json.loads(translations_data) if translations_data and isinstance(translations_data, str) else (translations_data or {})
            if not isinstance(translations_dict, dict):
                translations_dict = {}
            if instance.brand_name:
                if 'en' not in translations_dict:
                    translations_dict['en'] = {}
                translations_dict['en']['brand_name'] = instance.brand_name
            from api.utils.i18n import save_translations
            save_translations(instance, translations_dict)
        except (json.JSONDecodeError, TypeError):
            pass

        return Response(self.get_serializer(instance).data)


class AssetModelViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetModel.objects.all().order_by("asset_model_id")
    serializer_class = AssetModelSerializer

    def _insert_compatibility_row(self, table_name, columns, values):
        with connection.cursor() as cursor:
            cols = ",".join(columns)
            placeholders = ",".join(["%s"] * len(values))
            cursor.execute(
                f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders}) ON CONFLICT DO NOTHING",
                values,
            )

    def _delete_compatibility_row(self, table_name, where_columns, where_values):
        with connection.cursor() as cursor:
            where_sql = " AND ".join([f"{c} = %s" for c in where_columns])
            cursor.execute(
                f"DELETE FROM {table_name} WHERE {where_sql}",
                where_values,
            )

    @action(detail=True, methods=["get", "post"], url_path="compatible-stock-item-models")
    def compatible_stock_item_models(self, request, pk=None):
        asset_model = self.get_object()

        if request.method.lower() == "get":
            ids = list(
                StockItemIsCompatibleWithAsset.objects.filter(asset_model_id=asset_model.asset_model_id).values_list(
                    "stock_item_model_id", flat=True
                )
            )
            models = StockItemModel.objects.select_related("stock_item_brand", "stock_item_type").filter(
                stock_item_model_id__in=ids
            )
            return Response(StockItemModelSerializer(models, many=True).data, status=status.HTTP_200_OK)

        denial = self._require_superuser(request, "update asset model compatibility")
        if denial:
            return denial

        stock_item_model_id = request.data.get("stock_item_model_id")
        if not stock_item_model_id:
            return Response({"error": "stock_item_model_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            stock_item_model_id_int = int(stock_item_model_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid stock_item_model_id"}, status=status.HTTP_400_BAD_REQUEST)

        if not StockItemModel.objects.filter(stock_item_model_id=stock_item_model_id_int).exists():
            return Response({"error": "Stock item model not found"}, status=status.HTTP_404_NOT_FOUND)

        self._insert_compatibility_row(
            "public.stock_item_is_compatible_with_asset",
            ["stock_item_model_id", "asset_model_id"],
            [stock_item_model_id_int, asset_model.asset_model_id],
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["delete"],
        url_path=r"compatible-stock-item-models/(?P<stock_item_model_id>[^/.]+)",
    )
    def remove_compatible_stock_item_model(self, request, pk=None, stock_item_model_id=None):
        denial = self._require_superuser(request, "update asset model compatibility")
        if denial:
            return denial

        asset_model = self.get_object()
        try:
            stock_item_model_id_int = int(stock_item_model_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid stock_item_model_id"}, status=status.HTTP_400_BAD_REQUEST)

        self._delete_compatibility_row(
            "public.stock_item_is_compatible_with_asset",
            ["stock_item_model_id", "asset_model_id"],
            [stock_item_model_id_int, asset_model.asset_model_id],
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get", "post"], url_path="compatible-consumable-models")
    def compatible_consumable_models(self, request, pk=None):
        asset_model = self.get_object()

        if request.method.lower() == "get":
            ids = list(
                ConsumableIsCompatibleWithAsset.objects.filter(asset_model_id=asset_model.asset_model_id).values_list(
                    "consumable_model_id", flat=True
                )
            )
            models = ConsumableModel.objects.select_related("consumable_brand", "consumable_type").filter(
                consumable_model_id__in=ids
            )
            return Response(ConsumableModelSerializer(models, many=True).data, status=status.HTTP_200_OK)

        denial = self._require_superuser(request, "update asset model compatibility")
        if denial:
            return denial

        consumable_model_id = request.data.get("consumable_model_id")
        if not consumable_model_id:
            return Response({"error": "consumable_model_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            consumable_model_id_int = int(consumable_model_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid consumable_model_id"}, status=status.HTTP_400_BAD_REQUEST)

        if not ConsumableModel.objects.filter(consumable_model_id=consumable_model_id_int).exists():
            return Response({"error": "Consumable model not found"}, status=status.HTTP_404_NOT_FOUND)

        self._insert_compatibility_row(
            "public.consumable_is_compatible_with_asset",
            ["consumable_model_id", "asset_model_id"],
            [consumable_model_id_int, asset_model.asset_model_id],
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["delete"],
        url_path=r"compatible-consumable-models/(?P<consumable_model_id>[^/.]+)",
    )
    def remove_compatible_consumable_model(self, request, pk=None, consumable_model_id=None):
        denial = self._require_superuser(request, "update asset model compatibility")
        if denial:
            return denial

        asset_model = self.get_object()
        try:
            consumable_model_id_int = int(consumable_model_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid consumable_model_id"}, status=status.HTTP_400_BAD_REQUEST)

        self._delete_compatibility_row(
            "public.consumable_is_compatible_with_asset",
            ["consumable_model_id", "asset_model_id"],
            [consumable_model_id_int, asset_model.asset_model_id],
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)

    def get_queryset(self):
        queryset = AssetModel.objects.select_related("asset_brand", "asset_type").order_by("asset_model_id")
        asset_type_id = self.request.query_params.get("asset_type")
        if asset_type_id is not None:
            try:
                queryset = queryset.filter(asset_type_id=int(asset_type_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create asset models")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        translations_data = serializer.validated_data.pop('translations', None)

        last_model = AssetModel.objects.all().order_by("-asset_model_id").first()
        next_id = (last_model.asset_model_id + 1) if last_model else 1

        asset_model = AssetModel.objects.create(asset_model_id=next_id, **serializer.validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(asset_model, translations_data)
        _sync_asset_model_attribute_values(asset_model)
        return Response(AssetModelSerializer(asset_model).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        _sync_asset_model_attribute_values(instance)
        return response


class AssetModelDefaultStockItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing default stock items included with asset models"""
    queryset = AssetModelDefaultStockItem.objects.all().order_by('asset_model__model_name')
    serializer_class = AssetModelDefaultStockItemSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AssetModelDefaultConsumableViewSet(viewsets.ModelViewSet):
    """ViewSet for managing default consumables included with asset models"""
    queryset = AssetModelDefaultConsumable.objects.all().order_by('asset_model__model_name')
    serializer_class = AssetModelDefaultConsumableSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AssetViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by("asset_id")
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        queryset = queryset.prefetch_related(
            Prefetch(
                'stock_item_composition_history',
                queryset=AssetIsComposedOfStockItemHistory.objects.filter(
                    end_datetime__isnull=True
                ).select_related('stock_item'),
                to_attr='_current_stock_items',
            ),
            Prefetch(
                'consumable_composition_history',
                queryset=AssetIsComposedOfConsumableHistory.objects.filter(
                    end_datetime__isnull=True
                ).select_related('consumable'),
                to_attr='_current_consumables',
            ),
        )

        queryset = queryset.annotate(
            failed_external_maintenance_id=Subquery(
                AssetFailedExternalMaintenance.objects.filter(asset_id=OuterRef("asset_id"))
                .values("external_maintenance_id")[:1]
            )
        )

        status_param = self.request.query_params.get("asset_status")
        if status_param is not None:
            queryset = queryset.filter(asset_status=status_param)

        failed_via_external = self.request.query_params.get("failed_via_external_maintenance")
        if failed_via_external is not None and str(failed_via_external).strip().lower() in {"1", "true", "yes"}:
            queryset = queryset.filter(failed_external_maintenance_id__isnull=False)

        destruction_certificate_id = self.request.query_params.get("destruction_certificate_id")
        if destruction_certificate_id is not None:
            try:
                queryset = queryset.filter(destruction_certificate_id=int(destruction_certificate_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def _sync_composed_items_status_with_asset(self, asset):
        if not asset:
            return
        target_status = getattr(asset, "asset_status", None)
        if not target_status:
            return

        stock_item_ids = list(
            AssetIsComposedOfStockItemHistory.objects.filter(
                asset_id=asset.asset_id,
                end_datetime__isnull=True,
            ).values_list("stock_item_id", flat=True)
        )
        consumable_ids = list(
            AssetIsComposedOfConsumableHistory.objects.filter(
                asset_id=asset.asset_id,
                end_datetime__isnull=True,
            ).values_list("consumable_id", flat=True)
        )

        from api.utils.i18n import bulk_sync_status_translations
        if stock_item_ids:
            bulk_sync_status_translations(StockItem, {'stock_item_id__in': stock_item_ids}, target_status)
        if consumable_ids:
            bulk_sync_status_translations(Consumable, {'consumable_id__in': consumable_ids}, target_status)

    def update(self, request, *args, **kwargs):
        asset_status = request.data.get("asset_status")
        if isinstance(asset_status, str) and asset_status.strip().lower() == "failed":
            return Response(
                {"error": "Asset status can only be set to failed during external maintenance."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if isinstance(asset_status, str) and asset_status.strip().lower() == "suggested_for_destruction":
            return Response(
                {"error": "Asset status can only be set to suggested_for_destruction by a maintenance chief."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if isinstance(asset_status, str) and asset_status.strip().lower() == "destroyed":
            return Response(
                {"error": "Asset status can only be set to destroyed by validating a destruction certificate."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        response = super().update(request, *args, **kwargs)
        if response.status_code < 400:
            asset = self.get_object()
            # Handle translations from request data
            from api.utils.i18n import save_translations, translate_status
            translations_data = request.data.get('translations')
            if translations_data and isinstance(translations_data, dict):
                en_data = translations_data.get('en', {})
                if asset.asset_name and 'asset_name' not in en_data:
                    en_data['asset_name'] = asset.asset_name
                    translations_data['en'] = en_data
                if asset.asset_status and 'asset_status' not in en_data:
                    en_data['asset_status'] = translate_status(asset.asset_status, 'en')
                    translations_data['en'] = en_data
                ar_data = translations_data.get('ar', {})
                if asset.asset_name and 'asset_name' not in ar_data:
                    ar_data['asset_name'] = asset.asset_name
                    translations_data['ar'] = ar_data
                if asset.asset_status and 'asset_status' not in ar_data:
                    ar_data['asset_status'] = translate_status(asset.asset_status, 'ar')
                    translations_data['ar'] = ar_data
                save_translations(asset, translations_data)
            elif asset.asset_name or asset.asset_status:
                en_entry = {}
                if asset.asset_name:
                    en_entry['asset_name'] = asset.asset_name
                if asset.asset_status:
                    en_entry['asset_status'] = translate_status(asset.asset_status, 'en')
                ar_entry = {}
                if asset.asset_name:
                    ar_entry['asset_name'] = asset.asset_name
                if asset.asset_status:
                    ar_entry['asset_status'] = translate_status(asset.asset_status, 'ar')
                save_translations(asset, {'en': en_entry, 'ar': ar_entry})
            if "asset_status" in request.data:
                from api.utils.i18n import sync_status_translations
                sync_status_translations(asset, asset.asset_status)
                self._sync_composed_items_status_with_asset(asset)
        return response

    def partial_update(self, request, *args, **kwargs):
        asset_status = request.data.get("asset_status")
        if isinstance(asset_status, str) and asset_status.strip().lower() == "failed":
            return Response(
                {"error": "Asset status can only be set to failed during external maintenance."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if isinstance(asset_status, str) and asset_status.strip().lower() == "suggested_for_destruction":
            return Response(
                {"error": "Asset status can only be set to suggested_for_destruction by a maintenance chief."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if isinstance(asset_status, str) and asset_status.strip().lower() == "destroyed":
            return Response(
                {"error": "Asset status can only be set to destroyed by validating a destruction certificate."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        response = super().partial_update(request, *args, **kwargs)
        if response.status_code < 400:
            asset = self.get_object()
            # Handle translations from request data
            from api.utils.i18n import save_translations, translate_status
            translations_data = request.data.get('translations')
            if translations_data and isinstance(translations_data, dict):
                en_data = translations_data.get('en', {})
                if asset.asset_name and 'asset_name' not in en_data:
                    en_data['asset_name'] = asset.asset_name
                    translations_data['en'] = en_data
                if asset.asset_status and 'asset_status' not in en_data:
                    en_data['asset_status'] = translate_status(asset.asset_status, 'en')
                    translations_data['en'] = en_data
                ar_data = translations_data.get('ar', {})
                if asset.asset_name and 'asset_name' not in ar_data:
                    ar_data['asset_name'] = asset.asset_name
                    translations_data['ar'] = ar_data
                if asset.asset_status and 'asset_status' not in ar_data:
                    ar_data['asset_status'] = translate_status(asset.asset_status, 'ar')
                    translations_data['ar'] = ar_data
                save_translations(asset, translations_data)
            elif asset.asset_name or asset.asset_status:
                en_entry = {}
                if asset.asset_name:
                    en_entry['asset_name'] = asset.asset_name
                if asset.asset_status:
                    en_entry['asset_status'] = translate_status(asset.asset_status, 'en')
                ar_entry = {}
                if asset.asset_name:
                    ar_entry['asset_name'] = asset.asset_name
                if asset.asset_status:
                    ar_entry['asset_status'] = translate_status(asset.asset_status, 'ar')
                save_translations(asset, {'en': en_entry, 'ar': ar_entry})
            if "asset_status" in request.data:
                from api.utils.i18n import sync_status_translations
                sync_status_translations(asset, asset.asset_status)
                self._sync_composed_items_status_with_asset(asset)
        return response

    @action(detail=True, methods=["post"], url_path="suggest-for-destruction")
    def suggest_for_destruction(self, request, pk=None):
        user_account = self._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("maintenance_chief" not in role_codes):
            return Response(
                {"error": "Only maintenance chief can suggest for destruction"},
                status=status.HTTP_403_FORBIDDEN,
            )

        asset = self.get_object()
        current = (getattr(asset, "asset_status", None) or "").strip().lower()
        if current != "failed":
            return Response(
                {"error": "Asset must have status 'failed' before it can be suggested for destruction"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if getattr(asset, "destruction_certificate_id", None):
            return Response(
                {"error": "Asset is already linked to a destruction certificate"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get selected items for destruction from request
        stock_item_ids = request.data.get("stock_item_ids", [])
        consumable_ids = request.data.get("consumable_ids", [])
        storage_location_id = request.data.get("storage_location_id")

        now = timezone.now()
        
        # 1. Update asset status
        from api.utils.i18n import bulk_sync_status_translations
        bulk_sync_status_translations(Asset, {'asset_id': asset.asset_id}, 'suggested_for_destruction')
        
        # 2. Handle Stock Items
        from .models import AssetIsComposedOfStockItemHistory, StockItem, StockItemMovement
        current_stock_items = AssetIsComposedOfStockItemHistory.objects.filter(asset=asset, end_datetime__isnull=True)
        
        for mapping in current_stock_items:
            si = mapping.stock_item
            if si.stock_item_id in stock_item_ids:
                # Suggest for destruction
                from api.utils.i18n import bulk_sync_status_translations as _bsct_si
                _bsct_si(StockItem, {'stock_item_id': si.stock_item_id}, 'suggested_for_destruction')
            else:
                # Move to storage (creates pending movement)
                if storage_location_id:
                    # End composition
                    mapping.end_datetime = now
                    mapping.save()
                    
                    # Create movement request
                    last_move = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
                    next_id = (last_move.stock_item_movement_id + 1) if last_move else 1
                    
                    # Find current location (usually where the asset is)
                    asset_last_move = AssetMovement.objects.filter(asset=asset).order_by("-asset_movement_id").first()
                    source_loc_id = asset_last_move.destination_location_id if asset_last_move else None
                    
                    if source_loc_id:
                        _create_stock_item_movement_with_translations(
                            movement_reason="destruction_item_recovered",
                            stock_item_movement_id=next_id,
                            stock_item=si,
                            source_location_id=source_loc_id,
                            destination_location_id=storage_location_id,
                            movement_datetime=now,
                            status="pending"
                        )

        # 3. Handle Consumables
        from .models import AssetIsComposedOfConsumableHistory, Consumable, ConsumableMovement
        current_consumables = AssetIsComposedOfConsumableHistory.objects.filter(asset=asset, end_datetime__isnull=True)
        
        for mapping in current_consumables:
            c = mapping.consumable
            if c.consumable_id in consumable_ids:
                # Suggest for destruction
                from api.utils.i18n import bulk_sync_status_translations as _bsct_co
                _bsct_co(Consumable, {'consumable_id': c.consumable_id}, 'suggested_for_destruction')
            else:
                # Move to storage (creates pending movement)
                if storage_location_id:
                    # End composition
                    mapping.end_datetime = now
                    mapping.save()
                    
                    # Create movement request
                    last_move = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
                    next_id = (last_move.consumable_movement_id + 1) if last_move else 1
                    
                    # Find current location
                    asset_last_move = AssetMovement.objects.filter(asset=asset).order_by("-asset_movement_id").first()
                    source_loc_id = asset_last_move.destination_location_id if asset_last_move else None
                    
                    if source_loc_id:
                        _create_consumable_movement_with_translations(
                            movement_reason="destruction_item_recovered",
                            consumable_movement_id=next_id,
                            consumable=c,
                            source_location_id=source_loc_id,
                            destination_location_id=storage_location_id,
                            movement_datetime=now,
                            status="pending"
                        )

        asset.refresh_from_db()
        return Response(self.get_serializer(asset).data, status=status.HTTP_200_OK)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Debug: log incoming data
        print(f"[AssetViewSet.create] request.data: {request.data}")
        print(f"[AssetViewSet.create] validated_data keys: {list(serializer.validated_data.keys())}")
        
        # Extract included items before creating the asset
        included_stock_items = serializer.validated_data.pop('included_stock_items', [])
        included_consumables = serializer.validated_data.pop('included_consumables', [])
        
        print(f"[AssetViewSet.create] included_stock_items: {included_stock_items}")
        print(f"[AssetViewSet.create] included_consumables: {included_consumables}")
        
        # Extract translations before creating the asset
        translations_data = serializer.validated_data.pop('translations', None)
        
        # Make a clean copy of validated_data without the extra fields
        asset_data = {k: v for k, v in serializer.validated_data.items() 
                      if k not in ('included_stock_items', 'included_consumables', 'translations')}
        
        print(f"[AssetViewSet.create] asset_data keys: {list(asset_data.keys())}")
        
        # Get the last asset to determine next ID
        last_asset = Asset.objects.order_by("-asset_id").first()
        next_asset_id = (last_asset.asset_id + 1) if last_asset else 1
        
        # Create the asset with only model fields
        asset = Asset.objects.create(asset_id=next_asset_id, **asset_data)
        
        # Save translations (both en and ar rows with name and status)
        from api.utils.i18n import save_translations, translate_status
        if translations_data:
            en_data = translations_data.get('en', {})
            if asset.asset_name and 'asset_name' not in en_data:
                en_data['asset_name'] = asset.asset_name
                translations_data['en'] = en_data
            if asset.asset_status and 'asset_status' not in en_data:
                en_data['asset_status'] = translate_status(asset.asset_status, 'en')
                translations_data['en'] = en_data
            ar_data = translations_data.get('ar', {})
            if asset.asset_name and 'asset_name' not in ar_data:
                ar_data['asset_name'] = asset.asset_name
                translations_data['ar'] = ar_data
            if asset.asset_status and 'asset_status' not in ar_data:
                ar_data['asset_status'] = translate_status(asset.asset_status, 'ar')
                translations_data['ar'] = ar_data
            save_translations(asset, translations_data)
        elif asset.asset_name or asset.asset_status:
            en_entry = {}
            if asset.asset_name:
                en_entry['asset_name'] = asset.asset_name
            if asset.asset_status:
                en_entry['asset_status'] = translate_status(asset.asset_status, 'en')
            ar_entry = {}
            if asset.asset_name:
                ar_entry['asset_name'] = asset.asset_name
            if asset.asset_status:
                ar_entry['asset_status'] = translate_status(asset.asset_status, 'ar')
            save_translations(asset, {'en': en_entry, 'ar': ar_entry})
        
        # If asset has an attribution_order, create default composition
        attribution_order_obj = serializer.validated_data.get('attribution_order')
        attribution_order_id = getattr(attribution_order_obj, 'attribution_order_id', attribution_order_obj)
        asset_model_obj = serializer.validated_data.get('asset_model')
        asset_model_id = getattr(asset_model_obj, 'asset_model_id', asset_model_obj)
        
        if attribution_order_id and asset_model_id:
            if included_stock_items or included_consumables:
                self._create_included_items(asset, attribution_order_id, included_stock_items, included_consumables)
            else:
                self._create_default_composition(asset, asset_model_id, attribution_order_id)

        _sync_asset_attribute_values(asset)
        
        return Response(self.get_serializer(asset).data, status=status.HTTP_201_CREATED)

    def _create_included_items(self, asset, attribution_order_id, included_stock_items, included_consumables):
        now = timezone.now()

        for item in (included_stock_items or []):
            stock_item_model_id = item.get('stock_item_model')
            quantity = int(item.get('quantity') or 1)
            instances = item.get('instances') if isinstance(item, dict) else None
            if not stock_item_model_id or quantity < 1:
                continue

            for _ in range(quantity):
                last_si = StockItem.objects.order_by("-stock_item_id").first()
                next_si_id = (last_si.stock_item_id + 1) if last_si else 1

                inst_payload = None
                if isinstance(instances, list) and len(instances) > 0:
                    inst_payload = instances.pop(0)

                stock_item = StockItem.objects.create(
                    stock_item_id=next_si_id,
                    stock_item_model_id=stock_item_model_id,
                    stock_item_name=(inst_payload or {}).get('stock_item_name') or f"Stock item model {stock_item_model_id} (included with {asset})",
                    stock_item_inventory_number=(inst_payload or {}).get('stock_item_inventory_number') or None,
                    stock_item_status='not_delivered_to_company'
                )

                AssetIsComposedOfStockItemHistory.objects.create(
                    stock_item=stock_item,
                    asset=asset,
                    maintenance_step=None,
                    attribution_order_id=attribution_order_id,
                    start_datetime=now,
                    end_datetime=None
                )

        for item in (included_consumables or []):
            consumable_model_id = item.get('consumable_model')
            quantity = int(item.get('quantity') or 1)
            instances = item.get('instances') if isinstance(item, dict) else None
            if not consumable_model_id or quantity < 1:
                continue

            for _ in range(quantity):
                last_cons = Consumable.objects.order_by("-consumable_id").first()
                next_cons_id = (last_cons.consumable_id + 1) if last_cons else 1

                inst_payload = None
                if isinstance(instances, list) and len(instances) > 0:
                    inst_payload = instances.pop(0)

                consumable = Consumable.objects.create(
                    consumable_id=next_cons_id,
                    consumable_model_id=consumable_model_id,
                    consumable_name=(inst_payload or {}).get('consumable_name') or f"Consumable model {consumable_model_id} (included with {asset})",
                    consumable_serial_number=(inst_payload or {}).get('consumable_serial_number') or None,
                    consumable_inventory_number=(inst_payload or {}).get('consumable_inventory_number') or None,
                    consumable_status='not_delivered_to_company'
                )

                AssetIsComposedOfConsumableHistory.objects.create(
                    consumable=consumable,
                    asset=asset,
                    maintenance_step=None,
                    attribution_order_id=attribution_order_id,
                    start_datetime=now,
                    end_datetime=None
                )
    
    def _create_default_composition(self, asset, asset_model_id, attribution_order_id):
        """Create stock items/consumables based on asset model defaults and record composition history"""
        now = timezone.now()
        
        # Get default stock items for this asset model
        default_stock_items = AssetModelDefaultStockItem.objects.filter(
            asset_model_id=asset_model_id
        ).select_related('stock_item_model')
        
        for default_item in default_stock_items:
            # Create StockItem records for each quantity
            for _ in range(default_item.quantity):
                last_si = StockItem.objects.order_by("-stock_item_id").first()
                next_si_id = (last_si.stock_item_id + 1) if last_si else 1
                
                stock_item = StockItem.objects.create(
                    stock_item_id=next_si_id,
                    stock_item_model_id=default_item.stock_item_model_id,
                    stock_item_name=f"{default_item.stock_item_model} (included with {asset})",
                    stock_item_status='not_delivered_to_company'
                )
                
                # Record composition history
                AssetIsComposedOfStockItemHistory.objects.create(
                    stock_item=stock_item,
                    asset=asset,
                    maintenance_step=None,
                    attribution_order_id=attribution_order_id,
                    start_datetime=now,
                    end_datetime=None
                )
        
        # Get default consumables for this asset model
        default_consumables = AssetModelDefaultConsumable.objects.filter(
            asset_model_id=asset_model_id
        ).select_related('consumable_model')
        
        for default_item in default_consumables:
            # Create Consumable records for each quantity
            for _ in range(default_item.quantity):
                last_cons = Consumable.objects.order_by("-consumable_id").first()
                next_cons_id = (last_cons.consumable_id + 1) if last_cons else 1
                
                consumable = Consumable.objects.create(
                    consumable_id=next_cons_id,
                    consumable_model_id=default_item.consumable_model_id,
                    consumable_name=f"{default_item.consumable_model} (included with {asset})",
                    consumable_status='not_delivered_to_company'
                )
                
                # Record composition history
                AssetIsComposedOfConsumableHistory.objects.create(
                    consumable=consumable,
                    asset=asset,
                    maintenance_step=None,
                    attribution_order_id=attribution_order_id,
                    start_datetime=now,
                    end_datetime=None
                )

    @action(detail=True, methods=["get"], url_path="current-location")
    def current_location(self, request, pk=None):
        asset = self.get_object()
        last_move = (
            AssetMovement.objects.select_related("destination_location", "destination_location__location_type")
            .filter(asset_id=asset.asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_location_id:
            return Response({"location": None}, status=status.HTTP_200_OK)
        return Response({"location": LocationSerializer(last_move.destination_location).data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="move")
    def move(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_account.is_superuser():
            allowed = True
        else:
            person = getattr(user_account, "person", None)
            if not person:
                return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)
            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            allowed = ("asset_responsible" in role_codes) or ("exploitation_chief" in role_codes) or ("it_bureau_chief" in role_codes)

        if not allowed:
            return Response(
                {"error": "Only Asset Responsible or superiors can move assets"},
                status=status.HTTP_403_FORBIDDEN,
            )

        asset = self.get_object()
        destination_location_id = request.data.get("destination_location_id")
        movement_reason = request.data.get("movement_reason") or "manual_move"
        movement_reason_ar = request.data.get("movement_reason_ar") or None
        if not destination_location_id:
            return Response({"error": "destination_location_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            destination_location_id_int = int(destination_location_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_location = Location.objects.filter(location_id=destination_location_id_int).first()
        if not destination_location:
            return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        last_move = (
            AssetMovement.objects.select_related("destination_location")
            .filter(asset_id=asset.asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_location_id:
            last_asset_move = AssetMovement.objects.order_by("-asset_movement_id").first()
            next_asset_move_id = (last_asset_move.asset_movement_id + 1) if last_asset_move else 1

            _create_asset_movement_with_translations(
                movement_reason_en=movement_reason,
                movement_reason_ar=movement_reason_ar,
                asset_movement_id=next_asset_move_id,
                asset=asset,
                source_location=destination_location,
                destination_location=destination_location,
                maintenance_step=None,
                external_maintenance_step_id=None,
                movement_datetime=timezone.now(),
            )

            return Response(
                {
                    "asset_movement_id": next_asset_move_id,
                    "source_location_id": destination_location.location_id,
                    "destination_location_id": destination_location.location_id,
                },
                status=status.HTTP_201_CREATED,
            )

        source_location = last_move.destination_location
        if source_location.location_id == destination_location.location_id:
            return Response({"error": "Asset is already in this location"}, status=status.HTTP_400_BAD_REQUEST)

        last_asset_move = AssetMovement.objects.order_by("-asset_movement_id").first()
        next_asset_move_id = (last_asset_move.asset_movement_id + 1) if last_asset_move else 1

        _create_asset_movement_with_translations(
            movement_reason_en=movement_reason,
            movement_reason_ar=movement_reason_ar,
            asset_movement_id=next_asset_move_id,
            asset=asset,
            source_location=source_location,
            destination_location=destination_location,
            maintenance_step=None,
            external_maintenance_step_id=None,
            movement_datetime=timezone.now(),
        )

        _cascade_move_composed_items(
            asset_id=asset.asset_id,
            source_location_id=source_location.location_id,
            destination_location_id=destination_location.location_id,
            movement_reason=movement_reason,
            movement_datetime=timezone.now(),
            maintenance_step_id=None,
            external_maintenance_step_id=None,
        )

        return Response(
            {
                "asset_movement_id": next_asset_move_id,
                "source_location_id": source_location.location_id,
                "destination_location_id": destination_location.location_id,
            },
            status=status.HTTP_201_CREATED,
        )

    def get_queryset(self):
        queryset = Asset.objects.select_related("asset_model").order_by("asset_id")
        attribution_order_id = self.request.query_params.get("attribution_order")
        asset_model_id = self.request.query_params.get("asset_model")

        if attribution_order_id is not None:
            try:
                queryset = queryset.filter(attribution_order_id=int(attribution_order_id))
            except (ValueError, TypeError):
                pass
        if asset_model_id is not None:
            try:
                queryset = queryset.filter(asset_model_id=int(asset_model_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        _sync_asset_attribute_values(instance)
        return response


class AssetAttributeDefinitionViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetAttributeDefinition.objects.all().order_by("asset_attribute_definition_id")
    serializer_class = AssetAttributeDefinitionSerializer

    def get_queryset(self):
        queryset = AssetAttributeDefinition.objects.all().order_by("asset_attribute_definition_id")
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create asset attribute definitions")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        translations_data = serializer.validated_data.pop('translations', None)
        last_def = AssetAttributeDefinition.objects.order_by("-asset_attribute_definition_id").first()
        next_id = (last_def.asset_attribute_definition_id + 1) if last_def else 1
        definition = AssetAttributeDefinition.objects.create(asset_attribute_definition_id=next_id, **serializer.validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(definition, translations_data)
        return Response(AssetAttributeDefinitionSerializer(definition).data, status=status.HTTP_201_CREATED)


class AssetTypeAttributeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetTypeAttribute.objects.all().order_by("asset_type_id", "asset_attribute_definition_id")
    serializer_class = AssetTypeAttributeSerializer

    def get_queryset(self):
        queryset = AssetTypeAttribute.objects.select_related("asset_attribute_definition", "asset_type")
        asset_type_id = self.request.query_params.get("asset_type")
        if asset_type_id is not None:
            try:
                queryset = queryset.filter(asset_type_id=int(asset_type_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete asset type attributes")
        if denial:
            return denial

        asset_type_id = request.query_params.get("asset_type")
        definition_id = request.query_params.get("asset_attribute_definition") or kwargs.get("pk")
        if asset_type_id:
            deleted, _ = AssetTypeAttribute.objects.filter(
                asset_type_id=asset_type_id,
                asset_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)

            for model in AssetModel.objects.filter(asset_type_id=asset_type_id):
                _sync_asset_model_attribute_values(model)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        instance = serializer.save()
        for model in AssetModel.objects.filter(asset_type_id=instance.asset_type_id):
            _sync_asset_model_attribute_values(model)

    def perform_update(self, serializer):
        instance = serializer.save()
        for model in AssetModel.objects.filter(asset_type_id=instance.asset_type_id):
            _sync_asset_model_attribute_values(model)


class AssetModelAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetModelAttributeValue.objects.all().order_by("asset_model_id", "asset_attribute_definition_id")
    serializer_class = AssetModelAttributeValueSerializer

    def get_queryset(self):
        queryset = AssetModelAttributeValue.objects.select_related("asset_attribute_definition", "asset_model")
        asset_model_id = self.request.query_params.get("asset_model")
        if asset_model_id is not None:
            try:
                queryset = queryset.filter(asset_model_id=int(asset_model_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete asset model attributes")
        if denial:
            return denial

        asset_model_id = request.query_params.get("asset_model")
        definition_id = request.query_params.get("asset_attribute_definition") or kwargs.get("pk")
        if asset_model_id:
            deleted, _ = AssetModelAttributeValue.objects.filter(
                asset_model_id=asset_model_id,
                asset_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class AssetAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetAttributeValue.objects.all().order_by("asset_id", "asset_attribute_definition_id")
    serializer_class = AssetAttributeValueSerializer

    def get_queryset(self):
        queryset = AssetAttributeValue.objects.select_related("asset_attribute_definition", "asset")
        asset_id = self.request.query_params.get("asset")
        if asset_id is not None:
            try:
                queryset = queryset.filter(asset_id=int(asset_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete asset attributes")
        if denial:
            return denial

        asset_id = request.query_params.get("asset")
        definition_id = request.query_params.get("asset_attribute_definition") or kwargs.get("pk")
        if asset_id:
            deleted, _ = AssetAttributeValue.objects.filter(
                asset_id=asset_id,
                asset_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class StockItemTypeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemType.objects.all().order_by("stock_item_type_id")
    serializer_class = StockItemTypeSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create stock item types")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_type = StockItemType.objects.all().order_by("-stock_item_type_id").first()
        next_id = (last_type.stock_item_type_id + 1) if last_type else 1

        translations_data = serializer.validated_data.pop('translations', None)
        try:
            stock_item_type = StockItemType.objects.create(
                stock_item_type_id=next_id,
                **serializer.validated_data,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create stock item type due to database constraints.",
                    "details": "Check required fields and uniqueness constraints.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(stock_item_type, translations_data)
        return Response(StockItemTypeSerializer(stock_item_type).data, status=status.HTTP_201_CREATED)


class StockItemBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemBrand.objects.all().order_by("stock_item_brand_id")
    serializer_class = StockItemBrandSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create stock item brands")
        if denial:
            return denial

        translations_data = request.data.get('translations')
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        mutable_data.pop('translations', None)

        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        validated_data.pop('translations', None)

        last_brand = StockItemBrand.objects.all().order_by("-stock_item_brand_id").first()
        next_id = (last_brand.stock_item_brand_id + 1) if last_brand else 1

        try:
            brand = StockItemBrand.objects.create(
                stock_item_brand_id=next_id,
                **validated_data,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create stock item brand due to database constraints.",
                    "details": "Check required fields and uniqueness constraints.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Always save English translation from brand_name
        try:
            translations_dict = json.loads(translations_data) if translations_data and isinstance(translations_data, str) else (translations_data or {})
            if not isinstance(translations_dict, dict):
                translations_dict = {}
            if brand.brand_name:
                if 'en' not in translations_dict:
                    translations_dict['en'] = {}
                translations_dict['en']['brand_name'] = brand.brand_name
            from api.utils.i18n import save_translations
            save_translations(brand, translations_dict)
        except (json.JSONDecodeError, TypeError):
            pass

        return Response(self.get_serializer(brand).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        translations_data = request.data.get('translations')
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        mutable_data.pop('translations', None)

        serializer = self.get_serializer(instance, data=mutable_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.validated_data.pop('translations', None)
        serializer.save()

        # Always save English translation from brand_name
        try:
            translations_dict = json.loads(translations_data) if translations_data and isinstance(translations_data, str) else (translations_data or {})
            if not isinstance(translations_dict, dict):
                translations_dict = {}
            if instance.brand_name:
                if 'en' not in translations_dict:
                    translations_dict['en'] = {}
                translations_dict['en']['brand_name'] = instance.brand_name
            from api.utils.i18n import save_translations
            save_translations(instance, translations_dict)
        except (json.JSONDecodeError, TypeError):
            pass

        return Response(self.get_serializer(instance).data)


class StockItemModelViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemModel.objects.all().order_by("stock_item_model_id")
    serializer_class = StockItemModelSerializer

    def _insert_compatibility_row(self, table_name, columns, values):
        with connection.cursor() as cursor:
            cols = ",".join(columns)
            placeholders = ",".join(["%s"] * len(values))
            cursor.execute(
                f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders}) ON CONFLICT DO NOTHING",
                values,
            )

    def _delete_compatibility_row(self, table_name, where_columns, where_values):
        with connection.cursor() as cursor:
            where_sql = " AND ".join([f"{c} = %s" for c in where_columns])
            cursor.execute(
                f"DELETE FROM {table_name} WHERE {where_sql}",
                where_values,
            )

    @action(detail=True, methods=["get", "post"], url_path="compatible-asset-models")
    def compatible_asset_models(self, request, pk=None):
        stock_item_model = self.get_object()

        if request.method.lower() == "get":
            ids = list(
                StockItemIsCompatibleWithAsset.objects.filter(stock_item_model_id=stock_item_model.stock_item_model_id).values_list(
                    "asset_model_id", flat=True
                )
            )
            models = AssetModel.objects.select_related("asset_brand", "asset_type").filter(asset_model_id__in=ids)
            return Response(AssetModelSerializer(models, many=True).data, status=status.HTTP_200_OK)

        denial = self._require_superuser(request, "update stock item model compatibility")
        if denial:
            return denial

        asset_model_id = request.data.get("asset_model_id")
        if not asset_model_id:
            return Response({"error": "asset_model_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            asset_model_id_int = int(asset_model_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid asset_model_id"}, status=status.HTTP_400_BAD_REQUEST)

        if not AssetModel.objects.filter(asset_model_id=asset_model_id_int).exists():
            return Response({"error": "Asset model not found"}, status=status.HTTP_404_NOT_FOUND)

        self._insert_compatibility_row(
            "public.stock_item_is_compatible_with_asset",
            ["stock_item_model_id", "asset_model_id"],
            [stock_item_model.stock_item_model_id, asset_model_id_int],
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["delete"],
        url_path=r"compatible-asset-models/(?P<asset_model_id>[^/.]+)",
    )
    def remove_compatible_asset_model(self, request, pk=None, asset_model_id=None):
        denial = self._require_superuser(request, "update stock item model compatibility")
        if denial:
            return denial

        stock_item_model = self.get_object()
        try:
            asset_model_id_int = int(asset_model_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid asset_model_id"}, status=status.HTTP_400_BAD_REQUEST)

        self._delete_compatibility_row(
            "public.stock_item_is_compatible_with_asset",
            ["stock_item_model_id", "asset_model_id"],
            [stock_item_model.stock_item_model_id, asset_model_id_int],
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)

    def get_queryset(self):
        queryset = StockItemModel.objects.select_related("stock_item_brand", "stock_item_type").order_by("stock_item_model_id")
        stock_item_type_id = self.request.query_params.get("stock_item_type")
        if stock_item_type_id is not None:
            try:
                queryset = queryset.filter(stock_item_type_id=int(stock_item_type_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create stock item models")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        translations_data = serializer.validated_data.pop('translations', None)

        last_model = StockItemModel.objects.all().order_by("-stock_item_model_id").first()
        next_id = (last_model.stock_item_model_id + 1) if last_model else 1

        stock_item_model = StockItemModel.objects.create(stock_item_model_id=next_id, **serializer.validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(stock_item_model, translations_data)
        _sync_stock_item_model_attribute_values(stock_item_model)
        return Response(StockItemModelSerializer(stock_item_model).data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        instance = serializer.save()
        _sync_stock_item_model_attribute_values(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        _sync_stock_item_model_attribute_values(instance)


class StockItemViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItem.objects.all().order_by("stock_item_id")
    serializer_class = StockItemSerializer

    def get_queryset(self):
        queryset = StockItem.objects.select_related("stock_item_model").order_by("stock_item_id")
        stock_item_model_id = self.request.query_params.get("stock_item_model")
        if stock_item_model_id is not None:
            try:
                queryset = queryset.filter(stock_item_model_id=int(stock_item_model_id))
            except (ValueError, TypeError):
                pass
        status_param = self.request.query_params.get("stock_item_status")
        if status_param is not None:
            queryset = queryset.filter(stock_item_status=status_param)
        destruction_certificate_id = self.request.query_params.get("destruction_certificate_id")
        if destruction_certificate_id is not None:
            try:
                queryset = queryset.filter(destruction_certificate_id=int(destruction_certificate_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def partial_update(self, request, *args, **kwargs):
        stock_item_status = request.data.get("stock_item_status")
        if isinstance(stock_item_status, str) and stock_item_status.strip().lower() == "suggested_for_destruction":
            return Response(
                {"error": "Stock item status can only be set to suggested_for_destruction by a maintenance chief."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if isinstance(stock_item_status, str) and stock_item_status.strip().lower() == "destroyed":
            return Response(
                {"error": "Stock item status can only be set to destroyed by validating a destruction certificate."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        response = super().partial_update(request, *args, **kwargs)
        if response.status_code < 400:
            instance = self.get_object()
            # Handle translations from request data
            from api.utils.i18n import save_translations, translate_status
            translations_data = request.data.get('translations')
            if translations_data and isinstance(translations_data, dict):
                en_data = translations_data.get('en', {})
                if instance.stock_item_name and 'stock_item_name' not in en_data:
                    en_data['stock_item_name'] = instance.stock_item_name
                    translations_data['en'] = en_data
                if instance.stock_item_status and 'stock_item_status' not in en_data:
                    en_data['stock_item_status'] = translate_status(instance.stock_item_status, 'en')
                    translations_data['en'] = en_data
                if instance.stock_item_name_in_administrative_certificate and 'stock_item_name_in_administrative_certificate' not in en_data:
                    en_data['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
                    translations_data['en'] = en_data
                ar_data = translations_data.get('ar', {})
                if instance.stock_item_name and 'stock_item_name' not in ar_data:
                    ar_data['stock_item_name'] = instance.stock_item_name
                    translations_data['ar'] = ar_data
                if instance.stock_item_status and 'stock_item_status' not in ar_data:
                    ar_data['stock_item_status'] = translate_status(instance.stock_item_status, 'ar')
                    translations_data['ar'] = ar_data
                if instance.stock_item_name_in_administrative_certificate and 'stock_item_name_in_administrative_certificate' not in ar_data:
                    ar_data['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
                    translations_data['ar'] = ar_data
                save_translations(instance, translations_data)
            elif instance.stock_item_name or instance.stock_item_status or instance.stock_item_name_in_administrative_certificate:
                en_entry = {}
                if instance.stock_item_name:
                    en_entry['stock_item_name'] = instance.stock_item_name
                if instance.stock_item_status:
                    en_entry['stock_item_status'] = translate_status(instance.stock_item_status, 'en')
                if instance.stock_item_name_in_administrative_certificate:
                    en_entry['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
                ar_entry = {}
                if instance.stock_item_name:
                    ar_entry['stock_item_name'] = instance.stock_item_name
                if instance.stock_item_status:
                    ar_entry['stock_item_status'] = translate_status(instance.stock_item_status, 'ar')
                if instance.stock_item_name_in_administrative_certificate:
                    ar_entry['stock_item_name_in_administrative_certificate'] = instance.stock_item_name_in_administrative_certificate
                save_translations(instance, {'en': en_entry, 'ar': ar_entry})
            if "stock_item_status" in request.data:
                from api.utils.i18n import sync_status_translations
                sync_status_translations(instance, instance.stock_item_status)
        return response

    @action(detail=True, methods=["post"], url_path="suggest-for-destruction")
    def suggest_for_destruction(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_account.is_superuser():
            allowed = True
        else:
            person = getattr(user_account, "person", None)
            if not person:
                return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)
            role_codes = set(PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True))
            allowed = "maintenance_chief" in role_codes

        if not allowed:
            return Response(
                {"error": "Only maintenance chief or superusers can suggest a stock item for destruction"},
                status=status.HTTP_403_FORBIDDEN,
            )

        item = self.get_object()
        current = (getattr(item, "stock_item_status", None) or "").strip().lower()
        if current != "failed":
            return Response(
                {"error": "Stock item must have status 'failed' before it can be suggested for destruction"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if getattr(item, "stock_item_consumable_destruction_certificate_id", None):
            return Response(
                {"error": "Stock item is already linked to a destruction certificate"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from api.utils.i18n import bulk_sync_status_translations
        bulk_sync_status_translations(StockItem, {'stock_item_id': item.stock_item_id}, 'suggested_for_destruction')
        item.refresh_from_db()
        return Response(self.get_serializer(item).data, status=status.HTTP_200_OK)

    def _require_responsible_or_superuser(self, request, action_desc):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_account.is_superuser():
            return None

        person = getattr(user_account, "person", None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True))
        if "stock_consumable_responsible" in role_codes or "exploitation_chief" in role_codes or "it_bureau_chief" in role_codes:
            return None

        return Response(
            {"error": f"Only Stock/Consumable Responsible or superusers can {action_desc}"},
            status=status.HTTP_403_FORBIDDEN,
        )

    def create(self, request, *args, **kwargs):
        denial = self._require_responsible_or_superuser(request, "create stock items")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        translations_data = serializer.validated_data.pop('translations', None)
        last_item = StockItem.objects.order_by("-stock_item_id").first()
        next_id = (last_item.stock_item_id + 1) if last_item else 1
        item = StockItem.objects.create(stock_item_id=next_id, **serializer.validated_data)
        # Save translations (both en and ar rows with name and status)
        from api.utils.i18n import save_translations, translate_status
        if translations_data:
            en_data = translations_data.get('en', {})
            if item.stock_item_name and 'stock_item_name' not in en_data:
                en_data['stock_item_name'] = item.stock_item_name
                translations_data['en'] = en_data
            if item.stock_item_status and 'stock_item_status' not in en_data:
                en_data['stock_item_status'] = translate_status(item.stock_item_status, 'en')
                translations_data['en'] = en_data
            if item.stock_item_name_in_administrative_certificate and 'stock_item_name_in_administrative_certificate' not in en_data:
                en_data['stock_item_name_in_administrative_certificate'] = item.stock_item_name_in_administrative_certificate
                translations_data['en'] = en_data
            ar_data = translations_data.get('ar', {})
            if item.stock_item_name and 'stock_item_name' not in ar_data:
                ar_data['stock_item_name'] = item.stock_item_name
                translations_data['ar'] = ar_data
            if item.stock_item_status and 'stock_item_status' not in ar_data:
                ar_data['stock_item_status'] = translate_status(item.stock_item_status, 'ar')
                translations_data['ar'] = ar_data
            if item.stock_item_name_in_administrative_certificate and 'stock_item_name_in_administrative_certificate' not in ar_data:
                ar_data['stock_item_name_in_administrative_certificate'] = item.stock_item_name_in_administrative_certificate
                translations_data['ar'] = ar_data
            save_translations(item, translations_data)
        elif item.stock_item_name or item.stock_item_status or item.stock_item_name_in_administrative_certificate:
            en_entry = {}
            if item.stock_item_name:
                en_entry['stock_item_name'] = item.stock_item_name
            if item.stock_item_status:
                en_entry['stock_item_status'] = translate_status(item.stock_item_status, 'en')
            if item.stock_item_name_in_administrative_certificate:
                en_entry['stock_item_name_in_administrative_certificate'] = item.stock_item_name_in_administrative_certificate
            ar_entry = {}
            if item.stock_item_name:
                ar_entry['stock_item_name'] = item.stock_item_name
            if item.stock_item_status:
                ar_entry['stock_item_status'] = translate_status(item.stock_item_status, 'ar')
            if item.stock_item_name_in_administrative_certificate:
                ar_entry['stock_item_name_in_administrative_certificate'] = item.stock_item_name_in_administrative_certificate
            save_translations(item, {'en': en_entry, 'ar': ar_entry})
        _sync_stock_item_attribute_values(item)
        return Response(StockItemSerializer(item).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="split")
    def split(self, request, pk=None):
        denial = self._require_responsible_or_superuser(request, "split stock items")
        if denial:
            return denial

        source_item = self.get_object()

        raw_definition_id = request.data.get("attribute_definition_id")
        raw_split_value = request.data.get("split_value")

        try:
            definition_id = int(raw_definition_id)
        except (TypeError, ValueError):
            return Response({"error": "attribute_definition_id must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            split_value = Decimal(str(raw_split_value))
        except Exception:
            return Response({"error": "split_value must be a valid number"}, status=status.HTTP_400_BAD_REQUEST)

        if split_value <= 0:
            return Response({"error": "split_value must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

        definition = StockItemAttributeDefinition.objects.filter(
            stock_item_attribute_definition_id=definition_id
        ).first()
        if not definition:
            return Response({"error": "Invalid attribute_definition_id"}, status=status.HTTP_400_BAD_REQUEST)

        data_type = (getattr(definition, "data_type", "") or "").strip().lower()
        if data_type not in {"number", "numeric", "decimal", "int", "integer", "float", "double"}:
            return Response({"error": "attribute_definition_id must reference a numeric attribute"}, status=status.HTTP_400_BAD_REQUEST)

        source_attr = StockItemAttributeValue.objects.filter(
            stock_item_id=source_item.stock_item_id,
            stock_item_attribute_definition_id=definition_id,
        ).first()
        if not source_attr or source_attr.value_number is None:
            return Response({"error": "Source stock item does not have a numeric value for this attribute"}, status=status.HTTP_400_BAD_REQUEST)

        source_value = Decimal(str(source_attr.value_number))
        if split_value >= source_value:
            return Response({"error": "split_value must be strictly less than source attribute value"}, status=status.HTTP_400_BAD_REQUEST)

        remaining_value = source_value - split_value

        new_item_name = request.data.get("new_item_name")
        new_item_inventory_number = request.data.get("new_item_inventory_number")
        new_item_status = request.data.get("new_item_status") or source_item.stock_item_status
        raw_destination_location_id = request.data.get("destination_location_id")

        if new_item_name == "":
            new_item_name = None
        if new_item_inventory_number == "":
            new_item_inventory_number = None
        if new_item_status == "":
            new_item_status = None

        destination_location_id_int = None
        if raw_destination_location_id not in (None, ""):
            try:
                destination_location_id_int = int(raw_destination_location_id)
            except (TypeError, ValueError):
                return Response({"error": "destination_location_id must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
            if not Location.objects.filter(location_id=destination_location_id_int).exists():
                return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            last_item = StockItem.objects.order_by("-stock_item_id").first()
            next_id = (last_item.stock_item_id + 1) if last_item else 1
            new_item = StockItem.objects.create(
                stock_item_id=next_id,
                stock_item_model_id=source_item.stock_item_model_id,
                stock_item_name=new_item_name or source_item.stock_item_name,
                stock_item_inventory_number=new_item_inventory_number,
                stock_item_status=new_item_status,
                stock_item_consumable_destruction_certificate_id=None,
            )
            _sync_stock_item_attribute_values(new_item)

            source_attributes = list(
                StockItemAttributeValue.objects.filter(stock_item_id=source_item.stock_item_id)
            )
            with connection.cursor() as cursor:
                for source_row in source_attributes:
                    cursor.execute(
                        """
                        INSERT INTO public.stock_item_attribute_value
                            (stock_item_id, stock_item_attribute_definition_id, value_string, value_bool, value_date, value_number)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (stock_item_id, stock_item_attribute_definition_id)
                        DO UPDATE SET
                            value_string = EXCLUDED.value_string,
                            value_bool = EXCLUDED.value_bool,
                            value_date = EXCLUDED.value_date,
                            value_number = EXCLUDED.value_number
                        """,
                        [
                            new_item.stock_item_id,
                            source_row.stock_item_attribute_definition_id,
                            source_row.value_string,
                            source_row.value_bool,
                            source_row.value_date,
                            source_row.value_number,
                        ],
                    )

                updated_count = StockItemAttributeValue.objects.filter(
                    stock_item_id=source_item.stock_item_id,
                    stock_item_attribute_definition_id=definition_id,
                ).update(value_number=remaining_value)
                if updated_count == 0:
                    cursor.execute(
                        """
                        INSERT INTO public.stock_item_attribute_value
                            (stock_item_id, stock_item_attribute_definition_id, value_number)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (stock_item_id, stock_item_attribute_definition_id)
                        DO UPDATE SET value_number = EXCLUDED.value_number
                        """,
                        [source_item.stock_item_id, definition_id, remaining_value],
                    )

                updated_new_count = StockItemAttributeValue.objects.filter(
                    stock_item_id=new_item.stock_item_id,
                    stock_item_attribute_definition_id=definition_id,
                ).update(value_number=split_value)
                if updated_new_count == 0:
                    cursor.execute(
                        """
                        INSERT INTO public.stock_item_attribute_value
                            (stock_item_id, stock_item_attribute_definition_id, value_number)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (stock_item_id, stock_item_attribute_definition_id)
                        DO UPDATE SET value_number = EXCLUDED.value_number
                        """,
                        [new_item.stock_item_id, definition_id, split_value],
                    )

            source_last_move = (
                StockItemMovement.objects.filter(stock_item_id=source_item.stock_item_id)
                .order_by("-stock_item_movement_id")
                .first()
            )
            source_current_location_id = source_last_move.destination_location_id if source_last_move else None
            final_location_id = destination_location_id_int or source_current_location_id
            if final_location_id:
                last_move = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
                next_move_id = (last_move.stock_item_movement_id + 1) if last_move else 1
                _create_stock_item_movement_with_translations(
                    movement_reason="manual_split",
                    stock_item_movement_id=next_move_id,
                    stock_item_id=new_item.stock_item_id,
                    source_location_id=final_location_id,
                    destination_location_id=final_location_id,
                    maintenance_step_id=None,
                    external_maintenance_step_id=None,
                    movement_datetime=timezone.now(),
                )

        source_item.refresh_from_db()
        new_item.refresh_from_db()
        return Response(
            {
                "source_stock_item": StockItemSerializer(source_item).data,
                "new_stock_item": StockItemSerializer(new_item).data,
                "source_remaining_value": str(remaining_value),
                "new_item_value": str(split_value),
                "attribute_definition_id": definition_id,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        stock_item_status = request.data.get("stock_item_status")
        if isinstance(stock_item_status, str) and stock_item_status.strip().lower() == "suggested_for_destruction":
            return Response(
                {"error": "Stock item status can only be set to suggested_for_destruction by a maintenance chief."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if isinstance(stock_item_status, str) and stock_item_status.strip().lower() == "destroyed":
            return Response(
                {"error": "Stock item status can only be set to destroyed by validating a destruction certificate."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        _sync_stock_item_attribute_values(instance)
        return response

    @action(detail=True, methods=["get"], url_path="current-location")
    def current_location(self, request, pk=None):
        stock_item = self.get_object()
        last_move = (
            StockItemMovement.objects.filter(stock_item_id=stock_item.stock_item_id)
            .select_related("destination_location", "destination_location__location_type")
            .order_by("-stock_item_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_location_id:
            return Response({"location_id": None, "location": None}, status=status.HTTP_200_OK)
        loc = last_move.destination_location
        return Response(
            {
                "location_id": loc.location_id,
                "location": LocationSerializer(loc).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="move")
    def move(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_account.is_superuser():
            allowed = True
        else:
            person = getattr(user_account, "person", None)
            if not person:
                return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)
            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            allowed = (
                ("stock_consumable_responsible" in role_codes)
                or ("asset_responsible" in role_codes)
                or ("exploitation_chief" in role_codes)
                or ("it_bureau_chief" in role_codes)
            )

        if not allowed:
            return Response(
                {"error": "Only Stock/Consumable Responsible, Asset Responsible, or superiors can move stock items"},
                status=status.HTTP_403_FORBIDDEN,
            )

        stock_item = self.get_object()
        destination_location_id = request.data.get("destination_location_id")
        movement_reason = request.data.get("movement_reason") or "manual_move"
        if not destination_location_id:
            return Response({"error": "destination_location_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            destination_location_id_int = int(destination_location_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_location = Location.objects.filter(location_id=destination_location_id_int).first()
        if not destination_location:
            return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        last_move = (
            StockItemMovement.objects.select_related("destination_location")
            .filter(stock_item_id=stock_item.stock_item_id)
            .order_by("-stock_item_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_location_id:
            last_global_move = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
            next_move_id = (last_global_move.stock_item_movement_id + 1) if last_global_move else 1

            _create_stock_item_movement_with_translations(
                movement_reason=movement_reason,
                stock_item_movement_id=next_move_id,
                stock_item=stock_item,
                source_location=destination_location,
                destination_location=destination_location,
                maintenance_step=None,
                external_maintenance_step_id=None,
                movement_datetime=timezone.now(),
            )

            return Response(
                {
                    "stock_item_movement_id": next_move_id,
                    "source_location_id": destination_location.location_id,
                    "destination_location_id": destination_location.location_id,
                },
                status=status.HTTP_201_CREATED,
            )

        source_location = last_move.destination_location
        if source_location.location_id == destination_location.location_id:
            return Response({"error": "Stock item is already in this location"}, status=status.HTTP_400_BAD_REQUEST)

        last_global_move = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
        next_move_id = (last_global_move.stock_item_movement_id + 1) if last_global_move else 1

        _create_stock_item_movement_with_translations(
            movement_reason=movement_reason,
            stock_item_movement_id=next_move_id,
            stock_item=stock_item,
            source_location=source_location,
            destination_location=destination_location,
            maintenance_step=None,
            external_maintenance_step_id=None,
            movement_datetime=timezone.now(),
        )

        _cascade_move_stock_item_consumables(
            stock_item_id=stock_item.stock_item_id,
            source_location_id=source_location.location_id,
            destination_location_id=destination_location.location_id,
            movement_reason=movement_reason,
            movement_datetime=timezone.now(),
            maintenance_step_id=None,
            external_maintenance_step_id=None,
        )

        return Response(
            {
                "stock_item_movement_id": next_move_id,
                "source_location_id": source_location.location_id,
                "destination_location_id": destination_location.location_id,
            },
            status=status.HTTP_201_CREATED,
        )


class StockItemAttributeDefinitionViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemAttributeDefinition.objects.all().order_by("stock_item_attribute_definition_id")
    serializer_class = StockItemAttributeDefinitionSerializer

    def get_queryset(self):
        queryset = StockItemAttributeDefinition.objects.all().order_by("stock_item_attribute_definition_id")
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create stock item attribute definitions")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        translations_data = serializer.validated_data.pop('translations', None)
        last_def = StockItemAttributeDefinition.objects.order_by("-stock_item_attribute_definition_id").first()
        next_id = (last_def.stock_item_attribute_definition_id + 1) if last_def else 1
        definition = StockItemAttributeDefinition.objects.create(
            stock_item_attribute_definition_id=next_id, **serializer.validated_data
        )
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(definition, translations_data)
        return Response(StockItemAttributeDefinitionSerializer(definition).data, status=status.HTTP_201_CREATED)


class StockItemTypeAttributeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemTypeAttribute.objects.all().order_by("stock_item_type_id", "stock_item_attribute_definition_id")
    serializer_class = StockItemTypeAttributeSerializer

    def get_queryset(self):
        queryset = StockItemTypeAttribute.objects.select_related("stock_item_attribute_definition", "stock_item_type")
        stock_item_type_id = self.request.query_params.get("stock_item_type")
        if stock_item_type_id is not None:
            try:
                queryset = queryset.filter(stock_item_type_id=int(stock_item_type_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete stock item type attributes")
        if denial:
            return denial

        stock_item_type_id = request.query_params.get("stock_item_type")
        definition_id = request.query_params.get("stock_item_attribute_definition") or kwargs.get("pk")
        if stock_item_type_id:
            deleted, _ = StockItemTypeAttribute.objects.filter(
                stock_item_type_id=stock_item_type_id,
                stock_item_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)

            for model in StockItemModel.objects.filter(stock_item_type_id=stock_item_type_id):
                _sync_stock_item_model_attribute_values(model)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        instance = serializer.save()
        for model in StockItemModel.objects.filter(stock_item_type_id=instance.stock_item_type_id):
            _sync_stock_item_model_attribute_values(model)

    def perform_update(self, serializer):
        instance = serializer.save()
        for model in StockItemModel.objects.filter(stock_item_type_id=instance.stock_item_type_id):
            _sync_stock_item_model_attribute_values(model)


class StockItemModelAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemModelAttributeValue.objects.all().order_by(
        "stock_item_model_id", "stock_item_attribute_definition_id"
    )
    serializer_class = StockItemModelAttributeValueSerializer

    def get_queryset(self):
        queryset = StockItemModelAttributeValue.objects.select_related(
            "stock_item_attribute_definition", "stock_item_model"
        )
        stock_item_model_id = self.request.query_params.get("stock_item_model")
        if stock_item_model_id is not None:
            try:
                queryset = queryset.filter(stock_item_model_id=int(stock_item_model_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete stock item model attributes")
        if denial:
            return denial

        stock_item_model_id = request.query_params.get("stock_item_model")
        definition_id = request.query_params.get("stock_item_attribute_definition") or kwargs.get("pk")
        if stock_item_model_id:
            deleted, _ = StockItemModelAttributeValue.objects.filter(
                stock_item_model_id=stock_item_model_id,
                stock_item_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class StockItemAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemAttributeValue.objects.all().order_by("stock_item_id", "stock_item_attribute_definition_id")
    serializer_class = StockItemAttributeValueSerializer

    def get_queryset(self):
        queryset = StockItemAttributeValue.objects.select_related("stock_item_attribute_definition", "stock_item")
        stock_item_id = self.request.query_params.get("stock_item")
        if stock_item_id is not None:
            try:
                queryset = queryset.filter(stock_item_id=int(stock_item_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete stock item attributes")
        if denial:
            return denial

        stock_item_id = request.query_params.get("stock_item")
        definition_id = request.query_params.get("stock_item_attribute_definition") or kwargs.get("pk")
        if stock_item_id:
            deleted, _ = StockItemAttributeValue.objects.filter(
                stock_item_id=stock_item_id,
                stock_item_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class ConsumableTypeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableType.objects.all().order_by("consumable_type_id")
    serializer_class = ConsumableTypeSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create consumable types")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_type = ConsumableType.objects.all().order_by("-consumable_type_id").first()
        next_id = (last_type.consumable_type_id + 1) if last_type else 1

        translations_data = serializer.validated_data.pop('translations', None)
        try:
            consumable_type = ConsumableType.objects.create(
                consumable_type_id=next_id,
                **serializer.validated_data,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create consumable type due to database constraints.",
                    "details": "Check required fields and uniqueness constraints.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(consumable_type, translations_data)
        return Response(ConsumableTypeSerializer(consumable_type).data, status=status.HTTP_201_CREATED)


class ConsumableBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableBrand.objects.all().order_by("consumable_brand_id")
    serializer_class = ConsumableBrandSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create consumable brands")
        if denial:
            return denial

        translations_data = request.data.get('translations')
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        mutable_data.pop('translations', None)

        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        validated_data.pop('translations', None)

        last_brand = ConsumableBrand.objects.all().order_by("-consumable_brand_id").first()
        next_id = (last_brand.consumable_brand_id + 1) if last_brand else 1

        try:
            brand = ConsumableBrand.objects.create(
                consumable_brand_id=next_id,
                **validated_data,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create consumable brand due to database constraints.",
                    "details": "Check required fields and uniqueness constraints.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Always save English translation from brand_name
        try:
            translations_dict = json.loads(translations_data) if translations_data and isinstance(translations_data, str) else (translations_data or {})
            if not isinstance(translations_dict, dict):
                translations_dict = {}
            if brand.brand_name:
                if 'en' not in translations_dict:
                    translations_dict['en'] = {}
                translations_dict['en']['brand_name'] = brand.brand_name
            from api.utils.i18n import save_translations
            save_translations(brand, translations_dict)
        except (json.JSONDecodeError, TypeError):
            pass

        return Response(self.get_serializer(brand).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        translations_data = request.data.get('translations')
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        mutable_data.pop('translations', None)

        serializer = self.get_serializer(instance, data=mutable_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.validated_data.pop('translations', None)
        serializer.save()

        # Always save English translation from brand_name
        try:
            translations_dict = json.loads(translations_data) if translations_data and isinstance(translations_data, str) else (translations_data or {})
            if not isinstance(translations_dict, dict):
                translations_dict = {}
            if instance.brand_name:
                if 'en' not in translations_dict:
                    translations_dict['en'] = {}
                translations_dict['en']['brand_name'] = instance.brand_name
            from api.utils.i18n import save_translations
            save_translations(instance, translations_dict)
        except (json.JSONDecodeError, TypeError):
            pass

        return Response(self.get_serializer(instance).data)


class ConsumableModelViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableModel.objects.all().order_by("consumable_model_id")
    serializer_class = ConsumableModelSerializer

    def _insert_compatibility_row(self, table_name, columns, values):
        with connection.cursor() as cursor:
            cols = ",".join(columns)
            placeholders = ",".join(["%s"] * len(values))
            cursor.execute(
                f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders}) ON CONFLICT DO NOTHING",
                values,
            )

    def _delete_compatibility_row(self, table_name, where_columns, where_values):
        with connection.cursor() as cursor:
            where_sql = " AND ".join([f"{c} = %s" for c in where_columns])
            cursor.execute(
                f"DELETE FROM {table_name} WHERE {where_sql}",
                where_values,
            )

    @action(detail=True, methods=["get", "post"], url_path="compatible-asset-models")
    def compatible_asset_models(self, request, pk=None):
        consumable_model = self.get_object()

        if request.method.lower() == "get":
            ids = list(
                ConsumableIsCompatibleWithAsset.objects.filter(consumable_model_id=consumable_model.consumable_model_id).values_list(
                    "asset_model_id", flat=True
                )
            )
            models = AssetModel.objects.select_related("asset_brand", "asset_type").filter(asset_model_id__in=ids)
            return Response(AssetModelSerializer(models, many=True).data, status=status.HTTP_200_OK)

        denial = self._require_superuser(request, "update consumable model compatibility")
        if denial:
            return denial

        asset_model_id = request.data.get("asset_model_id")
        if not asset_model_id:
            return Response({"error": "asset_model_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            asset_model_id_int = int(asset_model_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid asset_model_id"}, status=status.HTTP_400_BAD_REQUEST)

        if not AssetModel.objects.filter(asset_model_id=asset_model_id_int).exists():
            return Response({"error": "Asset model not found"}, status=status.HTTP_404_NOT_FOUND)

        self._insert_compatibility_row(
            "public.consumable_is_compatible_with_asset",
            ["consumable_model_id", "asset_model_id"],
            [consumable_model.consumable_model_id, asset_model_id_int],
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["delete"],
        url_path=r"compatible-asset-models/(?P<asset_model_id>[^/.]+)",
    )
    def remove_compatible_asset_model(self, request, pk=None, asset_model_id=None):
        denial = self._require_superuser(request, "update consumable model compatibility")
        if denial:
            return denial

        consumable_model = self.get_object()
        try:
            asset_model_id_int = int(asset_model_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid asset_model_id"}, status=status.HTTP_400_BAD_REQUEST)

        self._delete_compatibility_row(
            "public.consumable_is_compatible_with_asset",
            ["consumable_model_id", "asset_model_id"],
            [consumable_model.consumable_model_id, asset_model_id_int],
        )
        return Response({"ok": True}, status=status.HTTP_200_OK)

    def get_queryset(self):
        queryset = ConsumableModel.objects.select_related("consumable_brand", "consumable_type").order_by(
            "consumable_model_id"
        )
        consumable_type_id = self.request.query_params.get("consumable_type")
        if consumable_type_id is not None:
            try:
                queryset = queryset.filter(consumable_type_id=int(consumable_type_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create consumable models")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        translations_data = serializer.validated_data.pop('translations', None)

        last_model = ConsumableModel.objects.all().order_by("-consumable_model_id").first()
        next_id = (last_model.consumable_model_id + 1) if last_model else 1

        consumable_model = ConsumableModel.objects.create(consumable_model_id=next_id, **serializer.validated_data)
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(consumable_model, translations_data)
        _sync_consumable_model_attribute_values(consumable_model)
        return Response(ConsumableModelSerializer(consumable_model).data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        instance = serializer.save()
        _sync_consumable_model_attribute_values(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        _sync_consumable_model_attribute_values(instance)


class ConsumableViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = Consumable.objects.all().order_by("consumable_id")
    serializer_class = ConsumableSerializer

    def get_queryset(self):
        queryset = Consumable.objects.select_related("consumable_model").order_by("consumable_id")
        consumable_model_id = self.request.query_params.get("consumable_model")
        if consumable_model_id is not None:
            try:
                queryset = queryset.filter(consumable_model_id=int(consumable_model_id))
            except (ValueError, TypeError):
                pass
        status_param = self.request.query_params.get("consumable_status")
        if status_param is not None:
            queryset = queryset.filter(consumable_status=status_param)
        destruction_certificate_id = self.request.query_params.get("destruction_certificate_id")
        if destruction_certificate_id is not None:
            try:
                queryset = queryset.filter(destruction_certificate_id=int(destruction_certificate_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def partial_update(self, request, *args, **kwargs):
        consumable_status = request.data.get("consumable_status")
        if isinstance(consumable_status, str) and consumable_status.strip().lower() == "suggested_for_destruction":
            return Response(
                {"error": "Consumable status can only be set to suggested_for_destruction by a maintenance chief."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if isinstance(consumable_status, str) and consumable_status.strip().lower() == "destroyed":
            return Response(
                {"error": "Consumable status can only be set to destroyed by validating a destruction certificate."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        response = super().partial_update(request, *args, **kwargs)
        instance = self.get_object()
        _sync_consumable_attribute_values(instance)
        # Handle translations from request data
        translations_data = request.data.get('translations')
        from api.utils.i18n import save_translations, translate_status
        if translations_data and isinstance(translations_data, dict):
            en_data = translations_data.get('en', {})
            if instance.consumable_name and 'consumable_name' not in en_data:
                en_data['consumable_name'] = instance.consumable_name
                translations_data['en'] = en_data
            if instance.consumable_status and 'consumable_status' not in en_data:
                en_data['consumable_status'] = translate_status(instance.consumable_status, 'en')
                translations_data['en'] = en_data
            if instance.consumable_name_in_administrative_certificate and 'consumable_name_in_administrative_certificate' not in en_data:
                en_data['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
                translations_data['en'] = en_data
            ar_data = translations_data.get('ar', {})
            if instance.consumable_name and 'consumable_name' not in ar_data:
                ar_data['consumable_name'] = instance.consumable_name
                translations_data['ar'] = ar_data
            if instance.consumable_status and 'consumable_status' not in ar_data:
                ar_data['consumable_status'] = translate_status(instance.consumable_status, 'ar')
                translations_data['ar'] = ar_data
            if instance.consumable_name_in_administrative_certificate and 'consumable_name_in_administrative_certificate' not in ar_data:
                ar_data['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
                translations_data['ar'] = ar_data
            save_translations(instance, translations_data)
        elif instance.consumable_name or instance.consumable_status or instance.consumable_name_in_administrative_certificate:
            en_entry = {}
            if instance.consumable_name:
                en_entry['consumable_name'] = instance.consumable_name
            if instance.consumable_status:
                en_entry['consumable_status'] = translate_status(instance.consumable_status, 'en')
            if instance.consumable_name_in_administrative_certificate:
                en_entry['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
            ar_entry = {}
            if instance.consumable_name:
                ar_entry['consumable_name'] = instance.consumable_name
            if instance.consumable_status:
                ar_entry['consumable_status'] = translate_status(instance.consumable_status, 'ar')
            if instance.consumable_name_in_administrative_certificate:
                ar_entry['consumable_name_in_administrative_certificate'] = instance.consumable_name_in_administrative_certificate
            save_translations(instance, {'en': en_entry, 'ar': ar_entry})
        if "consumable_status" in request.data:
            from api.utils.i18n import sync_status_translations
            sync_status_translations(instance, instance.consumable_status)
        return response

    @action(detail=True, methods=["post"], url_path="suggest-for-destruction")
    def suggest_for_destruction(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_account.is_superuser():
            allowed = True
        else:
            person = getattr(user_account, "person", None)
            if not person:
                return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)
            role_codes = set(PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True))
            allowed = "maintenance_chief" in role_codes

        if not allowed:
            return Response(
                {"error": "Only maintenance chief or superusers can suggest a consumable for destruction"},
                status=status.HTTP_403_FORBIDDEN,
            )

        item = self.get_object()
        current = (getattr(item, "consumable_status", None) or "").strip().lower()
        if current != "failed":
            return Response(
                {"error": "Consumable must have status 'failed' before it can be suggested for destruction"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if getattr(item, "stock_item_consumable_destruction_certificate_id", None):
            return Response(
                {"error": "Consumable is already linked to a destruction certificate"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from api.utils.i18n import bulk_sync_status_translations
        bulk_sync_status_translations(Consumable, {'consumable_id': item.consumable_id}, 'suggested_for_destruction')
        item.refresh_from_db()
        return Response(self.get_serializer(item).data, status=status.HTTP_200_OK)

    def _require_responsible_or_superuser(self, request, action_desc):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_account.is_superuser():
            return None

        person = getattr(user_account, "person", None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True))
        if "stock_consumable_responsible" in role_codes or "exploitation_chief" in role_codes or "it_bureau_chief" in role_codes:
            return None

        return Response(
            {"error": f"Only Stock/Consumable Responsible or superusers can {action_desc}"},
            status=status.HTTP_403_FORBIDDEN,
        )

    def create(self, request, *args, **kwargs):
        denial = self._require_responsible_or_superuser(request, "create consumables")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        translations_data = serializer.validated_data.pop('translations', None)
        last_item = Consumable.objects.order_by("-consumable_id").first()
        next_id = (last_item.consumable_id + 1) if last_item else 1
        item = Consumable.objects.create(consumable_id=next_id, **serializer.validated_data)
        # Save translations (both en and ar rows with name and status)
        from api.utils.i18n import save_translations, translate_status
        if translations_data:
            en_data = translations_data.get('en', {})
            if item.consumable_name and 'consumable_name' not in en_data:
                en_data['consumable_name'] = item.consumable_name
                translations_data['en'] = en_data
            if item.consumable_status and 'consumable_status' not in en_data:
                en_data['consumable_status'] = translate_status(item.consumable_status, 'en')
                translations_data['en'] = en_data
            ar_data = translations_data.get('ar', {})
            if item.consumable_name and 'consumable_name' not in ar_data:
                ar_data['consumable_name'] = item.consumable_name
                translations_data['ar'] = ar_data
            if item.consumable_status and 'consumable_status' not in ar_data:
                ar_data['consumable_status'] = translate_status(item.consumable_status, 'ar')
                translations_data['ar'] = ar_data
            save_translations(item, translations_data)
        elif item.consumable_name or item.consumable_status:
            en_entry = {}
            if item.consumable_name:
                en_entry['consumable_name'] = item.consumable_name
            if item.consumable_status:
                en_entry['consumable_status'] = translate_status(item.consumable_status, 'en')
            ar_entry = {}
            if item.consumable_name:
                ar_entry['consumable_name'] = item.consumable_name
            if item.consumable_status:
                ar_entry['consumable_status'] = translate_status(item.consumable_status, 'ar')
            save_translations(item, {'en': en_entry, 'ar': ar_entry})
        _sync_consumable_attribute_values(item)
        return Response(ConsumableSerializer(item).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="split")
    def split(self, request, pk=None):
        denial = self._require_responsible_or_superuser(request, "split consumables")
        if denial:
            return denial

        source_item = self.get_object()

        raw_definition_id = request.data.get("attribute_definition_id")
        raw_split_value = request.data.get("split_value")

        try:
            definition_id = int(raw_definition_id)
        except (TypeError, ValueError):
            return Response({"error": "attribute_definition_id must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            split_value = Decimal(str(raw_split_value))
        except Exception:
            return Response({"error": "split_value must be a valid number"}, status=status.HTTP_400_BAD_REQUEST)

        if split_value <= 0:
            return Response({"error": "split_value must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

        definition = ConsumableAttributeDefinition.objects.filter(
            consumable_attribute_definition_id=definition_id
        ).first()
        if not definition:
            return Response({"error": "Invalid attribute_definition_id"}, status=status.HTTP_400_BAD_REQUEST)

        data_type = (getattr(definition, "data_type", "") or "").strip().lower()
        if data_type not in {"number", "numeric", "decimal", "int", "integer", "float", "double"}:
            return Response({"error": "attribute_definition_id must reference a numeric attribute"}, status=status.HTTP_400_BAD_REQUEST)

        source_attr = ConsumableAttributeValue.objects.filter(
            consumable_id=source_item.consumable_id,
            consumable_attribute_definition_id=definition_id,
        ).first()
        if not source_attr or source_attr.value_number is None:
            return Response({"error": "Source consumable does not have a numeric value for this attribute"}, status=status.HTTP_400_BAD_REQUEST)

        source_value = Decimal(str(source_attr.value_number))
        if split_value >= source_value:
            return Response({"error": "split_value must be strictly less than source attribute value"}, status=status.HTTP_400_BAD_REQUEST)

        remaining_value = source_value - split_value

        new_item_name = request.data.get("new_item_name")
        new_item_inventory_number = request.data.get("new_item_inventory_number")
        new_item_serial_number = request.data.get("new_item_serial_number")
        new_item_status = request.data.get("new_item_status") or source_item.consumable_status
        raw_destination_location_id = request.data.get("destination_location_id")

        if new_item_name == "":
            new_item_name = None
        if new_item_inventory_number == "":
            new_item_inventory_number = None
        if new_item_serial_number == "":
            new_item_serial_number = None
        if new_item_status == "":
            new_item_status = None

        destination_location_id_int = None
        if raw_destination_location_id not in (None, ""):
            try:
                destination_location_id_int = int(raw_destination_location_id)
            except (TypeError, ValueError):
                return Response({"error": "destination_location_id must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
            if not Location.objects.filter(location_id=destination_location_id_int).exists():
                return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            last_item = Consumable.objects.order_by("-consumable_id").first()
            next_id = (last_item.consumable_id + 1) if last_item else 1
            new_item = Consumable.objects.create(
                consumable_id=next_id,
                consumable_model_id=source_item.consumable_model_id,
                consumable_name=new_item_name or source_item.consumable_name,
                consumable_inventory_number=new_item_inventory_number,
                consumable_serial_number=new_item_serial_number,
                consumable_status=new_item_status,
                stock_item_consumable_destruction_certificate_id=None,
            )
            _sync_consumable_attribute_values(new_item)

            source_attributes = list(
                ConsumableAttributeValue.objects.filter(consumable_id=source_item.consumable_id)
            )
            with connection.cursor() as cursor:
                for source_row in source_attributes:
                    cursor.execute(
                        """
                        INSERT INTO public.consumable_attribute_value
                            (consumable_id, consumable_attribute_definition_id, value_string, value_bool, value_date, value_number)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (consumable_id, consumable_attribute_definition_id)
                        DO UPDATE SET
                            value_string = EXCLUDED.value_string,
                            value_bool = EXCLUDED.value_bool,
                            value_date = EXCLUDED.value_date,
                            value_number = EXCLUDED.value_number
                        """,
                        [
                            new_item.consumable_id,
                            source_row.consumable_attribute_definition_id,
                            source_row.value_string,
                            source_row.value_bool,
                            source_row.value_date,
                            source_row.value_number,
                        ],
                    )

                updated_count = ConsumableAttributeValue.objects.filter(
                    consumable_id=source_item.consumable_id,
                    consumable_attribute_definition_id=definition_id,
                ).update(value_number=remaining_value)
                if updated_count == 0:
                    cursor.execute(
                        """
                        INSERT INTO public.consumable_attribute_value
                            (consumable_id, consumable_attribute_definition_id, value_number)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (consumable_id, consumable_attribute_definition_id)
                        DO UPDATE SET value_number = EXCLUDED.value_number
                        """,
                        [source_item.consumable_id, definition_id, remaining_value],
                    )

                updated_new_count = ConsumableAttributeValue.objects.filter(
                    consumable_id=new_item.consumable_id,
                    consumable_attribute_definition_id=definition_id,
                ).update(value_number=split_value)
                if updated_new_count == 0:
                    cursor.execute(
                        """
                        INSERT INTO public.consumable_attribute_value
                            (consumable_id, consumable_attribute_definition_id, value_number)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (consumable_id, consumable_attribute_definition_id)
                        DO UPDATE SET value_number = EXCLUDED.value_number
                        """,
                        [new_item.consumable_id, definition_id, split_value],
                    )

            source_last_move = (
                ConsumableMovement.objects.filter(consumable_id=source_item.consumable_id)
                .order_by("-consumable_movement_id")
                .first()
            )
            source_current_location_id = source_last_move.destination_location_id if source_last_move else None
            final_location_id = destination_location_id_int or source_current_location_id
            if final_location_id:
                last_move = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
                next_move_id = (last_move.consumable_movement_id + 1) if last_move else 1
                _create_consumable_movement_with_translations(
                    movement_reason="manual_split",
                    consumable_movement_id=next_move_id,
                    consumable_id=new_item.consumable_id,
                    source_location_id=final_location_id,
                    destination_location_id=final_location_id,
                    maintenance_step_id=None,
                    external_maintenance_step_id=None,
                    movement_datetime=timezone.now(),
                )

        source_item.refresh_from_db()
        new_item.refresh_from_db()
        return Response(
            {
                "source_consumable": ConsumableSerializer(source_item).data,
                "new_consumable": ConsumableSerializer(new_item).data,
                "source_remaining_value": str(remaining_value),
                "new_item_value": str(split_value),
                "attribute_definition_id": definition_id,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        consumable_status = request.data.get("consumable_status")
        if isinstance(consumable_status, str) and consumable_status.strip().lower() == "suggested_for_destruction":
            return Response(
                {"error": "Consumable status can only be set to suggested_for_destruction by a maintenance chief."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if isinstance(consumable_status, str) and consumable_status.strip().lower() == "destroyed":
            return Response(
                {"error": "Consumable status can only be set to destroyed by validating a destruction certificate."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        _sync_consumable_attribute_values(instance)
        return response

    @action(detail=True, methods=["get"], url_path="current-location")
    def current_location(self, request, pk=None):
        consumable = self.get_object()
        last_move = (
            ConsumableMovement.objects.filter(consumable_id=consumable.consumable_id)
            .select_related("destination_location", "destination_location__location_type")
            .order_by("-consumable_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_location_id:
            return Response({"location_id": None, "location": None}, status=status.HTTP_200_OK)
        loc = last_move.destination_location
        return Response(
            {
                "location_id": loc.location_id,
                "location": LocationSerializer(loc).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="move")
    def move(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_account.is_superuser():
            allowed = True
        else:
            person = getattr(user_account, "person", None)
            if not person:
                return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)
            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            allowed = (
                ("stock_consumable_responsible" in role_codes)
                or ("asset_responsible" in role_codes)
                or ("exploitation_chief" in role_codes)
                or ("it_bureau_chief" in role_codes)
            )

        if not allowed:
            return Response(
                {"error": "Only Stock/Consumable Responsible, Asset Responsible, or superiors can move consumables"},
                status=status.HTTP_403_FORBIDDEN,
            )

        consumable = self.get_object()
        destination_location_id = request.data.get("destination_location_id")
        movement_reason = request.data.get("movement_reason") or "manual_move"
        if not destination_location_id:
            return Response({"error": "destination_location_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            destination_location_id_int = int(destination_location_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_location = Location.objects.filter(location_id=destination_location_id_int).first()
        if not destination_location:
            return Response({"error": "Invalid destination_location_id"}, status=status.HTTP_400_BAD_REQUEST)

        last_move = (
            ConsumableMovement.objects.select_related("destination_location")
            .filter(consumable_id=consumable.consumable_id)
            .order_by("-consumable_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_location_id:
            last_global_move = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
            next_move_id = (last_global_move.consumable_movement_id + 1) if last_global_move else 1

            _create_consumable_movement_with_translations(
                movement_reason=movement_reason,
                consumable_movement_id=next_move_id,
                consumable=consumable,
                source_location=destination_location,
                destination_location=destination_location,
                maintenance_step=None,
                external_maintenance_step_id=None,
                movement_datetime=timezone.now(),
            )

            return Response(
                {
                    "consumable_movement_id": next_move_id,
                    "source_location_id": destination_location.location_id,
                    "destination_location_id": destination_location.location_id,
                },
                status=status.HTTP_201_CREATED,
            )

        source_location = last_move.destination_location
        if source_location.location_id == destination_location.location_id:
            return Response({"error": "Consumable is already in this location"}, status=status.HTTP_400_BAD_REQUEST)

        last_global_move = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
        next_move_id = (last_global_move.consumable_movement_id + 1) if last_global_move else 1

        _create_consumable_movement_with_translations(
            movement_reason=movement_reason,
            consumable_movement_id=next_move_id,
            consumable=consumable,
            source_location=source_location,
            destination_location=destination_location,
            maintenance_step=None,
            external_maintenance_step_id=None,
            movement_datetime=timezone.now(),
        )

        return Response(
            {
                "consumable_movement_id": next_move_id,
                "source_location_id": source_location.location_id,
                "destination_location_id": destination_location.location_id,
            },
            status=status.HTTP_201_CREATED,
        )


class StockItemConsumableDestructionCertificateViewSet(viewsets.ModelViewSet):
    queryset = StockItemConsumableDestructionCertificate.objects.all().order_by("-destruction_certificate_id")
    serializer_class = StockItemConsumableDestructionCertificateSerializer
    permission_classes = [IsAuthenticated]

    def _role_codes(self, user_account: UserAccount | None):
        if not user_account or not getattr(user_account, "is_authenticated", False):
            return set()
        if getattr(user_account, "is_superuser", False):
            return {"superuser"}
        person = getattr(user_account, "person", None)
        if not person:
            return set()
        return set(PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True))

    def create(self, request, *args, **kwargs):
        user_account = getattr(request, "user", None)
        role_codes = self._role_codes(user_account)

        is_super = getattr(user_account, "is_superuser", False) or "superuser" in role_codes
        is_exploitation = "exploitation_chief" in role_codes
        is_itbc = "it_bureau_chief" in role_codes

        if not (is_super or is_exploitation or is_itbc):
            return Response(
                {"error": "Only exploitation chief, IT bureau chief, or superusers can create destruction certificates"},
                status=status.HTTP_403_FORBIDDEN,
            )

        def _parse_id_list(value, field_name: str):
            if value is None or value == "":
                return []
            if isinstance(value, list):
                return value
            if isinstance(value, str):
                try:
                    parsed = json.loads(value)
                except json.JSONDecodeError:
                    raise ValidationError({field_name: "Must be a JSON array or a list"})
                if not isinstance(parsed, list):
                    raise ValidationError({field_name: "Must be a JSON array or a list"})
                return parsed
            raise ValidationError({field_name: "Must be a list"})

        stock_item_ids = _parse_id_list(request.data.get("stock_item_ids"), "stock_item_ids")
        consumable_ids = _parse_id_list(request.data.get("consumable_ids"), "consumable_ids")

        # These roles can include any item type as long as it is failed.

        try:
            stock_item_ids_int = [int(x) for x in stock_item_ids]
            consumable_ids_int = [int(x) for x in consumable_ids]
        except (TypeError, ValueError):
            return Response({"error": "Invalid item id(s)"}, status=status.HTTP_400_BAD_REQUEST)

        if not stock_item_ids_int and not consumable_ids_int:
            return Response({"error": "At least one item must be included"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            last_item = StockItemConsumableDestructionCertificate.objects.order_by("-destruction_certificate_id").first()
            next_id = (last_item.destruction_certificate_id + 1) if last_item else 1

            cert = StockItemConsumableDestructionCertificate.objects.create(
                destruction_certificate_id=next_id,
                destruction_datetime=None,
            )

            if stock_item_ids_int:
                invalid = StockItem.objects.filter(stock_item_id__in=stock_item_ids_int).exclude(stock_item_status="suggested_for_destruction")
                if invalid.exists():
                    raise ValidationError({"stock_item_ids": "All stock items must have status 'suggested_for_destruction'"})
                already_linked = StockItem.objects.filter(stock_item_id__in=stock_item_ids_int).exclude(
                    stock_item_consumable_destruction_certificate_id__isnull=True
                )
                if already_linked.exists():
                    raise ValidationError({"stock_item_ids": "Some stock items are already linked to a destruction certificate"})
                StockItem.objects.filter(stock_item_id__in=stock_item_ids_int).update(
                    stock_item_consumable_destruction_certificate_id=cert.destruction_certificate_id
                )

            if consumable_ids_int:
                invalid = Consumable.objects.filter(consumable_id__in=consumable_ids_int).exclude(consumable_status="suggested_for_destruction")
                if invalid.exists():
                    raise ValidationError({"consumable_ids": "All consumables must have status 'suggested_for_destruction'"})
                already_linked = Consumable.objects.filter(consumable_id__in=consumable_ids_int).exclude(
                    stock_item_consumable_destruction_certificate_id__isnull=True
                )
                if already_linked.exists():
                    raise ValidationError({"consumable_ids": "Some consumables are already linked to a destruction certificate"})
                Consumable.objects.filter(consumable_id__in=consumable_ids_int).update(
                    stock_item_consumable_destruction_certificate_id=cert.destruction_certificate_id
                )

        return Response(self.get_serializer(cert).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="validate")
    def validate_certificate(self, request, pk=None):
        user_account = getattr(request, "user", None)
        role_codes = self._role_codes(user_account)
        is_super = getattr(user_account, "is_superuser", False) or "superuser" in role_codes
        allowed = is_super or ("exploitation_chief" in role_codes) or ("it_bureau_chief" in role_codes)
        if not allowed:
            return Response(
                {"error": "Only exploitation chief, IT bureau chief, or superusers can validate destruction certificates"},
                status=status.HTTP_403_FORBIDDEN,
            )

        cert = self.get_object()
        if getattr(cert, "destruction_datetime", None) is not None:
            return Response({"error": "Destruction certificate is already validated"}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        with transaction.atomic():
            StockItemConsumableDestructionCertificate.objects.filter(destruction_certificate_id=cert.destruction_certificate_id).update(
                destruction_datetime=now,
            )
            from api.utils.i18n import bulk_sync_status_translations
            bulk_sync_status_translations(StockItem, {'stock_item_consumable_destruction_certificate_id': cert.destruction_certificate_id}, 'destroyed')
            bulk_sync_status_translations(Consumable, {'stock_item_consumable_destruction_certificate_id': cert.destruction_certificate_id}, 'destroyed')

        cert.refresh_from_db()
        return Response(self.get_serializer(cert).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="digital-copy-exists")
    def digital_copy_exists(self, request, pk=None):
        cert = self.get_object()
        rel_path = getattr(cert, "digital_copy", None)
        abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path) if rel_path else None
        has_file = bool(rel_path) and abs_path is not None and os.path.isfile(abs_path)
        return Response({"exists": has_file}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="digital-copy")
    def digital_copy(self, request, pk=None):
        cert = self.get_object()
        rel_path = getattr(cert, "digital_copy", None)
        if not rel_path:
            return Response({"error": "No digital copy stored"}, status=status.HTTP_404_NOT_FOUND)

        abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
        if not os.path.isfile(abs_path):
            return Response({"error": "Digital copy file missing on server"}, status=status.HTTP_404_NOT_FOUND)

        resp = FileResponse(open(abs_path, "rb"), content_type="application/pdf")
        resp["Content-Disposition"] = f'inline; filename="destruction_certificate_{cert.destruction_certificate_id}.pdf"'
        return resp

    @action(detail=True, methods=["post"], url_path="upload-digital-copy")
    def upload_digital_copy(self, request, pk=None):
        user_account = getattr(request, "user", None)
        role_codes = self._role_codes(user_account)
        is_super = getattr(user_account, "is_superuser", False) or "superuser" in role_codes
        allowed = is_super or ("exploitation_chief" in role_codes) or ("it_bureau_chief" in role_codes)
        if not allowed:
            return Response(
                {"error": "Only exploitation chief, IT bureau chief, or superusers can upload destruction certificate digital copy"},
                status=status.HTTP_403_FORBIDDEN,
            )

        cert = self.get_object()
        if getattr(cert, "destruction_datetime", None) is None:
            return Response({"error": "Certificate must be validated before uploading the PDF"}, status=status.HTTP_400_BAD_REQUEST)

        digital_copy = request.FILES.get("digital_copy")
        if not digital_copy:
            return Response({"error": "digital_copy file is required"}, status=status.HTTP_400_BAD_REQUEST)

        content_type = getattr(digital_copy, "content_type", "") or ""
        if "pdf" not in content_type.lower():
            return Response({"error": "digital_copy must be a valid PDF"}, status=status.HTTP_400_BAD_REQUEST)

        rel_dir = os.path.join("destruction_certificates")
        base_dir = os.path.join(str(settings.MEDIA_ROOT), rel_dir)
        os.makedirs(base_dir, exist_ok=True)

        rel_path = os.path.join(rel_dir, f"destruction_certificate_{cert.destruction_certificate_id}.pdf")
        abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
        with open(abs_path, "wb") as f:
            f.write(digital_copy.read())

        StockItemConsumableDestructionCertificate.objects.filter(destruction_certificate_id=cert.destruction_certificate_id).update(
            digital_copy=rel_path
        )
        cert.refresh_from_db()
        return Response(self.get_serializer(cert).data, status=status.HTTP_200_OK)


class AssetDestructionCertificateViewSet(viewsets.ModelViewSet):
    queryset = AssetDestructionCertificate.objects.all().order_by("-asset_destruction_certificate_id")
    serializer_class = AssetDestructionCertificateSerializer
    permission_classes = [IsAuthenticated]

    def _role_codes(self, user_account: UserAccount | None):
        if not user_account or not getattr(user_account, "is_authenticated", False):
            return set()
        if getattr(user_account, "is_superuser", False):
            return {"superuser"}
        person = getattr(user_account, "person", None)
        if not person:
            return set()
        return set(PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True))

    def create(self, request, *args, **kwargs):
        user_account = getattr(request, "user", None)
        role_codes = self._role_codes(user_account)

        is_super = getattr(user_account, "is_superuser", False) or "superuser" in role_codes
        is_asset_responsible = "asset_responsible" in role_codes
        is_exploitation = "exploitation_chief" in role_codes
        is_itbc = "it_bureau_chief" in role_codes

        if not (is_super or is_asset_responsible or is_exploitation or is_itbc):
            return Response(
                {"error": "Only asset responsible, exploitation chief, IT bureau chief, or superusers can create asset destruction certificates"},
                status=status.HTTP_403_FORBIDDEN,
            )

        asset_ids = request.data.get("asset_ids")
        if asset_ids is None or asset_ids == "":
            asset_ids = []
        if isinstance(asset_ids, str):
            try:
                asset_ids = json.loads(asset_ids)
            except json.JSONDecodeError:
                return Response({"error": "asset_ids must be a JSON array"}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(asset_ids, list):
            return Response({"error": "asset_ids must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            asset_ids_int = [int(x) for x in asset_ids]
        except (TypeError, ValueError):
            return Response({"error": "Invalid asset id(s)"}, status=status.HTTP_400_BAD_REQUEST)

        if not asset_ids_int:
            return Response({"error": "At least one asset must be included"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            last_item = AssetDestructionCertificate.objects.order_by("-asset_destruction_certificate_id").first()
            next_id = (last_item.asset_destruction_certificate_id + 1) if last_item else 1

            cert = AssetDestructionCertificate.objects.create(
                asset_destruction_certificate_id=next_id,
                destruction_datetime=None,
            )

            invalid_assets = Asset.objects.filter(asset_id__in=asset_ids_int).exclude(asset_status="suggested_for_destruction")
            if invalid_assets.exists():
                raise ValidationError({"asset_ids": "All assets must have status 'suggested_for_destruction'"})

            already_linked = Asset.objects.filter(asset_id__in=asset_ids_int).exclude(destruction_certificate_id__isnull=True)
            if already_linked.exists():
                raise ValidationError({"asset_ids": "Some assets are already linked to an asset destruction certificate"})

            missing_origin = AssetFailedExternalMaintenance.objects.filter(asset_id__in=asset_ids_int).count() != len(asset_ids_int)
            if missing_origin:
                raise ValidationError({"asset_ids": "Some assets do not have an originating external maintenance recorded"})

            Asset.objects.filter(asset_id__in=asset_ids_int).update(destruction_certificate_id=cert.asset_destruction_certificate_id)

            origins = {
                row.asset_id: row.external_maintenance_id
                for row in AssetFailedExternalMaintenance.objects.filter(asset_id__in=asset_ids_int)
            }

            AssetDestructionCertificateAsset.objects.bulk_create(
                [
                    AssetDestructionCertificateAsset(
                        asset_destruction_certificate_id=cert.asset_destruction_certificate_id,
                        asset_id=asset_id,
                        external_maintenance_id=origins[asset_id],
                    )
                    for asset_id in asset_ids_int
                ]
            )

        return Response(self.get_serializer(cert).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="validate")
    def validate_certificate(self, request, pk=None):
        user_account = getattr(request, "user", None)
        role_codes = self._role_codes(user_account)
        is_super = getattr(user_account, "is_superuser", False) or "superuser" in role_codes
        allowed = is_super or ("asset_responsible" in role_codes) or ("exploitation_chief" in role_codes) or ("it_bureau_chief" in role_codes)
        if not allowed:
            return Response(
                {"error": "Only asset responsible, exploitation chief, IT bureau chief, or superusers can validate asset destruction certificates"},
                status=status.HTTP_403_FORBIDDEN,
            )

        cert = self.get_object()
        if getattr(cert, "destruction_datetime", None) is not None:
            return Response({"error": "Asset destruction certificate is already validated"}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        with transaction.atomic():
            AssetDestructionCertificate.objects.filter(asset_destruction_certificate_id=cert.asset_destruction_certificate_id).update(
                destruction_datetime=now,
            )
            from api.utils.i18n import bulk_sync_status_translations
            bulk_sync_status_translations(Asset, {'destruction_certificate_id': cert.asset_destruction_certificate_id}, 'destroyed')

        cert.refresh_from_db()
        return Response(self.get_serializer(cert).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="digital-copy-exists")
    def digital_copy_exists(self, request, pk=None):
        cert = self.get_object()
        rel_path = getattr(cert, "digital_copy", None)
        abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path) if rel_path else None
        has_file = bool(rel_path) and abs_path is not None and os.path.isfile(abs_path)
        return Response({"exists": has_file}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="digital-copy")
    def digital_copy(self, request, pk=None):
        cert = self.get_object()
        rel_path = getattr(cert, "digital_copy", None)
        if not rel_path:
            return Response({"error": "No digital copy stored"}, status=status.HTTP_404_NOT_FOUND)

        abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
        if not os.path.isfile(abs_path):
            return Response({"error": "Digital copy file missing on server"}, status=status.HTTP_404_NOT_FOUND)

        resp = FileResponse(open(abs_path, "rb"), content_type="application/pdf")
        resp["Content-Disposition"] = f'inline; filename="asset_destruction_certificate_{cert.asset_destruction_certificate_id}.pdf"'
        return resp

    @action(detail=True, methods=["post"], url_path="upload-digital-copy")
    def upload_digital_copy(self, request, pk=None):
        user_account = getattr(request, "user", None)
        role_codes = self._role_codes(user_account)
        is_super = getattr(user_account, "is_superuser", False) or "superuser" in role_codes
        allowed = is_super or ("asset_responsible" in role_codes) or ("exploitation_chief" in role_codes) or ("it_bureau_chief" in role_codes)
        if not allowed:
            return Response(
                {"error": "Only asset responsible, exploitation chief, IT bureau chief, or superusers can upload asset destruction certificate digital copy"},
                status=status.HTTP_403_FORBIDDEN,
            )

        cert = self.get_object()
        if getattr(cert, "destruction_datetime", None) is None:
            return Response({"error": "Certificate must be validated before uploading the PDF"}, status=status.HTTP_400_BAD_REQUEST)

        digital_copy = request.FILES.get("digital_copy")
        if not digital_copy:
            return Response({"error": "digital_copy file is required"}, status=status.HTTP_400_BAD_REQUEST)

        content_type = getattr(digital_copy, "content_type", "") or ""
        if "pdf" not in content_type.lower():
            return Response({"error": "digital_copy must be a valid PDF"}, status=status.HTTP_400_BAD_REQUEST)

        rel_dir = os.path.join("asset_destruction_certificates")
        base_dir = os.path.join(str(settings.MEDIA_ROOT), rel_dir)
        os.makedirs(base_dir, exist_ok=True)

        rel_path = os.path.join(rel_dir, f"asset_destruction_certificate_{cert.asset_destruction_certificate_id}.pdf")
        abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
        with open(abs_path, "wb") as f:
            f.write(digital_copy.read())

        AssetDestructionCertificate.objects.filter(asset_destruction_certificate_id=cert.asset_destruction_certificate_id).update(
            digital_copy=rel_path
        )
        cert.refresh_from_db()
        return Response(self.get_serializer(cert).data, status=status.HTTP_200_OK)

class ConsumableAttributeDefinitionViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableAttributeDefinition.objects.all().order_by("consumable_attribute_definition_id")
    serializer_class = ConsumableAttributeDefinitionSerializer

    def get_queryset(self):
        queryset = ConsumableAttributeDefinition.objects.all().order_by("consumable_attribute_definition_id")
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create consumable attribute definitions")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        translations_data = serializer.validated_data.pop('translations', None)
        last_def = ConsumableAttributeDefinition.objects.order_by("-consumable_attribute_definition_id").first()
        next_id = (last_def.consumable_attribute_definition_id + 1) if last_def else 1
        definition = ConsumableAttributeDefinition.objects.create(
            consumable_attribute_definition_id=next_id, **serializer.validated_data
        )
        if translations_data:
            from api.utils.i18n import save_translations
            save_translations(definition, translations_data)
        return Response(ConsumableAttributeDefinitionSerializer(definition).data, status=status.HTTP_201_CREATED)


class ConsumableTypeAttributeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableTypeAttribute.objects.all().order_by("consumable_type_id", "consumable_attribute_definition_id")
    serializer_class = ConsumableTypeAttributeSerializer

    def get_queryset(self):
        queryset = ConsumableTypeAttribute.objects.select_related("consumable_attribute_definition", "consumable_type")
        consumable_type_id = self.request.query_params.get("consumable_type")
        if consumable_type_id is not None:
            try:
                queryset = queryset.filter(consumable_type_id=int(consumable_type_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete consumable type attributes")
        if denial:
            return denial

        consumable_type_id = request.query_params.get("consumable_type")
        definition_id = request.query_params.get("consumable_attribute_definition") or kwargs.get("pk")
        if consumable_type_id:
            deleted, _ = ConsumableTypeAttribute.objects.filter(
                consumable_type_id=consumable_type_id,
                consumable_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)

            for model in ConsumableModel.objects.filter(consumable_type_id=consumable_type_id):
                _sync_consumable_model_attribute_values(model)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        instance = serializer.save()
        for model in ConsumableModel.objects.filter(consumable_type_id=instance.consumable_type_id):
            _sync_consumable_model_attribute_values(model)

    def perform_update(self, serializer):
        instance = serializer.save()
        for model in ConsumableModel.objects.filter(consumable_type_id=instance.consumable_type_id):
            _sync_consumable_model_attribute_values(model)


class ConsumableModelAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableModelAttributeValue.objects.all().order_by("consumable_model_id", "consumable_attribute_definition_id")
    serializer_class = ConsumableModelAttributeValueSerializer

    def get_queryset(self):
        queryset = ConsumableModelAttributeValue.objects.select_related(
            "consumable_attribute_definition", "consumable_model"
        )
        consumable_model_id = self.request.query_params.get("consumable_model")
        if consumable_model_id is not None:
            try:
                queryset = queryset.filter(consumable_model_id=int(consumable_model_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete consumable model attributes")
        if denial:
            return denial

        consumable_model_id = request.query_params.get("consumable_model")
        definition_id = request.query_params.get("consumable_attribute_definition") or kwargs.get("pk")
        if consumable_model_id:
            deleted, _ = ConsumableModelAttributeValue.objects.filter(
                consumable_model_id=consumable_model_id,
                consumable_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


class ConsumableAttributeValueViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableAttributeValue.objects.all().order_by("consumable_id", "consumable_attribute_definition_id")
    serializer_class = ConsumableAttributeValueSerializer

    def get_queryset(self):
        queryset = ConsumableAttributeValue.objects.select_related("consumable_attribute_definition", "consumable")
        consumable_id = self.request.query_params.get("consumable")
        if consumable_id is not None:
            try:
                queryset = queryset.filter(consumable_id=int(consumable_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def destroy(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "delete consumable attributes")
        if denial:
            return denial

        consumable_id = request.query_params.get("consumable")
        definition_id = request.query_params.get("consumable_attribute_definition") or kwargs.get("pk")
        if consumable_id:
            deleted, _ = ConsumableAttributeValue.objects.filter(
                consumable_id=consumable_id,
                consumable_attribute_definition_id=definition_id,
            ).delete()
            if deleted == 0:
                return Response({"error": "Mapping not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


# Location ViewSets
class LocationTypeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = LocationType.objects.all().order_by("location_type_id")
    serializer_class = LocationTypeSerializer


class LocationViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by("location_id")
    serializer_class = LocationSerializer

    def get_queryset(self):
        queryset = Location.objects.all().order_by("location_id")
        location_type = self.request.query_params.get("location_type")
        if location_type is not None:
            queryset = queryset.filter(location_type=location_type)
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create locations")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_item = Location.objects.order_by("-location_id").first()
        next_id = (last_item.location_id + 1) if last_item else 1
        item = Location.objects.create(location_id=next_id, **serializer.validated_data)
        return Response(LocationSerializer(item).data, status=status.HTTP_201_CREATED)


class LocationRelationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = LocationRelation.objects.all().order_by("child_location_id")
    serializer_class = LocationRelationSerializer

    def get_queryset(self):
        queryset = LocationRelation.objects.all().order_by("child_location_id")
        
        # Safely access query parameters
        if hasattr(self, 'request') and self.request:
            child_location = self.request.query_params.get("child_location")
            parent_location = self.request.query_params.get("parent_location")
            
            if child_location is not None:
                queryset = queryset.filter(child_location=child_location)
            if parent_location is not None:
                queryset = queryset.filter(parent_location=parent_location)
        
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Prevent circular references
        child_id = serializer.validated_data['child_location'].location_id
        parent_id = serializer.validated_data['parent_location'].location_id
        
        if child_id == parent_id:
            return Response(
                {"error": "A location cannot be its own parent"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if this would create a circular reference
        if self._would_create_circular_reference(child_id, parent_id):
            return Response(
                {"error": "This would create a circular reference in the location hierarchy"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate a unique relation_id
        from django.db.models import Max
        max_relation_id = LocationRelation.objects.aggregate(max_id=Max('relation_id'))['max_id'] or 0
        next_relation_id = max_relation_id + 1
        
        # Add relation_id to validated data
        validated_data = serializer.validated_data.copy()
        validated_data['relation_id'] = next_relation_id
        
        item = LocationRelation.objects.create(**validated_data)
        return Response(LocationRelationSerializer(item).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Prevent circular references on update
        if 'parent_location' in serializer.validated_data:
            child_id = instance.child_location.location_id
            parent_id = serializer.validated_data['parent_location'].location_id
            
            if child_id == parent_id:
                return Response(
                    {"error": "A location cannot be its own parent"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if self._would_create_circular_reference(child_id, parent_id):
                return Response(
                    {"error": "This would create a circular reference in the location hierarchy"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer.save()
        return Response(LocationRelationSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _would_create_circular_reference(self, child_id, parent_id):
        """Check if setting parent_id as parent of child_id would create a circular reference"""
        visited = set()
        current = parent_id
        
        while current is not None and current not in visited:
            visited.add(current)
            try:
                parent_relation = LocationRelation.objects.get(child_location_id=current)
                current = parent_relation.parent_location.location_id
            except LocationRelation.DoesNotExist:
                current = None
        
        return current == child_id

    @action(detail=False, methods=['get'], url_path='by-child/(?P<child_id>[^/.]+)')
    def by_child(self, request, child_id=None):
        """Get relations by child location ID"""
        try:
            relations = LocationRelation.objects.filter(child_location_id=child_id)
            serializer = self.get_serializer(relations, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='by-parent/(?P<parent_id>[^/.]+)')
    def by_parent(self, request, parent_id=None):
        """Get relations by parent location ID"""
        try:
            relations = LocationRelation.objects.filter(parent_location_id=parent_id)
            serializer = self.get_serializer(relations, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='hierarchy/(?P<location_id>[^/.]+)')
    def hierarchy(self, request, location_id=None):
        """Get the full hierarchy for a location (parents and children)"""
        try:
            location = Location.objects.get(location_id=location_id)
            
            # Get parent chain
            parents = []
            current = location
            while True:
                try:
                    parent_relation = LocationRelation.objects.get(child_location=current)
                    parent_location = parent_relation.parent_location
                    parents.append({
                        'location_id': parent_location.location_id,
                        'location_name': parent_location.location_name,
                        'location_type': parent_location.location_type.location_type_label if parent_location.location_type else None
                    })
                    current = parent_location
                except LocationRelation.DoesNotExist:
                    break
            
            # Get direct children
            children_relations = LocationRelation.objects.filter(parent_location=location)
            children = []
            for relation in children_relations:
                child_location = relation.child_location
                children.append({
                    'location_id': child_location.location_id,
                    'location_name': child_location.location_name,
                    'location_type': child_location.location_type.location_type_label if child_location.location_type else None
                })
            
            return Response({
                'location': {
                    'location_id': location.location_id,
                    'location_name': location.location_name,
                    'location_type': location.location_type.location_type_label if location.location_type else None
                },
                'parents': list(reversed(parents)),  # Root first
                'children': children
            })
        except Location.DoesNotExist:
            return Response({"error": "Location not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PhysicalConditionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PhysicalCondition.objects.all().order_by("condition_id")
    serializer_class = PhysicalConditionSerializer
    permission_classes = [IsAuthenticated]


# Position ViewSet
class PositionViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = Position.objects.all().order_by("position_id")
    serializer_class = PositionSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create positions")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_position = Position.objects.order_by("-position_id").first()
        next_id = (last_position.position_id + 1) if last_position else 1
        position = Position.objects.create(position_id=next_id, **serializer.validated_data)
        return Response(PositionSerializer(position).data, status=status.HTTP_201_CREATED)


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all().order_by("role_id")
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


class PositionRoleMappingViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = PositionRoleMapping.objects.select_related("position", "role").all().order_by("position_id", "role_id")
    serializer_class = PositionRoleMappingSerializer
    lookup_field = "pk"
    lookup_value_regex = r"[0-9]+-[0-9]+"

    def _parse_lookup_pair(self):
        raw = self.kwargs.get(self.lookup_field)
        if not raw or "-" not in raw:
            raise ValidationError({"error": "Invalid mapping id. Expected format: <position_id>-<role_id>"})
        left, right = raw.split("-", 1)
        try:
            return int(left), int(right)
        except (TypeError, ValueError):
            raise ValidationError({"error": "Invalid mapping id. position_id and role_id must be integers"})

    def get_object(self):
        position_id, role_id = self._parse_lookup_pair()
        return self.get_queryset().get(position_id=position_id, role_id=role_id)


# Organizational Structure ViewSets
class OrganizationalStructureTypeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = OrganizationalStructureType.objects.all().order_by("organizational_structure_type_id")
    serializer_class = OrganizationalStructureTypeSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create organizational structure types")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_type = OrganizationalStructureType.objects.order_by("-organizational_structure_type_id").first()
        next_id = (last_type.organizational_structure_type_id + 1) if last_type else 1
        org_type = OrganizationalStructureType.objects.create(organizational_structure_type_id=next_id, **serializer.validated_data)
        return Response(OrganizationalStructureTypeSerializer(org_type).data, status=status.HTTP_201_CREATED)


class OrganizationalStructureViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = OrganizationalStructure.objects.all().order_by("organizational_structure_id")
    serializer_class = OrganizationalStructureSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create organizational structures")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        translations_data = serializer.validated_data.pop('translations', None)
        last_org = OrganizationalStructure.objects.order_by("-organizational_structure_id").first()
        next_id = (last_org.organizational_structure_id + 1) if last_org else 1
        org_structure = OrganizationalStructure.objects.create(organizational_structure_id=next_id, **serializer.validated_data)

        # Always save English translation from structure_name
        try:
            if not translations_data:
                translations_data = {}
            if 'en' not in translations_data:
                translations_data['en'] = {}
            if org_structure.structure_name:
                translations_data['en']['structure_name'] = org_structure.structure_name
            from api.utils.i18n import save_translations
            save_translations(org_structure, translations_data)
        except (json.JSONDecodeError, TypeError):
            pass

        return Response(OrganizationalStructureSerializer(org_structure).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        translations_data = serializer.validated_data.pop('translations', None)
        serializer.save()

        # Always save English translation from structure_name
        try:
            if not translations_data:
                translations_data = {}
            if 'en' not in translations_data:
                translations_data['en'] = {}
            if instance.structure_name:
                translations_data['en']['structure_name'] = instance.structure_name
            from api.utils.i18n import save_translations
            save_translations(instance, translations_data)
        except (json.JSONDecodeError, TypeError):
            pass

        return Response(OrganizationalStructureSerializer(instance).data)


class OrganizationalStructureRelationViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = OrganizationalStructureRelation.objects.all().order_by("child_organizational_structure_id", "parent_organizational_structure_id")
    serializer_class = OrganizationalStructureRelationSerializer

    def get_queryset(self):
        queryset = OrganizationalStructureRelation.objects.select_related(
            "child_organizational_structure", "parent_organizational_structure"
        ).order_by("child_organizational_structure_id", "parent_organizational_structure_id")
        org_structure_id = self.request.query_params.get("org_structure_id")
        if org_structure_id is not None:
            try:
                queryset = queryset.filter(child_organizational_structure_id=int(org_structure_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create organizational structure relations")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        relation = OrganizationalStructureRelation.objects.create(**serializer.validated_data)
        return Response(OrganizationalStructureRelationSerializer(relation).data, status=status.HTTP_201_CREATED)


class AssetIsAssignedToPersonViewSet(viewsets.ModelViewSet):
    queryset = AssetIsAssignedToPerson.objects.all().order_by("-start_datetime")
    serializer_class = AssetIsAssignedToPersonSerializer
    permission_classes = [IsAuthenticated]

    def _get_user_account(self, request):
        if hasattr(request, "user") and request.user and getattr(request.user, "is_authenticated", False):
            if isinstance(request.user, UserAccount):
                return request.user
        try:
            if hasattr(request, "auth") and request.auth is not None:
                user_id = request.auth.get("user_id")
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except:
            pass
        return None

    def create(self, request, *args, **kwargs):
        user_account = self._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = getattr(user_account, "person", None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        is_asset_responsible = "asset_responsible" in role_codes
        is_superuser = user_account.is_superuser()
        is_exploitation_chief = "exploitation_chief" in role_codes
        is_itbc = "it_bureau_chief" in role_codes

        if not (is_asset_responsible or is_superuser or is_exploitation_chief or is_itbc):
            return Response({"error": "Only Asset Responsible or superiors can assign assets"}, status=status.HTTP_403_FORBIDDEN)

        asset_id = request.data.get("asset")
        if not asset_id:
            return Response({"error": "Asset ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check for active assignment
        active_assignment = AssetIsAssignedToPerson.objects.filter(asset_id=asset_id, is_active=True).exists()
        if active_assignment:
            return Response({"error": "This asset is already assigned and active."}, status=status.HTTP_400_BAD_REQUEST)

        last_item = AssetIsAssignedToPerson.objects.order_by("-assignment_id").first()
        next_id = (last_item.assignment_id + 1) if last_item else 1

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"--- Asset Assignment Validation Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data.copy()
        
        print(f"--- Asset Assignment Validated Data: {data}")

        try:
            last_item = AssetIsAssignedToPerson.objects.all().order_by("-assignment_id").first()
            next_id = (last_item.assignment_id + 1) if last_item else 1
            
            # Explicitly add asset and person if they came as IDs but weren't in validated_data 
            # (though they should be if they are properly configured in serializer)
            
            assignment = AssetIsAssignedToPerson.objects.create(
                assignment_id=next_id, 
                assigned_by_person=person, 
                is_active=True, 
                **data
            )
            return Response(self.get_serializer(assignment).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"--- Asset Assignment Creation ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        user_account = self._get_user_account(request)
        person = getattr(user_account, "person", None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        if ("exploitation_chief" not in role_codes) and ("it_bureau_chief" not in role_codes) and (not user_account.is_superuser()):
            return Response({"error": "Only Exploitation Chief can confirm assignments"}, status=status.HTTP_403_FORBIDDEN)

        assignment = self.get_object()
        assignment.is_confirmed_by_exploitation_chief = person
        assignment.save()

        return Response(self.get_serializer(assignment).data)

    @action(detail=True, methods=["post"])
    def discharge(self, request, pk=None):
        from django.utils import timezone

        user_account = self._get_user_account(request)
        person = getattr(user_account, "person", None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        is_asset_responsible = "asset_responsible" in role_codes
        is_superuser = user_account.is_superuser()
        is_exploitation_chief = "exploitation_chief" in role_codes
        is_itbc = "it_bureau_chief" in role_codes

        if not (is_asset_responsible or is_superuser or is_exploitation_chief or is_itbc):
            return Response(
                {"error": "Only Asset Responsible or superiors can discharge assets"},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment = self.get_object()
        if not assignment.is_active:
            return Response({"error": "This assignment is already inactive."}, status=status.HTTP_400_BAD_REQUEST)

        assignment.end_datetime = timezone.now()
        assignment.is_active = False
        assignment.save()

        return Response(self.get_serializer(assignment).data)


class StockItemIsAssignedToPersonViewSet(viewsets.ModelViewSet):
    queryset = StockItemIsAssignedToPerson.objects.all().order_by("-start_datetime")
    serializer_class = StockItemIsAssignedToPersonSerializer
    permission_classes = [IsAuthenticated]

    def _get_user_account(self, request):
        return AssetIsAssignedToPersonViewSet()._get_user_account(request)

    def get_queryset(self):
        qs = StockItemIsAssignedToPerson.objects.all().order_by("-start_datetime")
        stock_item_id = self.request.query_params.get("stock_item")
        person_id = self.request.query_params.get("person")
        is_active = self.request.query_params.get("is_active")

        if stock_item_id not in (None, ""):
            try:
                qs = qs.filter(stock_item_id=int(stock_item_id))
            except (TypeError, ValueError):
                pass
        if person_id not in (None, ""):
            try:
                qs = qs.filter(person_id=int(person_id))
            except (TypeError, ValueError):
                pass
        if is_active in ("true", "false"):
            qs = qs.filter(is_active=(is_active == "true"))
        return qs

    def create(self, request, *args, **kwargs):
        user_account = self._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = getattr(user_account, "person", None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        is_responsible = "stock_consumable_responsible" in role_codes
        is_superuser = user_account.is_superuser()
        is_exploitation_chief = "exploitation_chief" in role_codes

        if not (is_responsible or is_superuser or is_exploitation_chief):
            return Response(
                {"error": "Only Stock/Consumable Responsible or superiors can assign stock items"},
                status=status.HTTP_403_FORBIDDEN,
            )

        stock_item_id = request.data.get("stock_item")
        if not stock_item_id:
            return Response({"error": "Stock item ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        active_assignment = StockItemIsAssignedToPerson.objects.filter(stock_item_id=stock_item_id, is_active=True).exists()
        if active_assignment:
            return Response({"error": "This stock item is already assigned and active."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()

        last_item = StockItemIsAssignedToPerson.objects.order_by("-assignment_id").first()
        next_id = (last_item.assignment_id + 1) if last_item else 1

        assignment = StockItemIsAssignedToPerson.objects.create(
            assignment_id=next_id,
            assigned_by_person=person,
            is_active=True,
            **data,
        )
        return Response(self.get_serializer(assignment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def discharge(self, request, pk=None):
        from django.utils import timezone

        user_account = self._get_user_account(request)
        person = getattr(user_account, "person", None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        is_responsible = "stock_consumable_responsible" in role_codes
        is_superuser = user_account.is_superuser()
        is_exploitation_chief = "exploitation_chief" in role_codes

        if not (is_responsible or is_superuser or is_exploitation_chief):
            return Response(
                {"error": "Only Stock/Consumable Responsible or superiors can discharge stock items"},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment = self.get_object()
        if not assignment.is_active:
            return Response({"error": "This assignment is already inactive."}, status=status.HTTP_400_BAD_REQUEST)

        assignment.end_datetime = timezone.now()
        assignment.is_active = False
        assignment.save()

        return Response(self.get_serializer(assignment).data)


class ConsumableIsAssignedToPersonViewSet(viewsets.ModelViewSet):
    queryset = ConsumableIsAssignedToPerson.objects.all().order_by("-start_datetime")
    serializer_class = ConsumableIsAssignedToPersonSerializer
    permission_classes = [IsAuthenticated]

    def _get_user_account(self, request):
        return AssetIsAssignedToPersonViewSet()._get_user_account(request)

    def get_queryset(self):
        qs = ConsumableIsAssignedToPerson.objects.all().order_by("-start_datetime")
        consumable_id = self.request.query_params.get("consumable")
        person_id = self.request.query_params.get("person")
        is_active = self.request.query_params.get("is_active")

        if consumable_id not in (None, ""):
            try:
                qs = qs.filter(consumable_id=int(consumable_id))
            except (TypeError, ValueError):
                pass
        if person_id not in (None, ""):
            try:
                qs = qs.filter(person_id=int(person_id))
            except (TypeError, ValueError):
                pass
        if is_active in ("true", "false"):
            qs = qs.filter(is_active=(is_active == "true"))
        return qs

    def create(self, request, *args, **kwargs):
        user_account = self._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = getattr(user_account, "person", None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        is_responsible = "stock_consumable_responsible" in role_codes
        is_superuser = user_account.is_superuser()
        is_exploitation_chief = "exploitation_chief" in role_codes

        if not (is_responsible or is_superuser or is_exploitation_chief):
            return Response(
                {"error": "Only Stock/Consumable Responsible or superiors can assign consumables"},
                status=status.HTTP_403_FORBIDDEN,
            )

        consumable_id = request.data.get("consumable")
        if not consumable_id:
            return Response({"error": "Consumable ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        active_assignment = ConsumableIsAssignedToPerson.objects.filter(consumable_id=consumable_id, is_active=True).exists()
        if active_assignment:
            return Response({"error": "This consumable is already assigned and active."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()

        last_item = ConsumableIsAssignedToPerson.objects.order_by("-assignment_id").first()
        next_id = (last_item.assignment_id + 1) if last_item else 1

        assignment = ConsumableIsAssignedToPerson.objects.create(
            assignment_id=next_id,
            assigned_by_person=person,
            is_active=True,
            **data,
        )
        return Response(self.get_serializer(assignment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def discharge(self, request, pk=None):
        from django.utils import timezone

        user_account = self._get_user_account(request)
        person = getattr(user_account, "person", None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        is_responsible = "stock_consumable_responsible" in role_codes
        is_superuser = user_account.is_superuser()
        is_exploitation_chief = "exploitation_chief" in role_codes

        if not (is_responsible or is_superuser or is_exploitation_chief):
            return Response(
                {"error": "Only Stock/Consumable Responsible or superiors can discharge consumables"},
                status=status.HTTP_403_FORBIDDEN,
            )

        assignment = self.get_object()
        if not assignment.is_active:
            return Response({"error": "This assignment is already inactive."}, status=status.HTTP_400_BAD_REQUEST)

        assignment.end_datetime = timezone.now()
        assignment.is_active = False
        assignment.save()

        return Response(self.get_serializer(assignment).data)


class StockItemMovementApprovalViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _require_responsible(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return None, Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if user_account.is_superuser() or ("stock_consumable_responsible" in role_codes) or ("exploitation_chief" in role_codes):
            return user_account, None

        return None, Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=["get"], url_path="pending")
    def pending(self, request):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        qs = (
            StockItemMovement.objects.filter(status="pending")
            .filter(
                Q(movement_reason="return_to_owner")
                | Q(movement_reason="problem_report_include")
                | Q(movement_reason="maintenance_step_return_to_owner")
            )
            .order_by("-movement_datetime", "-stock_item_movement_id")
        )

        data = [
            {
                "stock_item_movement_id": m.stock_item_movement_id,
                "stock_item_id": m.stock_item_id,
                "source_location_id": m.source_location_id,
                "destination_location_id": m.destination_location_id,
                "movement_reason": m.movement_reason,
                "movement_datetime": m.movement_datetime,
                "status": m.status,
            }
            for m in qs
        ]
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="decide")
    def decide(self, request, pk=None):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        decision = request.data.get("decision")
        if decision not in {"accepted", "rejected"}:
            return Response({"error": "decision must be 'accepted' or 'rejected'"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            movement_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid movement id"}, status=status.HTTP_400_BAD_REQUEST)

        movement = StockItemMovement.objects.filter(stock_item_movement_id=movement_id).first()
        if not movement:
            return Response({"error": "Movement not found"}, status=status.HTTP_404_NOT_FOUND)

        if not (
            movement.movement_reason in {"problem_report_include", "return_to_owner", "maintenance_step_return_to_owner"}
        ):
            return Response({"error": "Only problem_report_include, return_to_owner, or maintenance_step_return_to_owner movements can be decided"}, status=status.HTTP_400_BAD_REQUEST)

        if movement.status != "pending":
            return Response({"error": "Only pending movements can be decided"}, status=status.HTTP_400_BAD_REQUEST)

        StockItemMovement.objects.filter(stock_item_movement_id=movement.stock_item_movement_id).update(status=decision)
        movement.refresh_from_db()
        return Response(
            {
                "stock_item_movement_id": movement.stock_item_movement_id,
                "stock_item_id": movement.stock_item_id,
                "source_location_id": movement.source_location_id,
                "destination_location_id": movement.destination_location_id,
                "movement_reason": movement.movement_reason,
                "movement_datetime": movement.movement_datetime,
                "status": movement.status,
            },
            status=status.HTTP_200_OK,
        )


class ConsumableMovementApprovalViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _require_responsible(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return None, Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if user_account.is_superuser() or ("stock_consumable_responsible" in role_codes) or ("exploitation_chief" in role_codes):
            return user_account, None

        return None, Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=["get"], url_path="pending")
    def pending(self, request):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        qs = (
            ConsumableMovement.objects.filter(status="pending")
            .filter(
                Q(movement_reason="return_to_owner")
                | Q(movement_reason="problem_report_include")
                | Q(movement_reason="maintenance_step_return_to_owner")
            )
            .order_by("-movement_datetime", "-consumable_movement_id")
        )

        data = [
            {
                "consumable_movement_id": m.consumable_movement_id,
                "consumable_id": m.consumable_id,
                "source_location_id": m.source_location_id,
                "destination_location_id": m.destination_location_id,
                "movement_reason": m.movement_reason,
                "movement_datetime": m.movement_datetime,
                "status": m.status,
            }
            for m in qs
        ]
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="decide")
    def decide(self, request, pk=None):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        decision = request.data.get("decision")
        if decision not in {"accepted", "rejected"}:
            return Response({"error": "decision must be 'accepted' or 'rejected'"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            movement_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid movement id"}, status=status.HTTP_400_BAD_REQUEST)

        movement = ConsumableMovement.objects.filter(consumable_movement_id=movement_id).first()
        if not movement:
            return Response({"error": "Movement not found"}, status=status.HTTP_404_NOT_FOUND)

        if not (
            movement.movement_reason in {"problem_report_include", "return_to_owner", "maintenance_step_return_to_owner"}
        ):
            return Response(
                {"error": "Only problem_report_include, return_to_owner, or maintenance_step_return_to_owner movements can be decided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if movement.status != "pending":
            return Response({"error": "Only pending movements can be decided"}, status=status.HTTP_400_BAD_REQUEST)

        ConsumableMovement.objects.filter(consumable_movement_id=movement.consumable_movement_id).update(status=decision)
        movement.refresh_from_db()
        return Response(
            {
                "consumable_movement_id": movement.consumable_movement_id,
                "consumable_id": movement.consumable_id,
                "source_location_id": movement.source_location_id,
                "destination_location_id": movement.destination_location_id,
                "movement_reason": movement.movement_reason,
                "movement_datetime": movement.movement_datetime,
                "status": movement.status,
            },
            status=status.HTTP_200_OK,
        )


class AssetMovementApprovalViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _require_asset_responsible(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return None, Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if user_account.is_superuser() or ("asset_responsible" in role_codes) or ("exploitation_chief" in role_codes) or ("it_bureau_chief" in role_codes):
            return user_account, None

        return None, Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=["get"], url_path="pending")
    def pending(self, request):
        _, denial = self._require_asset_responsible(request)
        if denial:
            return denial

        lang = request.query_params.get('lang') or request.headers.get('Accept-Language', '').split(',')[0].split(';')[0].strip().split('-')[0].lower() or 'en'
        status_filter = request.query_params.get('status', 'pending')

        qs = AssetMovement.objects.select_related(
            "asset", "source_location", "destination_location"
        )
        if status_filter == 'all':
            pass  # no status filter
        elif status_filter in ('pending', 'accepted', 'rejected'):
            qs = qs.filter(status=status_filter)
        else:
            qs = qs.filter(Q(status="pending") | Q(status__isnull=True))
        qs = qs.order_by("-movement_datetime", "-asset_movement_id")

        # Pre-fetch translations for the requested language
        movement_ids = list(qs.values_list("asset_movement_id", flat=True))
        asset_ids = list(qs.values_list("asset_id", flat=True))
        location_ids = list(qs.values_list("source_location_id", flat=True)) + list(qs.values_list("destination_location_id", flat=True))

        reason_translations = {}
        asset_name_translations = {}
        location_name_translations = {}

        from api.translations import AssetMovementTranslation, AssetTranslation, LocationTranslation

        # Always fetch reason translations (English uses human-readable form, not snake_case)
        if movement_ids:
            for t in AssetMovementTranslation.objects.filter(asset_movement_id__in=movement_ids, language_code=lang):
                if t.movement_reason:
                    reason_translations[t.asset_movement_id] = t.movement_reason

        if lang != 'en':
            if asset_ids:
                for t in AssetTranslation.objects.filter(asset_id__in=asset_ids, language_code=lang):
                    if t.asset_name:
                        asset_name_translations[t.asset_id] = t.asset_name
            if location_ids:
                for t in LocationTranslation.objects.filter(location_id__in=location_ids, language_code=lang):
                    if t.location_name:
                        location_name_translations[t.location_id] = t.location_name

        data = [
            {
                "asset_movement_id": m.asset_movement_id,
                "asset_id": m.asset_id,
                "asset_name": asset_name_translations.get(m.asset_id, getattr(m.asset, 'asset_name', None) or ''),
                "asset_inventory_number": getattr(m.asset, 'asset_inventory_number', None) or '',
                "source_location_id": m.source_location_id,
                "source_location_name": location_name_translations.get(m.source_location_id, getattr(m.source_location, 'location_name', None) or ''),
                "destination_location_id": m.destination_location_id,
                "destination_location_name": location_name_translations.get(m.destination_location_id, getattr(m.destination_location, 'location_name', None) or ''),
                "movement_reason": m.movement_reason,
                "movement_reason_translated": reason_translations.get(m.asset_movement_id, m.movement_reason),
                "movement_datetime": m.movement_datetime,
                "status": m.status,
            }
            for m in qs
        ]
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="decide")
    def decide(self, request, pk=None):
        _, denial = self._require_asset_responsible(request)
        if denial:
            return denial

        decision = request.data.get("decision")
        if decision not in {"accepted", "rejected"}:
            return Response({"error": "decision must be 'accepted' or 'rejected'"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            movement_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid movement id"}, status=status.HTTP_400_BAD_REQUEST)

        movement = AssetMovement.objects.filter(asset_movement_id=movement_id).first()
        if not movement:
            return Response({"error": "Movement not found"}, status=status.HTTP_404_NOT_FOUND)

        if movement.status != "pending":
            return Response({"error": "Only pending movements can be decided"}, status=status.HTTP_400_BAD_REQUEST)

        AssetMovement.objects.filter(asset_movement_id=movement.asset_movement_id).update(status=decision)
        movement.refresh_from_db()
        return Response(
            {
                "asset_movement_id": movement.asset_movement_id,
                "asset_id": movement.asset_id,
                "source_location_id": movement.source_location_id,
                "destination_location_id": movement.destination_location_id,
                "movement_reason": movement.movement_reason,
                "movement_datetime": movement.movement_datetime,
                "status": movement.status,
            },
            status=status.HTTP_200_OK,
        )


class PurchaseOrderViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _require_purchase_order_consult(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not getattr(user_account, "person", None):
            return None, set(), Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        allowed = {
            "stock_consumable_responsible",
            "exploitation_chief",
            "director_admin_support",
            "protection_and_security_bureau_chief",
            "school_headquarter",
            "it_bureau_chief",
        }
        if user_account.is_superuser() or (role_codes & allowed):
            return user_account, role_codes, None

        return None, set(), Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

    def _require_responsible(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not getattr(user_account, "person", None):
            return None, Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if user_account.is_superuser() or ("stock_consumable_responsible" in role_codes) or ("exploitation_chief" in role_codes):
            return user_account, None

        return None, Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

    def _require_acceptance_report_consult(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not getattr(user_account, "person", None):
            return None, set(), Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        allowed = {
            "stock_consumable_responsible",
            "exploitation_chief",
            "director_admin_support",
            "protection_and_security_bureau_chief",
            "school_headquarter",
            "it_bureau_chief",
        }
        if user_account.is_superuser() or (role_codes & allowed):
            return user_account, role_codes, None

        return None, set(), Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

    def list(self, request):
        _, _, denial = self._require_purchase_order_consult(request)
        if denial:
            return denial

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT po.purchase_order_id,
                       po.supplier_id,
                       s.supplier_name,
                       po.is_signed_by_finance,
                       po.purchase_order_code,
                       (
                           EXISTS (
                               SELECT 1
                               FROM public.stock_item_model_is_found_in_purchase_order l
                               WHERE l.purchase_order_id = po.purchase_order_id
                                 AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                           )
                           OR EXISTS (
                               SELECT 1
                               FROM public.consumable_model_is_found_in_purchase_order l
                               WHERE l.purchase_order_id = po.purchase_order_id
                                 AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                           )
                       ) AS has_remaining
                FROM public.purchase_order po
                LEFT JOIN public.supplier s ON s.supplier_id = po.supplier_id
                ORDER BY po.purchase_order_id DESC
                """
            )
            rows = cursor.fetchall()

        return Response(
            [
                {
                    "purchase_order_id": r[0],
                    "supplier_id": r[1],
                    "supplier_name": r[2],
                    "is_signed_by_finance": r[3],
                    "purchase_order_code": r[4],
                    "has_remaining": bool(r[5]),
                }
                for r in rows
            ],
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="suppliers")
    def suppliers(self, request):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT s.supplier_id,
                       s.supplier_name
                FROM public.supplier s
                ORDER BY s.supplier_name, s.supplier_id
                """
            )
            rows = cursor.fetchall()

        return Response(
            [
                {
                    "supplier_id": r[0],
                    "supplier_name": r[1],
                }
                for r in rows
            ],
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"], url_path="included-items")
    def included_items(self, request, pk=None):
        _, _, denial = self._require_purchase_order_consult(request)
        if denial:
            return denial

        try:
            purchase_order_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase order id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM public.purchase_order WHERE purchase_order_id = %s",
                [purchase_order_id],
            )
            if cursor.fetchone() is None:
                return Response({"error": "Purchase order not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute(
                """
                SELECT stock_item_model_id, COALESCE(quantity_received, 0)
                FROM public.stock_item_model_is_found_in_purchase_order
                WHERE purchase_order_id = %s
                """,
                [purchase_order_id],
            )
            stock_lines = cursor.fetchall()

            cursor.execute(
                """
                SELECT consumable_model_id, COALESCE(quantity_received, 0)
                FROM public.consumable_model_is_found_in_purchase_order
                WHERE purchase_order_id = %s
                """,
                [purchase_order_id],
            )
            cons_lines = cursor.fetchall()

        stock_items = []
        for model_id, qty in stock_lines:
            try:
                qty_int = int(qty or 0)
            except (TypeError, ValueError):
                qty_int = 0
            if qty_int <= 0:
                continue
            qs = list(
                StockItem.objects.filter(stock_item_model_id=model_id)
                .order_by("-stock_item_id")[:qty_int]
            )
            stock_items.extend([StockItemSerializer(s).data for s in qs])

        consumables = []
        for model_id, qty in cons_lines:
            try:
                qty_int = int(qty or 0)
            except (TypeError, ValueError):
                qty_int = 0
            if qty_int <= 0:
                continue
            qs = list(
                Consumable.objects.filter(consumable_model_id=model_id)
                .order_by("-consumable_id")[:qty_int]
            )
            consumables.extend([ConsumableSerializer(c).data for c in qs])

        return Response(
            {
                "purchase_order_id": purchase_order_id,
                "stock_items": stock_items,
                "consumables": consumables,
            },
            status=status.HTTP_200_OK,
        )

    def create(self, request):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        supplier_id = request.data.get("supplier_id")
        purchase_order_code = request.data.get("purchase_order_code")
        is_signed_by_finance = request.data.get("is_signed_by_finance")
        stock_item_models = request.data.get("stock_item_models")
        consumable_models = request.data.get("consumable_models")

        if supplier_id in (None, ""):
            return Response({"error": "supplier_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            supplier_id_int = int(supplier_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid supplier_id"}, status=status.HTTP_400_BAD_REQUEST)

        if is_signed_by_finance in (None, ""):
            is_signed_bool = False
        elif isinstance(is_signed_by_finance, bool):
            is_signed_bool = is_signed_by_finance
        elif isinstance(is_signed_by_finance, (int, float)):
            is_signed_bool = bool(is_signed_by_finance)
        elif isinstance(is_signed_by_finance, str):
            is_signed_bool = is_signed_by_finance.strip().lower() in {"1", "true", "t", "yes", "y"}
        else:
            is_signed_bool = False

        if stock_item_models is None:
            stock_item_models = []
        if consumable_models is None:
            consumable_models = []
        if not isinstance(stock_item_models, list) or not isinstance(consumable_models, list):
            return Response(
                {"error": "stock_item_models and consumable_models must be lists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT 1 FROM public.supplier WHERE supplier_id = %s",
                    [supplier_id_int],
                )
                if cursor.fetchone() is None:
                    return Response({"error": "Supplier not found"}, status=status.HTTP_400_BAD_REQUEST)

                cursor.execute("SELECT COALESCE(MAX(purchase_order_id), 0) + 1 FROM public.purchase_order")
                next_id = cursor.fetchone()[0]

                cursor.execute(
                    """
                    INSERT INTO public.purchase_order
                        (purchase_order_id, supplier_id, digital_copy, is_signed_by_finance, purchase_order_code)
                    VALUES (%s, %s, NULL, %s, %s)
                    """,
                    [next_id, supplier_id_int, is_signed_bool, purchase_order_code],
                )

                for raw in stock_item_models:
                    if not isinstance(raw, dict):
                        return Response(
                            {"error": "Each stock_item_models entry must be an object"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    stock_item_model_id = raw.get("stock_item_model_id")
                    if stock_item_model_id in (None, ""):
                        return Response(
                            {"error": "stock_item_model_id is required for stock item model line"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    try:
                        stock_item_model_id_int = int(stock_item_model_id)
                    except (TypeError, ValueError):
                        return Response({"error": "Invalid stock_item_model_id"}, status=status.HTTP_400_BAD_REQUEST)

                    def _to_int(v):
                        if v in (None, ""):
                            return None
                        return int(v)

                    quantity_ordered = _to_int(raw.get("quantity_ordered"))
                    quantity_received = _to_int(raw.get("quantity_received"))
                    if quantity_received is None:
                        quantity_received = 0
                    unit_price = raw.get("unit_price")
                    if unit_price in (None, ""):
                        unit_price_dec = None
                    else:
                        unit_price_dec = Decimal(str(unit_price))

                    cursor.execute(
                        """
                        INSERT INTO public.stock_item_model_is_found_in_purchase_order
                            (stock_item_model_id, purchase_order_id, quantity_ordered, quantity_received, unit_price)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        [
                            stock_item_model_id_int,
                            next_id,
                            quantity_ordered,
                            quantity_received,
                            unit_price_dec,
                        ],
                    )

                for raw in consumable_models:
                    if not isinstance(raw, dict):
                        return Response(
                            {"error": "Each consumable_models entry must be an object"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    consumable_model_id = raw.get("consumable_model_id")
                    if consumable_model_id in (None, ""):
                        return Response(
                            {"error": "consumable_model_id is required for consumable model line"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    try:
                        consumable_model_id_int = int(consumable_model_id)
                    except (TypeError, ValueError):
                        return Response({"error": "Invalid consumable_model_id"}, status=status.HTTP_400_BAD_REQUEST)

                    def _to_int(v):
                        if v in (None, ""):
                            return None
                        return int(v)

                    quantity_ordered = _to_int(raw.get("quantity_ordered"))
                    quantity_received = _to_int(raw.get("quantity_received"))
                    if quantity_received is None:
                        quantity_received = 0
                    unit_price = raw.get("unit_price")
                    if unit_price in (None, ""):
                        unit_price_dec = None
                    else:
                        unit_price_dec = Decimal(str(unit_price))

                    cursor.execute(
                        """
                        INSERT INTO public.consumable_model_is_found_in_purchase_order
                            (consumable_model_id, purchase_order_id, quantity_ordered, quantity_received, unit_price)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        [
                            consumable_model_id_int,
                            next_id,
                            quantity_ordered,
                            quantity_received,
                            unit_price_dec,
                        ],
                    )

        return Response({"purchase_order_id": next_id}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="receive")
    def receive(self, request, pk=None):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        try:
            purchase_order_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase order id"}, status=status.HTTP_400_BAD_REQUEST)

        stock_item_models = request.data.get("stock_item_models")
        consumable_models = request.data.get("consumable_models")

        if stock_item_models is None:
            stock_item_models = []
        if consumable_models is None:
            consumable_models = []
        if not isinstance(stock_item_models, list) or not isinstance(consumable_models, list):
            return Response({"error": "stock_item_models and consumable_models must be lists"}, status=status.HTTP_400_BAD_REQUEST)

        def _as_int(v):
            if v in (None, ""):
                return None
            return int(v)

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT 1 FROM public.purchase_order WHERE purchase_order_id = %s",
                    [purchase_order_id],
                )
                if cursor.fetchone() is None:
                    return Response({"error": "Purchase order not found"}, status=status.HTTP_404_NOT_FOUND)

                for raw in stock_item_models:
                    if not isinstance(raw, dict):
                        return Response({"error": "Each stock_item_models entry must be an object"}, status=status.HTTP_400_BAD_REQUEST)
                    stock_item_model_id = _as_int(raw.get("stock_item_model_id"))
                    newly_received = _as_int(raw.get("quantity_received"))
                    if stock_item_model_id is None or newly_received is None:
                        return Response(
                            {"error": "stock_item_model_id and quantity_received are required for stock_item_models"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    if newly_received < 0:
                        return Response({"error": "quantity_received cannot be negative"}, status=status.HTTP_400_BAD_REQUEST)

                    cursor.execute(
                        """
                        SELECT COALESCE(quantity_ordered, 0), COALESCE(quantity_received, 0)
                        FROM public.stock_item_model_is_found_in_purchase_order
                        WHERE purchase_order_id = %s AND stock_item_model_id = %s
                        """,
                        [purchase_order_id, stock_item_model_id],
                    )
                    row = cursor.fetchone()
                    if row is None:
                        return Response(
                            {"error": f"Stock item model line not found (stock_item_model_id={stock_item_model_id})"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    qty_ordered, qty_received_current = row
                    qty_received_new = int(qty_received_current) + int(newly_received)
                    if qty_received_new > int(qty_ordered):
                        return Response(
                            {
                                "error": (
                                    f"Received quantity exceeds ordered for stock_item_model_id={stock_item_model_id} "
                                    f"(ordered={qty_ordered}, current_received={qty_received_current}, newly_received={newly_received})"
                                )
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    cursor.execute(
                        """
                        UPDATE public.stock_item_model_is_found_in_purchase_order
                        SET quantity_received = %s
                        WHERE purchase_order_id = %s AND stock_item_model_id = %s
                        """,
                        [qty_received_new, purchase_order_id, stock_item_model_id],
                    )

                for raw in consumable_models:
                    if not isinstance(raw, dict):
                        return Response({"error": "Each consumable_models entry must be an object"}, status=status.HTTP_400_BAD_REQUEST)
                    consumable_model_id = _as_int(raw.get("consumable_model_id"))
                    newly_received = _as_int(raw.get("quantity_received"))
                    if consumable_model_id is None or newly_received is None:
                        return Response(
                            {"error": "consumable_model_id and quantity_received are required for consumable_models"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    if newly_received < 0:
                        return Response({"error": "quantity_received cannot be negative"}, status=status.HTTP_400_BAD_REQUEST)

                    cursor.execute(
                        """
                        SELECT COALESCE(quantity_ordered, 0), COALESCE(quantity_received, 0)
                        FROM public.consumable_model_is_found_in_purchase_order
                        WHERE purchase_order_id = %s AND consumable_model_id = %s
                        """,
                        [purchase_order_id, consumable_model_id],
                    )
                    row = cursor.fetchone()
                    if row is None:
                        return Response(
                            {"error": f"Consumable model line not found (consumable_model_id={consumable_model_id})"},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    qty_ordered, qty_received_current = row
                    qty_received_new = int(qty_received_current) + int(newly_received)
                    if qty_received_new > int(qty_ordered):
                        return Response(
                            {
                                "error": (
                                    f"Received quantity exceeds ordered for consumable_model_id={consumable_model_id} "
                                    f"(ordered={qty_ordered}, current_received={qty_received_current}, newly_received={newly_received})"
                                )
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    cursor.execute(
                        """
                        UPDATE public.consumable_model_is_found_in_purchase_order
                        SET quantity_received = %s
                        WHERE purchase_order_id = %s AND consumable_model_id = %s
                        """,
                        [qty_received_new, purchase_order_id, consumable_model_id],
                    )

                cursor.execute(
                    """
                    SELECT
                        EXISTS (
                            SELECT 1
                            FROM public.stock_item_model_is_found_in_purchase_order l
                            WHERE l.purchase_order_id = %s
                              AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                        )
                        OR EXISTS (
                            SELECT 1
                            FROM public.consumable_model_is_found_in_purchase_order l
                            WHERE l.purchase_order_id = %s
                              AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                        )
                    """,
                    [purchase_order_id, purchase_order_id],
                )
                has_remaining = cursor.fetchone()[0]

                backorder_report_id = None
                if has_remaining:
                    cursor.execute("SELECT COALESCE(MAX(backorder_report_id), 0) + 1 FROM public.backorder_report")
                    next_id = cursor.fetchone()[0]
                    cursor.execute(
                        """
                        INSERT INTO public.backorder_report
                            (backorder_report_id, purchase_order_id, backorder_report_date, digital_copy)
                        VALUES (%s, %s, %s, NULL)
                        """,
                        [next_id, purchase_order_id, datetime.date.today()],
                    )
                    backorder_report_id = next_id

                    cursor.execute(
                        """
                        INSERT INTO public.backorder_report_stock_item_model_line
                            (backorder_report_id, stock_item_model_id, quantity_ordered, quantity_received, quantity_remaining)
                        SELECT %s,
                               l.stock_item_model_id,
                               COALESCE(l.quantity_ordered, 0),
                               COALESCE(l.quantity_received, 0),
                               (COALESCE(l.quantity_ordered, 0) - COALESCE(l.quantity_received, 0))
                        FROM public.stock_item_model_is_found_in_purchase_order l
                        WHERE l.purchase_order_id = %s
                          AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                        """,
                        [backorder_report_id, purchase_order_id],
                    )

                    cursor.execute(
                        """
                        INSERT INTO public.backorder_report_consumable_model_line
                            (backorder_report_id, consumable_model_id, quantity_ordered, quantity_received, quantity_remaining)
                        SELECT %s,
                               l.consumable_model_id,
                               COALESCE(l.quantity_ordered, 0),
                               COALESCE(l.quantity_received, 0),
                               (COALESCE(l.quantity_ordered, 0) - COALESCE(l.quantity_received, 0))
                        FROM public.consumable_model_is_found_in_purchase_order l
                        WHERE l.purchase_order_id = %s
                          AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                        """,
                        [backorder_report_id, purchase_order_id],
                    )

        return Response(
            {
                "purchase_order_id": purchase_order_id,
                "has_remaining": bool(has_remaining),
                "backorder_report_id": backorder_report_id,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get", "post"], url_path="delivery-note")
    def delivery_note(self, request, pk=None):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        try:
            purchase_order_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase order id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM public.purchase_order WHERE purchase_order_id = %s",
                [purchase_order_id],
            )
            if cursor.fetchone() is None:
                return Response({"error": "Purchase order not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute(
                """
                SELECT data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'delivery_note'
                  AND column_name = 'digital_copy'
                """
            )
            digital_copy_type = (cursor.fetchone() or [None])[0]

            cursor.execute(
                """
                SELECT delivery_note_id, delivery_note_date, delivery_note_code,
                       CASE WHEN digital_copy IS NULL OR digital_copy = '' THEN 0 ELSE 1 END AS has_digital_copy,
                       digital_copy
                FROM public.delivery_note
                WHERE purchase_order_id = %s
                """,
                [purchase_order_id],
            )
            existing = cursor.fetchone()

        if request.method == "GET":
            if existing is None:
                return Response({"exists": False}, status=status.HTTP_200_OK)

            if digital_copy_type == 'bytea':
                # Legacy schema: file stored in DB as binary
                has_file = existing[4] is not None
            else:
                rel_path = existing[4]
                abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path) if rel_path else None
                has_file = bool(rel_path) and abs_path is not None and os.path.isfile(abs_path)
            return Response(
                {
                    "exists": True,
                    "delivery_note_id": existing[0],
                    "purchase_order_id": purchase_order_id,
                    "delivery_note_date": existing[1],
                    "delivery_note_code": existing[2],
                    "has_digital_copy": has_file,
                },
                status=status.HTTP_200_OK,
            )

        if existing is not None:
            return Response(
                {"error": "Delivery note already exists for this purchase order", "delivery_note_id": existing[0]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if digital_copy_type == 'bytea':
            return Response(
                {
                    "error": "Database schema is outdated (delivery_note.digital_copy is bytea). Run backend migrations to switch it to a file path (text).",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        delivery_note_code = request.data.get("delivery_note_code")
        digital_copy_file = request.FILES.get("digital_copy")
        if not delivery_note_code:
            return Response({"error": "delivery_note_code is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not digital_copy_file:
            return Response({"error": "digital_copy file is required"}, status=status.HTTP_400_BAD_REQUEST)

        content_type = getattr(digital_copy_file, "content_type", None)
        filename = getattr(digital_copy_file, "name", "") or ""
        if content_type != "application/pdf" and not filename.lower().endswith(".pdf"):
            return Response({"error": "digital_copy must be a PDF"}, status=status.HTTP_400_BAD_REQUEST)

        digital_copy_bytes = digital_copy_file.read()
        if not digital_copy_bytes.startswith(b"%PDF"):
            return Response({"error": "digital_copy must be a valid PDF"}, status=status.HTTP_400_BAD_REQUEST)

        safe_code = "".join([c for c in str(delivery_note_code) if c.isalnum() or c in {"-", "_"}])
        if not safe_code:
            return Response({"error": "delivery_note_code is invalid"}, status=status.HTTP_400_BAD_REQUEST)

        rel_dir = os.path.join("delivery_notes", f"purchase_order_{purchase_order_id}")
        base_dir = os.path.join(str(settings.MEDIA_ROOT), rel_dir)
        os.makedirs(base_dir, exist_ok=True)

        rel_path = os.path.join(rel_dir, f"delivery_note_{safe_code}.pdf")
        abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
        with open(abs_path, "wb") as f:
            f.write(digital_copy_bytes)

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT (
                        EXISTS (
                            SELECT 1
                            FROM public.stock_item_model_is_found_in_purchase_order l
                            WHERE l.purchase_order_id = %s
                              AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                        )
                        OR EXISTS (
                            SELECT 1
                            FROM public.consumable_model_is_found_in_purchase_order l
                            WHERE l.purchase_order_id = %s
                              AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                        )
                    ) AS has_remaining
                    """,
                    [purchase_order_id, purchase_order_id],
                )
                has_remaining = bool(cursor.fetchone()[0])
                if has_remaining:
                    return Response(
                        {"error": "Cannot create delivery note: there are still items to receive"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                cursor.execute(
                    "SELECT delivery_note_id FROM public.delivery_note WHERE purchase_order_id = %s",
                    [purchase_order_id],
                )
                row = cursor.fetchone()
                if row is not None:
                    return Response(
                        {"error": "Delivery note already exists for this purchase order", "delivery_note_id": row[0]},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                cursor.execute("SELECT COALESCE(MAX(delivery_note_id), 0) + 1 FROM public.delivery_note")
                next_id = cursor.fetchone()[0]
                cursor.execute(
                    """
                    INSERT INTO public.delivery_note
                        (delivery_note_id, purchase_order_id, delivery_note_date, digital_copy, delivery_note_code)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    [next_id, purchase_order_id, timezone.now().date(), rel_path, str(delivery_note_code)],
                )

        return Response(
            {
                "delivery_note_id": next_id,
                "purchase_order_id": purchase_order_id,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"], url_path="delivery-note/download")
    def download_delivery_note(self, request, pk=None):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        try:
            purchase_order_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase order id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT delivery_note_id, digital_copy, delivery_note_code
                FROM public.delivery_note
                WHERE purchase_order_id = %s
                """,
                [purchase_order_id],
            )
            row = cursor.fetchone()

        if row is None:
            return Response({"error": "Delivery note not found"}, status=status.HTTP_404_NOT_FOUND)

        delivery_note_id, rel_path, delivery_note_code = row[0], row[1], row[2]
        if not rel_path:
            return Response({"error": "No digital copy stored"}, status=status.HTTP_404_NOT_FOUND)

        abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
        if not os.path.isfile(abs_path):
            return Response({"error": "Digital copy file missing on server"}, status=status.HTTP_404_NOT_FOUND)

        code = delivery_note_code or str(delivery_note_id)
        resp = FileResponse(open(abs_path, "rb"), content_type="application/pdf")
        resp["Content-Disposition"] = f'attachment; filename="delivery_note_{code}.pdf"'
        return resp

    @action(detail=True, methods=["get", "post"], url_path="invoice")
    def invoice(self, request, pk=None):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        try:
            purchase_order_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase order id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM public.purchase_order WHERE purchase_order_id = %s",
                [purchase_order_id],
            )
            if cursor.fetchone() is None:
                return Response({"error": "Purchase order not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute(
                "SELECT delivery_note_id FROM public.delivery_note WHERE purchase_order_id = %s",
                [purchase_order_id],
            )
            dn_row = cursor.fetchone()
            if dn_row is None:
                return Response({"error": "Delivery note must be created before invoice"}, status=status.HTTP_400_BAD_REQUEST)
            delivery_note_id = dn_row[0]

            cursor.execute(
                """
                SELECT invoice_id,
                       CASE WHEN digital_copy IS NULL OR digital_copy = '' THEN 0 ELSE 1 END AS has_digital_copy,
                       digital_copy
                FROM public.invoice
                WHERE delivery_note_id = %s
                """,
                [delivery_note_id],
            )
            existing = cursor.fetchone()

            cursor.execute(
                """
                SELECT data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'invoice'
                  AND column_name = 'digital_copy'
                """
            )
            digital_copy_type = (cursor.fetchone() or [None])[0]

        if request.method == "GET":
            if existing is None:
                return Response({"exists": False}, status=status.HTTP_200_OK)

            if digital_copy_type == 'bytea':
                has_file = existing[2] is not None
            else:
                rel_path = existing[2]
                abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path) if rel_path else None
                has_file = bool(rel_path) and abs_path is not None and os.path.isfile(abs_path)

            return Response(
                {
                    "exists": True,
                    "invoice_id": existing[0],
                    "purchase_order_id": purchase_order_id,
                    "delivery_note_id": delivery_note_id,
                    "has_digital_copy": has_file,
                },
                status=status.HTTP_200_OK,
            )

        if existing is not None:
            return Response(
                {"error": "Invoice already exists for this delivery note", "invoice_id": existing[0]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if digital_copy_type == 'bytea':
            return Response(
                {
                    "error": "Database schema is outdated (invoice.digital_copy is bytea). Run backend migrations to switch it to a file path (text).",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        digital_copy_file = request.FILES.get("digital_copy")
        if not digital_copy_file:
            return Response({"error": "digital_copy file is required"}, status=status.HTTP_400_BAD_REQUEST)

        content_type = getattr(digital_copy_file, "content_type", None)
        filename = getattr(digital_copy_file, "name", "") or ""
        if content_type != "application/pdf" and not filename.lower().endswith(".pdf"):
            return Response({"error": "digital_copy must be a PDF"}, status=status.HTTP_400_BAD_REQUEST)

        digital_copy_bytes = digital_copy_file.read()
        if not digital_copy_bytes.startswith(b"%PDF"):
            return Response({"error": "digital_copy must be a valid PDF"}, status=status.HTTP_400_BAD_REQUEST)

        rel_dir = os.path.join("invoices", f"delivery_note_{delivery_note_id}")
        base_dir = os.path.join(str(settings.MEDIA_ROOT), rel_dir)
        os.makedirs(base_dir, exist_ok=True)

        rel_path = os.path.join(rel_dir, f"invoice_{delivery_note_id}.pdf")
        abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
        with open(abs_path, "wb") as f:
            f.write(digital_copy_bytes)

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT invoice_id FROM public.invoice WHERE delivery_note_id = %s",
                    [delivery_note_id],
                )
                row = cursor.fetchone()
                if row is not None:
                    return Response(
                        {"error": "Invoice already exists for this delivery note", "invoice_id": row[0]},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                cursor.execute("SELECT COALESCE(MAX(invoice_id), 0) + 1 FROM public.invoice")
                next_id = cursor.fetchone()[0]
                cursor.execute(
                    """
                    INSERT INTO public.invoice (invoice_id, delivery_note_id, digital_copy)
                    VALUES (%s, %s, %s)
                    """,
                    [next_id, delivery_note_id, rel_path],
                )

        return Response(
            {
                "invoice_id": next_id,
                "purchase_order_id": purchase_order_id,
                "delivery_note_id": delivery_note_id,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"], url_path="invoice/download")
    def download_invoice(self, request, pk=None):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        try:
            purchase_order_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase order id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT delivery_note_id FROM public.delivery_note WHERE purchase_order_id = %s",
                [purchase_order_id],
            )
            dn_row = cursor.fetchone()
            if dn_row is None:
                return Response({"error": "Delivery note not found"}, status=status.HTTP_404_NOT_FOUND)
            delivery_note_id = dn_row[0]

            cursor.execute(
                "SELECT invoice_id, digital_copy FROM public.invoice WHERE delivery_note_id = %s",
                [delivery_note_id],
            )
            row = cursor.fetchone()

            cursor.execute(
                """
                SELECT data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'invoice'
                  AND column_name = 'digital_copy'
                """
            )
            digital_copy_type = (cursor.fetchone() or [None])[0]

        if row is None:
            return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)

        invoice_id, digital_copy = row[0], row[1]
        if digital_copy is None:
            return Response({"error": "No digital copy stored"}, status=status.HTTP_404_NOT_FOUND)

        if digital_copy_type == 'bytea':
            return Response(
                {"error": "Invoice digital copy is stored in DB as bytea; migrate to path-based storage to consult PDF"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        rel_path = digital_copy
        abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
        if not os.path.isfile(abs_path):
            return Response({"error": "Digital copy file missing on server"}, status=status.HTTP_404_NOT_FOUND)

        resp = FileResponse(open(abs_path, "rb"), content_type="application/pdf")
        resp["Content-Disposition"] = f'inline; filename="invoice_{invoice_id}.pdf"'
        return resp

    @action(detail=True, methods=["get", "post"], url_path="acceptance-report")
    def acceptance_report(self, request, pk=None):
        if request.method == "GET":
            _, _, denial = self._require_acceptance_report_consult(request)
            if denial:
                return denial
        else:
            _, denial = self._require_responsible(request)
            if denial:
                return denial

        try:
            purchase_order_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase order id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM public.purchase_order WHERE purchase_order_id = %s",
                [purchase_order_id],
            )
            if cursor.fetchone() is None:
                return Response({"error": "Purchase order not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute(
                "SELECT delivery_note_id FROM public.delivery_note WHERE purchase_order_id = %s",
                [purchase_order_id],
            )
            dn_row = cursor.fetchone()
            if dn_row is None:
                return Response({"error": "Delivery note must be created before acceptance report"}, status=status.HTTP_400_BAD_REQUEST)
            delivery_note_id = dn_row[0]

            cursor.execute(
                """
                SELECT acceptance_report_id,
                       delivery_note_id,
                       acceptance_report_datetime,
                       is_signed_by_director_of_administration_and_support,
                       is_signed_by_protection_and_security_bureau_chief,
                       is_signed_by_information_technilogy_bureau_chief,
                       acceptance_report_is_stock_item_and_consumable_responsible,
                       is_signed_by_school_headquarter,
                       digital_copy
                FROM public.acceptance_report
                WHERE delivery_note_id = %s
                """,
                [delivery_note_id],
            )
            existing = cursor.fetchone()

        if request.method == "GET":
            if existing is None:
                return Response({"exists": False}, status=status.HTTP_200_OK)

            rel_path = existing[8]
            abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path) if rel_path else None
            has_file = bool(rel_path) and abs_path is not None and os.path.isfile(abs_path)

            return Response(
                {
                    "exists": True,
                    "acceptance_report_id": existing[0],
                    "purchase_order_id": purchase_order_id,
                    "delivery_note_id": existing[1],
                    "acceptance_report_datetime": existing[2],
                    "is_signed_by_director_of_administration_and_support": existing[3],
                    "is_signed_by_protection_and_security_bureau_chief": existing[4],
                    "is_signed_by_information_technilogy_bureau_chief": existing[5],
                    "acceptance_report_is_stock_item_and_consumable_responsible": existing[6],
                    "is_signed_by_school_headquarter": existing[7],
                    "has_digital_copy": has_file,
                },
                status=status.HTTP_200_OK,
            )

        if existing is not None:
            return Response(
                {
                    "error": "Acceptance report already exists for this delivery note",
                    "acceptance_report_id": existing[0],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        digital_copy_file = request.FILES.get("digital_copy")
        if not digital_copy_file:
            return Response({"error": "digital_copy file is required"}, status=status.HTTP_400_BAD_REQUEST)

        content_type = getattr(digital_copy_file, "content_type", None)
        filename = getattr(digital_copy_file, "name", "") or ""
        if content_type != "application/pdf" and not filename.lower().endswith(".pdf"):
            return Response({"error": "digital_copy must be a PDF"}, status=status.HTTP_400_BAD_REQUEST)

        digital_copy_bytes = digital_copy_file.read()
        if not digital_copy_bytes.startswith(b"%PDF"):
            return Response({"error": "digital_copy must be a valid PDF"}, status=status.HTTP_400_BAD_REQUEST)

        rel_dir = os.path.join("acceptance_reports", f"delivery_note_{delivery_note_id}")
        base_dir = os.path.join(str(settings.MEDIA_ROOT), rel_dir)
        os.makedirs(base_dir, exist_ok=True)

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT acceptance_report_id FROM public.acceptance_report WHERE delivery_note_id = %s",
                    [delivery_note_id],
                )
                row = cursor.fetchone()
                if row is not None:
                    return Response(
                        {"error": "Acceptance report already exists for this delivery note", "acceptance_report_id": row[0]},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                cursor.execute("SELECT COALESCE(MAX(acceptance_report_id), 0) + 1 FROM public.acceptance_report")
                next_id = cursor.fetchone()[0]

                rel_path = os.path.join(rel_dir, f"acceptance_report_{next_id}.pdf")
                abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
                with open(abs_path, "wb") as f:
                    f.write(digital_copy_bytes)

                cursor.execute(
                    """
                    INSERT INTO public.acceptance_report (
                        acceptance_report_id,
                        delivery_note_id,
                        acceptance_report_datetime,
                        is_signed_by_director_of_administration_and_support,
                        is_signed_by_protection_and_security_bureau_chief,
                        is_signed_by_information_technilogy_bureau_chief,
                        acceptance_report_is_stock_item_and_consumable_responsible,
                        is_signed_by_school_headquarter,
                        digital_copy
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    [
                        next_id,
                        delivery_note_id,
                        timezone.now(),
                        False,
                        False,
                        False,
                        False,
                        False,
                        rel_path,
                    ],
                )

        return Response(
            {
                "acceptance_report_id": next_id,
                "purchase_order_id": purchase_order_id,
                "delivery_note_id": delivery_note_id,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="acceptance-report/sign")
    def sign_acceptance_report(self, request, pk=None):
        user_account, role_codes, denial = self._require_acceptance_report_consult(request)
        if denial:
            return denial

        try:
            purchase_order_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase order id"}, status=status.HTTP_400_BAD_REQUEST)

        sign_as = request.data.get("sign_as")
        is_signed = request.data.get("is_signed")

        if is_signed in (None, ""):
            is_signed_bool = True
        elif isinstance(is_signed, bool):
            is_signed_bool = is_signed
        elif isinstance(is_signed, (int, float)):
            is_signed_bool = bool(is_signed)
        elif isinstance(is_signed, str):
            is_signed_bool = is_signed.strip().lower() in {"1", "true", "t", "yes", "y"}
        else:
            is_signed_bool = True

        role_to_field = {
            "director_admin_support": "is_signed_by_director_of_administration_and_support",
            "protection_and_security_bureau_chief": "is_signed_by_protection_and_security_bureau_chief",
            "school_headquarter": "is_signed_by_school_headquarter",
            "it_bureau_chief": "is_signed_by_information_technilogy_bureau_chief",
            "stock_consumable_responsible": "acceptance_report_is_stock_item_and_consumable_responsible",
        }

        eligible_roles = [r for r in role_to_field.keys() if (r in role_codes) or user_account.is_superuser()]
        if not eligible_roles:
            return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        if sign_as not in (None, ""):
            if sign_as not in role_to_field:
                return Response({"error": "Invalid sign_as"}, status=status.HTTP_400_BAD_REQUEST)
            if (not user_account.is_superuser()) and (sign_as not in role_codes):
                return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
            role_to_use = sign_as
        else:
            if len(eligible_roles) != 1:
                return Response({"error": "sign_as is required"}, status=status.HTTP_400_BAD_REQUEST)
            role_to_use = eligible_roles[0]

        field_name = role_to_field[role_to_use]

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT delivery_note_id FROM public.delivery_note WHERE purchase_order_id = %s",
                    [purchase_order_id],
                )
                dn_row = cursor.fetchone()
                if dn_row is None:
                    return Response({"error": "Delivery note not found"}, status=status.HTTP_404_NOT_FOUND)
                delivery_note_id = dn_row[0]

                cursor.execute(
                    "SELECT acceptance_report_id FROM public.acceptance_report WHERE delivery_note_id = %s",
                    [delivery_note_id],
                )
                ar_row = cursor.fetchone()
                if ar_row is None:
                    return Response({"error": "Acceptance report not found"}, status=status.HTTP_404_NOT_FOUND)
                acceptance_report_id = ar_row[0]

                cursor.execute(
                    f"UPDATE public.acceptance_report SET {field_name} = %s WHERE acceptance_report_id = %s",
                    [is_signed_bool, acceptance_report_id],
                )

                cursor.execute(
                    """
                    SELECT is_signed_by_director_of_administration_and_support,
                           is_signed_by_protection_and_security_bureau_chief,
                           is_signed_by_school_headquarter,
                           is_signed_by_information_technilogy_bureau_chief,
                           acceptance_report_is_stock_item_and_consumable_responsible
                    FROM public.acceptance_report
                    WHERE acceptance_report_id = %s
                    """,
                    [acceptance_report_id],
                )
                flags = cursor.fetchone()

        return Response(
            {
                "acceptance_report_id": acceptance_report_id,
                "purchase_order_id": purchase_order_id,
                "is_signed_by_director_of_administration_and_support": flags[0],
                "is_signed_by_protection_and_security_bureau_chief": flags[1],
                "is_signed_by_school_headquarter": flags[2],
                "is_signed_by_it_bureau_chief": flags[3],
                "is_signed_by_stock_consumable_responsible": flags[4],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"], url_path="acceptance-report/download")
    def download_acceptance_report(self, request, pk=None):
        _, _, denial = self._require_acceptance_report_consult(request)
        if denial:
            return denial

        try:
            purchase_order_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase order id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT delivery_note_id FROM public.delivery_note WHERE purchase_order_id = %s",
                [purchase_order_id],
            )
            dn_row = cursor.fetchone()
            if dn_row is None:
                return Response({"error": "Delivery note not found"}, status=status.HTTP_404_NOT_FOUND)
            delivery_note_id = dn_row[0]

            cursor.execute(
                "SELECT acceptance_report_id, digital_copy FROM public.acceptance_report WHERE delivery_note_id = %s",
                [delivery_note_id],
            )
            row = cursor.fetchone()

        if row is None:
            return Response({"error": "Acceptance report not found"}, status=status.HTTP_404_NOT_FOUND)

        acceptance_report_id, digital_copy = row[0], row[1]
        if not digital_copy:
            return Response({"error": "No digital copy stored"}, status=status.HTTP_404_NOT_FOUND)

        abs_path = os.path.join(str(settings.MEDIA_ROOT), digital_copy)
        if not os.path.isfile(abs_path):
            return Response({"error": "Digital copy file missing on server"}, status=status.HTTP_404_NOT_FOUND)

        resp = FileResponse(open(abs_path, "rb"), content_type="application/pdf")
        resp["Content-Disposition"] = f'inline; filename="acceptance_report_{acceptance_report_id}.pdf"'
        return resp

    def retrieve(self, request, pk=None):
        _, _, denial = self._require_purchase_order_consult(request)
        if denial:
            return denial

        try:
            purchase_order_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase order id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT po.purchase_order_id,
                       po.supplier_id,
                       s.supplier_name,
                       po.is_signed_by_finance,
                       po.purchase_order_code
                FROM public.purchase_order po
                LEFT JOIN public.supplier s ON s.supplier_id = po.supplier_id
                WHERE po.purchase_order_id = %s
                """,
                [purchase_order_id],
            )
            header = cursor.fetchone()

            if not header:
                return Response({"error": "Purchase order not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute(
                """
                SELECT l.stock_item_model_id,
                       m.model_name,
                       b.brand_name,
                       t.stock_item_type_label,
                       l.quantity_ordered,
                       l.quantity_received,
                       l.unit_price
                FROM public.stock_item_model_is_found_in_purchase_order l
                LEFT JOIN public.stock_item_model m ON m.stock_item_model_id = l.stock_item_model_id
                LEFT JOIN public.stock_item_brand b ON b.stock_item_brand_id = m.stock_item_brand_id
                LEFT JOIN public.stock_item_type t ON t.stock_item_type_id = m.stock_item_type_id
                WHERE l.purchase_order_id = %s
                ORDER BY l.stock_item_model_id
                """,
                [purchase_order_id],
            )
            stock_rows = cursor.fetchall()

            cursor.execute(
                """
                SELECT l.consumable_model_id,
                       m.model_name,
                       b.brand_name,
                       t.consumable_type_label,
                       l.quantity_ordered,
                       l.quantity_received,
                       l.unit_price
                FROM public.consumable_model_is_found_in_purchase_order l
                LEFT JOIN public.consumable_model m ON m.consumable_model_id = l.consumable_model_id
                LEFT JOIN public.consumable_brand b ON b.consumable_brand_id = m.consumable_brand_id
                LEFT JOIN public.consumable_type t ON t.consumable_type_id = m.consumable_type_id
                WHERE l.purchase_order_id = %s
                ORDER BY l.consumable_model_id
                """,
                [purchase_order_id],
            )
            consumable_rows = cursor.fetchall()

        return Response(
            {
                "purchase_order_id": header[0],
                "supplier_id": header[1],
                "supplier_name": header[2],
                "is_signed_by_finance": header[3],
                "purchase_order_code": header[4],
                "stock_item_models": [
                    {
                        "stock_item_model_id": r[0],
                        "model_name": r[1],
                        "brand_name": r[2],
                        "type_label": r[3],
                        "quantity_ordered": r[4],
                        "quantity_received": r[5],
                        "unit_price": r[6],
                    }
                    for r in stock_rows
                ],
                "consumable_models": [
                    {
                        "consumable_model_id": r[0],
                        "model_name": r[1],
                        "brand_name": r[2],
                        "type_label": r[3],
                        "quantity_ordered": r[4],
                        "quantity_received": r[5],
                        "unit_price": r[6],
                    }
                    for r in consumable_rows
                ],
            },
            status=status.HTTP_200_OK,
        )


class BackorderReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _require_responsible(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not getattr(user_account, "person", None):
            return None, Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if user_account.is_superuser() or ("stock_consumable_responsible" in role_codes) or ("exploitation_chief" in role_codes):
            return user_account, None

        return None, Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

    def list(self, request):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        purchase_order_id = request.query_params.get("purchase_order_id")
        purchase_order_id_int = None
        if purchase_order_id not in (None, ""):
            try:
                purchase_order_id_int = int(purchase_order_id)
            except (TypeError, ValueError):
                return Response({"error": "Invalid purchase_order_id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            if purchase_order_id_int is None:
                cursor.execute(
                    """
                    SELECT br.backorder_report_id,
                           br.purchase_order_id,
                           br.backorder_report_date,
                           po.purchase_order_code,
                           s.supplier_id,
                           s.supplier_name
                    FROM public.backorder_report br
                    LEFT JOIN public.purchase_order po ON po.purchase_order_id = br.purchase_order_id
                    LEFT JOIN public.supplier s ON s.supplier_id = po.supplier_id
                    ORDER BY br.backorder_report_id DESC
                    """
                )
            else:
                cursor.execute(
                    """
                    SELECT br.backorder_report_id,
                           br.purchase_order_id,
                           br.backorder_report_date,
                           po.purchase_order_code,
                           s.supplier_id,
                           s.supplier_name
                    FROM public.backorder_report br
                    LEFT JOIN public.purchase_order po ON po.purchase_order_id = br.purchase_order_id
                    LEFT JOIN public.supplier s ON s.supplier_id = po.supplier_id
                    WHERE br.purchase_order_id = %s
                    ORDER BY br.backorder_report_id DESC
                    """,
                    [purchase_order_id_int],
                )
            rows = cursor.fetchall()

        return Response(
            [
                {
                    "backorder_report_id": r[0],
                    "purchase_order_id": r[1],
                    "backorder_report_date": r[2],
                    "purchase_order_code": r[3],
                    "supplier_id": r[4],
                    "supplier_name": r[5],
                }
                for r in rows
            ],
            status=status.HTTP_200_OK,
        )

    def create(self, request):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        purchase_order_id = request.data.get("purchase_order_id")
        backorder_report_date = request.data.get("backorder_report_date")

        if purchase_order_id in (None, ""):
            return Response({"error": "purchase_order_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            purchase_order_id_int = int(purchase_order_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase_order_id"}, status=status.HTTP_400_BAD_REQUEST)

        if backorder_report_date in (None, ""):
            date_val = datetime.date.today()
        else:
            try:
                date_val = datetime.date.fromisoformat(str(backorder_report_date))
            except ValueError:
                return Response(
                    {"error": "Invalid backorder_report_date (expected YYYY-MM-DD)"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT 1 FROM public.purchase_order WHERE purchase_order_id = %s",
                    [purchase_order_id_int],
                )
                if cursor.fetchone() is None:
                    return Response({"error": "Purchase order not found"}, status=status.HTTP_400_BAD_REQUEST)

                cursor.execute(
                    """
                    SELECT
                        EXISTS (
                            SELECT 1
                            FROM public.stock_item_model_is_found_in_purchase_order l
                            WHERE l.purchase_order_id = %s
                              AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                        )
                        OR EXISTS (
                            SELECT 1
                            FROM public.consumable_model_is_found_in_purchase_order l
                            WHERE l.purchase_order_id = %s
                              AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                        )
                    """,
                    [purchase_order_id_int, purchase_order_id_int],
                )
                has_remaining = cursor.fetchone()[0]
                if not has_remaining:
                    return Response(
                        {"error": "No remaining items for this purchase order"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                cursor.execute("SELECT COALESCE(MAX(backorder_report_id), 0) + 1 FROM public.backorder_report")
                next_id = cursor.fetchone()[0]

                cursor.execute(
                    """
                    INSERT INTO public.backorder_report
                        (backorder_report_id, purchase_order_id, backorder_report_date, digital_copy)
                    VALUES (%s, %s, %s, NULL)
                    """,
                    [next_id, purchase_order_id_int, date_val],
                )

                cursor.execute(
                    """
                    INSERT INTO public.backorder_report_stock_item_model_line
                        (backorder_report_id, stock_item_model_id, quantity_ordered, quantity_received, quantity_remaining)
                    SELECT %s,
                           l.stock_item_model_id,
                           COALESCE(l.quantity_ordered, 0),
                           COALESCE(l.quantity_received, 0),
                           (COALESCE(l.quantity_ordered, 0) - COALESCE(l.quantity_received, 0))
                    FROM public.stock_item_model_is_found_in_purchase_order l
                    WHERE l.purchase_order_id = %s
                      AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                    """,
                    [next_id, purchase_order_id_int],
                )

                cursor.execute(
                    """
                    INSERT INTO public.backorder_report_consumable_model_line
                        (backorder_report_id, consumable_model_id, quantity_ordered, quantity_received, quantity_remaining)
                    SELECT %s,
                           l.consumable_model_id,
                           COALESCE(l.quantity_ordered, 0),
                           COALESCE(l.quantity_received, 0),
                           (COALESCE(l.quantity_ordered, 0) - COALESCE(l.quantity_received, 0))
                    FROM public.consumable_model_is_found_in_purchase_order l
                    WHERE l.purchase_order_id = %s
                      AND COALESCE(l.quantity_ordered, 0) > COALESCE(l.quantity_received, 0)
                    """,
                    [next_id, purchase_order_id_int],
                )

        return Response({"backorder_report_id": next_id}, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        try:
            backorder_report_id = int(pk)
        except (TypeError, ValueError):
            return Response({"error": "Invalid backorder_report_id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT br.backorder_report_id,
                       br.purchase_order_id,
                       br.backorder_report_date,
                       po.purchase_order_code,
                       s.supplier_id,
                       s.supplier_name
                FROM public.backorder_report br
                LEFT JOIN public.purchase_order po ON po.purchase_order_id = br.purchase_order_id
                LEFT JOIN public.supplier s ON s.supplier_id = po.supplier_id
                WHERE br.backorder_report_id = %s
                """,
                [backorder_report_id],
            )
            row = cursor.fetchone()

            cursor.execute(
                """
                SELECT l.stock_item_model_id,
                       m.model_name,
                       l.quantity_ordered,
                       l.quantity_received,
                       l.quantity_remaining
                FROM public.backorder_report_stock_item_model_line l
                LEFT JOIN public.stock_item_model m ON m.stock_item_model_id = l.stock_item_model_id
                WHERE l.backorder_report_id = %s
                ORDER BY l.stock_item_model_id
                """,
                [backorder_report_id],
            )
            stock_lines = cursor.fetchall()

            cursor.execute(
                """
                SELECT l.consumable_model_id,
                       m.model_name,
                       l.quantity_ordered,
                       l.quantity_received,
                       l.quantity_remaining
                FROM public.backorder_report_consumable_model_line l
                LEFT JOIN public.consumable_model m ON m.consumable_model_id = l.consumable_model_id
                WHERE l.backorder_report_id = %s
                ORDER BY l.consumable_model_id
                """,
                [backorder_report_id],
            )
            consumable_lines = cursor.fetchall()

        if not row:
            return Response({"error": "Backorder report not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "backorder_report_id": row[0],
                "purchase_order_id": row[1],
                "backorder_report_date": row[2],
                "purchase_order_code": row[3],
                "supplier_id": row[4],
                "supplier_name": row[5],
                "stock_item_models": [
                    {
                        "stock_item_model_id": r[0],
                        "model_name": r[1],
                        "quantity_ordered": r[2],
                        "quantity_received": r[3],
                        "quantity_remaining": r[4],
                    }
                    for r in stock_lines
                ],
                "consumable_models": [
                    {
                        "consumable_model_id": r[0],
                        "model_name": r[1],
                        "quantity_ordered": r[2],
                        "quantity_received": r[3],
                        "quantity_remaining": r[4],
                    }
                    for r in consumable_lines
                ],
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="remaining")
    def remaining(self, request):
        _, denial = self._require_responsible(request)
        if denial:
            return denial

        purchase_order_id = request.query_params.get("purchase_order_id")
        if purchase_order_id in (None, ""):
            return Response({"error": "purchase_order_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            purchase_order_id_int = int(purchase_order_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid purchase_order_id"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT 1 FROM public.purchase_order WHERE purchase_order_id = %s",
                [purchase_order_id_int],
            )
            if cursor.fetchone() is None:
                return Response({"error": "Purchase order not found"}, status=status.HTTP_404_NOT_FOUND)

            cursor.execute(
                """
                SELECT l.stock_item_model_id,
                       m.model_name,
                       COALESCE(l.quantity_ordered, 0) AS quantity_ordered,
                       COALESCE(l.quantity_received, 0) AS quantity_received,
                       (COALESCE(l.quantity_ordered, 0) - COALESCE(l.quantity_received, 0)) AS quantity_remaining
                FROM public.stock_item_model_is_found_in_purchase_order l
                LEFT JOIN public.stock_item_model m ON m.stock_item_model_id = l.stock_item_model_id
                WHERE l.purchase_order_id = %s
                ORDER BY l.stock_item_model_id
                """,
                [purchase_order_id_int],
            )
            stock_rows = cursor.fetchall()

            cursor.execute(
                """
                SELECT l.consumable_model_id,
                       m.model_name,
                       COALESCE(l.quantity_ordered, 0) AS quantity_ordered,
                       COALESCE(l.quantity_received, 0) AS quantity_received,
                       (COALESCE(l.quantity_ordered, 0) - COALESCE(l.quantity_received, 0)) AS quantity_remaining
                FROM public.consumable_model_is_found_in_purchase_order l
                LEFT JOIN public.consumable_model m ON m.consumable_model_id = l.consumable_model_id
                WHERE l.purchase_order_id = %s
                ORDER BY l.consumable_model_id
                """,
                [purchase_order_id_int],
            )
            consumable_rows = cursor.fetchall()

        return Response(
            {
                "purchase_order_id": purchase_order_id_int,
                "stock_item_models": [
                    {
                        "stock_item_model_id": r[0],
                        "model_name": r[1],
                        "quantity_ordered": r[2],
                        "quantity_received": r[3],
                        "quantity_remaining": r[4],
                    }
                    for r in stock_rows
                    if (r[4] or 0) > 0
                ],
                "consumable_models": [
                    {
                        "consumable_model_id": r[0],
                        "model_name": r[1],
                        "quantity_ordered": r[2],
                        "quantity_received": r[3],
                        "quantity_remaining": r[4],
                    }
                    for r in consumable_rows
                    if (r[4] or 0) > 0
                ],
            },
            status=status.HTTP_200_OK,
        )


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all().order_by("warehouse_id")
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_item = Warehouse.objects.order_by("-warehouse_id").first()
        next_id = (last_item.warehouse_id + 1) if last_item else 1
        item = Warehouse.objects.create(warehouse_id=next_id, **serializer.validated_data)
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED)


class AttributionOrderViewSet(viewsets.ModelViewSet):
    queryset = AttributionOrder.objects.all().order_by("attribution_order_id")
    serializer_class = AttributionOrderSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_item = AttributionOrder.objects.order_by("-attribution_order_id").first()
        next_id = (last_item.attribution_order_id + 1) if last_item else 1
        item = AttributionOrder.objects.create(attribution_order_id=next_id, **serializer.validated_data)
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="included-items")
    def included_items(self, request, pk=None):
        """Get stock items and consumables related to assets in this attribution order.

        Note: This endpoint returns both:
        - composition items (items that compose assets, from asset_is_composed_of_*_history)
        - accessories (items that come with assets but do not compose them)
        """
        order = self.get_object()
        
        # Get stock items included in this attribution order
        stock_item_history = AssetIsComposedOfStockItemHistory.objects.filter(
            attribution_order=order
        ).select_related('stock_item', 'stock_item__stock_item_model', 'asset')
        
        stock_items = [
            {
                'id': h.stock_item.stock_item_id,
                'name': h.stock_item.stock_item_name,
                'model': str(h.stock_item.stock_item_model),
                'status': h.stock_item.stock_item_status,
                'asset_id': h.asset.asset_id,
                'asset_name': h.asset.asset_name,
                'start_datetime': h.start_datetime,
            }
            for h in stock_item_history
        ]
        
        # Get consumables included in this attribution order
        consumable_history = AssetIsComposedOfConsumableHistory.objects.filter(
            attribution_order=order
        ).select_related('consumable', 'consumable__consumable_model', 'asset')
        
        consumables = [
            {
                'id': h.consumable.consumable_id,
                'name': h.consumable.consumable_name,
                'model': str(h.consumable.consumable_model),
                'status': h.consumable.consumable_status,
                'asset_id': h.asset.asset_id,
                'asset_name': h.asset.asset_name,
                'start_datetime': h.start_datetime,
            }
            for h in consumable_history
        ]

        accessory_stock_qs = AttributionOrderAssetStockItemAccessory.objects.filter(
            attribution_order=order
        ).select_related('stock_item', 'stock_item__stock_item_model', 'asset')

        accessory_stock_items = [
            {
                'id': a.stock_item.stock_item_id,
                'name': a.stock_item.stock_item_name,
                'model': str(a.stock_item.stock_item_model),
                'status': a.stock_item.stock_item_status,
                'asset_id': a.asset.asset_id,
                'asset_name': a.asset.asset_name,
            }
            for a in accessory_stock_qs
        ]

        accessory_consumable_qs = AttributionOrderAssetConsumableAccessory.objects.filter(
            attribution_order=order
        ).select_related('consumable', 'consumable__consumable_model', 'asset')

        accessory_consumables = [
            {
                'id': a.consumable.consumable_id,
                'name': a.consumable.consumable_name,
                'model': str(a.consumable.consumable_model),
                'status': a.consumable.consumable_status,
                'asset_id': a.asset.asset_id,
                'asset_name': a.asset.asset_name,
            }
            for a in accessory_consumable_qs
        ]
        
        return Response({
            'stock_items': stock_items,
            'consumables': consumables,
            'accessory_stock_items': accessory_stock_items,
            'accessory_consumables': accessory_consumables,
        })


class AttributionOrderAssetStockItemAccessoryViewSet(viewsets.ModelViewSet):
    queryset = AttributionOrderAssetStockItemAccessory.objects.all().order_by('-id')
    serializer_class = AttributionOrderAssetStockItemAccessorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = self.queryset
        attribution_order_id = self.request.query_params.get('attribution_order')
        asset_id = self.request.query_params.get('asset')
        stock_item_id = self.request.query_params.get('stock_item')

        if attribution_order_id is not None:
            try:
                qs = qs.filter(attribution_order_id=int(attribution_order_id))
            except (TypeError, ValueError):
                pass

        if asset_id is not None:
            try:
                qs = qs.filter(asset_id=int(asset_id))
            except (TypeError, ValueError):
                pass

        if stock_item_id is not None:
            try:
                qs = qs.filter(stock_item_id=int(stock_item_id))
            except (TypeError, ValueError):
                pass

        return qs

    def create(self, request, *args, **kwargs):
        print('[AttributionOrderAssetStockItemAccessoryViewSet.create] request.data:', request.data)
        data = request.data.copy()
        stock_item_data = data.pop('stock_item_data', None)

        with transaction.atomic():
            if stock_item_data is not None and not data.get('stock_item'):
                if not isinstance(stock_item_data, dict):
                    raise ValidationError({'stock_item_data': 'Must be an object'})

                stock_item_model_id = stock_item_data.get('stock_item_model')
                if not stock_item_model_id:
                    raise ValidationError({'stock_item_model': 'This field is required'})

                serializer_item = StockItemSerializer(data={
                    'stock_item_model': stock_item_model_id,
                    'stock_item_inventory_number': stock_item_data.get('stock_item_inventory_number'),
                    'stock_item_name': stock_item_data.get('stock_item_name'),
                    'stock_item_status': stock_item_data.get('stock_item_status'),
                })
                serializer_item.is_valid(raise_exception=True)

                last_item = StockItem.objects.order_by('-stock_item_id').first()
                next_id = (last_item.stock_item_id + 1) if last_item else 1
                item = StockItem.objects.create(stock_item_id=next_id, **serializer_item.validated_data)
                _sync_stock_item_attribute_values(item)
                data['stock_item'] = item.stock_item_id

            serializer = self.get_serializer(data=data)
            if not serializer.is_valid():
                print('[AttributionOrderAssetStockItemAccessoryViewSet.create] serializer.errors:', serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            try:
                self.perform_create(serializer)
            except IntegrityError:
                return Response({'error': 'Accessory already exists for this order and asset'}, status=status.HTTP_400_BAD_REQUEST)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AttributionOrderAssetConsumableAccessoryViewSet(viewsets.ModelViewSet):
    queryset = AttributionOrderAssetConsumableAccessory.objects.all().order_by('-id')
    serializer_class = AttributionOrderAssetConsumableAccessorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = self.queryset
        attribution_order_id = self.request.query_params.get('attribution_order')
        asset_id = self.request.query_params.get('asset')
        consumable_id = self.request.query_params.get('consumable')

        if attribution_order_id is not None:
            try:
                qs = qs.filter(attribution_order_id=int(attribution_order_id))
            except (TypeError, ValueError):
                pass

        if asset_id is not None:
            try:
                qs = qs.filter(asset_id=int(asset_id))
            except (TypeError, ValueError):
                pass

        if consumable_id is not None:
            try:
                qs = qs.filter(consumable_id=int(consumable_id))
            except (TypeError, ValueError):
                pass

        return qs

    def create(self, request, *args, **kwargs):
        print('[AttributionOrderAssetConsumableAccessoryViewSet.create] request.data:', request.data)
        data = request.data.copy()
        consumable_data = data.pop('consumable_data', None)

        with transaction.atomic():
            if consumable_data is not None and not data.get('consumable'):
                if not isinstance(consumable_data, dict):
                    raise ValidationError({'consumable_data': 'Must be an object'})

                consumable_model_id = consumable_data.get('consumable_model')
                if not consumable_model_id:
                    raise ValidationError({'consumable_model': 'This field is required'})

                serializer_item = ConsumableSerializer(data={
                    'consumable_model': consumable_model_id,
                    'consumable_serial_number': consumable_data.get('consumable_serial_number'),
                    'consumable_inventory_number': consumable_data.get('consumable_inventory_number'),
                    'consumable_name': consumable_data.get('consumable_name'),
                    'consumable_status': consumable_data.get('consumable_status'),
                })
                serializer_item.is_valid(raise_exception=True)

                last_item = Consumable.objects.order_by('-consumable_id').first()
                next_id = (last_item.consumable_id + 1) if last_item else 1
                item = Consumable.objects.create(consumable_id=next_id, **serializer_item.validated_data)
                _sync_consumable_attribute_values(item)
                data['consumable'] = item.consumable_id

            serializer = self.get_serializer(data=data)
            if not serializer.is_valid():
                print('[AttributionOrderAssetConsumableAccessoryViewSet.create] serializer.errors:', serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            try:
                self.perform_create(serializer)
            except IntegrityError:
                return Response({'error': 'Accessory already exists for this order and asset'}, status=status.HTTP_400_BAD_REQUEST)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ReceiptReportViewSet(viewsets.ModelViewSet):
    queryset = ReceiptReport.objects.all().order_by("receipt_report_id")
    serializer_class = ReceiptReportSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'digital_copy' in request.FILES:
            data.pop('digital_copy', None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        last_item = ReceiptReport.objects.order_by("-receipt_report_id").first()
        next_id = (last_item.receipt_report_id + 1) if last_item else 1
        
        # Handle file upload if present
        digital_copy = request.FILES.get('digital_copy')
        validated_data = serializer.validated_data
        if digital_copy:
            rel_dir = os.path.join("receipt_reports")
            base_dir = os.path.join(str(settings.MEDIA_ROOT), rel_dir)
            os.makedirs(base_dir, exist_ok=True)

            rel_path = os.path.join(rel_dir, f"receipt_report_{next_id}.pdf")
            abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
            with open(abs_path, "wb") as f:
                f.write(digital_copy.read())
            validated_data['digital_copy'] = rel_path

        item = ReceiptReport.objects.create(receipt_report_id=next_id, **validated_data)
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED)


class AdministrativeCertificateViewSet(viewsets.ModelViewSet):
    queryset = AdministrativeCertificate.objects.all().order_by("administrative_certificate_id")
    serializer_class = AdministrativeCertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_account = getattr(self.request, "user", None)
        if not user_account or not getattr(user_account, "is_authenticated", False):
            return AdministrativeCertificate.objects.none()

        if getattr(user_account, "is_superuser", False):
            queryset = AdministrativeCertificate.objects.all().order_by("administrative_certificate_id")
        else:
            person = getattr(user_account, "person", None)
            if not person:
                return AdministrativeCertificate.objects.none()

            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            if ("asset_responsible" not in role_codes) and ("exploitation_chief" not in role_codes) and ("it_bureau_chief" not in role_codes):
                return AdministrativeCertificate.objects.none()

            queryset = AdministrativeCertificate.objects.all().order_by("administrative_certificate_id")

        attribution_order_id = self.request.query_params.get("attribution_order")
        if attribution_order_id is not None:
            try:
                queryset = queryset.filter(attribution_order_id=int(attribution_order_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def perform_update(self, serializer):
        instance = serializer.save()
        self._check_signatures_and_update_status(instance)

    def _check_signatures_and_update_status(self, cert):
        signatures = [
            cert.is_signed_by_warehouse_storage_magaziner,
            cert.is_signed_by_warehouse_storage_accountant,
            cert.is_signed_by_warehouse_storage_marketer,
            cert.is_signed_by_warehouse_it_chief,
            cert.is_signed_by_warehouse_leader,
        ]
        
        if all(signatures):
            with transaction.atomic():
                # Update Assets
                from api.utils.i18n import bulk_sync_status_translations
                bulk_sync_status_translations(Asset, {
                    'attribution_order_id': cert.attribution_order_id,
                    'asset_status': 'not_delivered_to_company',
                }, 'in_stock')
                
                # Update StockItems
                stock_item_ids = list(
                    AttributionOrderAssetStockItemAccessory.objects.filter(
                        attribution_order_id=cert.attribution_order_id
                    ).values_list('stock_item_id', flat=True)
                )
                if stock_item_ids:
                    bulk_sync_status_translations(StockItem, {
                        'stock_item_id__in': stock_item_ids,
                        'stock_item_status': 'not_delivered_to_company',
                    }, 'in_stock')

                # Update Consumables
                consumable_ids = list(
                    AttributionOrderAssetConsumableAccessory.objects.filter(
                        attribution_order_id=cert.attribution_order_id
                    ).values_list('consumable_id', flat=True)
                )
                if consumable_ids:
                    bulk_sync_status_translations(Consumable, {
                        'consumable_id__in': consumable_ids,
                        'consumable_status': 'not_delivered_to_company',
                    }, 'in_stock')

    def create(self, request, *args, **kwargs):
        user_account = getattr(request, "user", None)
        if not user_account or not getattr(user_account, "is_authenticated", False):
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        if getattr(user_account, "is_superuser", False):
            allowed = True
        else:
            person = getattr(user_account, "person", None)
            if not person:
                return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            allowed = ("asset_responsible" in role_codes) or ("exploitation_chief" in role_codes) or ("it_bureau_chief" in role_codes)

        if not allowed:
            return Response(
                {"error": "Only Asset Responsible can create administrative certificates"},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        if 'digital_copy' in request.FILES:
            data.pop('digital_copy', None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        last_item = AdministrativeCertificate.objects.order_by("-administrative_certificate_id").first()
        next_id = (last_item.administrative_certificate_id + 1) if last_item else 1
        
        digital_copy = request.FILES.get('digital_copy')
        validated_data = serializer.validated_data
        if digital_copy:
            rel_dir = os.path.join("administrative_certificates")
            base_dir = os.path.join(str(settings.MEDIA_ROOT), rel_dir)
            os.makedirs(base_dir, exist_ok=True)

            rel_path = os.path.join(rel_dir, f"administrative_certificate_{next_id}.pdf")
            abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
            with open(abs_path, "wb") as f:
                f.write(digital_copy.read())
            validated_data['digital_copy'] = rel_path

        with transaction.atomic():
            item = AdministrativeCertificate.objects.create(administrative_certificate_id=next_id, **validated_data)
            self._check_signatures_and_update_status(item)
            
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED)


class CompanyAssetRequestViewSet(viewsets.ModelViewSet):
    queryset = CompanyAssetRequest.objects.select_related("attribution_order").all().order_by(
        "-company_asset_request_id"
    )
    serializer_class = CompanyAssetRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_account = getattr(self.request, "user", None)
        if not user_account or not getattr(user_account, "is_authenticated", False):
            return CompanyAssetRequest.objects.none()

        if getattr(user_account, "is_superuser", False):
            return self.queryset

        person = getattr(user_account, "person", None)
        if not person:
            return CompanyAssetRequest.objects.none()

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )
        if ("asset_responsible" not in role_codes) and ("exploitation_chief" not in role_codes) and ("it_bureau_chief" not in role_codes):
            return CompanyAssetRequest.objects.none()

        return self.queryset

    def create(self, request, *args, **kwargs):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_account.is_superuser():
            allowed = True
        else:
            person = getattr(user_account, "person", None)
            if not person:
                return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)
            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            allowed = ("asset_responsible" in role_codes) or ("exploitation_chief" in role_codes) or ("it_bureau_chief" in role_codes)

        if not allowed:
            return Response(
                {"error": "Only Asset Responsible can create company asset requests"},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        if 'digital_copy' in request.FILES:
            data.pop('digital_copy', None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        last_item = CompanyAssetRequest.objects.order_by("-company_asset_request_id").first()
        next_id = (last_item.company_asset_request_id + 1) if last_item else 1

        validated_data = serializer.validated_data
        digital_copy = request.FILES.get('digital_copy')
        if digital_copy:
            validated_data = dict(validated_data)

            rel_dir = os.path.join("company_asset_requests")
            base_dir = os.path.join(str(settings.MEDIA_ROOT), rel_dir)
            os.makedirs(base_dir, exist_ok=True)

            rel_path = os.path.join(rel_dir, f"company_asset_request_{next_id}.pdf")
            abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
            with open(abs_path, "wb") as f:
                f.write(digital_copy.read())
            validated_data['digital_copy'] = rel_path

        item = CompanyAssetRequest.objects.create(company_asset_request_id=next_id, **validated_data)
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED)


class AssetIncidentReportViewSet(viewsets.ModelViewSet):
    INCIDENT_REASON_STATUSES = {"stolen", "lost", "irrecoverably_damaged"}

    queryset = AssetIncidentReport.objects.select_related(
        "asset",
        "asset__asset_model",
        "asset__asset_model__asset_brand",
        "asset__asset_model__asset_type",
        "owner_person",
        "school_headquarter_person",
    ).prefetch_related(
        "included_stock_items",
        "included_consumables",
    ).all().order_by("-asset_incident_report_id")
    serializer_class = AssetIncidentReportSerializer
    permission_classes = [IsAuthenticated]

    def _role_codes(self, user_account):
        if not user_account:
            return set()
        person = getattr(user_account, "person", None)
        if not person:
            return set()
        return set(PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True))

    def _is_superuser_account(self, user_account):
        if not user_account:
            return False
        is_super = getattr(user_account, "is_superuser", False)
        if callable(is_super):
            try:
                is_super = is_super()
            except Exception:
                is_super = False
        return bool(is_super)

    def _has_access(self, user_account):
        if self._is_superuser_account(user_account):
            return True
        role_codes = self._role_codes(user_account)
        return (
            ("exploitation_chief" in role_codes)
            or ("it_bureau_chief" in role_codes)
            or ("protection_and_security_bureau_chief" in role_codes)
            or ("school_headquarter" in role_codes)
        )

    def _is_report_owner(self, user_account, report):
        if not user_account or not report:
            return False
        person_id = getattr(user_account, "person_id", None)
        if not person_id:
            return False
        return int(person_id) == int(getattr(report, "owner_person_id", 0))

    def _can_create_report(self, user_account):
        if self._is_superuser_account(user_account):
            return True
        role_codes = self._role_codes(user_account)
        return ("exploitation_chief" in role_codes) or ("it_bureau_chief" in role_codes)

    def _editable_fields_for_user(self, user_account):
        if self._is_superuser_account(user_account):
            return {
                "owner_note",
                "is_signed_by_owner",
                "it_bureau_chief_note",
                "is_signed_by_it_bureau_chief",
                "exploitation_chief_note",
                "is_signed_by_exploitation_chief",
                "protection_and_security_bureau_chief_note",
                "is_signed_by_protection_and_security_bureau_chief",
                "school_headquarter_note",
                "is_signed_by_school_headquarter",
            }
        role_codes = self._role_codes(user_account)
        fields = set()
        if "it_bureau_chief" in role_codes:
            fields.update({"it_bureau_chief_note", "is_signed_by_it_bureau_chief"})
        if "exploitation_chief" in role_codes:
            fields.update({"exploitation_chief_note", "is_signed_by_exploitation_chief"})
        if "protection_and_security_bureau_chief" in role_codes:
            fields.update(
                {
                    "protection_and_security_bureau_chief_note",
                    "is_signed_by_protection_and_security_bureau_chief",
                }
            )
        if "school_headquarter" in role_codes:
            fields.update({"school_headquarter_note", "is_signed_by_school_headquarter"})
        return fields

    def get_queryset(self):
        request_user = getattr(self.request, "user", None)
        if request_user and getattr(request_user, "is_authenticated", False):
            user_account = request_user
        else:
            user_account = SuperuserWriteMixin()._get_user_account(self.request)
        if not user_account:
            return AssetIncidentReport.objects.none()
        if self._is_superuser_account(user_account) or self._has_access(user_account):
            return self.queryset
        person_id = getattr(user_account, "person_id", None)
        if person_id:
            return self.queryset.filter(owner_person_id=person_id)
        return AssetIncidentReport.objects.none()

    def _parse_id_list(self, raw_value):
        if raw_value is None:
            return []
        if isinstance(raw_value, (list, tuple)):
            values = raw_value
        elif isinstance(raw_value, str):
            text = raw_value.strip()
            if not text:
                return []
            try:
                parsed = json.loads(text)
                values = parsed if isinstance(parsed, list) else [parsed]
            except Exception:
                values = [x.strip() for x in text.split(",")]
        else:
            values = [raw_value]

        output = []
        for value in values:
            try:
                n = int(value)
            except Exception:
                continue
            if n > 0 and n not in output:
                output.append(n)
        return output

    def _normalize_text_value(self, value):
        if not isinstance(value, str):
            return ""
        return value.strip().lower()

    def _parse_bool_value(self, raw_value, default=False):
        if isinstance(raw_value, bool):
            return raw_value
        if raw_value is None:
            return default
        text = str(raw_value).strip().lower()
        if text in {"1", "true", "yes", "y", "on"}:
            return True
        if text in {"0", "false", "no", "n", "off"}:
            return False
        return default

    def _current_composed_item_ids(self, asset_id):
        stock_item_ids = list(
            AssetIsComposedOfStockItemHistory.objects.filter(
                asset_id=asset_id,
                end_datetime__isnull=True,
            ).values_list("stock_item_id", flat=True)
        )
        consumable_ids = list(
            AssetIsComposedOfConsumableHistory.objects.filter(
                asset_id=asset_id,
                end_datetime__isnull=True,
            ).values_list("consumable_id", flat=True)
        )
        return stock_item_ids, consumable_ids

    def _filter_to_current_ids(self, requested_ids, current_ids):
        current_set = set(current_ids)
        return [item_id for item_id in requested_ids if item_id in current_set]

    def _parse_status_map(self, raw_value, allowed_ids):
        if raw_value is None:
            return {}
        data = raw_value
        if isinstance(raw_value, str):
            text = raw_value.strip()
            if not text:
                return {}
            try:
                data = json.loads(text)
            except Exception:
                return {}
        if not isinstance(data, dict):
            return {}

        allowed_set = set(allowed_ids or [])
        output = {}
        for key, value in data.items():
            try:
                item_id = int(key)
            except Exception:
                continue
            if item_id not in allowed_set:
                continue
            normalized_status = self._normalize_text_value(value)
            if normalized_status in self.INCIDENT_REASON_STATUSES:
                output[item_id] = normalized_status
        return output

    def _sync_report_item_links(self, report, stock_item_ids, consumable_ids):
        stock_item_ids = list(dict.fromkeys(stock_item_ids or []))
        consumable_ids = list(dict.fromkeys(consumable_ids or []))

        AssetIncidentReportStockItem.objects.filter(asset_incident_report=report).exclude(
            stock_item_id__in=stock_item_ids
        ).delete()
        existing_stock_item_ids = set(
            AssetIncidentReportStockItem.objects.filter(asset_incident_report=report).values_list("stock_item_id", flat=True)
        )
        for stock_item_id in stock_item_ids:
            if stock_item_id not in existing_stock_item_ids:
                AssetIncidentReportStockItem.objects.create(
                    asset_incident_report=report,
                    stock_item_id=stock_item_id,
                )

        AssetIncidentReportConsumable.objects.filter(asset_incident_report=report).exclude(
            consumable_id__in=consumable_ids
        ).delete()
        existing_consumable_ids = set(
            AssetIncidentReportConsumable.objects.filter(asset_incident_report=report).values_list("consumable_id", flat=True)
        )
        for consumable_id in consumable_ids:
            if consumable_id not in existing_consumable_ids:
                AssetIncidentReportConsumable.objects.create(
                    asset_incident_report=report,
                    consumable_id=consumable_id,
                )

    def _apply_incident_status(
        self,
        report,
        stock_item_ids,
        consumable_ids,
        stock_item_status_overrides=None,
        consumable_status_overrides=None,
    ):
        reason_status = self._normalize_text_value(getattr(report, "reason", None))
        if reason_status not in self.INCIDENT_REASON_STATUSES:
            return
        report_status = self._normalize_text_value(getattr(report, "status", None))
        if report_status != "submitted":
            return
        from api.utils.i18n import bulk_sync_status_translations
        Asset.objects.filter(asset_id=report.asset_id).update(asset_status=reason_status)
        # Sync asset status translations
        try:
            asset = Asset.objects.get(asset_id=report.asset_id)
            from api.utils.i18n import sync_status_translations
            sync_status_translations(asset, reason_status)
        except Asset.DoesNotExist:
            pass
        stock_item_status_overrides = stock_item_status_overrides or {}
        consumable_status_overrides = consumable_status_overrides or {}

        if stock_item_ids:
            stock_item_ids = list(dict.fromkeys(stock_item_ids))
            if stock_item_status_overrides:
                remaining_ids = set(stock_item_ids)
                by_status = {}
                for item_id, item_status in stock_item_status_overrides.items():
                    if item_id not in remaining_ids:
                        continue
                    by_status.setdefault(item_status, []).append(item_id)
                    if item_id in remaining_ids:
                        remaining_ids.remove(item_id)
                for item_status, item_ids in by_status.items():
                    bulk_sync_status_translations(StockItem, {'stock_item_id__in': item_ids}, item_status)
                if remaining_ids:
                    bulk_sync_status_translations(StockItem, {'stock_item_id__in': list(remaining_ids)}, reason_status)
            else:
                bulk_sync_status_translations(StockItem, {'stock_item_id__in': stock_item_ids}, reason_status)

        if consumable_ids:
            consumable_ids = list(dict.fromkeys(consumable_ids))
            if consumable_status_overrides:
                remaining_ids = set(consumable_ids)
                by_status = {}
                for item_id, item_status in consumable_status_overrides.items():
                    if item_id not in remaining_ids:
                        continue
                    by_status.setdefault(item_status, []).append(item_id)
                    if item_id in remaining_ids:
                        remaining_ids.remove(item_id)
                for item_status, item_ids in by_status.items():
                    bulk_sync_status_translations(Consumable, {'consumable_id__in': item_ids}, item_status)
                if remaining_ids:
                    bulk_sync_status_translations(Consumable, {'consumable_id__in': list(remaining_ids)}, reason_status)
            else:
                bulk_sync_status_translations(Consumable, {'consumable_id__in': consumable_ids}, reason_status)

    def create(self, request, *args, **kwargs):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)
        if not self._can_create_report(user_account):
            return Response(
                {"error": "Only exploitation chief, IT bureau chief, or superusers can create incident reports"},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        if "digital_copy" in request.FILES:
            data.pop("digital_copy", None)
        data.pop("stock_item_ids", None)
        data.pop("consumable_ids", None)
        data.pop("apply_status_to_all_composing_items", None)
        data.pop("stock_item_statuses", None)
        data.pop("consumable_statuses", None)
        data["owner_note"] = ""
        data["is_signed_by_owner"] = False

        asset_id_raw = data.get("asset")
        try:
            asset_id = int(asset_id_raw)
        except Exception:
            return Response({"error": "asset is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not data.get("owner_person"):
            assignment = (
                AssetIsAssignedToPerson.objects.filter(asset_id=asset_id, is_active=True)
                .order_by("-assignment_id")
                .first()
            )
            if assignment:
                data["owner_person"] = assignment.person_id
            elif getattr(user_account, "person_id", None):
                data["owner_person"] = user_account.person_id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        validated_data = dict(serializer.validated_data)
        if not validated_data.get("report_datetime"):
            validated_data["report_datetime"] = timezone.now()
        if not validated_data.get("status"):
            validated_data["status"] = "draft"

        reason_status = self._normalize_text_value(validated_data.get("reason"))
        report_status = self._normalize_text_value(validated_data.get("status"))
        role_codes = self._role_codes(user_account)
        should_apply_incident_status = (
            ("exploitation_chief" in role_codes)
            and (report_status == "submitted")
            and (reason_status in self.INCIDENT_REASON_STATUSES)
        )

        requested_stock_item_ids = self._parse_id_list(request.data.get("stock_item_ids"))
        requested_consumable_ids = self._parse_id_list(request.data.get("consumable_ids"))
        apply_status_to_all_composing_items = self._parse_bool_value(
            request.data.get("apply_status_to_all_composing_items"),
            default=True,
        )
        current_stock_item_ids, current_consumable_ids = self._current_composed_item_ids(asset_id)
        selected_stock_item_ids = (
            current_stock_item_ids
            if apply_status_to_all_composing_items
            else self._filter_to_current_ids(requested_stock_item_ids, current_stock_item_ids)
        )
        selected_consumable_ids = (
            current_consumable_ids
            if apply_status_to_all_composing_items
            else self._filter_to_current_ids(requested_consumable_ids, current_consumable_ids)
        )
        stock_item_status_overrides = self._parse_status_map(
            request.data.get("stock_item_statuses"),
            selected_stock_item_ids,
        )
        consumable_status_overrides = self._parse_status_map(
            request.data.get("consumable_statuses"),
            selected_consumable_ids,
        )

        last_item = AssetIncidentReport.objects.order_by("-asset_incident_report_id").first()
        next_id = (last_item.asset_incident_report_id + 1) if last_item else 1

        digital_copy = request.FILES.get("digital_copy")
        if digital_copy:
            rel_dir = os.path.join("incident_reports")
            base_dir = os.path.join(str(settings.MEDIA_ROOT), rel_dir)
            os.makedirs(base_dir, exist_ok=True)

            rel_path = os.path.join(rel_dir, f"asset_incident_report_{next_id}.pdf")
            abs_path = os.path.join(str(settings.MEDIA_ROOT), rel_path)
            with open(abs_path, "wb") as f:
                f.write(digital_copy.read())
            validated_data["digital_copy"] = rel_path

        try:
            with transaction.atomic():
                report = AssetIncidentReport.objects.create(
                    asset_incident_report_id=next_id,
                    **validated_data,
                )
                self._sync_report_item_links(
                    report,
                    selected_stock_item_ids,
                    selected_consumable_ids,
                )
                if should_apply_incident_status:
                    target_stock_item_ids = (
                        current_stock_item_ids if apply_status_to_all_composing_items else selected_stock_item_ids
                    )
                    target_consumable_ids = (
                        current_consumable_ids if apply_status_to_all_composing_items else selected_consumable_ids
                    )
                    self._apply_incident_status(
                        report,
                        target_stock_item_ids,
                        target_consumable_ids,
                        stock_item_status_overrides if not apply_status_to_all_composing_items else None,
                        consumable_status_overrides if not apply_status_to_all_composing_items else None,
                    )
        except IntegrityError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.get_serializer(report).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)
        report = self.get_object()
        is_report_owner = self._is_report_owner(user_account, report)
        if not self._has_access(user_account) and not is_report_owner and not self._is_superuser_account(user_account):
            return Response(
                {"error": "You are not allowed to review incident reports"},
                status=status.HTTP_403_FORBIDDEN,
            )

        role_codes = self._role_codes(user_account)
        is_superuser = self._is_superuser_account(user_account)
        editable_fields = set()
        if is_superuser or is_report_owner:
            editable_fields.update({"owner_note", "is_signed_by_owner"})
        editable_fields.update(self._editable_fields_for_user(user_account))
        if not editable_fields:
            return Response(
                {"error": "You do not have any editable fields on incident reports"},
                status=status.HTTP_403_FORBIDDEN,
            )

        selection_fields = set()
        if is_superuser or ("exploitation_chief" in role_codes):
            selection_fields = {"stock_item_ids", "consumable_ids", "apply_status_to_all_composing_items"}

        payload_keys = set(request.data.keys())
        allowed_fields = editable_fields | selection_fields
        forbidden_keys = payload_keys - allowed_fields
        if forbidden_keys:
            return Response(
                {
                    "error": "You can only update your own note/signature fields",
                    "forbidden_fields": sorted(forbidden_keys),
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        if not payload_keys:
            return Response({"error": "No fields to update"}, status=status.HTTP_400_BAD_REQUEST)
        current_stock_item_ids, current_consumable_ids = self._current_composed_item_ids(report.asset_id)
        existing_selected_stock_item_ids = list(
            AssetIncidentReportStockItem.objects.filter(asset_incident_report=report).values_list("stock_item_id", flat=True)
        )
        existing_selected_consumable_ids = list(
            AssetIncidentReportConsumable.objects.filter(asset_incident_report=report).values_list("consumable_id", flat=True)
        )

        apply_all_field_present = "apply_status_to_all_composing_items" in request.data
        apply_status_to_all_composing_items = self._parse_bool_value(
            request.data.get("apply_status_to_all_composing_items"),
            default=False,
        )
        selected_stock_item_ids = existing_selected_stock_item_ids
        selected_consumable_ids = existing_selected_consumable_ids

        if apply_all_field_present and apply_status_to_all_composing_items:
            selected_stock_item_ids = current_stock_item_ids
            selected_consumable_ids = current_consumable_ids
        else:
            if "stock_item_ids" in request.data:
                selected_stock_item_ids = self._filter_to_current_ids(
                    self._parse_id_list(request.data.get("stock_item_ids")),
                    current_stock_item_ids,
                )
            if "consumable_ids" in request.data:
                selected_consumable_ids = self._filter_to_current_ids(
                    self._parse_id_list(request.data.get("consumable_ids")),
                    current_consumable_ids,
                )

        model_update_data = {k: request.data.get(k) for k in payload_keys if k in editable_fields}
        with transaction.atomic():
            self._sync_report_item_links(
                report,
                selected_stock_item_ids,
                selected_consumable_ids,
            )

            if model_update_data:
                serializer = self.get_serializer(report, data=model_update_data, partial=True)
                serializer.is_valid(raise_exception=True)
                report = serializer.save()

            if is_superuser or ("exploitation_chief" in role_codes):
                should_apply_now = bool(getattr(report, "is_signed_by_exploitation_chief", False))
                if should_apply_now:
                    target_stock_item_ids = (
                        current_stock_item_ids if apply_status_to_all_composing_items else selected_stock_item_ids
                    )
                    target_consumable_ids = (
                        current_consumable_ids if apply_status_to_all_composing_items else selected_consumable_ids
                    )
                    self._apply_incident_status(report, target_stock_item_ids, target_consumable_ids)

        report.refresh_from_db()
        return Response(self.get_serializer(report).data, status=status.HTTP_200_OK)


class InventoryReportViewSet(viewsets.ViewSet):
    """ViewSet for inventory reports - shows item counts by location"""
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get inventory counts by location for assets, stock items, and consumables"""
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_account.is_superuser():
            allowed = True
        else:
            person = getattr(user_account, "person", None)
            if not person:
                return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)
            role_codes = set(
                PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
            )
            allowed = ("asset_responsible" in role_codes) or ("exploitation_chief" in role_codes)

        if not allowed:
            return Response(
                {"error": "Only Asset Responsible can view inventory reports"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get all locations
        locations = Location.objects.all().order_by('location_name')

        # Get asset counts by location (current location based on latest accepted movement)
        asset_counts = {}
        # Get the latest accepted movement for each asset
        latest_asset_movements = AssetMovement.objects.filter(
            status='accepted'
        ).values('asset').annotate(
            latest_datetime=Max('movement_datetime')
        )
        
        for movement_data in latest_asset_movements:
            # Get the destination location of the latest movement
            latest_movement = AssetMovement.objects.get(
                asset_id=movement_data['asset'],
                movement_datetime=movement_data['latest_datetime'],
                status='accepted'
            )
            location_id = latest_movement.destination_location_id
            asset_counts[location_id] = asset_counts.get(location_id, 0) + 1

        # Get stock item counts by location (current location based on latest accepted movement)
        stock_item_counts = {}
        # Get the latest accepted movement for each stock item
        latest_stock_item_movements = StockItemMovement.objects.filter(
            status='accepted'
        ).values('stock_item').annotate(
            latest_datetime=Max('movement_datetime')
        )
        
        for movement_data in latest_stock_item_movements:
            # Get the destination location of the latest movement
            latest_movement = StockItemMovement.objects.get(
                stock_item_id=movement_data['stock_item'],
                movement_datetime=movement_data['latest_datetime'],
                status='accepted'
            )
            location_id = latest_movement.destination_location_id
            stock_item_counts[location_id] = stock_item_counts.get(location_id, 0) + 1

        # Get consumable counts by location (current location based on latest accepted movement)
        consumable_counts = {}
        # Get the latest accepted movement for each consumable
        latest_consumable_movements = ConsumableMovement.objects.filter(
            status='accepted'
        ).values('consumable').annotate(
            latest_datetime=Max('movement_datetime')
        )
        
        for movement_data in latest_consumable_movements:
            # Get the destination location of the latest movement
            latest_movement = ConsumableMovement.objects.get(
                consumable_id=movement_data['consumable'],
                movement_datetime=movement_data['latest_datetime'],
                status='accepted'
            )
            location_id = latest_movement.destination_location_id
            consumable_counts[location_id] = consumable_counts.get(location_id, 0) + 1

        # Build response data
        data = []
        for location in locations:
            location_id = location.location_id
            data.append({
                'location_id': location_id,
                'location_name': location.location_name,
                'location_type': location.location_type.location_type_label if location.location_type else None,
                'asset_count': asset_counts.get(location_id, 0),
                'stock_item_count': stock_item_counts.get(location_id, 0),
                'consumable_count': consumable_counts.get(location_id, 0),
                'total_items': (
                    asset_counts.get(location_id, 0) +
                    stock_item_counts.get(location_id, 0) +
                    consumable_counts.get(location_id, 0)
                )
            })

        return Response(data, status=status.HTTP_200_OK)


def _validate_strong_password(password):
    """Validate that a password meets strong password conditions.
    Returns an error message string if invalid, or None if valid."""
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not any(c.isupper() for c in password):
        return "Password must contain at least one uppercase letter."
    if not any(c.islower() for c in password):
        return "Password must contain at least one lowercase letter."
    if not any(c.isdigit() for c in password):
        return "Password must contain at least one digit."
    if not any(c in "!@#$%^&*()_+-=[]{}|;':\",./<>?`~" for c in password):
        return "Password must contain at least one special character."
    return None


class SignupView(APIView):
    """Public signup endpoint — creates a Person, PersonAssignment, and UserAccount.
    The account is created with is_approved=False by default; a superuser must approve it."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        """Public endpoint returning dropdown data needed for the signup form."""
        from api.translations import RoleTranslation, PositionTranslation, OrganizationalStructureTranslation, LocationTranslation
        lang = request.query_params.get("lang", "en")
        roles = Role.objects.all().order_by("role_id")
        positions = Position.objects.all().order_by("position_id")
        org_structures = OrganizationalStructure.objects.all().order_by("organizational_structure_id")
        locations = Location.objects.all().order_by("location_id")

        def _role_label(r):
            if lang == "ar":
                t = RoleTranslation.objects.filter(role=r, language_code="ar").first()
                return t.role_label if t else r.role_label
            return r.role_label

        def _position_label(p):
            if lang == "ar":
                t = PositionTranslation.objects.filter(position=p, language_code="ar").first()
                return t.position_label if t else p.position_label
            return p.position_label

        def _structure_name(s):
            if lang == "ar":
                t = OrganizationalStructureTranslation.objects.filter(organizational_structure=s, language_code="ar").first()
                return t.structure_name if t else s.structure_name
            return s.structure_name

        def _location_name(l):
            if lang == "ar":
                t = LocationTranslation.objects.filter(location=l, language_code="ar").first()
                return t.location_name if t else l.location_name
            return l.location_name

        return Response({
            "roles": [
                {"role_id": r.role_id, "role_code": r.role_code, "role_label": _role_label(r)}
                for r in roles
            ],
            "positions": [
                {"position_id": p.position_id, "position_label": _position_label(p)}
                for p in positions
            ],
            "organizational_structures": [
                {"organizational_structure_id": o.organizational_structure_id, "structure_name": _structure_name(o)}
                for o in org_structures
            ],
            "locations": [
                {"location_id": l.location_id, "location_name": _location_name(l)}
                for l in locations
            ],
        })

    def post(self, request):
        data = request.data

        # --- Required fields ---
        first_name = (data.get("first_name") or "").strip()
        last_name = (data.get("last_name") or "").strip()
        first_name_en = (data.get("first_name_en") or "").strip()
        first_name_ar = (data.get("first_name_ar") or "").strip()
        last_name_en = (data.get("last_name_en") or "").strip()
        last_name_ar = (data.get("last_name_ar") or "").strip()
        sex = (data.get("sex") or "").strip()
        birth_date = data.get("birth_date")
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""
        role_code = (data.get("role_code") or "").strip()
        position_id = data.get("position_id")
        organizational_structure_id = data.get("organizational_structure_id")
        location_id = data.get("location_id")

        # --- Validations ---
        if not first_name or not last_name:
            return Response({"error": "First name and last name are required."}, status=status.HTTP_400_BAD_REQUEST)
        if not first_name_en or not first_name_ar:
            return Response({"error": "First name in English and Arabic are required."}, status=status.HTTP_400_BAD_REQUEST)
        if not last_name_en or not last_name_ar:
            return Response({"error": "Last name in English and Arabic are required."}, status=status.HTTP_400_BAD_REQUEST)
        if sex not in ("Male", "Female"):
            return Response({"error": "Sex must be 'Male' or 'Female'."}, status=status.HTTP_400_BAD_REQUEST)
        if not birth_date:
            return Response({"error": "Birth date is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not username:
            return Response({"error": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({"error": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Username uniqueness
        if UserAccount.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Strong password
        pwd_error = _validate_strong_password(password)
        if pwd_error:
            return Response({"error": pwd_error}, status=status.HTTP_400_BAD_REQUEST)

        # Role
        role = None
        if role_code:
            role = Role.objects.filter(role_code=role_code).order_by("role_id").first()
            if not role:
                return Response({"error": f"Role not found for role_code '{role_code}'"}, status=status.HTTP_400_BAD_REQUEST)

        # Position
        position = None
        if position_id:
            try:
                position = Position.objects.get(position_id=int(position_id))
            except (ValueError, TypeError, Position.DoesNotExist):
                return Response({"error": "Invalid position_id"}, status=status.HTTP_400_BAD_REQUEST)

        # Organizational structure
        org_structure = None
        if organizational_structure_id:
            try:
                org_structure = OrganizationalStructure.objects.get(
                    organizational_structure_id=int(organizational_structure_id)
                )
            except (ValueError, TypeError, OrganizationalStructure.DoesNotExist):
                return Response({"error": "Invalid organizational_structure_id"}, status=status.HTTP_400_BAD_REQUEST)

        # Location
        location = None
        if location_id:
            try:
                location = Location.objects.get(location_id=int(location_id))
            except (ValueError, TypeError, Location.DoesNotExist):
                return Response({"error": "Invalid location_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            now_ts = timezone.now()

            with transaction.atomic():
                # 1. Create Person
                last_person = Person.objects.order_by("-person_id").first()
                next_person_id = (last_person.person_id + 1) if last_person else 1
                person = Person.objects.create(
                    person_id=next_person_id,
                    first_name=first_name_en,
                    last_name=last_name_en,
                    sex=sex,
                    birth_date=birth_date,
                    is_approved=False,
                )

                # Save person translations (en + ar)
                from api.translations import PersonTranslation
                last_pt = PersonTranslation.objects.order_by('-id').first()
                pt_id = (last_pt.id + 1) if last_pt else 1
                PersonTranslation.objects.create(
                    id=pt_id,
                    person=person,
                    language_code='en',
                    first_name=first_name_en,
                    last_name=last_name_en,
                )
                last_pt = PersonTranslation.objects.order_by('-id').first()
                pt_id = (last_pt.id + 1) if last_pt else 1
                PersonTranslation.objects.create(
                    id=pt_id,
                    person=person,
                    language_code='ar',
                    first_name=first_name_ar,
                    last_name=last_name_ar,
                )

                # 2. Create PersonAssignment if position provided
                if position:
                    last_pa = PersonAssignment.objects.order_by("-assignment_id").first()
                    next_pa_id = (last_pa.assignment_id + 1) if last_pa else 1
                    PersonAssignment.objects.create(
                        assignment_id=next_pa_id,
                        person=person,
                        position=position,
                        assignment_start_date=now_ts.date(),
                        employment_type=data.get("employment_type", ""),
                    )

                # 3. Create UserAccount (not approved by default)
                last_user = UserAccount.objects.order_by("-user_id").first()
                next_user_id = (last_user.user_id + 1) if last_user else 1
                account = UserAccount.objects.create(
                    user_id=next_user_id,
                    person=person,
                    username=username,
                    password_hash=hash_password(password),
                    created_at_datetime=now_ts,
                    disabled_at_datetime=now_ts,
                    last_login=now_ts,
                    account_status="pending_approval",
                    failed_login_attempts=0,
                    password_last_changed_datetime=now_ts,
                    is_approved=False,
                    modified_at_datetime=now_ts,
                )

                # 4. Assign role if provided
                if role is not None:
                    with connection.cursor() as cursor:
                        cursor.execute(
                            """
                            INSERT INTO person_role_mapping (role_id, person_id)
                            VALUES (%s, %s)
                            ON CONFLICT (role_id, person_id) DO NOTHING
                            """,
                            [role.role_id, person.person_id],
                        )

            return Response(
                {
                    "message": "Signup successful. Your account is pending approval by an administrator.",
                    "user_id": account.user_id,
                    "username": account.username,
                    "is_approved": account.is_approved,
                },
                status=status.HTTP_201_CREATED,
            )
        except IntegrityError as exc:
            return Response({"error": f"Could not create account due to a data conflict: {exc}"}, status=status.HTTP_400_BAD_REQUEST)


class ApproveUserAccountView(APIView):
    """Superuser-only endpoint to approve a user account."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        actor = SuperuserWriteMixin()._get_user_account(request)
        if not actor:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)
        if not actor.is_superuser():
            return Response({"error": "Only superusers can approve accounts"}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get("user_id")
        username = (request.data.get("username") or "").strip()

        if not user_id and not username:
            return Response({"error": "user_id or username is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if username:
                target = UserAccount.objects.get(username=username)
            else:
                target = UserAccount.objects.get(user_id=int(user_id))
        except (ValueError, TypeError, UserAccount.DoesNotExist):
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if target.is_approved:
            return Response({"message": "Account is already approved"}, status=status.HTTP_200_OK)

        if target.person and not target.person.is_approved:
            return Response(
                {"error": "Cannot approve a user account before approving the person"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target.is_approved = True
        target.account_status = "active"
        target.save(update_fields=["is_approved", "account_status"])

        return Response(
            {
                "message": "Account approved successfully",
                "user_id": target.user_id,
                "username": target.username,
                "is_approved": True,
            },
            status=status.HTTP_200_OK,
        )


class PendingUserAccountsView(APIView):
    """Superuser-only endpoint to list unapproved user accounts."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        actor = SuperuserWriteMixin()._get_user_account(request)
        if not actor:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)
        if not actor.is_superuser():
            return Response({"error": "Only superusers can view pending accounts"}, status=status.HTTP_403_FORBIDDEN)

        pending = UserAccount.objects.filter(is_approved=False).select_related("person")
        data = []
        for ua in pending:
            person_data = {
                "person_id": ua.person.person_id,
                "first_name": ua.person.first_name,
                "last_name": ua.person.last_name,
                "sex": ua.person.sex,
                "birth_date": ua.person.birth_date,
            } if ua.person else None

            # Get translations
            first_name_en = first_name_ar = last_name_en = last_name_ar = None
            if ua.person:
                from api.translations import PersonTranslation
                for pt in PersonTranslation.objects.filter(person=ua.person):
                    if pt.language_code == 'en':
                        first_name_en = pt.first_name
                        last_name_en = pt.last_name
                    elif pt.language_code == 'ar':
                        first_name_ar = pt.first_name
                        last_name_ar = pt.last_name

            # Get role
            role_code = None
            role_label = None
            mapping = PersonRoleMapping.objects.filter(person=ua.person).select_related('role').first()
            if mapping and mapping.role:
                role_code = mapping.role.role_code
                role_label = mapping.role.role_label

            # Get assignment
            assignment = PersonAssignment.objects.filter(person=ua.person).select_related('position').first()
            position_label = assignment.position.position_label if assignment and assignment.position else None

            data.append({
                "user_id": ua.user_id,
                "username": ua.username,
                "is_approved": ua.is_approved,
                "account_status": ua.account_status,
                "created_at_datetime": ua.created_at_datetime,
                "person": person_data,
                "first_name_en": first_name_en,
                "first_name_ar": first_name_ar,
                "last_name_en": last_name_en,
                "last_name_ar": last_name_ar,
                "role_code": role_code,
                "role_label": role_label,
                "position_label": position_label,
            })

        return Response(data, status=status.HTTP_200_OK)


class AssignmentsListView(APIView):
    """Unified assignments list view aggregating asset, stock item, and consumable assignments.

    Role-based access:
    - asset_responsible: can only see asset assignments
    - stock_consumable_responsible: can only see stock item and consumable assignments
    - exploitation_chief, it_bureau_chief, superuser: can see all assignment types

    Query params:
    - item_type: 'asset' | 'stock_item' | 'consumable' (optional, filtered by role if omitted)
    - is_active: 'true' | 'false' (optional)
    - date_from: ISO date string (filters start_datetime >= date_from)
    - date_to: ISO date string (filters start_datetime <= date_to)
    - confirmed: 'true' | 'false' (whether confirmed by exploitation chief)
    - assigned_by: person_id of the assigner (optional)
    - person: person_id of the assignee (optional)
    - search: search term for item name, inventory number, serial number, person name
    - sort: field to sort by (start_datetime, end_datetime, assignment_id). Default: -start_datetime
    - page: page number (default 1)
    - page_size: items per page (default 50)
    """
    permission_classes = [IsAuthenticated]

    ASSIGNMENT_TYPE_MAP = {
        'asset': {
            'model': AssetIsAssignedToPerson,
            'item_fk': 'asset',
            'serializer': AssetIsAssignedToPersonSerializer,
        },
        'stock_item': {
            'model': StockItemIsAssignedToPerson,
            'item_fk': 'stock_item',
            'serializer': StockItemIsAssignedToPersonSerializer,
        },
        'consumable': {
            'model': ConsumableIsAssignedToPerson,
            'item_fk': 'consumable',
            'serializer': ConsumableIsAssignedToPersonSerializer,
        },
    }

    def _get_user_account(self, request):
        if hasattr(request, 'user') and request.user and getattr(request.user, 'is_authenticated', False):
            if isinstance(request.user, UserAccount):
                return request.user
        try:
            if hasattr(request, 'auth') and request.auth is not None:
                user_id = request.auth.get("user_id")
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except Exception:
            pass
        return None

    def _get_allowed_types(self, role_codes, is_superuser):
        if is_superuser or 'exploitation_chief' in role_codes or 'it_bureau_chief' in role_codes:
            return ['asset', 'stock_item', 'consumable']
        types = []
        if 'asset_responsible' in role_codes:
            types.append('asset')
        if 'stock_consumable_responsible' in role_codes:
            types.extend(['stock_item', 'consumable'])
        return types

    def _build_queryset(self, item_type, params):
        cfg = self.ASSIGNMENT_TYPE_MAP[item_type]
        model = cfg['model']
        item_fk = cfg['item_fk']
        qs = model.objects.select_related('person', 'assigned_by_person', 'is_confirmed_by_exploitation_chief', item_fk).all()

        # is_active filter
        is_active = params.get('is_active')
        if is_active in ('true', 'false'):
            qs = qs.filter(is_active=(is_active == 'true'))

        # date range filter
        date_from = params.get('date_from')
        if date_from:
            try:
                qs = qs.filter(start_datetime__gte=date_from)
            except (ValueError, TypeError):
                pass
        date_to = params.get('date_to')
        if date_to:
            try:
                qs = qs.filter(start_datetime__lte=date_to)
            except (ValueError, TypeError):
                pass

        # confirmed filter
        confirmed = params.get('confirmed')
        if confirmed == 'true':
            qs = qs.filter(is_confirmed_by_exploitation_chief__isnull=False)
        elif confirmed == 'false':
            qs = qs.filter(is_confirmed_by_exploitation_chief__isnull=True)

        # assigned_by filter
        assigned_by = params.get('assigned_by')
        if assigned_by:
            try:
                qs = qs.filter(assigned_by_person_id=int(assigned_by))
            except (TypeError, ValueError):
                pass

        # person (assignee) filter
        person_id = params.get('person')
        if person_id:
            try:
                qs = qs.filter(person_id=int(person_id))
            except (TypeError, ValueError):
                pass

        # position/department filter
        position_id = params.get('position')
        if position_id:
            try:
                person_ids = PersonAssignment.objects.filter(
                    position_id=int(position_id)
                ).values_list('person_id', flat=True)
                qs = qs.filter(person_id__in=person_ids)
            except (TypeError, ValueError):
                pass

        # search filter
        search = params.get('search', '').strip()
        if search:
            search_conditions = Q()
            if item_type == 'asset':
                search_conditions |= Q(asset__asset_name__icontains=search)
                search_conditions |= Q(asset__asset_inventory_number__icontains=search)
                search_conditions |= Q(asset__asset_serial_number__icontains=search)
            elif item_type == 'stock_item':
                search_conditions |= Q(stock_item__stock_item_name__icontains=search)
                search_conditions |= Q(stock_item__stock_item_inventory_number__icontains=search)
            elif item_type == 'consumable':
                search_conditions |= Q(consumable__consumable_name__icontains=search)
                search_conditions |= Q(consumable__consumable_inventory_number__icontains=search)
                search_conditions |= Q(consumable__consumable_serial_number__icontains=search)
            search_conditions |= Q(person__first_name__icontains=search)
            search_conditions |= Q(person__last_name__icontains=search)
            search_conditions |= Q(assigned_by_person__first_name__icontains=search)
            search_conditions |= Q(assigned_by_person__last_name__icontains=search)
            qs = qs.filter(search_conditions)

        return qs

    def get(self, request):
        user_account = self._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = getattr(user_account, 'person', None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )
        is_superuser = user_account.is_superuser()
        allowed_types = self._get_allowed_types(role_codes, is_superuser)

        if not allowed_types:
            return Response(
                {"error": "You do not have permission to view assignments"},
                status=status.HTTP_403_FORBIDDEN,
            )

        params = request.query_params
        requested_type = params.get('item_type', '')

        # Determine which types to query
        if requested_type:
            if requested_type not in allowed_types:
                return Response(
                    {"error": f"You do not have permission to view {requested_type} assignments"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            types_to_query = [requested_type]
        else:
            types_to_query = allowed_types

        # Sort
        sort_field = params.get('sort', '-start_datetime')
        allowed_sorts = ['start_datetime', '-start_datetime', 'end_datetime', '-end_datetime', 'assignment_id', '-assignment_id']
        if sort_field not in allowed_sorts:
            sort_field = '-start_datetime'

        # Pagination
        try:
            page = max(1, int(params.get('page', 1)))
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = min(200, max(1, int(params.get('page_size', 50))))
        except (TypeError, ValueError):
            page_size = 50

        all_results = []
        for item_type in types_to_query:
            qs = self._build_queryset(item_type, params)
            qs = qs.order_by(sort_field)
            for assignment in qs:
                cfg = self.ASSIGNMENT_TYPE_MAP[item_type]
                try:
                    serialized = cfg['serializer'](assignment).data
                except Exception:
                    continue
                serialized['item_type'] = item_type
                # Enrich with person position info
                person_obj = assignment.person
                if person_obj:
                    pa = PersonAssignment.objects.filter(person=person_obj).select_related('position').first()
                    if pa and pa.position:
                        serialized['person_position'] = {
                            'position_id': pa.position.position_id,
                            'position_label': pa.position.position_label,
                        }
                    else:
                        serialized['person_position'] = None
                else:
                    serialized['person_position'] = None
                all_results.append(serialized)

        # Re-sort combined results
        sort_key_map = {
            'start_datetime': lambda x: x.get('start_datetime') or '',
            '-start_datetime': lambda x: x.get('start_datetime') or '',
            'end_datetime': lambda x: x.get('end_datetime') or '',
            '-end_datetime': lambda x: x.get('end_datetime') or '',
            'assignment_id': lambda x: x.get('assignment_id', 0),
            '-assignment_id': lambda x: x.get('assignment_id', 0),
        }
        sort_key = sort_key_map.get(sort_field, lambda x: x.get('start_datetime') or '')
        reverse = sort_field.startswith('-')
        all_results.sort(key=sort_key, reverse=reverse)

        # Pagination
        total = len(all_results)
        start = (page - 1) * page_size
        end = start + page_size
        paginated = all_results[start:end]

        # Stats
        stats = {
            'total': total,
            'active': sum(1 for r in all_results if r.get('is_active')),
            'inactive': sum(1 for r in all_results if not r.get('is_active')),
            'by_type': {},
        }
        for it in types_to_query:
            type_items = [r for r in all_results if r.get('item_type') == it]
            stats['by_type'][it] = {
                'total': len(type_items),
                'active': sum(1 for r in type_items if r.get('is_active')),
                'inactive': sum(1 for r in type_items if not r.get('is_active')),
            }

        # Positions for filter dropdown
        positions = list(Position.objects.all().order_by('position_label').values('position_id', 'position_label'))

        return Response({
            'results': paginated,
            'count': total,
            'page': page,
            'page_size': page_size,
            'total_pages': max(1, (total + page_size - 1) // page_size),
            'stats': stats,
            'allowed_types': allowed_types,
            'positions': positions,
        }, status=status.HTTP_200_OK)

    def _check_discharge_permission(self, user_account, item_type):
        """Check if user can discharge assignments of the given item type."""
        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        is_superuser = user_account.is_superuser()
        if is_superuser:
            return True
        if item_type == 'asset':
            return 'asset_responsible' in role_codes or 'exploitation_chief' in role_codes or 'it_bureau_chief' in role_codes
        return 'stock_consumable_responsible' in role_codes or 'exploitation_chief' in role_codes or 'it_bureau_chief' in role_codes

    def post(self, request):
        """Handle bulk discharge, item history, and quick reassign actions.

        Request body must include 'action' field:
        - 'bulk_discharge': discharge multiple assignments. Body: {action, items: [{assignment_id, item_type}, ...]}
        - 'item_history': get full assignment history for an item. Body: {action, item_type, item_id}
        - 'quick_reassign': discharge current and create new assignment. Body: {action, assignment_id, item_type, new_person_id, start_datetime}
        """
        user_account = self._get_user_account(request)
        if not user_account:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        person = getattr(user_account, 'person', None)
        if not person:
            return Response({"error": "Person profile not found"}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action', '')

        if action == 'bulk_discharge':
            return self._bulk_discharge(request, user_account, person)
        elif action == 'item_history':
            return self._item_history(request, user_account)
        elif action == 'quick_reassign':
            return self._quick_reassign(request, user_account, person)
        else:
            return Response({"error": "Invalid action. Use 'bulk_discharge', 'item_history', or 'quick_reassign'"}, status=status.HTTP_400_BAD_REQUEST)

    def _bulk_discharge(self, request, user_account, person):
        """Discharge multiple assignments at once."""
        items = request.data.get('items', [])
        if not items or not isinstance(items, list):
            return Response({"error": "items must be a non-empty list of {assignment_id, item_type}"}, status=status.HTTP_400_BAD_REQUEST)

        # Check permissions per item type
        item_types_in_batch = set(item.get('item_type') for item in items if item.get('item_type'))
        for it in item_types_in_batch:
            if not self._check_discharge_permission(user_account, it):
                return Response({"error": f"You do not have permission to discharge {it} assignments"}, status=status.HTTP_403_FORBIDDEN)

        discharged = []
        errors = []
        now = timezone.now()

        for item in items:
            assignment_id = item.get('assignment_id')
            item_type = item.get('item_type')
            if not assignment_id or not item_type or item_type not in self.ASSIGNMENT_TYPE_MAP:
                errors.append({"assignment_id": assignment_id, "error": "Invalid assignment_id or item_type"})
                continue

            model = self.ASSIGNMENT_TYPE_MAP[item_type]['model']
            try:
                assignment = model.objects.get(assignment_id=assignment_id)
            except model.DoesNotExist:
                errors.append({"assignment_id": assignment_id, "error": "Not found"})
                continue

            if not assignment.is_active:
                errors.append({"assignment_id": assignment_id, "error": "Already inactive"})
                continue

            assignment.end_datetime = now
            assignment.is_active = False
            assignment.save()
            discharged.append(assignment_id)

        return Response({
            "discharged": discharged,
            "errors": errors,
            "discharged_count": len(discharged),
        }, status=status.HTTP_200_OK)

    def _item_history(self, request, user_account):
        """Get full assignment history for a specific item."""
        item_type = request.data.get('item_type')
        item_id = request.data.get('item_id')

        if not item_type or not item_id:
            return Response({"error": "item_type and item_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        if item_type not in self.ASSIGNMENT_TYPE_MAP:
            return Response({"error": "Invalid item_type"}, status=status.HTTP_400_BAD_REQUEST)

        # Check read permission
        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        allowed = self._get_allowed_types(role_codes, user_account.is_superuser())
        if item_type not in allowed:
            return Response({"error": f"You do not have permission to view {item_type} assignments"}, status=status.HTTP_403_FORBIDDEN)

        cfg = self.ASSIGNMENT_TYPE_MAP[item_type]
        model = cfg['model']
        item_fk = cfg['item_fk']

        qs = model.objects.filter(**{f'{item_fk}_id': item_id}).select_related(
            'person', 'assigned_by_person', 'is_confirmed_by_exploitation_chief'
        ).order_by('-start_datetime')

        history = []
        for assignment in qs:
            serialized = cfg['serializer'](assignment).data
            serialized['item_type'] = item_type
            # Enrich with position
            person_obj = assignment.person
            if person_obj:
                pa = PersonAssignment.objects.filter(person=person_obj).select_related('position').first()
                if pa and pa.position:
                    serialized['person_position'] = {
                        'position_id': pa.position.position_id,
                        'position_label': pa.position.position_label,
                    }
                else:
                    serialized['person_position'] = None
            else:
                serialized['person_position'] = None
            history.append(serialized)

        return Response({"history": history, "count": len(history)}, status=status.HTTP_200_OK)

    def _quick_reassign(self, request, user_account, person):
        """Discharge current assignment and create a new one for the same item to a different person."""
        assignment_id = request.data.get('assignment_id')
        item_type = request.data.get('item_type')
        new_person_id = request.data.get('new_person_id')
        start_datetime = request.data.get('start_datetime')
        if not all([assignment_id, item_type, new_person_id, start_datetime]):
            return Response({"error": "assignment_id, item_type, new_person_id, and start_datetime are required"}, status=status.HTTP_400_BAD_REQUEST)

        if item_type not in self.ASSIGNMENT_TYPE_MAP:
            return Response({"error": "Invalid item_type"}, status=status.HTTP_400_BAD_REQUEST)

        if not self._check_discharge_permission(user_account, item_type):
            return Response({"error": f"You do not have permission to reassign {item_type}"}, status=status.HTTP_403_FORBIDDEN)

        # Check assign permission
        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        is_superuser = user_account.is_superuser()
        if item_type == 'asset':
            can_assign = is_superuser or 'asset_responsible' in role_codes or 'exploitation_chief' in role_codes or 'it_bureau_chief' in role_codes
        else:
            can_assign = is_superuser or 'stock_consumable_responsible' in role_codes or 'exploitation_chief' in role_codes
        if not can_assign:
            return Response({"error": f"You do not have permission to assign {item_type}"}, status=status.HTTP_403_FORBIDDEN)

        model = self.ASSIGNMENT_TYPE_MAP[item_type]['model']
        item_fk = self.ASSIGNMENT_TYPE_MAP[item_type]['item_fk']

        try:
            old_assignment = model.objects.get(assignment_id=assignment_id)
        except model.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND)

        if not old_assignment.is_active:
            return Response({"error": "Cannot reassign an inactive assignment"}, status=status.HTTP_400_BAD_REQUEST)

        # Verify new person exists
        try:
            new_person = Person.objects.get(person_id=int(new_person_id))
        except Person.DoesNotExist:
            return Response({"error": "New person not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check item isn't already assigned to new person actively
        item_id = getattr(old_assignment, f'{item_fk}_id')
        active_check = model.objects.filter(**{f'{item_fk}_id': item_id, 'is_active': True}).exclude(assignment_id=assignment_id).exists()
        if active_check:
            return Response({"error": "Item has another active assignment"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Discharge old
            now = timezone.now()
            old_assignment.end_datetime = now
            old_assignment.is_active = False
            old_assignment.save()

            # Create new
            last_item = model.objects.order_by("-assignment_id").first()
            next_id = (last_item.assignment_id + 1) if last_item else 1

            new_assignment = model.objects.create(
                assignment_id=next_id,
                person=new_person,
                assigned_by_person=person,
                **{f'{item_fk}_id': item_id},
                start_datetime=start_datetime,
                is_active=True,
            )

        cfg = self.ASSIGNMENT_TYPE_MAP[item_type]
        serialized = cfg['serializer'](new_assignment).data
        serialized['item_type'] = item_type
        return Response({"assignment": serialized, "discharged_id": assignment_id}, status=status.HTTP_201_CREATED)
