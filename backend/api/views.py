from __future__ import annotations

import hashlib
import os
import datetime
from decimal import Decimal

from django.utils import timezone
from django.db import connection
from django.db import transaction
from django.db.models import OuterRef, Subquery, Q
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
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
    OrganizationalStructure,
    OrganizationalStructureRelation,
    Person,
    PersonReportsProblemOnAsset,
    PersonReportsProblemOnConsumable,
    PersonReportsProblemOnStockItem,
    PersonRoleMapping,
    Position,
    Room,
    RoomType,
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
    Warehouse,
    AttributionOrder,
    ReceiptReport,
    AdministrativeCertificate,
    CompanyAssetRequest,
    StockItemIsCompatibleWithAsset,
    ConsumableIsCompatibleWithAsset,
    AssetIsComposedOfStockItemHistory,
    AssetIsComposedOfConsumableHistory,
    ConsumableIsUsedInStockItemHistory,
    StockItemMovement,
    ConsumableMovement,
    MaintenanceStepItemRequest,
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
    source_room_id: int,
    destination_room_id: int,
    movement_reason: str,
    movement_datetime,
    maintenance_step_id=None,
    external_maintenance_step_id=None,
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
        current_room_id = last_move.destination_room_id if last_move else source_room_id
        if current_room_id == destination_room_id:
            continue

        StockItemMovement.objects.create(
            stock_item_movement_id=next_stock_move_id,
            stock_item_id=stock_item_id,
            source_room_id=current_room_id,
            destination_room_id=destination_room_id,
            maintenance_step_id=maintenance_step_id,
            external_maintenance_step_id=external_maintenance_step_id,
            movement_reason=movement_reason,
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
        current_room_id = last_move.destination_room_id if last_move else source_room_id
        if current_room_id == destination_room_id:
            continue

        ConsumableMovement.objects.create(
            consumable_movement_id=next_consumable_move_id,
            consumable_id=consumable_id,
            source_room_id=current_room_id,
            destination_room_id=destination_room_id,
            maintenance_step_id=maintenance_step_id,
            external_maintenance_step_id=external_maintenance_step_id,
            movement_reason=movement_reason,
            movement_datetime=movement_datetime,
        )
        next_consumable_move_id += 1


def _cascade_move_stock_item_consumables(
    *,
    stock_item_id: int,
    source_room_id: int,
    destination_room_id: int,
    movement_reason: str,
    movement_datetime,
    maintenance_step_id=None,
    external_maintenance_step_id=None,
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
        current_room_id = last_move.destination_room_id if last_move else source_room_id
        if current_room_id == destination_room_id:
            continue

        ConsumableMovement.objects.create(
            consumable_movement_id=next_consumable_move_id,
            consumable_id=consumable_id,
            source_room_id=current_room_id,
            destination_room_id=destination_room_id,
            maintenance_step_id=maintenance_step_id,
            external_maintenance_step_id=external_maintenance_step_id,
            movement_reason=movement_reason,
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
    OrganizationalStructureRelationSerializer,
    OrganizationalStructureSerializer,
    PersonSerializer,
    PositionSerializer,
    RoomSerializer,
    RoomTypeSerializer,
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
    ReceiptReportSerializer,
    AdministrativeCertificateSerializer,
    CompanyAssetRequestSerializer,
    MaintenanceStepItemRequestSerializer,
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
        # For tests using force_authenticate, request.user is set directly
        if hasattr(request, "user") and request.user and getattr(request.user, "is_authenticated", False):
            if isinstance(request.user, UserAccount):
                return request.user

        try:
            if hasattr(request, "auth") and request.auth is not None:
                user_id = request.auth.get("user_id")
                if user_id:
                    return UserAccount.objects.get(user_id=user_id)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
            pass

        try:
            if hasattr(request, "auth") and request.auth is not None:
                username = request.auth.get("username")
                if username:
                    return UserAccount.objects.get(username=username)
        except (UserAccount.DoesNotExist, AttributeError, KeyError):
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


class MaintenanceTypicalStepViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MaintenanceTypicalStep.objects.all().order_by("maintenance_typical_step_id")
    serializer_class = MaintenanceTypicalStepSerializer
    permission_classes = [IsAuthenticated]


class MaintenanceViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = Maintenance.objects.all().order_by("maintenance_id")
    serializer_class = MaintenanceSerializer

    def get_queryset(self):
        qs = (
            Maintenance.objects.select_related(
                "asset",
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
        if "maintenance_chief" in role_codes or "exploitation_chief" in role_codes:
            return qs

        if "maintenance_technician" in role_codes:
            return qs.filter(performed_by_person=person)

        return Maintenance.objects.none()

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create maintenances")
        if denial:
            return denial

        last_item = Maintenance.objects.order_by("-maintenance_id").first()
        next_id = (last_item.maintenance_id + 1) if last_item else 1
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        maintenance = Maintenance.objects.create(maintenance_id=next_id, **serializer.validated_data)
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
            if "maintenance_chief" in role_codes:
                is_allowed = True
            elif maintenance.performed_by_person_id == person.person_id:
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
            if "maintenance_chief" in role_codes or "exploitation_chief" in role_codes:
                is_allowed = True
            elif getattr(maintenance, "performed_by_person_id", None) == getattr(person, "person_id", None):
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
        is_successful_value = "__missing__"
        if is_successful_raw != "__missing__":
            if is_successful_raw is None:
                is_successful_value = None
            elif isinstance(is_successful_raw, bool):
                is_successful_value = is_successful_raw
            elif isinstance(is_successful_raw, (int, float)):
                is_successful_value = bool(is_successful_raw)
            else:
                s = str(is_successful_raw).strip().lower()
                if s in {"true", "1", "yes", "y"}:
                    is_successful_value = True
                elif s in {"false", "0", "no", "n"}:
                    is_successful_value = False
                elif s in {"null", "none", ""}:
                    is_successful_value = None
                else:
                    return Response({"error": "Invalid is_successful"}, status=status.HTTP_400_BAD_REQUEST)

        update_payload = {"end_datetime": timezone.now()}
        if is_successful_value != "__missing__":
            update_payload["is_successful"] = is_successful_value

        Maintenance.objects.filter(maintenance_id=maintenance.maintenance_id).update(**update_payload)
        maintenance.refresh_from_db()
        return Response(self.get_serializer(maintenance).data, status=status.HTTP_200_OK)


    @action(detail=False, methods=["post"], url_path="create-direct")
    def create_direct(self, request):
        user_account = self._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("maintenance_chief" not in role_codes):
            return Response({"error": "Only maintenance chiefs can create maintenance"}, status=status.HTTP_403_FORBIDDEN)

        asset_id = request.data.get("asset_id")
        technician_person_id = request.data.get("technician_person_id")
        description = request.data.get("description")
        destination_room_id = request.data.get("destination_room_id")

        if not asset_id:
            return Response({"error": "asset_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not technician_person_id:
            return Response({"error": "technician_person_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        asset = Asset.objects.filter(asset_id=asset_id).first()
        if not asset:
            return Response({"error": "Asset not found"}, status=status.HTTP_404_NOT_FOUND)

        last_move = (
            AssetMovement.objects.select_related("destination_room", "destination_room__room_type")
            .filter(asset_id=asset.asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        current_room = last_move.destination_room if last_move else None

        def _is_maintenance_room(room: Room | None) -> bool:
            if not room or not getattr(room, "room_type", None):
                return False
            code = getattr(room.room_type, "room_type_code", None)
            label = (getattr(room.room_type, "room_type_label", None) or "").lower()
            if code and str(code).upper() in {"MR", "MAINTENANCE", "MAINT"}:
                return True
            return "maintenance" in label

        if not _is_maintenance_room(current_room):
            if not destination_room_id:
                return Response(
                    {
                        "error": "Asset is not in a maintenance room. destination_room_id is required to move the asset before creating maintenance.",
                        "current_room": RoomSerializer(current_room).data if current_room else None,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            destination_room = Room.objects.select_related("room_type").filter(room_id=destination_room_id).first()
            if not destination_room:
                return Response({"error": "Invalid destination_room_id"}, status=status.HTTP_400_BAD_REQUEST)
            if not _is_maintenance_room(destination_room):
                return Response({"error": "destination_room_id must be a maintenance room"}, status=status.HTTP_400_BAD_REQUEST)
            if not current_room:
                return Response({"error": "Cannot infer asset current room (no movement history)"}, status=status.HTTP_400_BAD_REQUEST)

            last_asset_move = AssetMovement.objects.order_by("-asset_movement_id").first()
            next_asset_move_id = (last_asset_move.asset_movement_id + 1) if last_asset_move else 1
            AssetMovement.objects.create(
                asset_movement_id=next_asset_move_id,
                asset=asset,
                source_room=current_room,
                destination_room=destination_room,
                maintenance_step=None,
                external_maintenance_step_id=None,
                movement_reason="maintenance_create",
                movement_datetime=timezone.now(),
            )
            _cascade_move_composed_items(
                asset_id=asset.asset_id,
                source_room_id=current_room.room_id,
                destination_room_id=destination_room.room_id,
                movement_reason="maintenance_create",
                movement_datetime=timezone.now(),
                maintenance_step_id=None,
                external_maintenance_step_id=None,
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
                start_datetime=timezone.now(),
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

        # Get assets for which the user made a problem report
        reported_asset_ids = set(
            PersonReportsProblemOnAsset.objects.filter(person=person)
            .values_list("asset_id", flat=True)
        )

        # If asset_id is specified, check if user reported a problem on it
        if asset_id is not None:
            if int(asset_id) not in reported_asset_ids:
                return Response({"error": "You have not reported a problem on this asset"}, status=status.HTTP_403_FORBIDDEN)
            asset_ids = [int(asset_id)]
        else:
            asset_ids = list(reported_asset_ids)

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

            status_value = (new_status if new_status is not None else getattr(step, "maintenance_step_status", None))
            if status_value != "started":
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

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        maintenance = serializer.validated_data.get("maintenance")
        if maintenance and getattr(maintenance, "end_datetime", None) is not None:
            return Response({"error": "Maintenance is ended"}, status=status.HTTP_400_BAD_REQUEST)

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
        if "superuser" in user_role_codes or "maintenance_chief" in user_role_codes:
            return True, None

        # Check if target person is a maintenance_chief
        target_is_chief = PersonRoleMapping.objects.filter(
            person_id=target_person_id,
            role__role_code="maintenance_chief"
        ).exists()

        if target_is_chief:
            return False, Response(
                {"error": "Only maintenance chiefs can assign steps to other maintenance chiefs"},
                status=status.HTTP_403_FORBIDDEN
            )

        return True, None

    def _require_can_request_for_step(self, request, step: MaintenanceStep):
        person = self._get_user_person(request)
        if not person:
            return None, Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=person).values_list("role__role_code", flat=True)
        )

        if (step.person_id == person.person_id) or ("maintenance_chief" in role_codes) or ("superuser" in role_codes):
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
        destination_room_id = request.data.get("destination_room_id")
        if component_type not in {"stock_item", "consumable"}:
            return Response({"error": "component_type must be 'stock_item' or 'consumable'"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            component_id_int = int(component_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid component_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_room = None
        if destination_room_id not in (None, ""):
            try:
                destination_room_id_int = int(destination_room_id)
            except (TypeError, ValueError):
                return Response({"error": "Invalid destination_room_id"}, status=status.HTTP_400_BAD_REQUEST)

            destination_room = Room.objects.filter(room_id=destination_room_id_int).first()
            if not destination_room:
                return Response({"error": "Invalid destination_room_id"}, status=status.HTTP_400_BAD_REQUEST)

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

        if destination_room and component_type == "stock_item":
            last_move = (
                StockItemMovement.objects.filter(stock_item_id=component_id_int)
                .order_by("-stock_item_movement_id")
                .first()
            )
            if not last_move:
                return Response({"error": "Cannot infer stock item current room (no movement history)"}, status=status.HTTP_400_BAD_REQUEST)

            source_room = last_move.destination_room
            last_move_global = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
            next_move_id = (last_move_global.stock_item_movement_id + 1) if last_move_global else 1

            StockItemMovement.objects.create(
                stock_item_movement_id=next_move_id,
                stock_item_id=component_id_int,
                source_room=source_room,
                destination_room=destination_room,
                maintenance_step=step,
                movement_reason="maintenance_step_remove",
                movement_datetime=now_dt,
            )
            _cascade_move_stock_item_consumables(
                stock_item_id=component_id_int,
                source_room_id=source_room.room_id,
                destination_room_id=destination_room.room_id,
                movement_reason="maintenance_step_remove",
                movement_datetime=now_dt,
                maintenance_step_id=step.maintenance_step_id,
                external_maintenance_step_id=None,
            )
        elif destination_room and component_type == "consumable":
            last_move = (
                ConsumableMovement.objects.filter(consumable_id=component_id_int)
                .order_by("-consumable_movement_id")
                .first()
            )
            if not last_move:
                return Response({"error": "Cannot infer consumable current room (no movement history)"}, status=status.HTTP_400_BAD_REQUEST)

            source_room = last_move.destination_room
            last_move_global = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
            next_move_id = (last_move_global.consumable_movement_id + 1) if last_move_global else 1

            ConsumableMovement.objects.create(
                consumable_movement_id=next_move_id,
                consumable_id=component_id_int,
                source_room=source_room,
                destination_room=destination_room,
                maintenance_step=step,
                movement_reason="maintenance_step_remove",
                movement_datetime=now_dt,
            )

        step.maintenance_step_status = "done"
        step.save(update_fields=["maintenance_step_status"])
        return Response(self.get_serializer(step).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="request-stock-item")
    def request_stock_item(self, request, pk=None):
        step = self.get_object()
        person, denial = self._require_can_request_for_step(request, step)
        if denial:
            return denial

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
        qs = MaintenanceStepItemRequest.objects.all().order_by("-created_at")
        user_account = SuperuserWriteMixin()._get_user_account(self.request)
        if not user_account or not user_account.person:
            return MaintenanceStepItemRequest.objects.none()

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if user_account.is_superuser() or ("stock_consumable_responsible" in role_codes):
            return qs

        return MaintenanceStepItemRequest.objects.none()

    def _require_responsible(self, request):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return None, Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if user_account.is_superuser() or ("stock_consumable_responsible" in role_codes):
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

        source_room_id = request.data.get("source_room_id")
        destination_room_id = request.data.get("destination_room_id")
        note = request.data.get("note")
        if not source_room_id or not destination_room_id:
            return Response({"error": "source_room_id and destination_room_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        source_room = Room.objects.filter(room_id=source_room_id).first()
        destination_room = Room.objects.filter(room_id=destination_room_id).first()
        if not source_room or not destination_room:
            return Response({"error": "Invalid source/destination room"}, status=status.HTTP_400_BAD_REQUEST)

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

            StockItemMovement.objects.create(
                stock_item_movement_id=next_move_id,
                stock_item=stock_item,
                source_room=source_room,
                destination_room=destination_room,
                maintenance_step=step,
                movement_reason="maintenance_step_fulfill_request",
                movement_datetime=timezone.now(),
            )

            _cascade_move_stock_item_consumables(
                stock_item_id=stock_item.stock_item_id,
                source_room_id=source_room.room_id,
                destination_room_id=destination_room.room_id,
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

            ConsumableMovement.objects.create(
                consumable_movement_id=next_move_id,
                consumable=consumable,
                source_room=source_room,
                destination_room=destination_room,
                maintenance_step=step,
                movement_reason="maintenance_step_fulfill_request",
                movement_datetime=timezone.now(),
            )

            req.consumable = consumable
        else:
            return Response({"error": "Invalid request_type"}, status=status.HTTP_400_BAD_REQUEST)

        req.source_room = source_room
        req.destination_room = destination_room
        req.status = "fulfilled"
        req.fulfilled_at = timezone.now()
        req.fulfilled_by_person = person
        if note is not None:
            req.note = note
        req.save()

        step.maintenance_step_status = "In Progress"
        step.save(update_fields=["maintenance_step_status"])

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
        req.source_room = None
        req.destination_room = None
        req.stock_item = None
        req.consumable = None
        if note is not None:
            req.note = note
        req.save()

        step = req.maintenance_step
        step.maintenance_step_status = "started"
        step.save(update_fields=["maintenance_step_status"])

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

            last_dest_room_subq = Subquery(
                StockItemMovement.objects.filter(stock_item_id=OuterRef("stock_item_id"))
                .order_by("-stock_item_movement_id")
                .values("destination_room_id")[:1]
            )

            candidates = (
                StockItem.objects.filter(stock_item_model_id=req.requested_stock_item_model_id)
                .exclude(stock_item_id__in=used_stock_item_ids)
                .annotate(current_room_id=last_dest_room_subq)
                .exclude(current_room_id__isnull=True)
                .order_by("?")
            )
            chosen = candidates.first()
            if not chosen:
                return Response({"error": "No available stock item found"}, status=status.HTTP_404_NOT_FOUND)

            return Response(
                {
                    "request_type": "stock_item",
                    "stock_item_id": chosen.stock_item_id,
                    "source_room_id": getattr(chosen, "current_room_id", None),
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

            last_dest_room_subq = Subquery(
                ConsumableMovement.objects.filter(consumable_id=OuterRef("consumable_id"))
                .order_by("-consumable_movement_id")
                .values("destination_room_id")[:1]
            )

            candidates = (
                Consumable.objects.filter(consumable_model_id=req.requested_consumable_model_id)
                .exclude(consumable_id__in=used_consumable_ids)
                .annotate(current_room_id=last_dest_room_subq)
                .exclude(current_room_id__isnull=True)
                .order_by("?")
            )
            chosen = candidates.first()
            if not chosen:
                return Response({"error": "No available consumable found"}, status=status.HTTP_404_NOT_FOUND)

            return Response(
                {
                    "request_type": "consumable",
                    "consumable_id": chosen.consumable_id,
                    "source_room_id": getattr(chosen, "current_room_id", None),
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

            last_dest_room_subq = Subquery(
                StockItemMovement.objects.filter(stock_item_id=OuterRef("stock_item_id"))
                .order_by("-stock_item_movement_id")
                .values("destination_room_id")[:1]
            )

            candidates = (
                StockItem.objects.filter(stock_item_model_id=req.requested_stock_item_model_id)
                .exclude(stock_item_id__in=used_stock_item_ids)
                .annotate(current_room_id=last_dest_room_subq)
                .exclude(current_room_id__isnull=True)
                .values("stock_item_id", "stock_item_inventory_number", "current_room_id")
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

            last_dest_room_subq = Subquery(
                ConsumableMovement.objects.filter(consumable_id=OuterRef("consumable_id"))
                .order_by("-consumable_movement_id")
                .values("destination_room_id")[:1]
            )

            candidates = (
                Consumable.objects.filter(consumable_model_id=req.requested_consumable_model_id)
                .exclude(consumable_id__in=used_consumable_ids)
                .annotate(current_room_id=last_dest_room_subq)
                .exclude(current_room_id__isnull=True)
                .values("consumable_id", "consumable_inventory_number", "current_room_id")
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


class ExternalMaintenanceTypicalStepViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExternalMaintenanceTypicalStep.objects.all().order_by("external_maintenance_typical_step_id")
    serializer_class = ExternalMaintenanceTypicalStepSerializer
    permission_classes = [IsAuthenticated]


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

        try:
            maintenance_id_int = int(maintenance_id)
        except (ValueError, TypeError):
            return Response({"error": "Invalid ids"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            maintenance = Maintenance.objects.select_related("asset").get(maintenance_id=maintenance_id_int)
        except Maintenance.DoesNotExist:
            return Response({"error": "Maintenance not found"}, status=status.HTTP_404_NOT_FOUND)

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
        if (not user_account.is_superuser()) and ("asset_responsible" not in role_codes):
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

        destination_room_id = request.data.get("destination_room_id")
        if not destination_room_id:
            return Response(
                {"error": "destination_room_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            provider_id_int = int(provider_id)
            destination_room_id_int = int(destination_room_id)
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
            destination_room = Room.objects.select_related("room_type").get(room_id=destination_room_id_int)
        except Room.DoesNotExist:
            return Response({"error": "Destination room not found"}, status=status.HTTP_404_NOT_FOUND)

        if not destination_room.room_type or destination_room.room_type.room_type_label != "External Maintenance Center":
            return Response(
                {"error": "Destination room must be of type 'External Maintenance Center'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        asset_id = getattr(em.maintenance, "asset_id", None)
        if not asset_id:
            return Response({"error": "External maintenance has no associated asset"}, status=status.HTTP_400_BAD_REQUEST)

        last_move = (
            AssetMovement.objects.select_related("destination_room")
            .filter(asset_id=asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_room_id:
            return Response(
                {"error": "Cannot infer asset current room (no movement history)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        last_asset_move = AssetMovement.objects.order_by("-asset_movement_id").first()
        next_asset_move_id = (last_asset_move.asset_movement_id + 1) if last_asset_move else 1

        now = timezone.now()
        try:
            AssetMovement.objects.create(
                asset_movement_id=next_asset_move_id,
                asset_id=asset_id,
                source_room_id=last_move.destination_room_id,
                destination_room_id=destination_room_id_int,
                maintenance_step_id=None,
                external_maintenance_step_id=None,
                movement_reason="Sent to external maintenance provider",
                movement_datetime=now,
            )
            _cascade_move_composed_items(
                asset_id=asset_id,
                source_room_id=last_move.destination_room_id,
                destination_room_id=destination_room_id_int,
                movement_reason="Sent to external maintenance provider",
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
        if (not user_account.is_superuser()) and ("maintenance_technician" not in role_codes):
            return Response(
                {"error": "Only maintenance technician can create external maintenance steps"},
                status=status.HTTP_403_FORBIDDEN,
            )

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
        if (not user_account.is_superuser()) and ("asset_responsible" not in role_codes):
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
        if (not user_account.is_superuser()) and ("asset_responsible" not in role_codes):
            return Response(
                {"error": "Only asset responsible can confirm asset received by company"},
                status=status.HTTP_403_FORBIDDEN,
            )

        destination_room_id = request.data.get("destination_room_id")
        if not destination_room_id:
            return Response({"error": "destination_room_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            destination_room_id_int = int(destination_room_id)
        except (ValueError, TypeError):
            return Response({"error": "Invalid destination_room_id"}, status=status.HTTP_400_BAD_REQUEST)

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
            destination_room = Room.objects.get(room_id=destination_room_id_int)
        except Room.DoesNotExist:
            return Response({"error": "Destination room not found"}, status=status.HTTP_404_NOT_FOUND)

        last_move = (
            AssetMovement.objects.select_related("destination_room")
            .filter(asset_id=asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_room_id:
            return Response(
                {"error": "Cannot infer asset current room (no movement history)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if last_move.destination_room_id == destination_room_id_int:
            return Response({"error": "Asset is already in this room"}, status=status.HTTP_400_BAD_REQUEST)

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
            AssetMovement.objects.create(
                asset_movement_id=next_asset_move_id,
                asset_id=asset_id,
                source_room_id=last_move.destination_room_id,
                destination_room_id=destination_room_id_int,
                maintenance_step_id=None,
                external_maintenance_step_id=external_step_id,
                movement_reason="Received by company from external maintenance",
                movement_datetime=now,
            )
            _cascade_move_composed_items(
                asset_id=asset_id,
                source_room_id=last_move.destination_room_id,
                destination_room_id=destination_room_id_int,
                movement_reason="Received by company from external maintenance",
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
        payload["destination_room"] = {"room_id": destination_room.room_id, "room_name": destination_room.room_name}
        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="confirm-sent-to-company")
    def confirm_sent_to_company(self, request, pk=None):
        user_account = SuperuserWriteMixin()._get_user_account(request)
        if not user_account or not user_account.person:
            return Response({"error": "User account not found"}, status=status.HTTP_404_NOT_FOUND)

        role_codes = set(
            PersonRoleMapping.objects.filter(person=user_account.person).values_list("role__role_code", flat=True)
        )
        if (not user_account.is_superuser()) and ("asset_responsible" not in role_codes):
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


class ProblemReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        asset_reports = PersonReportsProblemOnAsset.objects.all().order_by("-report_datetime")
        stock_reports = PersonReportsProblemOnStockItem.objects.all().order_by("-report_datetime")
        consumable_reports = PersonReportsProblemOnConsumable.objects.all().order_by("-report_datetime")

        def normalize(item_type, report):
            return {
                "item_type": item_type,
                "report_id": report.report_id,
                "item_id": getattr(report, item_type).pk if getattr(report, item_type, None) else None,
                "person_id": report.person_id if hasattr(report, "person_id") else report.person.person_id,
                "person_name": f"{report.person.first_name} {report.person.last_name}",
                "report_datetime": report.report_datetime,
                "owner_observation": report.owner_observation,
            }

        data = [normalize("asset", r) for r in asset_reports] + [normalize("stock_item", r) for r in stock_reports] + [
            normalize("consumable", r) for r in consumable_reports
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
            last = PersonReportsProblemOnAsset.objects.order_by("-report_id").first()
            next_id = (last.report_id + 1) if last else 1
            report = PersonReportsProblemOnAsset.objects.create(
                report_id=next_id,
                asset_id=item_id,
                person=person,
                owner_observation=owner_observation,
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

        if item_type not in {"asset", "stock_item", "consumable"}:
            return Response({"error": "Invalid item_type"}, status=status.HTTP_400_BAD_REQUEST)
        if not report_id:
            return Response({"error": "report_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not technician_person_id:
            return Response({"error": "technician_person_id is required"}, status=status.HTTP_400_BAD_REQUEST)

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
        next_id = (last_item.maintenance_id + 1) if last_item else 1
        try:
            maintenance = Maintenance.objects.create(
                maintenance_id=next_id,
                performed_by_person=technician,
                approved_by_maintenance_chief=user_account.person,
                maintenance_status="pending",
                description=description or report.owner_observation,
                start_datetime=timezone.now(),
                end_datetime=timezone.now(),
                asset=report.asset,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create maintenance due to database constraints.",
                    "details": "Check required fields in Maintenance model (approved_by_maintenance_chief, end_datetime, etc.)",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(MaintenanceSerializer(maintenance).data, status=status.HTTP_201_CREATED)
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
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if user.account_status != "active":
            return Response({"error": "Account is not active"}, status=status.HTTP_403_FORBIDDEN)

        user.last_login = timezone.now()
        user.failed_login_attempts = 0
        user.save(update_fields=["last_login", "failed_login_attempts"])

        refresh = RefreshToken()
        refresh["user_id"] = user.user_id
        refresh["username"] = user.username
        refresh["is_superuser"] = user.is_superuser()

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserProfileSerializer(user).data,
            }
        )


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
        person = Person.objects.create(person_id=next_id, **serializer.validated_data)
        return Response(PersonSerializer(person).data, status=status.HTTP_201_CREATED)


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
        
        asset_type = AssetType.objects.create(asset_type_id=next_id, **serializer.validated_data)
        return Response(AssetTypeSerializer(asset_type).data, status=status.HTTP_201_CREATED)


class AssetBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetBrand.objects.all().order_by("asset_brand_id")
    serializer_class = AssetBrandSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create asset brands")
        if denial:
            return denial

        # Handle file upload
        brand_photo_file = request.FILES.get('brand_photo')
        brand_photo_path = None
        if brand_photo_file:
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            import os
            
            # Save file to media/brands/
            file_path = f"brands/assets/{brand_photo_file.name}"
            brand_photo_path = default_storage.save(file_path, ContentFile(brand_photo_file.read()))

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_brand = AssetBrand.objects.all().order_by("-asset_brand_id").first()
        next_id = (last_brand.asset_brand_id + 1) if last_brand else 1

        try:
            data = serializer.validated_data.copy()
            if brand_photo_path:
                data['brand_photo'] = brand_photo_path
            brand = AssetBrand.objects.create(
                asset_brand_id=next_id,
                **data,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create asset brand due to database constraints.",
                    "details": "Check required fields and uniqueness constraints.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(self.get_serializer(brand).data, status=status.HTTP_201_CREATED)


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
        
        last_model = AssetModel.objects.all().order_by("-asset_model_id").first()
        next_id = (last_model.asset_model_id + 1) if last_model else 1
        
        asset_model = AssetModel.objects.create(asset_model_id=next_id, **serializer.validated_data)
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
        # item = AssetModelDefaultStockItem.objects.create(**serializer.validated_data)
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
        # item = AssetModelDefaultConsumable.objects.create(**serializer.validated_data)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by("asset_id")
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
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
        
        # Make a clean copy of validated_data without the extra fields
        asset_data = {k: v for k, v in serializer.validated_data.items() 
                      if k not in ('included_stock_items', 'included_consumables')}
        
        print(f"[AssetViewSet.create] asset_data keys: {list(asset_data.keys())}")
        
        # Get the last asset to determine next ID
        last_asset = Asset.objects.order_by("-asset_id").first()
        next_asset_id = (last_asset.asset_id + 1) if last_asset else 1
        
        # Create the asset with only model fields
        asset = Asset.objects.create(asset_id=next_asset_id, **asset_data)
        
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
                    stock_item_status='Included with Asset'
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
                    consumable_status='Included with Asset'
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
                    stock_item_status='Included with Asset'
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
                    consumable_status='Included with Asset'
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

    @action(detail=True, methods=["get"], url_path="current-room")
    def current_room(self, request, pk=None):
        asset = self.get_object()
        last_move = (
            AssetMovement.objects.select_related("destination_room", "destination_room__room_type")
            .filter(asset_id=asset.asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_room_id:
            return Response({"room": None}, status=status.HTTP_200_OK)
        return Response({"room": RoomSerializer(last_move.destination_room).data}, status=status.HTTP_200_OK)

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
            allowed = ("asset_responsible" in role_codes) or ("exploitation_chief" in role_codes)

        if not allowed:
            return Response(
                {"error": "Only Asset Responsible or superiors can move assets"},
                status=status.HTTP_403_FORBIDDEN,
            )

        asset = self.get_object()
        destination_room_id = request.data.get("destination_room_id")
        movement_reason = request.data.get("movement_reason") or "manual_move"
        if not destination_room_id:
            return Response({"error": "destination_room_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            destination_room_id_int = int(destination_room_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid destination_room_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_room = Room.objects.filter(room_id=destination_room_id_int).first()
        if not destination_room:
            return Response({"error": "Invalid destination_room_id"}, status=status.HTTP_400_BAD_REQUEST)

        last_move = (
            AssetMovement.objects.select_related("destination_room")
            .filter(asset_id=asset.asset_id)
            .order_by("-asset_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_room_id:
            return Response(
                {"error": "Cannot infer asset current room (no movement history)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        source_room = last_move.destination_room
        if source_room.room_id == destination_room.room_id:
            return Response({"error": "Asset is already in this room"}, status=status.HTTP_400_BAD_REQUEST)

        last_asset_move = AssetMovement.objects.order_by("-asset_movement_id").first()
        next_asset_move_id = (last_asset_move.asset_movement_id + 1) if last_asset_move else 1

        AssetMovement.objects.create(
            asset_movement_id=next_asset_move_id,
            asset=asset,
            source_room=source_room,
            destination_room=destination_room,
            maintenance_step=None,
            external_maintenance_step_id=None,
            movement_reason=movement_reason,
            movement_datetime=timezone.now(),
        )

        _cascade_move_composed_items(
            asset_id=asset.asset_id,
            source_room_id=source_room.room_id,
            destination_room_id=destination_room.room_id,
            movement_reason=movement_reason,
            movement_datetime=timezone.now(),
            maintenance_step_id=None,
            external_maintenance_step_id=None,
        )

        return Response(
            {
                "asset_movement_id": next_asset_move_id,
                "source_room_id": source_room.room_id,
                "destination_room_id": destination_room.room_id,
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

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create asset attribute definitions")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_def = AssetAttributeDefinition.objects.order_by("-asset_attribute_definition_id").first()
        next_id = (last_def.asset_attribute_definition_id + 1) if last_def else 1
        definition = AssetAttributeDefinition.objects.create(asset_attribute_definition_id=next_id, **serializer.validated_data)
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

        return Response(StockItemTypeSerializer(stock_item_type).data, status=status.HTTP_201_CREATED)


class StockItemBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemBrand.objects.all().order_by("stock_item_brand_id")
    serializer_class = StockItemBrandSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create stock item brands")
        if denial:
            return denial

        # Handle file upload
        brand_photo_file = request.FILES.get('brand_photo')
        brand_photo_path = None
        if brand_photo_file:
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            
            # Save file to media/brands/
            file_path = f"brands/stock_items/{brand_photo_file.name}"
            brand_photo_path = default_storage.save(file_path, ContentFile(brand_photo_file.read()))

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_brand = StockItemBrand.objects.all().order_by("-stock_item_brand_id").first()
        next_id = (last_brand.stock_item_brand_id + 1) if last_brand else 1

        try:
            data = serializer.validated_data.copy()
            if brand_photo_path:
                data['brand_photo'] = brand_photo_path
            brand = StockItemBrand.objects.create(
                stock_item_brand_id=next_id,
                **data,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create stock item brand due to database constraints.",
                    "details": "Check required fields and uniqueness constraints.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(self.get_serializer(brand).data, status=status.HTTP_201_CREATED)


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

        last_model = StockItemModel.objects.all().order_by("-stock_item_model_id").first()
        next_id = (last_model.stock_item_model_id + 1) if last_model else 1

        stock_item_model = StockItemModel.objects.create(stock_item_model_id=next_id, **serializer.validated_data)
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
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create stock items")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_item = StockItem.objects.order_by("-stock_item_id").first()
        next_id = (last_item.stock_item_id + 1) if last_item else 1
        item = StockItem.objects.create(stock_item_id=next_id, **serializer.validated_data)
        _sync_stock_item_attribute_values(item)
        return Response(StockItemSerializer(item).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        _sync_stock_item_attribute_values(instance)
        return response

    @action(detail=True, methods=["get"], url_path="current-room")
    def current_room(self, request, pk=None):
        stock_item = self.get_object()
        last_move = (
            StockItemMovement.objects.filter(stock_item_id=stock_item.stock_item_id)
            .order_by("-stock_item_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_room_id:
            return Response({"room_id": None}, status=status.HTTP_200_OK)
        return Response({"room_id": last_move.destination_room_id}, status=status.HTTP_200_OK)

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
            allowed = "stock_consumable_responsible" in role_codes

        if not allowed:
            return Response(
                {"error": "Only Stock/Consumable Responsible or superusers can move stock items"},
                status=status.HTTP_403_FORBIDDEN,
            )

        stock_item = self.get_object()
        destination_room_id = request.data.get("destination_room_id")
        movement_reason = request.data.get("movement_reason") or "manual_move"
        if not destination_room_id:
            return Response({"error": "destination_room_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            destination_room_id_int = int(destination_room_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid destination_room_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_room = Room.objects.filter(room_id=destination_room_id_int).first()
        if not destination_room:
            return Response({"error": "Invalid destination_room_id"}, status=status.HTTP_400_BAD_REQUEST)

        last_move = (
            StockItemMovement.objects.select_related("destination_room")
            .filter(stock_item_id=stock_item.stock_item_id)
            .order_by("-stock_item_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_room_id:
            return Response(
                {"error": "Cannot infer stock item current room (no movement history)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        source_room = last_move.destination_room
        if source_room.room_id == destination_room.room_id:
            return Response({"error": "Stock item is already in this room"}, status=status.HTTP_400_BAD_REQUEST)

        last_global_move = StockItemMovement.objects.order_by("-stock_item_movement_id").first()
        next_move_id = (last_global_move.stock_item_movement_id + 1) if last_global_move else 1

        StockItemMovement.objects.create(
            stock_item_movement_id=next_move_id,
            stock_item=stock_item,
            source_room=source_room,
            destination_room=destination_room,
            maintenance_step=None,
            external_maintenance_step_id=None,
            movement_reason=movement_reason,
            movement_datetime=timezone.now(),
        )

        _cascade_move_stock_item_consumables(
            stock_item_id=stock_item.stock_item_id,
            source_room_id=source_room.room_id,
            destination_room_id=destination_room.room_id,
            movement_reason=movement_reason,
            movement_datetime=timezone.now(),
            maintenance_step_id=None,
            external_maintenance_step_id=None,
        )

        return Response(
            {
                "stock_item_movement_id": next_move_id,
                "source_room_id": source_room.room_id,
                "destination_room_id": destination_room.room_id,
            },
            status=status.HTTP_201_CREATED,
        )


class StockItemAttributeDefinitionViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemAttributeDefinition.objects.all().order_by("stock_item_attribute_definition_id")
    serializer_class = StockItemAttributeDefinitionSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create stock item attribute definitions")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_def = StockItemAttributeDefinition.objects.order_by("-stock_item_attribute_definition_id").first()
        next_id = (last_def.stock_item_attribute_definition_id + 1) if last_def else 1
        definition = StockItemAttributeDefinition.objects.create(
            stock_item_attribute_definition_id=next_id, **serializer.validated_data
        )
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

        return Response(ConsumableTypeSerializer(consumable_type).data, status=status.HTTP_201_CREATED)


class ConsumableBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableBrand.objects.all().order_by("consumable_brand_id")
    serializer_class = ConsumableBrandSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create consumable brands")
        if denial:
            return denial

        # Handle file upload
        brand_photo_file = request.FILES.get('brand_photo')
        brand_photo_path = None
        if brand_photo_file:
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            
            # Save file to media/brands/
            file_path = f"brands/consumables/{brand_photo_file.name}"
            brand_photo_path = default_storage.save(file_path, ContentFile(brand_photo_file.read()))

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_brand = ConsumableBrand.objects.all().order_by("-consumable_brand_id").first()
        next_id = (last_brand.consumable_brand_id + 1) if last_brand else 1

        try:
            data = serializer.validated_data.copy()
            if brand_photo_path:
                data['brand_photo'] = brand_photo_path
            brand = ConsumableBrand.objects.create(
                consumable_brand_id=next_id,
                **data,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "Failed to create consumable brand due to database constraints.",
                    "details": "Check required fields and uniqueness constraints.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(self.get_serializer(brand).data, status=status.HTTP_201_CREATED)


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

        last_model = ConsumableModel.objects.all().order_by("-consumable_model_id").first()
        next_id = (last_model.consumable_model_id + 1) if last_model else 1

        consumable_model = ConsumableModel.objects.create(consumable_model_id=next_id, **serializer.validated_data)
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
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create consumables")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_item = Consumable.objects.order_by("-consumable_id").first()
        next_id = (last_item.consumable_id + 1) if last_item else 1
        item = Consumable.objects.create(consumable_id=next_id, **serializer.validated_data)
        _sync_consumable_attribute_values(item)
        return Response(ConsumableSerializer(item).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        _sync_consumable_attribute_values(instance)
        return response

    @action(detail=True, methods=["get"], url_path="current-room")
    def current_room(self, request, pk=None):
        consumable = self.get_object()
        last_move = (
            ConsumableMovement.objects.filter(consumable_id=consumable.consumable_id)
            .order_by("-consumable_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_room_id:
            return Response({"room_id": None}, status=status.HTTP_200_OK)
        return Response({"room_id": last_move.destination_room_id}, status=status.HTTP_200_OK)

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
            allowed = "stock_consumable_responsible" in role_codes

        if not allowed:
            return Response(
                {"error": "Only Stock/Consumable Responsible or superusers can move consumables"},
                status=status.HTTP_403_FORBIDDEN,
            )

        consumable = self.get_object()
        destination_room_id = request.data.get("destination_room_id")
        movement_reason = request.data.get("movement_reason") or "manual_move"
        if not destination_room_id:
            return Response({"error": "destination_room_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            destination_room_id_int = int(destination_room_id)
        except (TypeError, ValueError):
            return Response({"error": "Invalid destination_room_id"}, status=status.HTTP_400_BAD_REQUEST)

        destination_room = Room.objects.filter(room_id=destination_room_id_int).first()
        if not destination_room:
            return Response({"error": "Invalid destination_room_id"}, status=status.HTTP_400_BAD_REQUEST)

        last_move = (
            ConsumableMovement.objects.select_related("destination_room")
            .filter(consumable_id=consumable.consumable_id)
            .order_by("-consumable_movement_id")
            .first()
        )
        if not last_move or not last_move.destination_room_id:
            return Response(
                {"error": "Cannot infer consumable current room (no movement history)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        source_room = last_move.destination_room
        if source_room.room_id == destination_room.room_id:
            return Response({"error": "Consumable is already in this room"}, status=status.HTTP_400_BAD_REQUEST)

        last_global_move = ConsumableMovement.objects.order_by("-consumable_movement_id").first()
        next_move_id = (last_global_move.consumable_movement_id + 1) if last_global_move else 1

        ConsumableMovement.objects.create(
            consumable_movement_id=next_move_id,
            consumable=consumable,
            source_room=source_room,
            destination_room=destination_room,
            maintenance_step=None,
            external_maintenance_step_id=None,
            movement_reason=movement_reason,
            movement_datetime=timezone.now(),
        )

        return Response(
            {
                "consumable_movement_id": next_move_id,
                "source_room_id": source_room.room_id,
                "destination_room_id": destination_room.room_id,
            },
            status=status.HTTP_201_CREATED,
        )


class ConsumableAttributeDefinitionViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableAttributeDefinition.objects.all().order_by("consumable_attribute_definition_id")
    serializer_class = ConsumableAttributeDefinitionSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create consumable attribute definitions")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_def = ConsumableAttributeDefinition.objects.order_by("-consumable_attribute_definition_id").first()
        next_id = (last_def.consumable_attribute_definition_id + 1) if last_def else 1
        definition = ConsumableAttributeDefinition.objects.create(
            consumable_attribute_definition_id=next_id, **serializer.validated_data
        )
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


# Room ViewSets
class RoomTypeViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = RoomType.objects.all().order_by("room_type_id")
    serializer_class = RoomTypeSerializer


class RoomViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by("room_id")
    serializer_class = RoomSerializer

    def get_queryset(self):
        queryset = Room.objects.all().order_by("room_id")
        room_type = self.request.query_params.get("room_type")
        if room_type is not None:
            queryset = queryset.filter(room_type=room_type)
        return queryset

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create rooms")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_room = Room.objects.order_by("-room_id").first()
        next_id = (last_room.room_id + 1) if last_room else 1
        room = Room.objects.create(room_id=next_id, **serializer.validated_data)
        return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)


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


# Organizational Structure ViewSets
class OrganizationalStructureViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = OrganizationalStructure.objects.all().order_by("organizational_structure_id")
    serializer_class = OrganizationalStructureSerializer

    def create(self, request, *args, **kwargs):
        denial = self._require_superuser(request, "create organizational structures")
        if denial:
            return denial

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_org = OrganizationalStructure.objects.order_by("-organizational_structure_id").first()
        next_id = (last_org.organizational_structure_id + 1) if last_org else 1
        org_structure = OrganizationalStructure.objects.create(organizational_structure_id=next_id, **serializer.validated_data)
        return Response(OrganizationalStructureSerializer(org_structure).data, status=status.HTTP_201_CREATED)


class OrganizationalStructureRelationViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = OrganizationalStructureRelation.objects.all().order_by("organizational_structure_id", "parent_organizational_structure_id")
    serializer_class = OrganizationalStructureRelationSerializer

    def get_queryset(self):
        queryset = OrganizationalStructureRelation.objects.select_related(
            "organizational_structure", "parent_organizational_structure"
        ).order_by("organizational_structure_id", "parent_organizational_structure_id")
        org_structure_id = self.request.query_params.get("org_structure_id")
        if org_structure_id is not None:
            try:
                queryset = queryset.filter(organizational_structure_id=int(org_structure_id))
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

        if not (is_asset_responsible or is_superuser or is_exploitation_chief):
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

        if "exploitation_chief" not in role_codes and not user_account.is_superuser():
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

        if not (is_asset_responsible or is_superuser or is_exploitation_chief):
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
        """Get all stock items and consumables included with assets in this attribution order"""
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
        
        return Response({
            'stock_items': stock_items,
            'consumables': consumables,
        })


class ReceiptReportViewSet(viewsets.ModelViewSet):
    queryset = ReceiptReport.objects.all().order_by("receipt_report_id")
    serializer_class = ReceiptReportSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_item = ReceiptReport.objects.order_by("-receipt_report_id").first()
        next_id = (last_item.receipt_report_id + 1) if last_item else 1
        
        # Handle file upload if present
        digital_copy = request.FILES.get('digital_copy')
        validated_data = serializer.validated_data
        if digital_copy:
            validated_data['digital_copy'] = digital_copy.read()

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
            if "asset_responsible" not in role_codes:
                return AdministrativeCertificate.objects.none()

            queryset = AdministrativeCertificate.objects.all().order_by("administrative_certificate_id")

        attribution_order_id = self.request.query_params.get("attribution_order")
        if attribution_order_id is not None:
            try:
                queryset = queryset.filter(attribution_order_id=int(attribution_order_id))
            except (ValueError, TypeError):
                pass
        return queryset

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
            allowed = "asset_responsible" in role_codes

        if not allowed:
            return Response(
                {"error": "Only Asset Responsible can create administrative certificates"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        last_item = AdministrativeCertificate.objects.order_by("-administrative_certificate_id").first()
        next_id = (last_item.administrative_certificate_id + 1) if last_item else 1
        
        digital_copy = request.FILES.get('digital_copy')
        validated_data = serializer.validated_data
        if digital_copy:
            validated_data['digital_copy'] = digital_copy.read()

        item = AdministrativeCertificate.objects.create(administrative_certificate_id=next_id, **validated_data)
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
        if "asset_responsible" not in role_codes:
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
            allowed = "asset_responsible" in role_codes

        if not allowed:
            return Response(
                {"error": "Only Asset Responsible can create company asset requests"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        last_item = CompanyAssetRequest.objects.order_by("-company_asset_request_id").first()
        next_id = (last_item.company_asset_request_id + 1) if last_item else 1

        validated_data = serializer.validated_data
        digital_copy = request.FILES.get('digital_copy')
        if digital_copy:
            validated_data = dict(validated_data)
            validated_data['digital_copy'] = digital_copy.read()

        item = CompanyAssetRequest.objects.create(company_asset_request_id=next_id, **validated_data)
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED)
