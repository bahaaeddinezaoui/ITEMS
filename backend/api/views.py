from __future__ import annotations

import hashlib
import os

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
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
)
from .serializers import (
    AssetAttributeDefinitionSerializer,
    AssetAttributeValueSerializer,
    AssetBrandSerializer,
    AssetIsAssignedToPersonSerializer,
    AssetModelAttributeValueSerializer,
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


class MaintenanceStepViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceStep.objects.all().order_by("maintenance_step_id")
    serializer_class = MaintenanceStepSerializer
    permission_classes = [IsAuthenticated]

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
        maintenance = Maintenance.objects.create(
            maintenance_id=next_id,
            performed_by_person=technician,
            description=description or report.owner_observation,
            start_datetime=timezone.now(),
            asset=report.asset,
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

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        last_brand = AssetBrand.objects.all().order_by("-asset_brand_id").first()
        next_id = (last_brand.asset_brand_id + 1) if last_brand else 1
        
        brand = AssetBrand.objects.create(asset_brand_id=next_id, **serializer.validated_data)
        return Response(AssetBrandSerializer(brand).data, status=status.HTTP_201_CREATED)


class AssetModelViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = AssetModel.objects.all().order_by("asset_model_id")
    serializer_class = AssetModelSerializer

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
        return Response(AssetModelSerializer(asset_model).data, status=status.HTTP_201_CREATED)


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by("asset_id")
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Asset.objects.select_related("asset_model").order_by("asset_id")
        asset_model_id = self.request.query_params.get("asset_model")
        if asset_model_id is not None:
            try:
                queryset = queryset.filter(asset_model_id=int(asset_model_id))
            except (ValueError, TypeError):
                pass
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        last_asset = Asset.objects.all().order_by("-asset_id").first()
        next_id = (last_asset.asset_id + 1) if last_asset else 1
        
        # Manually set the ID and validated data
        instance = Asset(asset_id=next_id, **serializer.validated_data)
        instance.save(force_insert=True)
        return Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED)


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
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


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


class StockItemBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemBrand.objects.all().order_by("stock_item_brand_id")
    serializer_class = StockItemBrandSerializer


class StockItemModelViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = StockItemModel.objects.all().order_by("stock_item_model_id")
    serializer_class = StockItemModelSerializer

    def get_queryset(self):
        queryset = StockItemModel.objects.select_related("stock_item_brand", "stock_item_type").order_by("stock_item_model_id")
        stock_item_type_id = self.request.query_params.get("stock_item_type")
        if stock_item_type_id is not None:
            try:
                queryset = queryset.filter(stock_item_type_id=int(stock_item_type_id))
            except (ValueError, TypeError):
                pass
        return queryset


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
        return Response(StockItemSerializer(item).data, status=status.HTTP_201_CREATED)


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
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


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


class ConsumableBrandViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableBrand.objects.all().order_by("consumable_brand_id")
    serializer_class = ConsumableBrandSerializer


class ConsumableModelViewSet(SuperuserWriteMixin, viewsets.ModelViewSet):
    queryset = ConsumableModel.objects.all().order_by("consumable_model_id")
    serializer_class = ConsumableModelSerializer

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
        return Response(ConsumableSerializer(item).data, status=status.HTTP_201_CREATED)


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
            return Response(status=status.HTTP_204_NO_CONTENT)

        return super().destroy(request, *args, **kwargs)


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
